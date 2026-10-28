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

/**
 * Préposition devant le nom d'un département : « en Gironde », « dans le
 * Nord », « dans les Landes », « dans l’Ain », « à Paris ». L'usage ne suit
 * pas de règle sûre (« en Isère » mais « dans l’Isère » se lit aussi) ; la
 * table retient la forme la plus courante. Les départements absents prennent
 * « en ».
 */
const PREPOSITION_DEPARTEMENT: Record<string, string> = {
  // « dans l’ » : noms à initiale vocalique, surtout masculins.
  ain: 'dans l’', aisne: 'dans l’', allier: 'dans l’', aube: 'dans l’', aude: 'dans l’', aveyron: 'dans l’',
  eure: 'dans l’', herault: 'dans l’', indre: 'dans l’', oise: 'dans l’', orne: 'dans l’', yonne: 'dans l’',
  // « dans le » : masculins.
  'bas-rhin': 'dans le', 'haut-rhin': 'dans le', calvados: 'dans le', cantal: 'dans le', cher: 'dans le',
  doubs: 'dans le', finistere: 'dans le', gard: 'dans le', gers: 'dans le', jura: 'dans le',
  'loir-et-cher': 'dans le', loiret: 'dans le', lot: 'dans le', 'lot-et-garonne': 'dans le',
  'maine-et-loire': 'dans le', morbihan: 'dans le', nord: 'dans le', 'pas-de-calais': 'dans le',
  'puy-de-dome': 'dans le', rhone: 'dans le', tarn: 'dans le', 'tarn-et-garonne': 'dans le',
  'territoire-de-belfort': 'dans le', 'val-d-oise': 'dans le', 'val-de-marne': 'dans le', var: 'dans le',
  vaucluse: 'dans le',
  // « dans les » : pluriels.
  'alpes-de-haute-provence': 'dans les', 'alpes-maritimes': 'dans les', ardennes: 'dans les',
  'bouches-du-rhone': 'dans les', 'cotes-d-armor': 'dans les', 'deux-sevres': 'dans les',
  'hautes-alpes': 'dans les', 'hautes-pyrenees': 'dans les', 'hauts-de-seine': 'dans les', landes: 'dans les',
  'pyrenees-atlantiques': 'dans les', 'pyrenees-orientales': 'dans les', vosges: 'dans les', yvelines: 'dans les',
  // « à » : villes et îles.
  paris: 'à', 'la-reunion': 'à', mayotte: 'à', 'saint-barthelemy': 'à', 'saint-martin': 'à',
  'saint-pierre-et-miquelon': 'à', 'wallis-et-futuna': 'à',
}

const cleNom = (nom: string) =>
  nom.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Par le nom affiché : certains appelants n'ont pas le slug sous la main. */
export function enDepartement(nom: string): string {
  const p = PREPOSITION_DEPARTEMENT[cleNom(nom)] ?? 'en'
  return p.endsWith('’') ? `${p}${nom}` : `${p} ${nom}`
}
