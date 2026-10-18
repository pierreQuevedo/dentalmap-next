/**
 * La règle du mot de passe, partagée par l'écran (liste qui se coche à la
 * saisie) et par le serveur (refus à l'inscription, à la réinitialisation et
 * au changement). Recommandation de la CNIL pour un mot de passe seul :
 * douze caractères au moins, des quatre familles.
 */
export const LONGUEUR_MOT_DE_PASSE = 12

export const CRITERES_MOT_DE_PASSE = [
  { cle: 'longueur', libelle: `${LONGUEUR_MOT_DE_PASSE} caractères au moins`, test: (m: string) => [...m].length >= LONGUEUR_MOT_DE_PASSE },
  { cle: 'majuscule', libelle: 'Une majuscule', test: (m: string) => /\p{Lu}/u.test(m) },
  { cle: 'minuscule', libelle: 'Une minuscule', test: (m: string) => /\p{Ll}/u.test(m) },
  { cle: 'chiffre', libelle: 'Un chiffre', test: (m: string) => /\p{Nd}/u.test(m) },
  { cle: 'special', libelle: 'Un caractère spécial (! ? @ # % & * …)', test: (m: string) => /[^\p{L}\p{Nd}\s]/u.test(m) },
] as const

export function motDePasseValide(m: string): boolean {
  return CRITERES_MOT_DE_PASSE.every((c) => c.test(m))
}

export const MESSAGE_MOT_DE_PASSE = `Le mot de passe doit compter ${LONGUEUR_MOT_DE_PASSE} caractères au moins, avec une majuscule, une minuscule, un chiffre et un caractère spécial.`
