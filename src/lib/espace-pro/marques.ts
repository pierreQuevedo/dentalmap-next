import { PERSO_MAX, PREFIXE_PERSO, nomLibre } from './labo'

/**
 * Les marques utilisées au cabinet, déclarées par le praticien : une liste
 * par famille, pour que la fiche reste lisible et que les noms soient écrits
 * juste ; une marque absente se nomme à la main (`perso:<famille>:<nom>`,
 * cinq au plus par famille). Affichées sur la fiche comme « déclarées par le
 * praticien », jamais comme un partenariat ou une recommandation.
 */

export type CleFamille = 'implants' | 'aligneurs' | 'numerique' | 'materiaux'

export type Marque = { code: string; nom: string }

export const FAMILLES_MARQUES: { cle: CleFamille; libelle: string; detail: string; marques: Marque[] }[] = [
  {
    cle: 'implants',
    libelle: 'Implants',
    detail: 'Les systèmes d’implants posés au cabinet',
    marques: [
      { code: 'straumann', nom: 'Straumann' },
      { code: 'nobel_biocare', nom: 'Nobel Biocare' },
      { code: 'zimvie', nom: 'ZimVie (Zimmer Biomet)' },
      { code: 'astra_tech', nom: 'Astra Tech (Dentsply Sirona)' },
      { code: 'anthogyr', nom: 'Anthogyr' },
      { code: 'neodent', nom: 'Neodent' },
      { code: 'megagen', nom: 'MegaGen' },
      { code: 'osstem', nom: 'Osstem' },
      { code: 'biotech_dental', nom: 'Biotech Dental' },
      { code: 'global_d', nom: 'Global D' },
      { code: 'camlog', nom: 'Camlog' },
      { code: 'bego', nom: 'BEGO' },
    ],
  },
  {
    cle: 'aligneurs',
    libelle: 'Aligneurs',
    detail: 'Les gouttières d’orthodontie proposées',
    marques: [
      { code: 'invisalign', nom: 'Invisalign' },
      { code: 'spark', nom: 'Spark' },
      { code: 'clearcorrect', nom: 'ClearCorrect' },
      { code: 'angel_aligner', nom: 'Angel Aligner' },
      { code: 'orthocaps', nom: 'Orthocaps' },
      { code: 'smilers', nom: 'Smilers' },
    ],
  },
  {
    cle: 'numerique',
    libelle: 'Numérique et imagerie',
    detail: 'Empreinte optique, usinage au fauteuil, radiographie 3D, laser',
    marques: [
      { code: 'itero', nom: 'iTero' },
      { code: 'trios', nom: '3Shape TRIOS' },
      { code: 'primescan', nom: 'Primescan' },
      { code: 'medit', nom: 'Medit' },
      { code: 'cerec', nom: 'CEREC' },
      { code: 'planmeca', nom: 'Planmeca' },
      { code: 'carestream', nom: 'Carestream Dental' },
      { code: 'vatech', nom: 'Vatech' },
      { code: 'newtom', nom: 'NewTom' },
      { code: 'fotona', nom: 'Fotona (laser)' },
      { code: 'biolase', nom: 'Biolase (laser)' },
    ],
  },
  {
    cle: 'materiaux',
    libelle: 'Matériaux et prothèse',
    detail: 'Composites, céramiques, zircone',
    marques: [
      { code: 'ivoclar', nom: 'Ivoclar' },
      { code: 'gc', nom: 'GC' },
      { code: 'solventum', nom: 'Solventum (3M)' },
      { code: 'kuraray_noritake', nom: 'Kuraray Noritake' },
      { code: 'vita', nom: 'VITA' },
      { code: 'voco', nom: 'VOCO' },
      { code: 'coltene', nom: 'Coltene' },
      { code: 'septodont', nom: 'Septodont' },
    ],
  },
]

const PAR_CODE = new Map(FAMILLES_MARQUES.flatMap((f) => f.marques.map((m) => [m.code, { ...m, famille: f.cle }] as const)))

/** Le préfixe des marques nommées à la main dans une famille. */
export const prefixeLibre = (famille: CleFamille) => `${PREFIXE_PERSO}${famille}:`

/** Les marques nommées à la main d'une famille, parmi des codes. */
function libresDe(codes: string[], famille: CleFamille): string[] {
  const p = prefixeLibre(famille)
  return codes.filter((c) => c.startsWith(p)).map((c) => c.slice(p.length))
}

/** Les codes connus, dans l'ordre du catalogue, puis les noms libres de chaque famille, nettoyés. */
export function marquesValides(codes: string[]): string[] {
  const choisis = new Set(codes)
  return FAMILLES_MARQUES.flatMap((f) => [
    ...f.marques.filter((m) => choisis.has(m.code)).map((m) => m.code),
    ...[...new Set(libresDe(codes, f.cle).map(nomLibre).filter((n): n is string => !!n))].slice(0, PERSO_MAX).map((n) => prefixeLibre(f.cle) + n),
  ])
}

/** Les marques d'une fiche, regroupées par famille ; les familles vides sont omises. */
export function marquesParFamille(codes: string[]): { libelle: string; marques: string[] }[] {
  const choisis = new Set(codes)
  return FAMILLES_MARQUES.map((f) => ({ libelle: f.libelle, marques: [...f.marques.filter((m) => choisis.has(m.code)).map((m) => m.nom), ...libresDe(codes, f.cle)] })).filter((f) => f.marques.length)
}

export const nomMarque = (code: string) => {
  if (code.startsWith(PREFIXE_PERSO)) return code.slice(code.indexOf(':', PREFIXE_PERSO.length) + 1) || null
  return PAR_CODE.get(code)?.nom ?? null
}

/** La galerie du cabinet compte à partir de trois photos. */
export const GALERIE_MIN = 3
