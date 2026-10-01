import type { Profession } from './types'

/**
 * Libellés des professions, partagés par toutes les pages de l'annuaire.
 *
 * Un seul endroit pour « chirurgiens-dentistes » et « laboratoires de
 * prothèse dentaire » : les titres, les descriptions et les fils d'Ariane de
 * l'index, des régions, des départements et des communes disent la même chose.
 */
export const LIBELLE: Record<Profession, { singulier: string; pluriel: string; registre: string }> = {
  dentiste: {
    singulier: 'chirurgien-dentiste',
    pluriel: 'chirurgiens-dentistes',
    registre: 'du répertoire partagé des professionnels de santé',
  },
  prothesiste: {
    singulier: 'laboratoire de prothèse dentaire',
    pluriel: 'laboratoires de prothèse dentaire',
    registre: 'de la base Sirene de l’INSEE',
  },
  maxillo_facial: {
    singulier: 'chirurgien maxillo-facial',
    pluriel: 'chirurgiens maxillo-faciaux',
    registre: 'du répertoire partagé des professionnels de santé',
  },
  stomatologue: {
    singulier: 'stomatologue',
    pluriel: 'stomatologues',
    registre: 'du répertoire partagé des professionnels de santé',
  },
  orl: {
    singulier: 'ORL',
    pluriel: 'ORL',
    registre: 'du répertoire partagé des professionnels de santé',
  },
}

/** Titre de rubrique, plus complet que le pluriel courant. */
export const TITRE: Record<Profession, string> = {
  dentiste: 'Chirurgiens-dentistes',
  prothesiste: 'Laboratoires de prothèse dentaire',
  maxillo_facial: 'Chirurgiens maxillo-faciaux',
  stomatologue: 'Stomatologues',
  orl: 'Oto-rhino-laryngologistes',
}

export const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** « 3 chirurgiens-dentistes », « 1 laboratoire de prothèse dentaire ». */
export function compte(profession: Profession, n: number): string {
  const l = LIBELLE[profession]
  return `${n.toLocaleString('fr-FR')} ${n > 1 ? l.pluriel : l.singulier}`
}

/**
 * Préposition devant le nom d'une région : « en Bretagne », « dans le Grand
 * Est », « à La Réunion ». Dix-huit régions, une table vaut mieux qu'une
 * règle. Les régions absentes de la table prennent « en ».
 */
const PREPOSITION_REGION: Record<string, string> = {
  'grand-est': 'dans le',
  'hauts-de-france': 'dans les',
  'pays-de-la-loire': 'dans les',
  'la-reunion': 'à',
  mayotte: 'à',
  'saint-pierre-et-miquelon': 'à',
  'saint-barthelemy': 'à',
  'saint-martin': 'à',
  'wallis-et-futuna': 'à',
  'nouvelle-caledonie': 'en',
  'polynesie-francaise': 'en',
}

export function enRegion(slug: string, nom: string): string {
  return `${PREPOSITION_REGION[slug] ?? 'en'} ${nom}`
}
