import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { configPsc } from '@/lib/psc/config'
import { echangerCode, lireUserinfo, verifierIdToken } from '@/lib/psc/client'
import { COOKIE_PSC, desceller } from '@/lib/psc/etat'
import { estChirurgienDentiste, lireIdentitePsc } from '@/lib/psc/identite'
import { accorderParPsc, getFicheParSlug } from '@/lib/espace-pro/revendication'
import { estPersonne } from '@/lib/annuaire/types'

/**
 * Retour de Pro Santé Connect.
 *
 * C'est ici que la revendication se décide, sans intervention humaine :
 *
 * 1. l'état du cookie doit être authentique, non expiré, et correspondre au
 *    `state` renvoyé ainsi qu'au compte connecté ;
 * 2. le code est échangé, le jeton d'identité vérifié, le UserInfo lu ;
 * 3. l'identité doit être celle d'un chirurgien-dentiste dont le numéro RPPS
 *    est exactement celui de la fiche visée.
 *
 * Si tout concorde, la revendication est acceptée et le praticien est conduit
 * au parcours d'accueil. Sinon, il revient sur la page de revendication avec
 * la raison, où la vérification manuelle reste possible.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const etat = desceller(request.cookies.get(COOKIE_PSC)?.value)

  const repondre = (chemin: string) => {
    const reponse = NextResponse.redirect(new URL(chemin, request.url))
    reponse.cookies.set(COOKIE_PSC, '', { path: '/api/psc/', maxAge: 0 })
    return reponse
  }
  const versRevendication = (code: string) =>
    repondre(`/espace-pro/revendiquer/?${etat ? `fiche=${encodeURIComponent(etat.fiche)}&` : ''}psc=${code}`)

  const config = configPsc()
  if (!config) return versRevendication('indisponible')
  if (!etat || params.get('state') !== etat.state) return versRevendication('etat')

  // L'utilisateur a renoncé sur l'écran de Pro Santé Connect, ou celui-ci a
  // refusé la demande : rien à échanger.
  if (params.get('error')) return versRevendication(params.get('error') === 'access_denied' ? 'annule' : 'technique')
  const code = params.get('code')
  if (!code) return versRevendication('technique')

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session || session.user.id !== etat.userId) return versRevendication('session')

  let userinfo: unknown
  try {
    const jetons = await echangerCode(config, code, etat)
    await verifierIdToken(config, jetons.id_token, etat.nonce)
    userinfo = await lireUserinfo(config, jetons.access_token)
  } catch (e) {
    console.error('[psc] échec du flux OpenID Connect', e)
    return versRevendication('technique')
  }

  const identite = lireIdentitePsc(userinfo)
  if (!identite || !identite.rpps) return versRevendication('technique')
  if (!estChirurgienDentiste(identite)) return versRevendication('profession')

  const fiche = await getFicheParSlug(etat.fiche)
  if (!fiche || !estPersonne(fiche.profession)) return versRevendication('fiche')
  if (fiche.rpps !== identite.rpps) return versRevendication('rpps')

  await accorderParPsc({
    praticienId: fiche.id,
    userId: session.user.id,
    identifiantNational: identite.identifiantNational,
    rpps: identite.rpps,
  })

  return repondre(`/espace-pro/onboarding/?fiche=${encodeURIComponent(fiche.slug)}&bienvenue=1`)
}
