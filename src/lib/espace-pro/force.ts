import { JOURS, PRESENTATION_MAX, PRESENTATION_MIN, termesRefuses, type FicheCompletee } from './fiche-completee'

/**
 * La force d'une fiche de soignant, et tout ce qui en découle.
 *
 * Fonctions pures, calculées à la volée, jamais stockées. La force est le taux
 * de remplissage qui ordonne les listes de résultats, avant la distance au
 * centre de la recherche (`src/lib/annuaire/remplissage.ts`). Barème et
 * règles : `docs/handoff/03-gamification.md`.
 */

const JOUR_MS = 86_400_000

export type Contexte = {
  /** Une revendication acceptée : l'identité est vérifiée. */
  identiteVerifiee: boolean
  /** Vérifiée par Pro Santé Connect. */
  viaPsc: boolean
  /** Lieux d'exercice au registre, et lieux gérés par le compte. */
  nombreDeLieux: number
  lieuxGeres: number
}

export type CleItem = 'identite' | 'horaires' | 'photo' | 'presentation' | 'soins' | 'conventionnement' | 'langues' | 'pmr'

export type ItemForce = { cle: CleItem | string; libelle: string; points: number; max: number; aReconfirmer?: boolean }

export type Force = { total: number; items: ItemForce[] }

const age = (date: string | null, maintenant: Date) => (date ? (maintenant.getTime() - new Date(date).getTime()) / JOUR_MS : Infinity)

/** Des horaires sont renseignés quand au moins un jour est ouvert : les autres sont fermés. */
export function horairesRenseignes(f: FicheCompletee | null): boolean {
  return !!f?.horaires && JOURS.some((j) => (f.horaires?.[j]?.length ?? 0) > 0)
}

/** La présentation compte entre 200 et 800 caractères, sans terme refusé. */
export function presentationValide(texte: string | null): boolean {
  if (!texte) return false
  const n = texte.trim().length
  return n >= PRESENTATION_MIN && n <= PRESENTATION_MAX && termesRefuses(texte).length === 0
}

/** Points des horaires selon leur fraîcheur : 20, 10 à reconfirmer (90 jours), 0 expirés (180 jours). */
function pointsHoraires(f: FicheCompletee, maintenant: Date): { points: number; aReconfirmer: boolean } {
  if (!horairesRenseignes(f)) return { points: 0, aReconfirmer: false }
  const jours = age(f.horairesConfirmesLe ?? f.majLe, maintenant)
  if (jours >= 180) return { points: 0, aReconfirmer: true }
  if (jours >= 90) return { points: 10, aReconfirmer: true }
  return { points: 20, aReconfirmer: false }
}

export function calculerForce(f: FicheCompletee | null, ctx: Contexte, maintenant = new Date()): Force {
  const h = f ? pointsHoraires(f, maintenant) : { points: 0, aReconfirmer: false }
  const items: ItemForce[] = [
    { cle: 'identite', libelle: 'Identité vérifiée', points: ctx.identiteVerifiee ? 30 : 0, max: 30 },
    { cle: 'horaires', libelle: 'Horaires', points: h.points, max: 20, aReconfirmer: h.aReconfirmer },
    { cle: 'photo', libelle: 'Photo du cabinet', points: f?.photoUrl ? 12 : 0, max: 12 },
    { cle: 'presentation', libelle: 'Présentation', points: presentationValide(f?.presentation ?? null) ? 10 : 0, max: 10 },
    { cle: 'soins', libelle: 'Domaines de soins', points: (f?.orientations.length ?? 0) >= 2 ? 8 : 0, max: 8 },
    { cle: 'conventionnement', libelle: 'Secteur et tiers payant', points: (f?.secteur ? 5 : 0) + (f?.tiersPayant ? 5 : 0), max: 10 },
    { cle: 'langues', libelle: 'Langues', points: (f?.langues.length ?? 0) > 0 ? 5 : 0, max: 5 },
    { cle: 'pmr', libelle: 'Accessibilité PMR', points: f?.accesPmr ? 5 : 0, max: 5 },
  ]
  return { total: items.reduce((s, i) => s + i.points, 0), items }
}

export type Palier = 'debutant' | 'intermediaire' | 'avance' | 'exemplaire'

export function palierDe(total: number): Palier {
  if (total >= 90) return 'exemplaire'
  if (total >= 70) return 'avance'
  if (total >= 40) return 'intermediaire'
  return 'debutant'
}

export const LIBELLE_PALIER: Record<Palier, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  exemplaire: 'Exemplaire',
}

/* ------------------------------------------------------------------ */
/* Missions                                                             */
/* ------------------------------------------------------------------ */

export type CleMission = 'horaires' | 'conventionnement' | 'accueil' | 'photo' | 'presentation' | 'soins' | 'liens'

