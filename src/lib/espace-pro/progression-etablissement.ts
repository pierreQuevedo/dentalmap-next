import type { Force } from './force'
import type { MissionEtab } from './etablissement'

/**
 * La progression d'une page d'établissement (école, faculté) : le taux de
 * page complète (`calculerForceEtablissement`, 100 points) et trois paliers.
 * Comme pour les soignants, rien n'est stocké : tout se recalcule à chaque
 * lecture. Sans vérification de l'identité, aucun palier n'est tenu.
 */

export type PalierEtab = { niveau: number; nom: string; seuil: number; gains: string[] }

export const PALIERS_ETAB: PalierEtab[] = [
  { niveau: 1, nom: 'Page publiée', seuil: 30, gains: ['Visible dans la recherche des formations', 'Pastille « Vérifié » sur la page'] },
  { niveau: 2, nom: 'Page complète', seuil: 70, gains: ['Les questions des futurs étudiants ont leur réponse', 'Accès, formations et photo affichés'] },
  { niveau: 3, nom: 'Page exemplaire', seuil: 100, gains: ['Toutes les rubriques remplies', 'Portes ouvertes annoncées en tête de page'] },
]

export type ProgressionEtab = { total: number; actuel: PalierEtab | null; suivant: PalierEtab | null; reste: number; part: number; verifiee: boolean }

/** Le palier tenu, le suivant, et la part du chemin parcourue entre les deux. */
export function progressionEtab(total: number, verifiee: boolean): ProgressionEtab {
  if (!verifiee) return { total, actuel: null, suivant: PALIERS_ETAB[0], reste: Math.max(0, PALIERS_ETAB[0].seuil - total), part: Math.min(1, total / PALIERS_ETAB[0].seuil), verifiee }
  const actuel = [...PALIERS_ETAB].reverse().find((p) => total >= p.seuil) ?? null
  const suivant = PALIERS_ETAB.find((p) => total < p.seuil) ?? null
  const depart = actuel?.seuil ?? 0
  return { total, actuel, suivant, reste: suivant ? suivant.seuil - total : 0, part: suivant ? (total - depart) / (suivant.seuil - depart) : 1, verifiee }
}

/** Le titre de l'encart quand un bloc vient de rapporter. */
export const TITRE_GAIN_ETAB: Record<string, string> = {
  identite: 'Identité vérifiée',
  formations: 'Formations renseignées',
  acces: 'Accès aux études décrit',
  alternance: 'Voies de formation indiquées',
  centres: 'Centres de soins complets',
  portes_ouvertes: 'Portes ouvertes annoncées',
  photo: 'Photo ajoutée',
}

/** Une source de pour cent : ce qui est acquis, le maximum, et où la gagner. */
export type SourceEtab = { cle: string; libelle: string; titre: string; acquis: number; max: number; href: string | null; duree: string | null }

/**
 * Les sources, dans l'ordre des missions (le plus rentable d'abord), puis
 * l'identité, qui se gagne par la vérification et non dans l'espace.
 */
export function sourcesEtab(force: Force, missions: MissionEtab[]): SourceEtab[] {
  const item = (cle: string) => force.items.find((i) => i.cle === cle)
  const depuisMissions = missions.flatMap((m) => {
    const i = item(m.cle)
    return i ? [{ cle: m.cle, libelle: i.libelle, titre: m.titre, acquis: i.points, max: i.max, href: m.href, duree: m.duree }] : []
  })
  const id = item('identite')
  return [...depuisMissions, ...(id ? [{ cle: 'identite', libelle: id.libelle, titre: 'Vérification de votre identité', acquis: id.points, max: id.max, href: null, duree: null }] : [])]
}

/** Points acquis par bloc, pour retrouver d'une visite à l'autre ce qui a rapporté. */
export function detailForce(force: Force): Record<string, number> {
  return Object.fromEntries(force.items.map((i) => [i.cle, i.points]))
}

/** Le bloc qui a le plus monté entre deux visites. */
export function blocGagne(avant: Record<string, number>, apres: Record<string, number>): string | null {
  const cles = Object.keys(apres).filter((c) => apres[c] > (avant[c] ?? 0))
  return cles.sort((x, y) => apres[y] - (avant[y] ?? 0) - (apres[x] - (avant[x] ?? 0)))[0] ?? null
}

/** Ce que chaque bloc enregistré fait gagner (une faculté n'a pas d'alternance : 0 point). */
const BLOC_ITEMS: Record<string, { texte: string; items: string[] }> = {
  formations: { texte: 'Formations enregistrées', items: ['formations', 'acces', 'alternance'] },
  cursus: { texte: 'Cursus enregistré', items: [] },
  voiesAcces: { texte: 'Accès aux études décrit', items: ['acces'] },
  centres: { texte: 'Centres de soins enregistrés', items: ['centres'] },
  galerie: { texte: 'Galerie mise à jour', items: ['photo'] },
  portesOuvertes: { texte: 'Portes ouvertes annoncées', items: ['portes_ouvertes'] },
  presentation: { texte: 'Présentation enregistrée', items: [] },
}

export type EvenementEtab = { cle: string; texte: string; le: string; points: number }

/**
 * L'historique de la page, lu dans ce qui est daté : la demande de gestion, la
 * publication, la dernière confirmation de chaque bloc. Les points sont ceux
 * que le bloc apporte aujourd'hui ; le plus récent d'abord.
 */
export function historiqueEtab(
  e: { confirmeLe: Record<string, string>; demandeLe: string | null; publieeLe: string | null; type: 'ecole_prothese' | 'faculte' },
  force: Force,
): EvenementEtab[] {
  const pts = (cles: string[]) => cles.reduce((s, c) => s + (force.items.find((i) => i.cle === c)?.points ?? 0), 0)
  const blocs = Object.entries(e.confirmeLe).flatMap(([bloc, le]) => {
    const b = BLOC_ITEMS[bloc]
    if (!b || !le) return []
    return [{ cle: bloc, texte: e.type === 'faculte' && bloc === 'formations' ? 'Diplôme et durée enregistrés' : b.texte, le, points: pts(b.items) }]
  })
  return [
    ...blocs,
    ...(e.publieeLe ? [{ cle: 'publication', texte: 'Page publiée', le: e.publieeLe, points: pts(['identite']) }] : []),
    ...(e.demandeLe ? [{ cle: 'demande', texte: 'Gestion de la page demandée', le: e.demandeLe, points: 0 }] : []),
  ].sort((a, b) => b.le.localeCompare(a.le))
}
