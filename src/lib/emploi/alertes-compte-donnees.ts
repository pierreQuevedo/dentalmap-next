import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { CriteresAlerte } from './alerte'
import { lireFrequence, type Frequence } from './alertes-compte'

export type AlerteCompte = {
  id: string
  titre: string | null
  criteres: CriteresAlerte
  /** Le nom de la commune de l'alerte, ou du département ; nul pour toute la France. */
  lieu: string | null
  communeNom: string | null
  frequence: Frequence
  active: boolean
  dernierEnvoiLe: Date | null
}

/** Les alertes d'un compte, les plus récentes d'abord. Lecture directe, jamais mise en cache. */
export async function getAlertesCompte(userId: string): Promise<AlerteCompte[]> {
  const { rows } = await db.execute<{ id: string; titre: string | null; criteres: unknown; frequence: string; active: boolean; dernier_envoi_le: string | null; commune_nom: string | null; departement_nom: string | null }>(sql`
    SELECT a.id, a.titre, a.criteres, a.frequence, a.active, a.dernier_envoi_le,
           c.nom AS commune_nom, d.nom AS departement_nom
    FROM alertes_emploi a
    LEFT JOIN communes c ON c.code_insee = a.criteres->>'commune'
    LEFT JOIN departements d ON d.code = a.criteres->>'departement'
    WHERE a.user_id = ${userId}::uuid
    ORDER BY a.cree_le DESC
  `)
  return rows.flatMap((r) => {
    const c = CriteresAlerte.safeParse(r.criteres)
    if (!c.success) return []
    return [
      {
        id: r.id,
        titre: r.titre,
        criteres: c.data,
        lieu: r.commune_nom ?? r.departement_nom,
        communeNom: r.commune_nom,
        frequence: lireFrequence(r.frequence),
        active: r.active,
        dernierEnvoiLe: r.dernier_envoi_le ? new Date(r.dernier_envoi_le) : null,
      },
    ]
  })
}
