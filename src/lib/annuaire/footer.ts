/**
 * Panneaux d'exploration du pied de page.
 *
 * Même cache que l'annuaire : ces listes sortent des mêmes tables et n'ont
 * aucune raison d'avoir un rythme de fraîcheur différent.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { getAccesRapide, type LienCommune } from './acces-rapide'

export type LienRegion = { label: string; href: string; sub: string }

/** Régions avec leur nombre de départements, pour le panneau « Par région ». */
export async function getRegionsPanel(): Promise<LienRegion[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ nom: string; slug: string; total: number }>(sql`
    SELECT r.nom, r.slug, count(d.code)::int AS total
    FROM regions r
    JOIN departements d ON d.region_code = r.code
    GROUP BY r.code, r.nom, r.slug
    ORDER BY r.nom
  `)
  return rows.map((r) => ({
    label: r.nom,
    // Les régions n'ont pas de page propre : le lien mène à l'index des
    // départements, qui est groupé par région et porte l'ancre.
    href: `/dentistes#${r.slug}`,
    sub: `${r.total} départements`,
  }))
}

/** Grandes villes pour les laboratoires de prothèse. */
export function getLabosPanel(limite = 12): Promise<LienCommune[]> {
  return getAccesRapide(limite, 'prothesiste')
}

/**
 * Date de la dernière synchronisation terminée, affichée en `title` sur les
 * badges de source. Retourne `null` tant qu'aucun run n'a abouti, auquel cas
 * le badge s'affiche sans date plutôt que de mentir sur la fraîcheur.
 */
export async function getDerniereSync(): Promise<string | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ termine_le: string }>(sql`
    SELECT termine_le FROM sync_runs
    WHERE statut = 'termine' AND termine_le IS NOT NULL
    ORDER BY termine_le DESC LIMIT 1
  `)
  return rows[0]?.termine_le ?? null
}
