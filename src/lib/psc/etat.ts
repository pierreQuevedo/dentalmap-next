import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto'

/**
 * État d'une authentification Pro Santé Connect en cours.
 *
 * Entre le départ vers Pro Santé Connect et le retour, il faut retenir le
 * `state` attendu, le `nonce` posé dans la requête, le vérificateur PKCE, la
 * fiche visée et le compte qui a lancé la démarche. Tout cela tient dans un
 * cookie signé plutôt qu'en base : la démarche dure quelques minutes, et un
 * cookie qui expire suffit à faire le ménage.
 *
 * La signature empêche de fabriquer un état. Elle n'empêche pas de le lire,
 * mais rien ici n'est secret : le vérificateur PKCE n'a de valeur que pour
 * celui qui détient aussi le code d'autorisation.
 */
export const COOKIE_PSC = 'dm_psc'
/** Dix minutes : le temps d'aller chercher sa carte, pas plus. */
export const DUREE_ETAT_SECONDES = 600

export type EtatPsc = {
  state: string
  nonce: string
  verifier: string
  /** Slug de la fiche à revendiquer. */
  fiche: string
  /** Compte connecté au départ ; le retour doit venir du même. */
  userId: string
  /** Expiration, en secondes depuis l'époque. */
  exp: number
}

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error('BETTER_AUTH_SECRET manquant : impossible de signer l’état Pro Santé Connect')
  return s
}

function signer(donnees: string): string {
  return createHmac('sha256', secret()).update(donnees).digest('base64url')
}

export function nouvelEtat(fiche: string, userId: string): EtatPsc {
  return {
    state: randomBytes(24).toString('base64url'),
    nonce: randomBytes(24).toString('base64url'),
    verifier: randomBytes(48).toString('base64url'),
    fiche,
    userId,
    exp: Math.floor(Date.now() / 1000) + DUREE_ETAT_SECONDES,
  }
}

/** Défi PKCE, méthode S256. */
export function defiPkce(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

export function sceller(etat: EtatPsc): string {
  const corps = Buffer.from(JSON.stringify(etat)).toString('base64url')
  return `${corps}.${signer(corps)}`
}

/** Rend l'état s'il est authentique et non expiré, `null` sinon. */
export function desceller(valeur: string | undefined): EtatPsc | null {
  if (!valeur) return null
  const [corps, signature] = valeur.split('.')
  if (!corps || !signature) return null

  const attendue = Buffer.from(signer(corps))
  const recue = Buffer.from(signature)
  if (attendue.length !== recue.length || !timingSafeEqual(attendue, recue)) return null

  try {
    const etat = JSON.parse(Buffer.from(corps, 'base64url').toString()) as EtatPsc
    if (typeof etat.exp !== 'number' || etat.exp < Math.floor(Date.now() / 1000)) return null
    if (!etat.state || !etat.nonce || !etat.verifier || !etat.fiche || !etat.userId) return null
    return etat
  } catch {
    return null
  }
}
