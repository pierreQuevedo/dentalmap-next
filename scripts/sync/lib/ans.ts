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
  nom: 7,
  prenom: 8,
  codeProfession: 9,
  codeModeExercice: 17,
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
  nom: string
  prenom: string
  modeExercice: string
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
  codeProfession: string,
  onLigneLue?: () => void,
): AsyncGenerator<LigneAns> {
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
    if (champs[COL.codeProfession] !== codeProfession) continue
    yield {
      identifiantNational: nettoyer(champs[COL.identificationNationale]),
      rpps: nettoyer(champs[COL.identifiantPP]),
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
