/**
 * Le vocabulaire d'un laboratoire de prothèse : listes fermées, pour que
 * chaque choix serve de critère de recherche aux cabinets. Un code qui n'est
 * pas ici n'existe pas ; un libellé n'est écrit qu'une fois.
 */

export const TECHNIQUES = [
  { code: 'ceramo_metallique', libelle: 'Céramo-métallique' },
  { code: 'ceramique_pressee', libelle: 'Céramique pressée' },
  { code: 'cfao', libelle: 'CFAO' },
  { code: 'implantaire', libelle: 'Implantaire' },
  { code: 'amovible', libelle: 'Amovible' },
  { code: 'orthodontie', libelle: 'Orthodontie' },
  { code: 'gouttieres', libelle: 'Gouttières' },
  { code: 'provisoires', libelle: 'Provisoires' },
] as const

export const MATERIAUX = [
  { code: 'zircone', libelle: 'Zircone' },
  { code: 'disilicate', libelle: 'Disilicate de lithium' },
  { code: 'chrome_cobalt', libelle: 'Chrome-cobalt' },
  { code: 'titane', libelle: 'Titane' },
  { code: 'resine', libelle: 'Résine' },
  { code: 'peek', libelle: 'PEEK' },
  { code: 'or', libelle: 'Or' },
] as const

/** Les pièces dont le laboratoire affiche un délai moyen, et le délai proposé au départ. */
export const PIECES = [
  { code: 'couronne_unitaire', libelle: 'Couronne unitaire', defaut: 5 },
  { code: 'bridge_3', libelle: 'Bridge 3 éléments', defaut: 8 },
  { code: 'couronne_implant', libelle: 'Couronne sur implant', defaut: 10 },
  { code: 'protheses_amovible', libelle: 'Prothèse amovible', defaut: 10 },
  { code: 'chassis', libelle: 'Châssis métallique', defaut: 8 },
  { code: 'gouttiere', libelle: 'Gouttière', defaut: 4 },
  // Proposées dans « Délais de fabrication », après l'onboarding.
  { code: 'inlay_onlay', libelle: 'Inlay ou onlay', defaut: 5 },
  { code: 'facette', libelle: 'Facette céramique', defaut: 7 },
  { code: 'bridge_implants', libelle: 'Bridge sur implants', defaut: 15 },
  { code: 'complet_implants', libelle: 'Complet sur implants', defaut: 20 },
  { code: 'prothese_complete', libelle: 'Prothèse complète', defaut: 12 },
  { code: 'provisoire', libelle: 'Provisoire', defaut: 3 },
  { code: 'reparation', libelle: 'Réparation', defaut: 2 },
  { code: 'orthodontie', libelle: 'Appareil d’orthodontie', defaut: 7 },
  { code: 'guide_chirurgical', libelle: 'Guide chirurgical', defaut: 5 },
] as const

/** Les pièces proposées pendant l'onboarding : les six plus courantes. */
export const PIECES_ONBOARDING = ['couronne_unitaire', 'bridge_3', 'couronne_implant', 'protheses_amovible', 'chassis', 'gouttiere']

/** Les quatre pièces proposées d'emblée à l'onboarding. */
export const PIECES_DEPART = ['couronne_unitaire', 'bridge_3', 'protheses_amovible', 'gouttiere']

export const DELAI_MIN = 1
export const DELAI_MAX = 60
export const RAYON_MIN = 5
export const RAYON_MAX = 150

export const ETENDUES = [
  { code: '', libelle: 'Autour du laboratoire' },
  { code: 'france', libelle: 'Toute la France' },
  { code: 'international', libelle: 'France et étranger' },
] as const

/** « 40 km · ramassage », « Toute la France · ramassage à 30 km » : la zone en quelques mots. */
export function resumeZone(z: { rayonKm: number | null; ramassage: boolean | null; zoneEtendue?: 'france' | 'international' | null }): string | null {
  if (!z.rayonKm) return null
  if (!z.zoneEtendue) return `${z.rayonKm} km${z.ramassage ? ' · ramassage' : ''}`
  return `${z.zoneEtendue === 'france' ? 'Toute la France' : 'France et étranger'}${z.ramassage ? ` · ramassage à ${z.rayonKm} km` : ''}`
}

export const JOURS_RAMASSAGE = [
  { code: 'lundi', court: 'Lun' },
  { code: 'mardi', court: 'Mar' },
  { code: 'mercredi', court: 'Mer' },
  { code: 'jeudi', court: 'Jeu' },
  { code: 'vendredi', court: 'Ven' },
  { code: 'samedi', court: 'Sam' },
] as const

export const REALISATIONS_MAX = 8

export const ROLES_LABO = [
  { code: 'gerant', titre: 'Gérant ou dirigeant', detail: 'Vous figurez sur l’extrait Kbis.' },
  { code: 'mandate', titre: 'Salarié mandaté', detail: 'Le gérant vous autorise à gérer la fiche.' },
  { code: 'salarie', titre: 'Prothésiste salarié', detail: 'Vous travaillez au laboratoire sans le représenter.' },
] as const
export type RoleLabo = (typeof ROLES_LABO)[number]['code']

export function libelleDe<T extends { code: string; libelle: string }>(liste: readonly T[], code: string): string {
  return liste.find((e) => e.code === code)?.libelle ?? code
}

/* ------------------------------------------------------------------ */
/* SIREN et SIRET                                                       */
/* ------------------------------------------------------------------ */

export const nettoyerNumero = (s: string) => s.replace(/[\s.-]/g, '')

function luhn(chiffres: string): boolean {
  let somme = 0
  for (let i = 0; i < chiffres.length; i++) {
    let c = Number(chiffres[chiffres.length - 1 - i])
    if (i % 2 === 1) {
      c *= 2
      if (c > 9) c -= 9
    }
    somme += c
  }
  return somme % 10 === 0
}

/** SIREN : neuf chiffres, clé de Luhn. */
export function sirenValide(s: string): boolean {
  const n = nettoyerNumero(s)
  return /^\d{9}$/.test(n) && luhn(n)
}

/**
 * SIRET : quatorze chiffres, clé de Luhn sur l'ensemble. Exception connue :
 * les établissements de La Poste (SIREN 356000000), dont la somme des
 * chiffres est un multiple de cinq.
 */
export function siretValide(s: string): boolean {
  const n = nettoyerNumero(s)
  if (!/^\d{14}$/.test(n)) return false
  if (n.startsWith('356000000')) return [...n].reduce((t, c) => t + Number(c), 0) % 5 === 0
  return luhn(n)
}

/** « 812 345 678 00021 », pour l'affichage. */
export function formaterSiret(s: string | null): string | null {
  if (!s) return null
  const n = nettoyerNumero(s)
  return n.length === 14 ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}` : n.length === 9 ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : n
}
