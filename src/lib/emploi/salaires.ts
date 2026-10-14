/**
 * Repères de rémunération des pages Emploi, par métier et par secteur.
 *
 * Les sources officielles ne publient, par métier et par secteur, que des
 * minimums : les montants ci-dessous sont des minimums, lus dans les grilles
 * des conventions collectives ou, à l'hôpital, dans la grille publique des
 * praticiens hospitaliers (recherche du 14 octobre 2026). Ce ne sont jamais
 * des calculs sur les offres publiées. Les taux horaires des conventions sont
 * mensualisés sur 151,67 heures (35 heures par semaine), la base que fixent
 * les accords eux-mêmes.
 *
 * Un secteur sans grille commune (centre de santé, assistants à l'hôpital)
 * n'a pas de montant : la page affiche « Pas de grille de référence ».
 */
import { metierDepuisCode, type CodeMetier } from './metiers'

export const SECTEURS = ['Cabinet libéral', 'Centre de santé', 'Laboratoire de prothèse', 'Hôpital ou centre universitaire'] as const

export const SANS_GRILLE = 'Pas de grille de référence'

export type Source = { libelle: string; url: string }

/** Les textes cités sous les montants, avec leur date d'effet. */
export const SOURCES_SALAIRES = {
  idcc1619: {
    libelle:
      'Accord du 12 février 2026 relatif aux salaires, convention collective des cabinets dentaires (IDCC 1619), montants au 1er janvier 2026, étendu par arrêté du 15 juillet 2026',
    url: 'https://www.legifrance.gouv.fr/conv_coll/id/KALITEXT000054880705',
  },
  idcc993: {
    libelle:
      'Accord du 15 juin 2026 sur les salaires, convention collective des prothésistes dentaires (IDCC 993), montants au 1er octobre 2026, étendu par arrêté du 24 août 2026',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054794475',
  },
  mentions1619: {
    libelle:
      'Accord du 5 décembre 2024 relatif à la valorisation des mentions complémentaires, convention collective des cabinets dentaires (IDCC 1619) : 215 € brut par mois ajoutés au minimum de l’assistant(e) dentaire',
    url: 'https://www.legifrance.gouv.fr/conv_coll/id/KALIARTI000051352500',
  },
  ph: {
    libelle:
      'Arrêté du 8 juillet 2022 relatif aux émoluments des personnels médicaux, pharmaceutiques et odontologiques des établissements publics de santé, annexe II, montants en vigueur depuis le 1er juillet 2023',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000046029572',
  },
} as const satisfies Record<string, Source>
export type CleSource = keyof typeof SOURCES_SALAIRES

/**
 * Une case du tableau : un minimum brut mensuel pour un temps plein (avec,
 * le cas échéant, le haut de la fourchette et une précision), un texte
 * affiché tel quel (« Honoraires »), ou `null` : pas de grille de référence.
 */
export type CaseSalaire =
  | { montant: number; haut?: number; precision?: string; source: CleSource }
  | { texte: string; precision?: string }
  | null

export type LigneSalaires = { libelle: string; valeurs: CaseSalaire[] }

/** Dans l'ordre de `SECTEURS`. Les métiers absents n'ont pas de repère et n'affichent rien. */
export const SALAIRES: Partial<Record<CodeMetier, LigneSalaires>> = {
  assistant_dentaire: {
    libelle: 'Assistant(e) dentaire',
    valeurs: [{ montant: 2113, source: 'idcc1619' }, null, null, null],
  },
  secretaire: {
    libelle: 'Secrétaire de cabinet dentaire',
    valeurs: [{ montant: 2090, precision: 'Secrétaire technique', source: 'idcc1619' }, null, { montant: 1896, precision: 'Secrétaire administratif', source: 'idcc993' }, null],
  },
  prothesiste: {
    libelle: 'Prothésiste dentaire',
    valeurs: [
      { montant: 1963, haut: 3065, precision: 'Du CAP au BTS', source: 'idcc1619' },
      null,
      { montant: 1935, haut: 2293, precision: 'Du bac pro au BTS', source: 'idcc993' },
      null,
    ],
  },
  assistant_specialise: {
    libelle: 'Assistant(e) spécialisé(e)',
    valeurs: [{ montant: 2328, precision: 'Mention orthodontie ou parodontologie et implantologie, exercée', source: 'mentions1619' }, null, null, null],
  },
  aide_dentaire: {
    libelle: 'Aide dentaire',
    valeurs: [{ montant: 1905, source: 'idcc1619' }, null, null, null],
  },
  chirurgien_dentiste: {
    libelle: 'Chirurgien-dentiste',
    valeurs: [{ texte: 'Honoraires', precision: 'Exercice libéral' }, null, null, { montant: 4634, precision: 'Début de grille des praticiens hospitaliers', source: 'ph' }],
  },
}

/** « 2 113 € » ou « 1 935 € à 2 293 € ». */
export function montantTexte(c: { montant: number; haut?: number }): string {
  const e = (n: number) => `${n.toLocaleString('fr-FR')} €`
  return c.haut ? `${e(c.montant)} à ${e(c.haut)}` : e(c.montant)
}

