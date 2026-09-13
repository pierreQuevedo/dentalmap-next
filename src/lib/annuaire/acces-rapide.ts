/**
 * Liens d'accès rapide du méga-menu et du pied de page.
 *
 * Les grandes villes changent rarement de rang : la requête est cachée avec le
 * profil `listing` et le tag `annuaire`, comme le reste de l'annuaire, et se
 * rafraîchit donc au même rythme que la synchronisation.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { Profession } from './types'

export type LienCommune = { label: string; href: string; total: number }

const BASE_URL: Record<Profession, string> = {
  dentiste: '/dentistes',
  prothesiste: '/prothesistes',
}

/**
 * Communes les plus peuplées ayant au moins un praticien de la profession.
 *
 * Le tri se fait sur la population et non sur le nombre de praticiens : le
 * visiteur cherche « Paris » ou « Lyon », pas la commune qui compte le plus de
 * cabinets.
 *
 * Paris, Lyon et Marseille n'ont aucun praticien rattaché à leur code commune :
 * l'Annuaire Santé adresse tout à l'arrondissement, et leur page de commune est
 * donc vide. Les compter par leurs arrondissements les fait réapparaître en
 * tête de liste, et leur lien mène à la recherche géolocalisée, seule vue qui
 * couvre aujourd'hui la ville entière. Faire agréger les arrondissements par la
 * page de commune serait une décision d'architecture de l'annuaire, pas un
 * réglage de menu.
 */
export async function getAccesRapide(limite: number, profession: Profession = 'dentiste'): Promise<LienCommune[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    nom: string
    slug: string
    departement_slug: string
    total: number
    a_des_arrondissements: boolean
  }>(sql`
    SELECT c.nom, c.slug, d.slug AS departement_slug,
           count(DISTINCT p.id)::int AS total,
           bool_or(a.commune_parente_code IS NOT NULL) AS a_des_arrondissements
    FROM communes c
    JOIN departements d ON d.code = c.departement_code
    -- La commune elle-même, ou l'un de ses arrondissements.
    JOIN communes a ON a.code_insee = c.code_insee OR a.commune_parente_code = c.code_insee
    JOIN lieux_exercice l ON l.code_insee = a.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    WHERE c.type = 'commune'
    GROUP BY c.code_insee, c.nom, c.slug, c.population, d.slug
    ORDER BY c.population DESC NULLS LAST
    LIMIT ${limite}
  `)
  return rows.map((r) => ({
    label: r.nom,
    href: r.a_des_arrondissements
      ? `/recherche?profession=${BASE_URL[profession].slice(1)}&q=${encodeURIComponent(r.nom)}`
      : `${BASE_URL[profession]}/${r.departement_slug}/${r.slug}`,
    total: r.total,
  }))
}
