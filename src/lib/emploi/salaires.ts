/**
 * Repères de rémunération issus d'études, par métier et par secteur.
 *
 * Ce ne sont jamais des calculs sur les offres publiées : un tableau tiré de
 * quelques offres serait trompeur, et le changer à chaque publication le
 * rendrait instable. Les montants ci-dessous sont encore ceux des maquettes ;
 * ils seront remplacés par ceux de l'étude retenue, et `SOURCE_SALAIRES` par
 * sa référence exacte (décision du 13 octobre 2026 : vraies sources à citer).
 */
import { metierDepuisCode, type CodeMetier } from './metiers'

export const SECTEURS = ['Cabinet libéral', 'Centre de santé', 'Laboratoire de prothèse', 'Hôpital ou centre universitaire'] as const

export const SOURCE_SALAIRES = 'Source : étude salariale à citer, année'

/**
 * Salaire brut mensuel moyen pour un temps plein, dans l'ordre de `SECTEURS`.
 * `null` : métier peu présent dans ce secteur. Les métiers absents n'ont pas
 * encore de repère et n'affichent rien.
 */
export const SALAIRES: Partial<Record<CodeMetier, { libelle: string; valeurs: (number | null)[] }>> = {
  assistant_dentaire: { libelle: 'Assistant(e) dentaire', valeurs: [2050, 2150, null, 2250] },
  secretaire: { libelle: 'Secrétaire ou assistant(e) de gestion', valeurs: [1900, 2000, 1950, 2100] },
  prothesiste: { libelle: 'Prothésiste dentaire', valeurs: [null, 2300, 2250, 2450] },
  aide_dentaire: { libelle: 'Aide dentaire', valeurs: [1800, 1850, null, 1900] },
  chirurgien_dentiste: { libelle: 'Chirurgien-dentiste salarié(e)', valeurs: [null, 5800, null, 5200] },
}

/** Salaire moyen d'un alternant selon l'année de contrat, brut mensuel. */
export const SALAIRES_ALTERNANCE = [
  { annee: 'Première année', moyenne: 1050 },
  { annee: 'Deuxième année', moyenne: 1250 },
  { annee: 'Troisième année', moyenne: 1450 },
] as const

/** Taux moyens, en pourcentage des honoraires. */
export const RETROCESSION_MOYENNE = { remplacement: 40, collaboration: 35 } as const

/**
 * Le repère affiché à côté d'une offre : le salaire moyen du métier dans le
 * secteur du recruteur, ou le taux moyen pour un remplacement ou une
 * collaboration. `null` quand aucun repère n'existe : rien n'est affiché.
 */
export function repereSalaire(
  metier: CodeMetier,
  contrat: string,
  type: 'cabinet' | 'laboratoire' | 'centre',
): { texte: string; objet: string } | null {
  if (contrat === 'remplacement') {
    return { texte: `Rétrocession moyenne pour un remplacement : ${RETROCESSION_MOYENNE.remplacement} % des honoraires.`, objet: 'Taux moyen issu d’études' }
  }
  if (contrat === 'collaboration') {
    return { texte: `Redevance moyenne pour une collaboration libérale : ${RETROCESSION_MOYENNE.collaboration} % des honoraires.`, objet: 'Taux moyen issu d’études' }
  }
  const ligne = SALAIRES[metier]
  if (!ligne) return null
  const i = type === 'laboratoire' ? 2 : type === 'centre' ? 1 : 0
  const v = ligne.valeurs[i]
  if (v == null) return null
  return {
    texte: `Salaire moyen ${metierDepuisCode(metier).de} en ${SECTEURS[i].toLocaleLowerCase('fr')} : ${v.toLocaleString('fr-FR')} € brut par mois.`,
    objet: 'Salaire brut mensuel moyen pour un temps plein, issu d’études salariales',
  }
}
