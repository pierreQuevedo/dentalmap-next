import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose'

/**
 * Cœur du simulateur de Pro Santé Connect.
 *
 * Il fabrique ce que l'ANS fabriquerait : un code d'autorisation lié au
 * défi PKCE et au nonce, un jeton d'identité signé RS256 vérifiable par les
 * clés qu'il publie, et un UserInfo de la forme exacte documentée par l'ANS.
 * Le client de `src/lib/psc/client.ts` ne sait pas qu'il parle à un
 * simulateur : c'est tout l'intérêt, le code de production est celui qui est
 * exercé.
 *
 * Les routes qui l'exposent refusent de servir hors développement, voir
 * `simulateurActif()` dans `config.ts`.
 */

export type IdentiteSimulee = {
  rpps: string
  codeProfession: string
  nom: string
  prenom: string
}

/** Fenêtre de validité du code et du jeton d'accès. */
const DUREE_SECONDES = 300

function secret(): string {
  return process.env.BETTER_AUTH_SECRET ?? 'simulateur-sans-secret'
}

function signer(corps: string): string {
  return createHmac('sha256', `${secret()}:psc-simulateur`).update(corps).digest('base64url')
}

function sceller(donnees: object): string {
  const corps = Buffer.from(JSON.stringify(donnees)).toString('base64url')
  return `${corps}.${signer(corps)}`
}

function desceller<T>(valeur: string | null | undefined): T | null {
  if (!valeur) return null
  const [corps, sig] = valeur.split('.')
  if (!corps || !sig) return null
  const a = Buffer.from(signer(corps))
  const b = Buffer.from(sig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const d = JSON.parse(Buffer.from(corps, 'base64url').toString()) as T & { exp: number }
    return d.exp > Math.floor(Date.now() / 1000) ? d : null
  } catch {
    return null
  }
}

type Code = { identite: IdentiteSimulee; nonce: string; challenge: string; redirectUri: string; exp: number }
type Acces = { identite: IdentiteSimulee; exp: number }

export function emettreCode(args: Omit<Code, 'exp'>): string {
  return sceller({ ...args, exp: Math.floor(Date.now() / 1000) + DUREE_SECONDES })
}

/** Rend le contenu du code si la signature, l'expiration et le vérificateur PKCE sont bons. */
export function consommerCode(code: string, verifier: string, redirectUri: string): Code | null {
  const c = desceller<Code>(code)
  if (!c) return null
  if (c.redirectUri !== redirectUri) return null
  const attendu = createHash('sha256').update(verifier).digest('base64url')
  return attendu === c.challenge ? c : null
}

export function emettreAcces(identite: IdentiteSimulee): string {
  return sceller({ identite, exp: Math.floor(Date.now() / 1000) + DUREE_SECONDES } satisfies Acces)
}

export function lireAcces(bearer: string | null): IdentiteSimulee | null {
  const jeton = bearer?.replace(/^Bearer\s+/i, '')
  return desceller<Acces>(jeton)?.identite ?? null
}

/**
 * Paire de clés du simulateur, conservée sur `globalThis` : en développement,
 * les modules sont rechargés à chaud et une clé régénérée à chaque fois
 * rendrait les jetons émis une seconde plus tôt invérifiables.
 */
type Cles = { prive: CryptoKey; jwk: JWK; kid: string }
const g = globalThis as unknown as { __pscSimulateurCles?: Promise<Cles> }

export function cles(): Promise<Cles> {
  g.__pscSimulateurCles ??= (async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true })
    const jwk = await exportJWK(publicKey)
    const kid = randomBytes(8).toString('hex')
    return { prive: privateKey, jwk: { ...jwk, kid, alg: 'RS256', use: 'sig' }, kid }
  })()
  return g.__pscSimulateurCles
}

export async function emettreIdToken(args: {
  issuer: string
  clientId: string
  identite: IdentiteSimulee
  nonce: string
}): Promise<string> {
  const { prive, kid } = await cles()
  return new SignJWT({ nonce: args.nonce, preferred_username: `8${args.identite.rpps}`, acr: 'eidas1' })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuer(args.issuer)
    .setAudience(args.clientId)
    .setSubject(`f:simulateur:8${args.identite.rpps}`)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(prive)
}

/** UserInfo dans la forme documentée par l'ANS, réduite aux champs que l'on lit. */
export function userinfo(identite: IdentiteSimulee): Record<string, unknown> {
  const identifiantNational = `8${identite.rpps}`
  return {
    sub: `f:simulateur:${identifiantNational}`,
    preferred_username: identifiantNational,
    given_name: identite.prenom,
    family_name: identite.nom,
    SubjectNameID: identifiantNational,
    SubjectRole: [`${identite.codeProfession}^1.2.250.1.71.1.2.7`],
    SubjectRefPro: {
      codeCivilite: 'M',
      exercices: [
        {
          codeProfession: identite.codeProfession,
          codeCategorieProfessionnelle: 'C',
          codeCiviliteDexercice: 'DR',
          nomDexercice: identite.nom,
          prenomDexercice: identite.prenom,
          activities: [],
        },
      ],
    },
    otherIds: [{ identifiant: identifiantNational, origine: 'RPPS', qualite: 'NAT' }],
  }
}
