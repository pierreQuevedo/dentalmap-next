/**
 * Lecture de l'identité renvoyée par Pro Santé Connect.
 *
 * Le jeton UserInfo de Pro Santé Connect porte l'identité du professionnel
 * telle qu'elle figure au répertoire RPPS, sous une forme qui lui est propre :
 * `SubjectNameID` est l'identifiant national, préfixé d'un chiffre qui dit le
 * type de répertoire (8 pour le RPPS, 0 pour ADELI), et `SubjectRefPro` porte
 * la liste des exercices, chacun avec un code profession de la nomenclature
 * TRE_G15.
 *
 * Ce module ne fait que lire. Il ne touche ni au réseau ni à la base, ce qui
 * permet de le tester sur des jetons d'exemple.
 */

/** Code des chirurgiens-dentistes dans la nomenclature TRE_G15, le même que dans l'extraction ANS. */
export const PROFESSION_DENTISTE = '40'
/** Code profession des médecins : chirurgiens maxillo-faciaux, stomatologues, ORL. */
export const PROFESSION_MEDECIN = '10'

export type IdentitePsc = {
  /** Identifiant national, préfixe de type compris, par exemple `899700218896`. */
  identifiantNational: string
  /** Numéro RPPS à 11 chiffres, comparable à la colonne `praticiens.rpps`. Nul hors RPPS. */
  rpps: string | null
  /** Codes profession de tous les exercices déclarés. */
  professions: string[]
  nom: string | null
  prenom: string | null
}

type Exercice = { codeProfession?: unknown }

/**
 * Ramène un identifiant national à son numéro RPPS.
 *
 * Douze caractères commençant par 8 : c'est un RPPS préfixé, on retire le
 * préfixe. Onze chiffres : c'est déjà un RPPS nu. Tout autre format, dont
 * les identifiants ADELI préfixés de 0, n'est pas un RPPS et rend `null`.
 */
export function rppsDepuisIdentifiantNational(identifiant: string): string | null {
  const propre = identifiant.trim()
  if (/^8\d{11}$/.test(propre)) return propre.slice(1)
  if (/^\d{11}$/.test(propre)) return propre
  return null
}

function chaine(valeur: unknown): string | null {
  return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null
}

/**
 * Extrait ce dont la revendication a besoin, ou `null` si le jeton ne porte
 * pas d'identifiant national. Les champs manquants ne font pas échouer la
 * lecture : seuls l'identifiant et les professions sont décisifs.
 */
export function lireIdentitePsc(userinfo: unknown): IdentitePsc | null {
  if (!userinfo || typeof userinfo !== 'object') return null
  const u = userinfo as Record<string, unknown>

  const identifiantNational = chaine(u.SubjectNameID) ?? chaine(u.preferred_username)
  if (!identifiantNational) return null

  const professions = new Set<string>()
  const refPro = u.SubjectRefPro as { exercices?: unknown } | undefined
  if (Array.isArray(refPro?.exercices)) {
    for (const ex of refPro.exercices as Exercice[]) {
      const code = chaine(ex?.codeProfession)
      if (code) professions.add(code)
    }
  }
  // `SubjectRole` double l'information sous la forme `40^1.2.250.1.71.1.2.7`.
  // On la lit aussi : un jeton sans détail d'exercice reste exploitable.
  if (Array.isArray(u.SubjectRole)) {
    for (const role of u.SubjectRole) {
      const code = chaine(role)?.split('^')[0]
      if (code) professions.add(code)
    }
  }

  return {
    identifiantNational,
    rpps: rppsDepuisIdentifiantNational(identifiantNational),
    professions: [...professions],
    nom: chaine(u.family_name),
    prenom: chaine(u.given_name),
  }
}

export function estChirurgienDentiste(identite: IdentitePsc): boolean {
  return identite.professions.includes(PROFESSION_DENTISTE) || identite.professions.includes(PROFESSION_MEDECIN)
}
