import type { Profession } from '@/lib/annuaire/types'

/**
 * Le tunnel de connexion et d'inscription, décrit une fois pour toutes.
 *
 * Un compte avance d'étape en étape ; à chaque page, on calcule où il en est
 * et on le renvoie à la bonne étape s'il n'est pas au bon endroit. La logique
 * est ici, pure, testée ; les pages ne font que l'appeler. Deux publics, deux
 * parcours :
 *
 * - patient : rôle, puis retour là où il était ;
 * - professionnel : rôle, fiche à trouver, preuve de qualité, parcours
 *   d'accueil, tableau de bord.
 *
 * Une revendication en attente ne bloque pas : le parcours d'accueil est
 * ouvert tout de suite, la publication attend l'acceptation.
 */
export type Role = 'patient' | 'dentiste' | 'prothesiste' | 'medecin'

export const ROLES: readonly Role[] = ['patient', 'dentiste', 'prothesiste', 'medecin'] as const

/** Les professions de l'annuaire qu'un rôle peut revendiquer. */
export const PROFESSIONS_DU_ROLE: Record<Role, readonly Profession[]> = {
  patient: [],
  dentiste: ['dentiste'],
  prothesiste: ['prothesiste'],
  medecin: ['maxillo_facial', 'stomatologue', 'orl'],
}

export function estRole(v: unknown): v is Role {
  return typeof v === 'string' && (ROLES as readonly string[]).includes(v)
}

export const ETAPES_TUNNEL = ['profil', 'fiche', 'verification', 'onboarding', 'tableau-de-bord'] as const
export type EtapeTunnel = (typeof ETAPES_TUNNEL)[number]

/** Chemin de chaque étape ; l'étape « vérification » vit sur la page de revendication existante. */
export const CHEMIN_ETAPE: Record<EtapeTunnel, string> = {
  profil: '/inscription/profil/',
  fiche: '/espace-pro/fiche/choisir/',
  verification: '/espace-pro/revendiquer/',
  onboarding: '/espace-pro/onboarding/',
  'tableau-de-bord': '/espace-pro/',
}

export type RevendicationResume = {
  statut: 'en_attente' | 'acceptee' | 'refusee'
  /** Parcours d'accueil terminé pour cette fiche. */
  onboardingTermine: boolean
}

export type EtatCompte = {
  role: Role | null
  revendications: RevendicationResume[]
  demandeCreationEnAttente: boolean
}

/** Seuls les chemins internes sont acceptés comme retour : pas de tremplin vers un autre site. */
export function retourSur(valeur: string | null | undefined, defaut = '/'): string {
  if (!valeur || !valeur.startsWith('/') || valeur.startsWith('//')) return defaut
  return valeur
}

/** Où en est ce compte, et donc où l'envoyer. */
export function etapeDe(etat: EtatCompte): EtapeTunnel {
  if (!etat.role) return 'profil'
  if (etat.role === 'patient') return 'tableau-de-bord'
  const vivantes = etat.revendications.filter((r) => r.statut !== 'refusee')
  if (vivantes.length === 0) return etat.demandeCreationEnAttente ? 'tableau-de-bord' : 'fiche'
  if (vivantes.some((r) => !r.onboardingTermine)) return 'onboarding'
  return 'tableau-de-bord'
}

/**
 * Chemin vers lequel envoyer le compte après connexion.
 *
 * Un patient revient là où il était, ou à l'accueil. Un professionnel est
 * conduit à sa prochaine étape ; s'il a fini, `retour` l'emporte, sinon la
 * fiche passe avant tout.
 */
export function prochaineEtape(etat: EtatCompte, retour?: string | null): string {
  const etape = etapeDe(etat)
  if (etape === 'tableau-de-bord') return retourSur(retour, etat.role === 'patient' ? '/' : CHEMIN_ETAPE['tableau-de-bord'])
  return CHEMIN_ETAPE[etape]
}

/**
 * Une page du tunnel peut-elle être montrée à ce compte ?
 *
 * Les pages d'aval sont ouvertes dès que l'étape est atteinte ; les pages
 * d'amont restent accessibles pour corriger (changer de rôle, chercher une
 * autre fiche). Seule règle stricte : rien avant le profil, et rien du volet
 * professionnel pour un patient.
 */
export function etapeAutorisee(etat: EtatCompte, etape: EtapeTunnel): boolean {
  if (etape === 'profil') return true
  if (!etat.role) return false
  if (etat.role === 'patient') return etape === 'tableau-de-bord'
  if (etape === 'onboarding') return etat.revendications.some((r) => r.statut !== 'refusee')
  return true
}

/** Un patient et un professionnel n'ont pas le même tableau de bord : le libellé le dit. */
export function libelleRole(role: Role | null): string {
  return role === 'dentiste' ? 'Chirurgien-dentiste' : role === 'prothesiste' ? 'Prothésiste dentaire' : role === 'medecin' ? 'Médecin : chirurgien maxillo-facial, stomatologue ou ORL' : role === 'patient' ? 'Patient' : 'Non renseigné'
}