export type Mission = {
  cle: CleMission | string
  titre: string
  detail: string
  /** Points de force rapportés ; 0 pour une mission hors barème. */
  gain: number
  minutes: number
  faite: boolean
  /** Où la faire. */
  href: string
}

/**
 * Les missions du tableau de bord : d'abord ce que l'onboarding a laissé de
 * côté, puis les trois missions du barème, puis les liens, hors barème.
 */
export function missionsDe(f: FicheCompletee | null): Mission[] {
  return [
    { cle: 'horaires', titre: 'Horaires', detail: 'Présence dans le filtre « Ouvert maintenant »', gain: 20, minutes: 2, faite: horairesRenseignes(f), href: '/espace-pro/onboarding/horaires/' },
    {
      cle: 'conventionnement',
      titre: 'Conventionnement',
      detail: 'Filtres « Secteur 1 » et « Tiers payant »',
      gain: 10,
      minutes: 1,
      faite: !!f?.secteur && !!f?.tiersPayant,
      href: '/espace-pro/onboarding/conventionnement/',
    },
    {
      cle: 'accueil',
      titre: 'Accueil des patients',
      detail: 'Filtres langues, PMR et enfants',
      gain: 10,
      minutes: 1,
      faite: (f?.langues.length ?? 0) > 0 && !!f?.accesPmr,
      href: '/espace-pro/onboarding/accueil/',
    },
    { cle: 'photo', titre: 'Photo du cabinet', detail: 'Image sur la fiche et dans Google', gain: 12, minutes: 2, faite: !!f?.photoUrl, href: '/espace-pro/missions/photo/' },
    {
      cle: 'presentation',
      titre: 'Présentation',
      detail: `Le texte de la fiche, ${PRESENTATION_MIN} à ${PRESENTATION_MAX} caractères`,
      gain: 10,
      minutes: 5,
      faite: presentationValide(f?.presentation ?? null),
      href: '/espace-pro/missions/presentation/',
    },
    { cle: 'soins', titre: 'Domaines de soins', detail: 'Ouvre le filtre par domaine', gain: 8, minutes: 1, faite: (f?.orientations.length ?? 0) >= 2, href: '/espace-pro/missions/soins/' },
    {
      cle: 'liens',
      titre: 'Liens du cabinet',
      detail: 'Boutons « Site du cabinet » et « Prendre rendez-vous »',
      gain: 0,
      minutes: 1,
      faite: !!f?.siteWeb || !!f?.rdvEnLigne,
      href: '/espace-pro/missions/liens/',
    },
  ]
}

/** La prochaine action : la mission au plus fort gain, à égalité la plus rapide. */
export function prochaineMission(missions: Mission[]): Mission | null {
  const restantes = missions.filter((m) => !m.faite)
  if (!restantes.length) return null
  return [...restantes].sort((a, b) => b.gain - a.gain || a.minutes - b.minutes)[0]
}

/* ------------------------------------------------------------------ */
/* Filtres patients                                                     */
/* ------------------------------------------------------------------ */

export type Filtre = { libelle: string; actif: boolean }

/** Les huit filtres de la recherche où la fiche peut apparaître, et ceux qu'elle ouvre déjà. */
export function filtresDe(f: FicheCompletee | null, maintenant = new Date()): Filtre[] {
  const horairesOk = !!f && horairesRenseignes(f) && age(f.horairesConfirmesLe ?? f.majLe, maintenant) < 180
  const autreLangue = f?.langues.find((l) => l !== 'fr')
  const nomLangue: Record<string, string> = { en: 'Anglais', es: 'Espagnol', de: 'Allemand', it: 'Italien', pt: 'Portugais', ar: 'Arabe' }
  return [
    { libelle: 'Ouvert maintenant', actif: horairesOk },
    { libelle: f?.secteur === 'secteur_2' ? 'Secteur 2' : f?.secteur === 'non_conventionne' ? 'Non conventionné' : 'Secteur 1', actif: !!f?.secteur },
    { libelle: 'Tiers payant', actif: !!f?.tiersPayant && f.tiersPayant !== 'aucun' },
    { libelle: autreLangue ? (nomLangue[autreLangue] ?? 'Autre langue') : 'Langue étrangère', actif: !!autreLangue },
    { libelle: 'Accès PMR', actif: f?.accesPmr === 'oui' },
    { libelle: 'Enfants', actif: f?.ageMinimum !== null && f?.ageMinimum !== undefined && f.ageMinimum <= 12 },
    { libelle: 'Domaine de soins', actif: (f?.orientations.length ?? 0) > 0 },
    { libelle: 'Image dans Google', actif: !!f?.photoUrl },
  ]
}

/* ------------------------------------------------------------------ */
/* Fraîcheur                                                            */
/* ------------------------------------------------------------------ */

