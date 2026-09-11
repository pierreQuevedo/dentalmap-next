import { formaterNom, formaterRaisonSociale } from './nom'

export type Profession = 'dentiste' | 'prothesiste'

/** Segment d'URL correspondant à une profession. La hiérarchie est figée. */
export const BASE_URL: Record<Profession, 'dentistes' | 'prothesistes'> = {
  dentiste: 'dentistes',
  prothesiste: 'prothesistes',
}

export const PROFESSION_PAR_BASE = {
  dentistes: 'dentiste',
  prothesistes: 'prothesiste',
} as const satisfies Record<string, Profession>

export type BaseUrl = keyof typeof PROFESSION_PAR_BASE

export type Lieu = {
  id: string
  adresseLigne: string | null
  codePostal: string | null
  telephone: string | null
  principal: boolean
  approximative: boolean
  lon: number | null
  lat: number | null
  communeNom: string | null
  communeSlug: string | null
  departementSlug: string | null
}

export type Praticien = {
  id: string
  slug: string
  profession: Profession
  nom: string
  prenom: string | null
  raisonSociale: string | null
  rpps: string | null
  siren: string | null
  statutVerification: 'verifie' | 'partiel' | 'non_verifie'
  indexable: boolean
  supprimeLe: string | null
  majLe: string
  lieux: Lieu[]
}

/** Ligne de liste : le strict nécessaire pour afficher une carte de résultat. */
export type PraticienResume = {
  slug: string
  nom: string
  prenom: string | null
  raisonSociale: string | null
  statutVerification: 'verifie' | 'partiel' | 'non_verifie'
  adresseLigne: string | null
  codePostal: string | null
  telephone: string | null
  communeNom: string | null
  communeSlug: string | null
  departementSlug: string | null
  lon: number | null
  lat: number | null
}

/**
 * Nom d'affichage : raison sociale pour un laboratoire, civilité pour un
 * praticien. Les sources livrent tout en capitales, la mise en forme est faite
 * ici pour qu'aucune page n'ait à y penser.
 */
export function nomAffiche(p: {
  profession?: Profession
  nom: string
  prenom?: string | null
  raisonSociale?: string | null
}): string {
  if (p.profession === 'prothesiste') return formaterRaisonSociale(p.raisonSociale || p.nom)
  const complet = [formaterNom(p.prenom), formaterNom(p.nom)].filter(Boolean).join(' ')
  return complet ? `Dr ${complet}` : formaterNom(p.nom)
}

export function cheminPraticien(base: BaseUrl, departement: string, commune: string, slug: string): string {
  return `/${base}/${departement}/${commune}/${slug}/`
}
