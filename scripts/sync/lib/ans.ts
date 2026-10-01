/**
 * Lecture du fichier d'extraction en libre accès de l'Annuaire Santé.
 *
 * Le fichier pèse environ 780 Mo pour 2,3 millions de lignes, toutes
 * professions confondues. Il est lu en flux, ligne par ligne : le charger en
 * mémoire n'est pas envisageable.
 *
 * Format : texte, séparateur barre verticale, 55 colonnes, une ligne par
 * situation d'exercice. Un praticien peut donc apparaître plusieurs fois.
 */
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

/** Code profession des chirurgiens-dentistes dans la nomenclature TRE_G15. */
export const PROFESSION_DENTISTE = '40'
/** Code profession des médecins. */
export const PROFESSION_MEDECIN = '10'

/**
 * Les médecins retenus, par le libellé de leur savoir-faire. Relevé sur le
 * fichier du 17 septembre 2026 : « Chirurgie maxillo-faciale et stomatologie »
 * (1 279 activités), « Stomatologie » (1 205), « Oto-rhino-laryngologie »
 * (4 042), « Chirurgie maxillo-faciale » (187), « Chirurgie maxillo-faciale
 * (réforme 2017) » (124). La chirurgie orale exercée par des médecins n'est
 * pas retenue : c'est une spécialité de dentiste dans l'annuaire.
 */
export type ProfessionMedecin = 'maxillo_facial' | 'stomatologue' | 'orl'
export function professionDuMedecin(savoirFaire: string): ProfessionMedecin | null {
  const s = savoirFaire.toLowerCase()
  if (s.includes('maxillo')) return 'maxillo_facial'
  if (s.includes('stomato')) return 'stomatologue'
  if (s.includes('rhino')) return 'orl'
  return null
}

/**
 * Position des colonnes utilisées, en base 0.
 *
 * Relevé sur le fichier du 11 septembre 2026. La colonne 44, « Code
 * Département (structure) », est vide sur toutes les lignes : le département se
 * déduit du code commune, jamais de cette colonne.
 */
export const COL = {
  identifiantPP: 1,
  identificationNationale: 2,
  /**
   * « Code civilité », `M` ou `MME`, à ne pas confondre avec la colonne 3,
   * « Code civilité d'exercice », qui porte le titre (DR, PR) et non le genre.
   * Elle est renseignée sur toutes les lignes de l'extraction.
   */
  civilite: 5,
  nom: 7,
  prenom: 8,
  codeProfession: 9,
  /** « Civil », « Étudiant » ou « Agent public ». Renseigné sur toutes les lignes. */
  categorieProfessionnelle: 12,
  /**
   * Spécialité ordinale : orthopédie dento-faciale, chirurgie orale, médecine
   * bucco-dentaire. Renseignée sur 7 % des lignes seulement, mais c'est
   * exactement l'information qu'un patient cherche quand elle existe.
   */
  specialite: 16,
  codeModeExercice: 17,
  /** « Lib,indép,artis,com », « Salarié » ou « Bénévole ». Renseigné à 81 %. */
  libelleModeExercice: 18,
  /** Numéro FINESS du site, pour les lieux rattachés à un établissement. */
  finess: 21,
  siret: 19,
  siren: 20,
  identifiantStructure: 23,
  raisonSociale: 24,
  numeroVoie: 28,
  indiceRepetition: 29,
  libelleTypeVoie: 31,
  libelleVoie: 32,
  codePostal: 35,
  codeCommune: 36,
  libelleCommune: 37,
  telephone: 40,
} as const

export type LigneAns = {
  identifiantNational: string
  rpps: string
  civilite: string
  nom: string
  prenom: string
  categorieProfessionnelle: string
  specialite: string
  /** Code profession TRE_G15 de la ligne : 40 dentiste, 10 médecin. */
  codeProfession: string
  modeExercice: string
  libelleModeExercice: string
  finess: string
  siret: string
  siren: string
  identifiantStructure: string
  raisonSociale: string
  adresseLigne: string
  codePostal: string
  codeCommune: string
  libelleCommune: string
  telephone: string
}

function nettoyer(v: string | undefined): string {
  return (v ?? '').trim()
}

/**
 * Recompose l'adresse à partir des colonnes séparées.
 *
 * L'indice de répétition (bis, ter) et le libellé de type de voie sont bien
 * utilisés : une simple concaténation du numéro et du libellé fait perdre
 * plusieurs points de taux de géocodage.
 */
export function composerAdresse(champs: string[]): string {
  return [
    nettoyer(champs[COL.numeroVoie]),
    nettoyer(champs[COL.indiceRepetition]),
    nettoyer(champs[COL.libelleTypeVoie]),
    nettoyer(champs[COL.libelleVoie]),
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parcourt le fichier et ne rend que les lignes de la profession demandée.
 *
 * `onLigneLue` est appelé pour chaque ligne du fichier, filtrée ou non, afin de
 * pouvoir compter ce qui a réellement été parcouru.
 */
export async function* lireAns(
  chemin: string,
  codeProfession: string | readonly string[],
  onLigneLue?: () => void,
): AsyncGenerator<LigneAns> {
  const codes = new Set(typeof codeProfession === 'string' ? [codeProfession] : codeProfession)
  const rl = createInterface({
    input: createReadStream(chemin, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  let premiere = true
  for await (const ligne of rl) {
    if (premiere) {
      premiere = false
      continue // en-tête
    }
    if (!ligne) continue
    onLigneLue?.()
    // Découpage paresseux : on teste la profession avant de tout découper.
    const champs = ligne.split('|')
    if (!codes.has(champs[COL.codeProfession] ?? '')) continue
    yield {
      codeProfession: champs[COL.codeProfession] ?? '',
      identifiantNational: nettoyer(champs[COL.identificationNationale]),
      rpps: nettoyer(champs[COL.identifiantPP]),
      civilite: nettoyer(champs[COL.civilite]).toUpperCase(),
      categorieProfessionnelle: nettoyer(champs[COL.categorieProfessionnelle]),
      specialite: nettoyer(champs[COL.specialite]),
      libelleModeExercice: nettoyer(champs[COL.libelleModeExercice]),
      finess: nettoyer(champs[COL.finess]),
      nom: nettoyer(champs[COL.nom]),
      prenom: nettoyer(champs[COL.prenom]),
      modeExercice: nettoyer(champs[COL.codeModeExercice]),
      siret: nettoyer(champs[COL.siret]),
      siren: nettoyer(champs[COL.siren]),
      identifiantStructure: nettoyer(champs[COL.identifiantStructure]),
      raisonSociale: nettoyer(champs[COL.raisonSociale]),
      adresseLigne: composerAdresse(champs),
      codePostal: nettoyer(champs[COL.codePostal]),
      codeCommune: nettoyer(champs[COL.codeCommune]),
      libelleCommune: nettoyer(champs[COL.libelleCommune]),
      telephone: nettoyer(champs[COL.telephone]),
    }
  }
}
