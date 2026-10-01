import { SITE_URL } from '@/lib/seo/site'

/**
 * Réglages de Pro Santé Connect.
 *
 * Deux environnements existent côté Agence du Numérique en Santé : le bac à
 * sable, où l'on développe avec des identités de test, et la production, que
 * l'on n'obtient qu'après recette. L'un et l'autre se distinguent uniquement
 * par l'émetteur et par le couple d'identifiants, le reste du protocole est
 * identique. Par défaut, on vise le bac à sable : un environnement de
 * développement qui frapperait la production par oubli d'une variable serait
 * la pire des surprises.
 *
 * L'intégration est optionnelle. Tant que les identifiants ne sont pas posés,
 * `pscConfigure()` rend faux et l'interface propose la vérification manuelle.
 */
export const PSC_ISSUER_BAC_A_SABLE = 'https://wallet.bas.esw.esante.gouv.fr/auth/realms/esante-wallet'
export const PSC_ISSUER_PRODUCTION = 'https://wallet.esw.esante.gouv.fr/auth/realms/esante-wallet'

export type ConfigPsc = {
  clientId: string
  clientSecret: string
  issuer: string
  redirectUri: string
  /** Vrai quand on parle au simulateur local et non à l'ANS. */
  simulateur: boolean
}

/**
 * Simulateur local de Pro Santé Connect.
 *
 * Tant que l'ANS n'a pas ouvert le bac à sable, on ne peut pas dérouler le
 * parcours. Le simulateur, servi par l'application elle-même sous
 * `/api/psc-simulateur/`, joue le rôle du fournisseur d'identité : mêmes
 * points de terminaison, mêmes jetons, même UserInfo, mais avec l'identité que
 * l'on tape dans un formulaire. Il n'existe que si `PSC_SIMULATEUR=1` et jamais
 * en production Vercel, quelle que soit la variable.
 */
export function simulateurActif(): boolean {
  return process.env.PSC_SIMULATEUR === '1' && process.env.VERCEL_ENV !== 'production'
}

function base(): string {
  return (process.env.BETTER_AUTH_URL ?? SITE_URL).replace(/\/$/, '')
}

export function configPsc(): ConfigPsc | null {
  // L'adresse de retour est déclarée à l'ANS et doit correspondre au caractère
  // près, barre finale comprise : le site tourne avec `trailingSlash`.
  const redirectUri = process.env.PSC_REDIRECT_URI ?? `${base()}/api/psc/retour/`

  if (simulateurActif()) {
    return {
      clientId: 'simulateur',
      clientSecret: 'simulateur',
      issuer: `${base()}/api/psc-simulateur`,
      redirectUri,
      simulateur: true,
    }
  }

  const clientId = process.env.PSC_CLIENT_ID
  const clientSecret = process.env.PSC_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const issuer = (process.env.PSC_ISSUER ?? PSC_ISSUER_BAC_A_SABLE).replace(/\/$/, '')
  return { clientId, clientSecret, issuer, redirectUri, simulateur: false }
}

export function pscConfigure(): boolean {
  return configPsc() !== null
}
