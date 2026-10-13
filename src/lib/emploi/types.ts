import type { CodeContrat, CodeMetier, ModeRemuneration } from './metiers'

export type TypeRecruteur = 'cabinet' | 'laboratoire' | 'centre'

/**
 * Une offre en ligne, telle que les listes l'affichent. Les dates sont en
 * ISO ; la mise en forme se fait à l'affichage (`format.ts`).
 */
export type OffreResume = {
  id: string
  slug: string
  titre: string
  metier: CodeMetier
  contrat: CodeContrat
  tempsPlein: boolean
  heuresHebdo: number | null
  /** Texte libre du recruteur, ou date ISO (`2026-11-03`). */
  debut: string | null
  fin: string | null
  mode: ModeRemuneration
  /** Fourchette brute mensuelle en euros, ou pourcentage des honoraires. */
  min: number
  max: number
  /** Nom d'affichage de la fiche du recruteur. */
  recruteur: string
  type: TypeRecruteur
  adresse: string | null
  codePostal: string | null
  commune: string
  communeSlug: string
  departementSlug: string
  lon: number | null
  lat: number | null
  /** Distance au point d'origine de la page (centre de la commune), en mètres ; absente sur les pages nationales. */
  metres: number | null
  publieeLe: string | null
  /** Photo déposée par le recruteur sur sa fiche. Absente : fond neutre avec monogramme. */
  photo: string | null
}

/** Une offre complète, pour sa page. */
export type OffreDetail = OffreResume & {
  statut: 'brouillon' | 'en_ligne' | 'pourvue' | 'expiree' | 'retiree'
  /** Vrai seulement si l'offre est en ligne et pas encore expirée. */
  visible: boolean
  description: string
  profil: string | null
  avantages: string[]
  confirmeeLe: string | null
  expireLe: string | null
  departementNom: string
  departementCode: string
  regionNom: string
  communeCode: string
  /** Distance au centre de la commune de l'offre, en mètres. */
  metresCentre: number | null
  praticien: {
    slug: string
    profession: 'dentiste' | 'prothesiste' | 'maxillo_facial' | 'stomatologue' | 'orl'
    /** Chemin de la fiche publique, ou `null` si le lieu n'est pas rattaché à une commune. */
    chemin: string | null
    presentation: string | null
    presentationConfirmeeLe: string | null
  }
}
