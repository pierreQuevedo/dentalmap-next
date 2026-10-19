import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { calculerForce } from '@/lib/espace-pro/force'
import { calculerForceLabo } from '@/lib/espace-pro/force-labo'
import { bonusDesFiches } from '@/lib/espace-pro/parrainage-donnees'
import { diffusionDesFiches } from '@/lib/espace-pro/progression-donnees'
import { bonusPalier, pointsDe, progressionDe } from '@/lib/espace-pro/progression'
import { etatLienGoogle } from '@/lib/espace-pro/lien-google'
import { fraicheurDe } from '@/lib/espace-pro/force'
import { fraicheurLabo } from '@/lib/espace-pro/force-labo'
import type { FicheCompletee } from '@/lib/espace-pro/fiche-completee'
import { COLONNES_FICHE, ficheDepuisLigne, type LigneFiche } from '@/lib/espace-pro/fiche-lecture'
import type { Profession } from './types'

export type Classement = {
  /** Ce qui ordonne les résultats avant la distance. */
  scores: Map<string, number>
  /** Le palier tenu par chaque fiche gérée, pour l'habillage de sa carte. */
  paliers: Map<string, number>
  /** La photo de profil de chaque fiche gérée qui en a une : la carte la montre comme dans l'espace pro. */
  photos: Map<string, string>
}

/**
 * Ce qui ordonne les listes de résultats avant la distance : les points de
 * progression de la fiche (`src/lib/espace-pro/progression.ts`), plus le
 * bonus du palier tenu et celui, temporaire, des parrainages réussis.
 *
 * Les points partent de la force de l'espace pro (`calculerForce`,
 * `calculerForceLabo`, un point par pour cent), calculée de la même façon,
 * pour qu'un praticien voie dans son tableau de bord exactement ce qui le
 * classe, et y ajoutent ce qu'il fait pour faire connaître sa fiche. Seule une
 * fiche attribuée compte : ce qu'elle déclare n'est affiché qu'à cette
 * condition. Une fiche non revendiquée vaut zéro.
 */
export async function getRemplissages(profession: Profession, praticiens: { id: string; revendiquee: boolean }[]): Promise<Classement> {
  const scores = new Map<string, number>()
  const paliers = new Map<string, number>()
  const photos = new Map<string, string>()
  const attribuees = praticiens.filter((p) => p.revendiquee).map((p) => p.id)
  if (!attribuees.length) return { scores, paliers, photos }

  const calculer = profession === 'prothesiste' ? calculerForceLabo : calculerForce
  const contexte = { identiteVerifiee: true, viaPsc: false, nombreDeLieux: 1, lieuxGeres: 1 }
  // Une fiche attribuée sans rien de complété vaut déjà les points de l'identité vérifiée.
  for (const id of attribuees) scores.set(id, calculer(null, contexte).total)

  const { rows } = await db.execute<LigneFiche & { praticien_id: string }>(sql`
    SELECT f.praticien_id, ${COLONNES_FICHE}
    FROM fiches_completees f
    WHERE f.praticien_id IN (${sql.join(
      attribuees.map((id) => sql`${id}`),
      sql`, `,
    )})
  `)
  const maintenant = new Date()
  const fiches = new Map<string, FicheCompletee>()
  for (const r of rows) {
    const f = ficheDepuisLigne(r)
    fiches.set(r.praticien_id, f)
    if (f.photoUrl) photos.set(r.praticien_id, f.photoUrl)
    scores.set(r.praticien_id, calculer(f, contexte, maintenant).total)
  }
  const [parrainages, diffusion] = await Promise.all([bonusDesFiches(attribuees), diffusionDesFiches(attribuees)])
  const fraicheur = profession === 'prothesiste' ? fraicheurLabo : fraicheurDe
  for (const id of attribuees) {
    const f = fiches.get(id) ?? null
    const force = scores.get(id) ?? 0
    const points = pointsDe({ force, google: etatLienGoogle(f).etat === 'actif', aJour: fraicheur(f, maintenant).every((x) => x.etat !== 'expire'), ...diffusion.get(id)! })
    scores.set(id, points.total + bonusPalier(points.total) + (parrainages.get(id) ?? 0))
    const palier = progressionDe(points.total).actuel?.niveau
    if (palier) paliers.set(id, palier)
  }
  return { scores, paliers, photos }
}
