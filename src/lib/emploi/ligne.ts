/**
 * Conversion d'une ligne SQL d'offre en `OffreResume`. Pure : partagée par
 * toutes les requêtes de `queries.ts` et testable sans base.
 */
import { formaterAdresse } from '@/lib/annuaire/nom'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import type { CodeContrat, CodeMetier, ModeRemuneration } from './metiers'
import type { OffreResume, TypeRecruteur } from './types'

export type LigneOffre = {
  id: string
  slug: string
  titre: string
  metier: CodeMetier
  contrat: CodeContrat
  temps_plein: boolean
  heures_hebdo: number | null
  debut: string | null
  fin: string | null
  mode_remuneration: ModeRemuneration
  remuneration_min: number
  remuneration_max: number
  publiee_le: string | null
  profession: Profession
  nom: string
  prenom: string | null
  raison_sociale: string | null
  adresse_ligne: string | null
  code_postal: string | null
  finess: string | null
  commune_nom: string
  commune_slug: string
  departement_slug: string
  lon: number | null
  lat: number | null
  metres: number | null
  photo_url: string | null
}

/**
 * Le type de structure, pour l'icône du visuel sans photo : un laboratoire
 * vient de Sirene, un lieu porteur d'un numéro FINESS est un établissement
 * (centre de santé), le reste un cabinet.
 */
export function typeRecruteur(profession: Profession, finess: string | null): TypeRecruteur {
  if (profession === 'prothesiste') return 'laboratoire'
  return finess ? 'centre' : 'cabinet'
}

const date = (v: string | Date | null) => (v == null ? null : v instanceof Date ? v.toISOString() : v)

export function resumeDepuisLigne(r: LigneOffre): OffreResume {
  return {
    id: r.id,
    slug: r.slug,
    titre: r.titre,
    metier: r.metier,
    contrat: r.contrat,
    tempsPlein: r.temps_plein,
    heuresHebdo: r.heures_hebdo,
    debut: r.debut,
    fin: r.fin,
    mode: r.mode_remuneration,
    min: r.remuneration_min,
    max: r.remuneration_max,
    recruteur: nomAffiche({ profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale }),
    type: typeRecruteur(r.profession, r.finess),
    adresse: r.adresse_ligne ? formaterAdresse(r.adresse_ligne) : null,
    codePostal: r.code_postal,
    commune: r.commune_nom,
    communeSlug: r.commune_slug,
    departementSlug: r.departement_slug,
    lon: r.lon,
    lat: r.lat,
    metres: r.metres,
    publieeLe: date(r.publiee_le),
    photo: r.photo_url,
  }
}
