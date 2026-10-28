/**
 * La progression d'une fiche : des points de visibilité, gagnés en complétant
 * la fiche (la force, un point par pour cent) et en la faisant connaître
 * (lien Google vérifié, badge du site, partages, parrainages, mises à jour à
 * l'heure), et des paliers qui débloquent des gains concrets.
 *
 * Les paliers 4 et 5 ajoutent un bonus au taux de remplissage pour le
 * classement, tant qu'ils sont tenus (`BONUS_PALIER`) ; les points se
 * recalculent à chaque lecture, rien n'est stocké. Maquette des états :
 * `/maquettes/progression/`.
 */

export type CleGain = 'fiche' | 'google' | 'badge' | 'partage' | 'parrainage' | 'a_jour'

/** Le barème : ce qui rapporte, combien, et à quelle condition. */
export const BAREME: { cle: CleGain; libelle: string; detail: string; points: string; max: number }[] = [
  { cle: 'fiche', libelle: 'Fiche complétée', detail: 'Un point par pour cent de la force de fiche', points: '1 par %', max: 100 },
  { cle: 'google', libelle: 'Lien sur la fiche Google', detail: 'Vérifié par un patient arrivé de Google, à renouveler tous les 30 jours', points: '+20', max: 20 },
  { cle: 'badge', libelle: 'Badge sur le site du cabinet', detail: 'Au moins une visite par le badge en 90 jours', points: '+15', max: 15 },
  { cle: 'partage', libelle: 'Partage sur les réseaux', detail: 'Au moins une visite par une story, un code QR ou une publication ce mois-ci', points: '+10', max: 10 },
  { cle: 'parrainage', libelle: 'Parrainage réussi', detail: 'Un confrère vérifié grâce à vous, trois comptent', points: '+25 chacun', max: 75 },
  { cle: 'a_jour', libelle: 'Toujours à jour', detail: 'Aucune information expirée', points: '+10', max: 10 },
]

export const POINTS_MAX = BAREME.reduce((t, b) => t + b.max, 0)

export type Palier = {
  niveau: number
  nom: string
  seuil: number
  gains: string[]
  /** Points ajoutés au taux de remplissage pour le classement, tant que le palier est tenu. */
  bonus: number
  /** Force de fiche demandée en plus des points : à partir de « Fiche exemplaire », la fiche elle-même doit être presque complète. */
  forceMin: number
}

/** La force demandée à partir du palier 3 : les points des partages ne remplacent pas une fiche remplie. */
export const FORCE_EXEMPLAIRE = 90

/** Les paliers et ce que chacun débloque. */
export const PALIERS: Palier[] = [
  { niveau: 1, nom: 'Fiche publiée', seuil: 30, gains: ['Visible dans l’annuaire et sur Google', 'Pastille « Gérée par le praticien »'], bonus: 0, forceMin: 0 },
  { niveau: 2, nom: 'Fiche complète', seuil: 70, gains: ['Tous les filtres patients ouverts', 'Visuels pour les réseaux'], bonus: 0, forceMin: 0 },
  { niveau: 3, nom: 'Fiche exemplaire', seuil: 100, gains: ['Distinction « Fiche exemplaire »', 'Visuels aux couleurs Exemplaire'], bonus: 0, forceMin: FORCE_EXEMPLAIRE },
  // Atteignable sans parrainage : fiche complète et les quatre gestes de diffusion font 155.
  { niveau: 4, nom: 'Ambassadeur', seuil: 150, gains: ['+5 points de mise en avant tant que le palier est tenu', 'Publier des offres d’emploi'], bonus: 5, forceMin: FORCE_EXEMPLAIRE },
  { niveau: 5, nom: 'Référence locale', seuil: 200, gains: ['+10 points de mise en avant tant que le palier est tenu', 'Mise en avant dans les contenus DentalMap de votre ville'], bonus: 10, forceMin: FORCE_EXEMPLAIRE },
]