/** Les sources citées par un ensemble de lignes, sans doublon, dans l'ordre de `SOURCES_SALAIRES`. */
export function sourcesDe(lignes: LigneSalaires[]): Source[] {
  const cles = new Set(lignes.flatMap((l) => l.valeurs.flatMap((c) => (c && 'source' in c ? [c.source] : []))))
  return (Object.keys(SOURCES_SALAIRES) as CleSource[]).filter((k) => cles.has(k)).map((k) => SOURCES_SALAIRES[k])
}

/** Ce que sont les montants, affiché avant les sources. */
export const OBJET_SALAIRES =
  'Minimum brut mensuel pour un temps plein, fixé par la convention collective ou la grille publique, et non calculé sur les offres publiées. Un salaire réel peut être plus élevé.'

/**
 * Rémunération minimale d'un alternant, en pourcentage du SMIC (lue sur
 * Légifrance le 14 octobre 2026). Apprentissage : article D6222-26 du Code du
 * travail, par âge et par année de contrat ; de 21 à 25 ans et à partir de
 * 26 ans, le minimum conventionnel s'applique s'il est plus élevé.
 */
export const APPRENTISSAGE = [
  { age: '16 et 17 ans', taux: [27, 39, 55] },
  { age: '18 à 20 ans', taux: [43, 51, 67] },
  { age: '21 à 25 ans', taux: [53, 61, 78] },
  { age: '26 ans et plus', taux: [100, 100, 100] },
] as const

/**
 * Contrat de professionnalisation, articles D6325-15 et D6325-18 : 55 % ou
 * 70 % du SMIC selon l'âge, 65 % ou 80 % avec un bac pro ou plus ; à partir de
 * 26 ans, 85 % du minimum de la branche. Pour l'assistant(e) dentaire en
 * cabinet, l'accord de branche du 12 février 2026 (IDCC 1619) fixe 90 % du
 * SMIC avant 26 ans et 100 % ensuite.
 */
export const PROFESSIONNALISATION = [
  { age: 'Moins de 21 ans', taux: 55, avecBac: 65 },
  { age: '21 à 25 ans', taux: 70, avecBac: 80 },
] as const

/** SMIC brut au 1er juin 2026, arrêté du 22 mai 2026. */
export const SMIC = { mensuel: 1867.02, horaire: 12.31, date: '1er juin 2026' } as const

export const SOURCES_ALTERNANCE: Source[] = [
  { libelle: 'Code du travail, article D6222-26 (apprentissage)', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038033238' },
  { libelle: 'Code du travail, articles D6325-14 à D6325-18 (contrat de professionnalisation)', url: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000018523001' },
  { libelle: 'Accord du 12 février 2026 relatif aux salaires, cabinets dentaires (IDCC 1619), annexe, personnel en formation', url: 'https://www.legifrance.gouv.fr/conv_coll/id/KALIARTI000054880716' },
  { libelle: 'Arrêté du 22 mai 2026 relatif au relèvement du salaire minimum de croissance', url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054126589' },
]

/** Contrats types de l'Ordre national des chirurgiens-dentistes, dans son espace documentaire. */
export const CONTRATS_TYPES_ORDRE = {
  remplacement: {
    libelle: 'Ordre national des chirurgiens-dentistes, contrats types de remplacement',
    url: 'https://www.ordre-chirurgiens-dentistes.fr/espace-documentaire/?dlm_download_category=remplacement',
  },
  collaboration: {
    libelle: 'Ordre national des chirurgiens-dentistes, contrats types de collaboration',
    url: 'https://www.ordre-chirurgiens-dentistes.fr/espace-documentaire/?dlm_download_category=collaboration',
  },
} as const satisfies Record<string, Source>

export type Repere = { texte: string; objet: string; sources: Source[] }

/**
 * Le repère affiché à côté d'une offre : le minimum conventionnel du métier
 * dans le secteur du recruteur. Pour un remplacement ou une collaboration,
 * aucun taux de référence n'existe : le repère renvoie au contrat type de
 * l'Ordre. `null` quand aucun repère n'existe : rien n'est affiché.
 */
export function repereSalaire(metier: CodeMetier, contrat: string, type: 'cabinet' | 'laboratoire' | 'centre'): Repere | null {
  if (contrat === 'remplacement' || contrat === 'collaboration') {
    const taux = contrat === 'remplacement' ? 'de rétrocession' : 'de redevance'
    return {
      texte: `Le taux ${taux} est fixé par le contrat conclu entre les praticiens, sur le modèle des contrats types de l’Ordre.`,
      objet: 'Contrat communiqué au conseil départemental de l’Ordre',
      sources: [CONTRATS_TYPES_ORDRE[contrat]],
    }
  }
  const ligne = SALAIRES[metier]
  if (!ligne) return null
  const i = type === 'laboratoire' ? 2 : type === 'centre' ? 1 : 0
  const c = ligne.valeurs[i]
  if (!c || !('montant' in c)) return null
  const precision = c.haut && c.precision ? `, ${c.precision.charAt(0).toLocaleLowerCase('fr')}${c.precision.slice(1)}` : ''
  return {
    texte: `Salaire minimum conventionnel ${metierDepuisCode(metier).de} en ${SECTEURS[i].toLocaleLowerCase('fr')} : ${montantTexte(c)} brut par mois${precision}.`,
    objet: c.source === 'ph' ? 'Minimum brut mensuel pour un temps plein, fixé par la grille publique' : 'Minimum brut mensuel pour un temps plein, fixé par la convention collective',
    sources: [SOURCES_SALAIRES[c.source]],
  }
}
