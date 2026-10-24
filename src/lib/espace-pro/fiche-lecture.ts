import { sql } from 'drizzle-orm'
import type { FicheCompletee } from './fiche-completee'

/**
 * Lecture d'une ligne de `fiches_completees`, partagée par la fiche publique
 * (mise en cache) et l'espace pro (jamais en cache) : une seule liste de
 * colonnes, une seule conversion.
 */
export const COLONNES_FICHE = sql`
  f.horaires, f.langues, f.accessibilite, f.accessibilite_commentaire, f.paiements, f.tiers_payant, f.orientations,
  f.secteur, f.acces_pmr, f.age_minimum, f.presentation, f.photo_url, f.site_web, f.rdv_en_ligne, f.liens_echecs, f.liens_testes_le, f.rappels_coupes_le, f.lien_google_le, f.lien_google_dernier_le, f.lien_google_clics,
  f.horaires_confirmes_le, f.conventionnement_confirme_le, f.accueil_confirme_le, f.presentation_confirmee_le, f.photo_confirmee_le,
  f.publiee_le, f.etape, f.termine_le, f.updated_at,
  f.techniques, f.materiaux, f.usinage, f.empreintes_stl, f.impression_3d, f.delais, f.rayon_km, f.ramassage, f.jours_ramassage, f.transporteur, f.zone_etendue,
  f.realisations, f.credit_photos, f.ansm_numero, f.ansm_declare_le, f.savoir_faire_confirme_le, f.delais_confirmes_le, f.zone_confirmee_le,
  f.realisations_confirmees_le, f.praticien_lie_id`

export type LigneFiche = {
  horaires: FicheCompletee['horaires']
  langues: string[] | null
  accessibilite: string[] | null
  accessibilite_commentaire: string | null
  paiements: string[] | null
  tiers_payant: FicheCompletee['tiersPayant']
  orientations: string[] | null
  secteur: FicheCompletee['secteur']
  acces_pmr: FicheCompletee['accesPmr']
  age_minimum: number | null
  presentation: string | null
  photo_url: string | null
  site_web: string | null
  rdv_en_ligne: string | null
  liens_echecs: { site?: number; rdv?: number } | null
  liens_testes_le: string | null
  rappels_coupes_le: string | null
  lien_google_le: string | null
  lien_google_dernier_le: string | null
  lien_google_clics: number | null
  horaires_confirmes_le: string | null
  conventionnement_confirme_le: string | null
  accueil_confirme_le: string | null
  presentation_confirmee_le: string | null
  photo_confirmee_le: string | null
  publiee_le: string | null
  etape: number
  termine_le: string | null
  updated_at: string
  techniques: string[] | null
  materiaux: string[] | null
  usinage: boolean | null
  empreintes_stl: boolean | null
  impression_3d: boolean | null
  delais: Record<string, number> | null
  rayon_km: number | null
  ramassage: boolean | null
  jours_ramassage: string[] | null
  zone_etendue: 'france' | 'international' | null
  transporteur: boolean | null
  realisations: { url: string; legende: string }[] | null
  credit_photos: string | null
  ansm_numero: string | null
  ansm_declare_le: string | null
  savoir_faire_confirme_le: string | null
  delais_confirmes_le: string | null
  zone_confirmee_le: string | null
  realisations_confirmees_le: string | null
  praticien_lie_id: string | null
}

export function ficheDepuisLigne(r: LigneFiche): FicheCompletee {
  return {
    horaires: r.horaires,
    langues: r.langues ?? [],
    accessibilite: r.accessibilite ?? [],
    accessibiliteCommentaire: r.accessibilite_commentaire,
    paiements: r.paiements ?? [],
    tiersPayant: r.tiers_payant,
    orientations: r.orientations ?? [],
    secteur: r.secteur,
    accesPmr: r.acces_pmr,
    ageMinimum: r.age_minimum,
    presentation: r.presentation,
    photoUrl: r.photo_url,
    siteWeb: r.site_web,
    rdvEnLigne: r.rdv_en_ligne,
    liensEchecs: r.liens_echecs ?? {},
    liensTestesLe: r.liens_testes_le,
    rappelsCoupesLe: r.rappels_coupes_le,
    lienGoogleLe: r.lien_google_le,
    lienGoogleDernierLe: r.lien_google_dernier_le,
    lienGoogleClics: r.lien_google_clics ?? 0,
    horairesConfirmesLe: r.horaires_confirmes_le,
    conventionnementConfirmeLe: r.conventionnement_confirme_le,
    accueilConfirmeLe: r.accueil_confirme_le,
    presentationConfirmeeLe: r.presentation_confirmee_le,
    photoConfirmeeLe: r.photo_confirmee_le,
    publieeLe: r.publiee_le,
    techniques: r.techniques ?? [],
    materiaux: r.materiaux ?? [],
    usinage: !!r.usinage,
    empreintesStl: !!r.empreintes_stl,
    impression3d: !!r.impression_3d,
    delais: r.delais,
    rayonKm: r.rayon_km,
    ramassage: r.ramassage,
    joursRamassage: r.jours_ramassage ?? [],
    transporteur: r.transporteur,
    zoneEtendue: r.zone_etendue ?? null,
    realisations: r.realisations ?? [],
    creditPhotos: r.credit_photos,
    ansmNumero: r.ansm_numero,
    ansmDeclareLe: r.ansm_declare_le,
    savoirFaireConfirmeLe: r.savoir_faire_confirme_le,
    delaisConfirmesLe: r.delais_confirmes_le,
    zoneConfirmeeLe: r.zone_confirmee_le,
    realisationsConfirmeesLe: r.realisations_confirmees_le,
    praticienLieId: r.praticien_lie_id,
    etape: r.etape,
    termineLe: r.termine_le,
    majLe: r.updated_at,
  }
}
