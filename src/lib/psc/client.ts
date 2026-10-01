import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTPayload } from 'jose'
import type { ConfigPsc } from './config'
import { defiPkce, type EtatPsc } from './etat'

/**
 * Client OpenID Connect minimal pour Pro Santé Connect.
 *
 * Pro Santé Connect est un fournisseur OpenID Connect classique, avec deux
 * particularités : son document de découverte est servi sous
 * `.well-known/wallet-openid-configuration`, et la requête d'autorisation doit
 * porter `acr_values=eidas1`, seul niveau accepté aujourd'hui. Le scope
 * `scope_all` renvoie en une fois l'identité et les exercices du professionnel.
 *
 * On n'utilise pas Better Auth pour ce flux : Pro Santé Connect ne sert pas à
 * se connecter à DentalMap, mais à prouver, une fois connecté, que l'on est
 * bien le praticien de la fiche. Le jeton ne porte d'ailleurs pas d'adresse
 * électronique fiable, ce qui interdirait d'en faire un compte.
 */

type Decouverte = {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_uri: string
}

const cache = new Map<string, { promesse: Promise<Decouverte>; lueLe: number }>()
const DUREE_DECOUVERTE_MS = 60 * 60 * 1000

async function lireDecouverte(issuer: string): Promise<Decouverte> {
  for (const chemin of ['/.well-known/wallet-openid-configuration', '/.well-known/openid-configuration']) {
    const res = await fetch(`${issuer}${chemin}`, { headers: { accept: 'application/json' } })
    if (res.ok) return (await res.json()) as Decouverte
  }
  throw new Error(`Découverte Pro Santé Connect introuvable pour ${issuer}`)
}

export async function decouverte(config: ConfigPsc): Promise<Decouverte> {
  // Le simulateur vit dans le même processus : pas besoin d'aller le lire.
  if (config.simulateur) {
    return {
      issuer: config.issuer,
      authorization_endpoint: `${config.issuer}/autoriser/`,
      token_endpoint: `${config.issuer}/jeton/`,
      userinfo_endpoint: `${config.issuer}/userinfo/`,
      jwks_uri: `${config.issuer}/jwks/`,
    }
  }
  const entree = cache.get(config.issuer)
  if (entree && Date.now() - entree.lueLe < DUREE_DECOUVERTE_MS) return entree.promesse
  const promesse = lireDecouverte(config.issuer)
  cache.set(config.issuer, { promesse, lueLe: Date.now() })
  // Une découverte en échec ne doit pas rester en cache une heure.
  promesse.catch(() => cache.delete(config.issuer))
  return promesse
}

export async function urlAutorisation(config: ConfigPsc, etat: EtatPsc): Promise<string> {
  const d = await decouverte(config)
  const url = new URL(d.authorization_endpoint)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('scope', 'openid scope_all')
  url.searchParams.set('acr_values', 'eidas1')
  url.searchParams.set('state', etat.state)
  url.searchParams.set('nonce', etat.nonce)
  url.searchParams.set('code_challenge', defiPkce(etat.verifier))
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

type Jetons = { access_token: string; id_token: string; token_type: string }

export async function echangerCode(config: ConfigPsc, code: string, etat: EtatPsc): Promise<Jetons> {
  const d = await decouverte(config)
  const res = await fetch(d.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code_verifier: etat.verifier,
    }),
  })
  if (!res.ok) throw new Error(`Échange du code refusé par Pro Santé Connect (${res.status})`)
  const jetons = (await res.json()) as Partial<Jetons>
  if (!jetons.access_token || !jetons.id_token) throw new Error('Réponse de jeton incomplète')
  return jetons as Jetons
}

/**
 * Vérifie le jeton d'identité : signature contre les clés publiées, émetteur,
 * audience et nonce. Le flux par code sur canal arrière rend déjà ces jetons
 * difficiles à forger, mais une vérification qui manque est une vérification
 * dont on regrettera un jour l'absence.
 */
export async function verifierIdToken(config: ConfigPsc, idToken: string, nonce: string): Promise<JWTPayload> {
  const d = await decouverte(config)
  const jwks = createRemoteJWKSet(new URL(d.jwks_uri))
  const { payload } = await jwtVerify(idToken, jwks, { issuer: d.issuer, audience: config.clientId })
  if (payload.nonce !== nonce) throw new Error('Nonce inattendu dans le jeton d’identité')
  return payload
}

/**
 * Lit le UserInfo. Pro Santé Connect le sert en JSON ; si un jour il le
 * servait en JWT signé, on le vérifie de la même manière que l'id_token.
 */
export async function lireUserinfo(config: ConfigPsc, accessToken: string): Promise<unknown> {
  const d = await decouverte(config)
  const res = await fetch(d.userinfo_endpoint, { headers: { authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`UserInfo refusé par Pro Santé Connect (${res.status})`)

  const type = res.headers.get('content-type') ?? ''
  if (type.includes('application/jwt')) {
    const jwt = await res.text()
    decodeProtectedHeader(jwt) // lève si ce n'est pas un JWT
    const jwks = createRemoteJWKSet(new URL(d.jwks_uri))
    const { payload } = await jwtVerify(jwt, jwks, { issuer: d.issuer })
    return payload
  }
  return res.json()
}
