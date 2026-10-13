import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { configPsc } from '@/lib/psc/config'
import { urlAutorisation } from '@/lib/psc/client'
import { COOKIE_PSC, DUREE_ETAT_SECONDES, nouvelEtat, sceller } from '@/lib/psc/etat'
import { getFicheParSlug } from '@/lib/espace-pro/revendication'
import { estPersonne } from '@/lib/annuaire/types'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'

/**
 * Départ vers Pro Santé Connect, pour revendiquer une fiche ou prouver son
 * identité avant de la retirer.
 *
 * La fiche est facultative : sans elle, c'est le RPPS certifié qui la
 * désignera au retour (S0, « S'identifier avec Pro Santé Connect »).
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
  const objet = request.nextUrl.searchParams.get('objet') === 'retrait' ? 'retrait' : 'revendication'
  const versErreur = (code: string) =>
    NextResponse.redirect(new URL(`${REVENDIQUER}/psc/erreur/?code=${code}${slug ? `&fiche=${encodeURIComponent(slug)}` : ''}`, request.url))

  const config = configPsc()
  if (!config) return versErreur('indisponible')

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    const retour = `/api/psc/connexion/?${request.nextUrl.searchParams.toString()}`
    return NextResponse.redirect(new URL(`/connexion/?retour=${encodeURIComponent(retour)}`, request.url))
  }

  let rppsAttendu: string | null = null
  if (slug) {
    const fiche = await getFicheParSlug(slug)
    if (!fiche) return versErreur('fiche')
    if (!estPersonne(fiche.profession) || !fiche.rpps) return versErreur('profession')
    rppsAttendu = fiche.rpps
  }

  const etat = nouvelEtat(slug, session.user.id, objet)
  let destination: string
  try {
    destination = await urlAutorisation(config, etat)
    // Le simulateur préremplit son formulaire avec le RPPS attendu : il ne
    // s'agit pas de tricher, mais d'éviter de le recopier à chaque essai. Rien
    // de tel n'est envoyé à l'ANS.
    if (config.simulateur && rppsAttendu) destination += `&login_hint=${encodeURIComponent(rppsAttendu)}`
  } catch (e) {
    console.error('[psc] découverte impossible', e)
    return versErreur('technique')
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
