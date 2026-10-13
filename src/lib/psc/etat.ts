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
  /** Slug de la fiche visée ; vide quand la fiche sera retrouvée par le RPPS au retour. */
  fiche: string
  /** Revendiquer la fiche, ou prouver son identité pour la retirer. */
  objet: 'revendication' | 'retrait'
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

export function nouvelEtat(fiche: string, userId: string, objet: EtatPsc['objet'] = 'revendication'): EtatPsc {
  return {
    objet,
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

function scellerObjet(valeur: { exp: number }): string {
  const corps = Buffer.from(JSON.stringify(valeur)).toString('base64url')
  return `${corps}.${signer(corps)}`
}

/** Rend l'objet s'il est authentique et non expiré, `null` sinon. */
function descellerObjet<T extends { exp: number }>(valeur: string | undefined): T | null {
  if (!valeur) return null
  const [corps, signature] = valeur.split('.')
  if (!corps || !signature) return null

  const attendue = Buffer.from(signer(corps))
  const recue = Buffer.from(signature)
  if (attendue.length !== recue.length || !timingSafeEqual(attendue, recue)) return null

  try {
    const objet = JSON.parse(Buffer.from(corps, 'base64url').toString()) as T
    if (typeof objet.exp !== 'number' || objet.exp < Math.floor(Date.now() / 1000)) return null
    return objet
  } catch {
    return null
  }
}

export function sceller(etat: EtatPsc): string {
  return scellerObjet(etat)
}

/** Rend l'état s'il est authentique et non expiré, `null` sinon. */
export function desceller(valeur: string | undefined): EtatPsc | null {
  const etat = descellerObjet<EtatPsc>(valeur)
  if (!etat || !etat.state || !etat.nonce || !etat.verifier || typeof etat.fiche !== 'string' || !etat.userId) return null
  return { ...etat, objet: etat.objet === 'retrait' ? 'retrait' : 'revendication' }
}

/**
 * L'identité certifiée par Pro Santé Connect, entre le retour et la
 * confirmation (PSC2).
 *
 * Le retour ne décide plus seul : il montre la fiche qui porte le RPPS et
 * attend « Revendiquer et continuer ». Ce qui a été certifié est gardé dans
 * un cookie signé, au nom du compte, dix minutes : personne ne peut le
 * fabriquer, et il ne sert qu'à ce compte.
 */
export const COOKIE_IDENTITE = 'dm_psc_identite'

export type IdentiteScellee = {
  userId: string
  rpps: string
  identifiantNational: string
  prenom: string | null
  nom: string | null
  /** Fiche portant ce RPPS. */
  fiche: string
  exp: number
}

export function scellerIdentite(identite: Omit<IdentiteScellee, 'exp'>): string {
  return scellerObjet({ ...identite, exp: Math.floor(Date.now() / 1000) + DUREE_ETAT_SECONDES })
}

export function descellerIdentite(valeur: string | undefined, userId: string): IdentiteScellee | null {
  const identite = descellerObjet<IdentiteScellee>(valeur)
  return identite && identite.userId === userId && identite.rpps && identite.fiche ? identite : null
}