export type Progression = {
  points: number
  actuel: Palier | null
  suivant: Palier | null
  reste: number
  part: number
  /**
   * Identité vérifiée. Les paliers se franchissent sans elle (décision du
   * 2026-10-28) ; elle reste exigée pour publier la fiche et pour l'emploi
   * (`recruteur`), même au palier 4 ou 5.
   */
  verifiee: boolean
  /** La force qui manque pour le palier suivant, quand ce sont elle et non les points qui bloquent ; 0 sinon. */
  forceManquante: number
}

/**
 * Où en est une fiche : le palier tenu, le suivant, et la part du chemin
 * parcourue entre les deux. Les paliers se comptent dès les points acquis,
 * identité vérifiée ou non : seule la publication de la fiche, et l'emploi,
 * attendent la vérification.
 */
export function progressionDe(points: number, verifiee = true, force = 100): Progression {
  const tenu = (p: Palier) => points >= p.seuil && force >= p.forceMin
  // Les paliers se tiennent dans l'ordre : le premier qui manque arrête la montée.
  const i = PALIERS.findIndex((p) => !tenu(p))
  const actuel = i === -1 ? PALIERS[PALIERS.length - 1] : i === 0 ? null : PALIERS[i - 1]
  const suivant = i === -1 ? null : PALIERS[i]
  const depart = actuel?.seuil ?? 0
  return {
    points,
    actuel,
    suivant,
    reste: suivant ? Math.max(0, suivant.seuil - points) : 0,
    part: suivant ? Math.min(1, (points - depart) / (suivant.seuil - depart)) : 1,
    verifiee,
    forceManquante: suivant ? Math.max(0, suivant.forceMin - force) : 0,
  }
}

/** Ce qu'il reste à faire avant le palier suivant, en clair : des points, de la force de fiche, ou les deux. */
export function resteAFaire(p: Progression): string {
  if (!p.suivant) return ''
  const pts = p.reste ? `${p.reste} point${p.reste > 1 ? 's' : ''}` : ''
  const fiche = p.forceManquante ? `une fiche remplie à ${p.suivant.forceMin} %` : ''
  return [pts, fiche].filter(Boolean).join(' et ')
}

/** Ce qui compte pour les points d'une fiche, lu ailleurs (force, lien Google, visites, parrainages, fraîcheur). */
export type Activite = {
  force: number
  google: boolean
  /** Au moins une visite par le badge du site en 90 jours. */
  badge: boolean
  /** Au moins une visite par une story, un code QR ou une publication en 30 jours. */
  partage: boolean
  /** Parrainages réussis comme parrain, depuis toujours. */
  parrainages: number
  /** Aucune information expirée. */
  aJour: boolean
  /** Identité vérifiée ; absente, vraie. */
  verifiee?: boolean
}

export type Points = { total: number; detail: Record<CleGain, number>; verifiee: boolean }

export function pointsDe(a: Activite): Points {
  const detail: Record<CleGain, number> = {
    fiche: Math.max(0, Math.min(100, Math.round(a.force))),
    google: a.google ? 20 : 0,
    badge: a.badge ? 15 : 0,
    partage: a.partage ? 10 : 0,
    parrainage: Math.min(3, Math.max(0, a.parrainages)) * 25,
    a_jour: a.aJour ? 10 : 0,
  }
  return { total: Object.values(detail).reduce((t, v) => t + v, 0), detail, verifiee: a.verifiee ?? true }
}

/** Publier des offres d'emploi : le gain du palier Ambassadeur. */
export const PALIER_EMPLOI = 4

/** Le bonus de classement d'un total de points : celui du palier tenu. */
export function bonusPalier(points: number, force = 100): number {
  return progressionDe(points, true, force).actuel?.bonus ?? 0
}

/** Où gagner chaque type de points dans l'espace pro. */
export const OU_GAGNER: Record<CleGain, string> = {
  fiche: '/espace-pro/progression/',
  google: '/espace-pro/partager/#google',
  badge: '/espace-pro/partager/#badge',
  partage: '/espace-pro/partager/#reseaux',
  parrainage: '/espace-pro/partager/#parrainage',
  a_jour: '/espace-pro/fraicheur/',
}
