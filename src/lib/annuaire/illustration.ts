import type { Civilite, Profession } from './types'

/**
 * Illustration de remplacement d'une fiche sans photo.
 *
 * Aucune fiche de l'annuaire n'a de photo : elles viennent de registres, pas
 * d'inscriptions. Le visuel est choisi sur la civilité portée par le registre,
 * jamais déduite du prénom : un annuaire qui devine le genre de ses praticiens
 * se trompe, et se trompe visiblement.
 *
 * Les laboratoires de prothèse sont des structures et non des personnes : une
 * silhouette en blouse y serait un contresens, ils ont leur propre visuel, un
 * établi de prothésiste dans les mêmes gris. Seuls les treize dentistes dont la
 * civilité manque retombent sur la surface neutre.
 *
 * Partagée par les cartes de résultats et l'en-tête des fiches, pour qu'un
 * praticien ne change pas de visage d'une page à l'autre.
 */
const FONDS = {
  M: '/images/fiche-dentiste-homme.png',
  MME: '/images/fiche-dentiste-femme.png',
  laboratoire: '/images/fiche-laboratoire.png',
  neutre: '/images/fiche-sans-photo.png',
} as const

export function illustration(profession: Profession, civilite: Civilite | null): string {
  if (profession === 'prothesiste') return FONDS.laboratoire
  // Les médecins de la bouche et du visage partagent la silhouette en blouse des dentistes.
  if (!civilite) return FONDS.neutre
  return FONDS[civilite]
}
