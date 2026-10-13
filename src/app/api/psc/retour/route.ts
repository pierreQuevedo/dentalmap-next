import { NextResponse, type NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { configPsc } from '@/lib/psc/config'
import { echangerCode, lireUserinfo, verifierIdToken } from '@/lib/psc/client'
import { COOKIE_IDENTITE, COOKIE_PSC, DUREE_ETAT_SECONDES, desceller, scellerIdentite } from '@/lib/psc/etat'
import { estChirurgienDentiste, lireIdentitePsc } from '@/lib/psc/identite'
import { appliquerRetrait, getFicheParRpps, getFicheParSlug } from '@/lib/espace-pro/revendication'
import { REVENDIQUER, cheminFiche } from '@/lib/espace-pro/chemins'
import { estPersonne } from '@/lib/annuaire/types'

/**
 * Retour de Pro Santé Connect.
 *
 * 1. l'état du cookie doit être authentique, non expiré, et correspondre au
 *    `state` renvoyé ainsi qu'au compte connecté ;
 * 2. le code est échangé, le jeton d'identité vérifié, le UserInfo lu ;
 * 3. l'identité doit être celle d'un chirurgien-dentiste ou d'un médecin du
 *    RPPS. La fiche est celle qui était visée, dont le RPPS doit être
 *    exactement le sien, ou, sans fiche visée, celle qui porte ce RPPS.
 *
 * Pour une revendication, rien n'est encore écrit : l'identité certifiée est
 * scellée dans un cookie et le praticien confirme sur PSC2. Pour un retrait,
 * l'identité vérifiée suffit : la fiche est retirée (R2). Sans fiche pour ce
 * RPPS : PSC-0. Toute erreur mène à PSC-E, qui propose une autre voie.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const etat = desceller(request.cookies.get(COOKIE_PSC)?.value)

  const repondre = (chemin: string) => {
    const reponse = NextResponse.redirect(new URL(chemin, request.url))
    reponse.cookies.set(COOKIE_PSC, '', { path: '/api/psc/', maxAge: 0 })
    return reponse
  }
  const versErreur = (code: string) => repondre(`${REVENDIQUER}/psc/erreur/?code=${code}${etat?.fiche ? `&fiche=${encodeURIComponent(etat.fiche)}` : ''}`)

  const config = configPsc()
  if (!config) return versErreur('indisponible')
  if (!etat || params.get('state') !== etat.state) return versErreur('etat')

  // L'utilisateur a renoncé sur l'écran de Pro Santé Connect, ou celui-ci a
  // refusé la demande : rien à échanger.
  if (params.get('error')) return versErreur(params.get('error') === 'access_denied' ? 'annule' : 'technique')
  const code = params.get('code')
  if (!code) return versErreur('technique')

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session || session.user.id !== etat.userId) return versErreur('session')

  let userinfo: unknown
  try {
    const jetons = await echangerCode(config, code, etat)
    await verifierIdToken(config, jetons.id_token, etat.nonce)
    userinfo = await lireUserinfo(config, jetons.access_token)
  } catch (e) {
    console.error('[psc] échec du flux OpenID Connect', e)
    return versErreur('technique')
  }

  const identite = lireIdentitePsc(userinfo)
  if (!identite || !identite.rpps) return versErreur('technique')
  if (!estChirurgienDentiste(identite)) return versErreur('profession')

  const fiche = etat.fiche ? await getFicheParSlug(etat.fiche) : await getFicheParRpps(identite.rpps)
  if (!fiche) {
    if (etat.fiche) return versErreur('fiche')
    return repondre(`${REVENDIQUER}/psc/sans-fiche/?rpps=${identite.rpps}`)
  }
  if (!estPersonne(fiche.profession)) return versErreur('fiche')
  if (fiche.rpps !== identite.rpps) return versErreur('rpps')

  if (etat.objet === 'retrait') {
    await appliquerRetrait({ praticienId: fiche.id, userId: session.user.id, methode: 'pro_sante_connect', rpps: identite.rpps, identifiantNational: identite.identifiantNational })
    revalidateTag('annuaire', 'max')
    return repondre(cheminFiche(fiche.slug, 'retrait/confirme'))
  }

  const reponse = repondre(`${REVENDIQUER}/psc/confirmer/`)
  reponse.cookies.set(
    COOKIE_IDENTITE,
    scellerIdentite({
      userId: session.user.id,
      rpps: identite.rpps,
      identifiantNational: identite.identifiantNational,
      prenom: identite.prenom,
      nom: identite.nom,
      fiche: fiche.slug,
    }),
    { httpOnly: true, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:', path: `${REVENDIQUER}/`, maxAge: DUREE_ETAT_SECONDES },
  )
  return reponse
}