export type CleFraicheur = 'horaires' | 'conventionnement' | 'accueil' | 'presentation' | 'photo'

export type Fraicheur = {
  cle: CleFraicheur | string
  libelle: string
  confirmeLe: string | null
  /** Jours depuis la dernière confirmation. */
  jours: number
  /** Durée de validité, en jours. */
  validite: number
  /** Écoulé, de 0 à 1. */
  part: number
  etat: 'a_jour' | 'rappel' | 'a_reconfirmer' | 'expire'
  regle: string
}

const REGLES: Record<CleFraicheur, { libelle: string; validite: number; rappel: number; regle: string }> = {
  horaires: { libelle: 'Horaires', validite: 90, rappel: 75, regle: 'Rappel à 75 jours, points réduits à 90, sortie du filtre « Ouvert maintenant » à 180' },
  conventionnement: { libelle: 'Conventionnement et tiers payant', validite: 365, rappel: 350, regle: 'Reconfirmation annuelle, ou dès qu’il change' },
  accueil: { libelle: 'Langues, accès, enfants', validite: 365, rappel: 350, regle: 'Reconfirmation annuelle' },
  presentation: { libelle: 'Présentation', validite: 365, rappel: 350, regle: 'Reconfirmation annuelle' },
  photo: { libelle: 'Photo du cabinet', validite: 730, rappel: 715, regle: 'À renouveler tous les deux ans' },
}

/** Les blocs renseignés, chacun avec sa date, son échéance et son état. */
export function fraicheurDe(f: FicheCompletee | null, maintenant = new Date()): Fraicheur[] {
  if (!f) return []
  const blocs: [CleFraicheur, boolean, string | null][] = [
    ['horaires', horairesRenseignes(f), f.horairesConfirmesLe],
    ['conventionnement', !!f.secteur || !!f.tiersPayant, f.conventionnementConfirmeLe],
    ['accueil', f.langues.length > 0 || !!f.accesPmr || f.ageMinimum !== null, f.accueilConfirmeLe],
    ['presentation', !!f.presentation, f.presentationConfirmeeLe],
    ['photo', !!f.photoUrl, f.photoConfirmeeLe],
  ]
  return blocs
    .filter(([, renseigne]) => renseigne)
    .map(([cle, , le]) => {
      const r = REGLES[cle]
      const confirmeLe = le ?? f.majLe
      const jours = Math.max(0, Math.floor(age(confirmeLe, maintenant)))
      const etat = cle === 'horaires' && jours >= 180 ? 'expire' : jours >= r.validite ? 'a_reconfirmer' : jours >= r.rappel ? 'rappel' : 'a_jour'
      return { cle, libelle: r.libelle, confirmeLe, jours, validite: r.validite, part: Math.min(1, jours / r.validite), etat, regle: r.regle }
    })
}

/* ------------------------------------------------------------------ */
/* Distinctions                                                         */
/* ------------------------------------------------------------------ */

export type Distinction = { code: string; titre: string; condition: string; obtenue: boolean }

/**
 * Les distinctions d'un soignant, privées : jamais affichées aux patients, et
 * sans effet sur l'ordre des résultats. Calculées sur l'état présent ;
 * « Toujours à jour » demande un historique de reconfirmations qui n'est pas
 * encore tenu, elle reste donc à obtenir.
 */
export function distinctionsDe(f: FicheCompletee | null, ctx: Contexte, force: Force): Distinction[] {
  return [
    { code: 'fiche_verifiee', titre: 'Fiche vérifiée', condition: 'Identité confirmée', obtenue: ctx.identiteVerifiee },
    { code: 'identifie_psc', titre: 'Identifié PSC', condition: 'Connexion par Pro Santé Connect', obtenue: ctx.viaPsc },
    { code: 'horaires_complets', titre: 'Horaires complets', condition: 'Sept jours renseignés', obtenue: horairesRenseignes(f) },
    { code: 'cabinet_accessible', titre: 'Cabinet accessible', condition: 'Accès renseigné', obtenue: !!f?.accesPmr },
    { code: 'bilingue', titre: 'Bilingue', condition: 'Au moins deux langues', obtenue: (f?.langues ?? []).some((l) => l !== 'fr') },
    { code: 'fiche_exemplaire', titre: 'Fiche exemplaire', condition: 'Palier à 90 %', obtenue: force.total >= 90 },
    { code: 'toujours_a_jour', titre: 'Toujours à jour', condition: 'Trois reconfirmations trimestrielles de suite', obtenue: false },
    {
      code: 'multi_lieux',
      titre: 'Multi-lieux',
      condition: 'Tous les lieux d’exercice complétés',
      obtenue: ctx.nombreDeLieux > 1 && ctx.lieuxGeres >= ctx.nombreDeLieux,
    },
  ]
}
