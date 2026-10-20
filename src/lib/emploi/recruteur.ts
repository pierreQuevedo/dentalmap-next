import { updateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { getCompte } from '@/lib/tunnel/compte'
import { getEspace } from '@/lib/espace-pro/espace'
import { pointsDeLEspace } from '@/lib/espace-pro/progression-donnees'
import { PALIER_EMPLOI, progressionDe } from '@/lib/espace-pro/progression'

/**
 * Le recruteur derrière une action Emploi de l'espace pro : le titulaire
 * vérifié de la fiche, `null` sinon. `publier` : il tient en plus le palier
 * Ambassadeur, qui ouvre la publication. Postuler, côté candidat, ne demande
 * qu'un compte, sans palier.
 */
export async function recruteur(slug: string, publier = false) {
  const compte = await getCompte()
  if (!compte) return null
  const espace = await getEspace(compte, slug || null)
  if (!espace || !espace.ctx.identiteVerifiee || espace.fiche.demande?.statut !== 'acceptee') return null
  if (publier) {
    const points = await pointsDeLEspace(espace)
    if ((progressionDe(points.total, points.verifiee).actuel?.niveau ?? 0) < PALIER_EMPLOI) return null
  }
  return { compte, espace }
}

/** Les caches publics qui montrent l'offre : la recherche d'emploi, la page de l'offre, la fiche (« Recrute »). */
export function invalider(offreSlug: string, ficheSlug: string) {
  updateTag('emploi')
  updateTag(`emploi:offre:${offreSlug}`)
  updateTag(`praticien:${ficheSlug}`)
}

export type CabinetRecrutement = { presentation: string; avantages: string[]; lieuId: string | null }

/** Les informations du cabinet communes à ses offres ; vides tant qu'elles n'ont pas été saisies. Lecture directe. */
export async function getCabinetRecrutement(praticienId: string): Promise<CabinetRecrutement> {
  const { rows } = await db.execute<{ presentation: string | null; avantages: string[] | null; lieu_id: string | null }>(sql`
    SELECT presentation, avantages, lieu_id FROM recrutement_cabinets WHERE praticien_id = ${praticienId}
  `)
  const r = rows[0]
  return { presentation: r?.presentation ?? '', avantages: r?.avantages ?? [], lieuId: r?.lieu_id ?? null }
}
