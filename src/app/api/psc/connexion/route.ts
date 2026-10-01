import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { configPsc } from '@/lib/psc/config'
import { urlAutorisation } from '@/lib/psc/client'
import { COOKIE_PSC, DUREE_ETAT_SECONDES, nouvelEtat, sceller } from '@/lib/psc/etat'
import { getFicheParSlug } from '@/lib/espace-pro/revendication'

/**
 * Départ vers Pro Santé Connect pour revendiquer une fiche.
 *
 * Le compte doit être connecté avant de partir : Pro Santé Connect prouve que
 * l'on est le praticien, il ne crée pas de compte. Sans session, on passe par
 * la page de connexion avec retour ici même, de sorte que le lien reçu par
 * courriel ramène directement à l'étape suivante.
 *
 * Réservé aux chirurgiens-dentistes : les laboratoires de prothèse ne sont pas
 * au RPPS, et donc pas dans Pro Santé Connect.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('fiche') ?? ''
  const versRevendication = (code: string) =>
    NextResponse.redirect(new URL(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(slug)}&psc=${code}`, request.url))

  const config = configPsc()
  if (!config) return versRevendication('indisponible')
  if (!slug) return NextResponse.redirect(new URL('/espace-pro/revendiquer/', request.url))

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    const retour = `/api/psc/connexion/?fiche=${encodeURIComponent(slug)}`
    return NextResponse.redirect(new URL(`/connexion/?retour=${encodeURIComponent(retour)}`, request.url))
  }

  const fiche = await getFicheParSlug(slug)
  if (!fiche) return versRevendication('fiche')
  if (fiche.profession !== 'dentiste' || !fiche.rpps) return versRevendication('profession')

  const etat = nouvelEtat(slug, session.user.id)
  let destination: string
  try {
    destination = await urlAutorisation(config, etat)
    // Le simulateur préremplit son formulaire avec le RPPS attendu : il ne
    // s'agit pas de tricher, mais d'éviter de le recopier à chaque essai. Rien
    // de tel n'est envoyé à l'ANS.
    if (config.simulateur) destination += `&login_hint=${encodeURIComponent(fiche.rpps)}`
  } catch (e) {
    console.error('[psc] découverte impossible', e)
    return versRevendication('technique')
  }

  const reponse = NextResponse.redirect(destination)
  reponse.cookies.set(COOKIE_PSC, sceller(etat), {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/api/psc/',
    maxAge: DUREE_ETAT_SECONDES,
  })
  return reponse
}
