import type { Profession } from '@/lib/annuaire/types'

/**
 * Le tunnel de connexion et d'inscription, décrit une fois pour toutes.
 *
 * Un compte avance d'étape en étape ; à chaque page, on calcule où il en est
 * et on le renvoie à la bonne étape s'il n'est pas au bon endroit. La logique
 * est ici, pure, testée ; les pages ne font que l'appeler. Deux publics, deux
 * parcours :
 *
 * - étudiant ou salarié (`candidat`) : rôle, puis son espace Emploi (profil,
 *   candidatures, avis sur son école) ; les comptes `patient` d'avant le
 *   2026-10-26, quand le profil n'est plus proposé, reviennent là où ils étaient ;
 * - professionnel : rôle, fiche à trouver, preuve de qualité, parcours
 *   d'accueil, tableau de bord.
 *
 * Une revendication en attente ne bloque pas : le parcours d'accueil est
 * ouvert tout de suite, la publication attend l'acceptation.
 */
export type Role = 'candidat' | 'patient' | 'dentiste' | 'prothesiste' | 'medecin' | 'organisme'

export const ROLES: readonly Role[] = ['candidat', 'patient', 'dentiste', 'prothesiste', 'medecin', 'organisme'] as const

/** L'espace d'un étudiant ou d'un salarié : son profil Emploi, ou le parcours de bienvenue. */
export const ESPACE_CANDIDAT = '/espace-candidat/'

/** Ni soignant ni établissement : pas de fiche à revendiquer. */
export const sansFiche = (role: Role | null) => role === 'candidat' || role === 'patient'

/** Les professions de l'annuaire qu'un rôle peut revendiquer. */
export const PROFESSIONS_DU_ROLE: Record<Role, readonly Profession[]> = {
  candidat: [],
  patient: [],
  dentiste: ['dentiste'],
  prothesiste: ['prothesiste'],
  medecin: ['maxillo_facial', 'stomatologue', 'orl'],
  organisme: [],
}

export function estRole(v: unknown): v is Role {
  return typeof v === 'string' && (ROLES as readonly string[]).includes(v)
}

export const ETAPES_TUNNEL = ['profil', 'fiche', 'verification', 'onboarding', 'tableau-de-bord'] as const
export type EtapeTunnel = (typeof ETAPES_TUNNEL)[number]

/** Chemin de chaque étape du tunnel. */
export const CHEMIN_ETAPE: Record<EtapeTunnel, string> = {
  profil: '/inscription/profil/',
  fiche: '/espace-pro/revendiquer/',
  verification: '/espace-pro/revendiquer/suivi/',
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
  if (sansFiche(etat.role) || etat.role === 'organisme') return 'tableau-de-bord'
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
/** Le chemin d'une étape pour ce rôle : un laboratoire a son propre parcours. */
export function cheminEtape(etape: EtapeTunnel, role: Role | null): string {
  if (role === 'prothesiste' && etape === 'fiche') return '/espace-pro/laboratoire/revendiquer/'
  if (role === 'prothesiste' && etape === 'onboarding') return '/espace-pro/laboratoire/onboarding/'
  return CHEMIN_ETAPE[etape]
}

export function prochaineEtape(etat: EtatCompte, retour?: string | null): string {
  const etape = etapeDe(etat)
  if (etape === 'tableau-de-bord') {
    // Un étudiant ou un salarié revient sur l'offre qu'il regardait ; sinon, son espace Emploi plutôt que l'accueil.
    if (etat.role === 'candidat') return retour && retour !== '/' ? retourSur(retour, ESPACE_CANDIDAT) : ESPACE_CANDIDAT
    return retourSur(retour, etat.role === 'patient' ? '/' : CHEMIN_ETAPE['tableau-de-bord'])
  }
  // Un retour qui pointe déjà dans l'étape est gardé : arrivé par « Revendiquer
  // cette fiche », on revient sur la revendication de cette fiche, pas sur une
  // revendication vierge.
  const sur = retourSur(retour, '')
  const cible = cheminEtape(etape, etat.role)
  // Une invitation à rejoindre une fiche passe avant la revendication.
  if (sur.startsWith('/espace-pro/invitation/')) return sur
  if (sur && (sur.startsWith(cible) || sur.startsWith(CHEMIN_ETAPE[etape]))) return sur
  return cible
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
  if (sansFiche(etat.role)) return etape === 'tableau-de-bord'
  if (etape === 'onboarding') return etat.revendications.some((r) => r.statut !== 'refusee')
  return true
}

/** Un patient et un professionnel n'ont pas le même tableau de bord : le libellé le dit. */
export function libelleRole(role: Role | null): string {
  return role === 'dentiste' ? 'Chirurgien-dentiste' : role === 'prothesiste' ? 'Prothésiste dentaire' : role === 'medecin' ? 'Médecin : chirurgien maxillo-facial, stomatologue ou ORL' : role === 'candidat' ? 'Étudiant ou salarié' : role === 'patient' ? 'Patient' : role === 'organisme' ? 'École ou organisme' : 'Non renseigné'
}
