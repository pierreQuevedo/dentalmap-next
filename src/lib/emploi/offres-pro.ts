import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { CodeContrat, CodeMetier, ModeRemuneration } from './metiers'
import type { StatutOffre } from './offre-pro'

/** Une offre telle que le recruteur la voit dans son espace, avec ses candidatures. */
export type OffreRecruteur = {
  id: string
  slug: string
  titre: string
  metier: CodeMetier
  contrat: CodeContrat
  tempsPlein: boolean
  heuresHebdo: number | null
  debut: string | null
  fin: string | null
  mode: ModeRemuneration
  min: number
  max: number
  description: string
  profil: string | null
  avantages: string[]
  lieuId: string | null
  adresse: string | null
  communeNom: string | null
  statut: StatutOffre
  publieeLe: Date | null
  confirmeeLe: Date | null
  expireLe: Date | null
  clotureeLe: Date | null
  creeLe: Date
  candidatures: number
  nouvelles: number
}

/** Les offres d'une fiche, les plus récentes d'abord. Lecture directe : l'espace pro n'est jamais mis en cache. */
export async function getOffresRecruteur(praticienId: string): Promise<OffreRecruteur[]> {
  const { rows } = await db.execute<{
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
    description: string
    profil: string | null
    avantages: string[] | null
    lieu_id: string | null
    adresse_ligne: string | null
    commune_nom: string | null
    statut: StatutOffre
    publiee_le: string | null
    confirmee_le: string | null
    expire_le: string | null
    cloturee_le: string | null
    cree_le: string
    candidatures: number
    nouvelles: number
  }>(sql`
    SELECT o.id, o.slug, o.titre, o.metier, o.contrat, o.temps_plein, o.heures_hebdo, o.debut, o.fin,
           o.mode_remuneration, o.remuneration_min, o.remuneration_max, o.description, o.profil, o.avantages,
           o.lieu_id, l.adresse_ligne, c.nom AS commune_nom, o.statut, o.publiee_le, o.confirmee_le, o.expire_le, o.cloturee_le, o.cree_le,
           (SELECT count(*)::int FROM candidatures k WHERE k.offre_id = o.id) AS candidatures,
           (SELECT count(*)::int FROM candidatures k WHERE k.offre_id = o.id AND k.statut = 'nouvelle') AS nouvelles
    FROM offres o
    LEFT JOIN lieux_exercice l ON l.id = o.lieu_id
    LEFT JOIN communes c ON c.code_insee = o.commune_code
    WHERE o.praticien_id = ${praticienId}
    ORDER BY (o.statut = 'en_ligne') DESC, (o.statut = 'brouillon') DESC, o.maj_le DESC
  `)
  const date = (v: string | null) => (v ? new Date(v) : null)
  return rows.map((r) => ({
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
    description: r.description,
    profil: r.profil,
    avantages: r.avantages ?? [],
    lieuId: r.lieu_id,
    adresse: r.adresse_ligne,
    communeNom: r.commune_nom,
    statut: r.statut,
    publieeLe: date(r.publiee_le),
    confirmeeLe: date(r.confirmee_le),
    expireLe: date(r.expire_le),
    clotureeLe: date(r.cloturee_le),
    creeLe: new Date(r.cree_le),
    candidatures: r.candidatures,
    nouvelles: r.nouvelles,
  }))
}
