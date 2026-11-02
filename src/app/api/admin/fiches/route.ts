import { z } from 'zod'
import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { chercherFichesAdmin, retablirFiche, supprimerFiche } from '@/lib/moderation/suppression'

/** Recherche de fiches, toutes professions, pour l'écran « Supprimer une fiche » du SAV WordPress. */
export async function GET(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const q = (new URL(requete.url).searchParams.get('q') ?? '').slice(0, 100)
  return Response.json({ ok: true, fiches: await chercherFichesAdmin(q) })
}

const Corps = z.object({
  action: z.enum(['supprimer', 'retablir']),
  id: z.string().min(1).max(100),
  /** Personne de l'équipe qui agit, et pourquoi : pour le journal. */
  par: z.string().max(200).optional(),
  motif: z.string().max(500).optional(),
})

/**
 * Suppression ou rétablissement d'une fiche depuis le SAV WordPress. Réponse
 * 409 quand la fiche est déjà dans l'état demandé.
 */
export async function POST(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const r = Corps.safeParse(await requete.json().catch(() => null))
  if (!r.success) return Response.json({ ok: false, erreur: r.error.issues[0]?.message }, { status: 400 })
  const { action, id, par, motif } = r.data
  const fait = action === 'supprimer' ? await supprimerFiche(id) : await retablirFiche(id)
  if (!fait) return Response.json({ ok: false, erreur: 'deja-fait' }, { status: 409 })
  console.info('[moderation] fiche depuis le back-office', { action, id, slug: fait.slug, par, motif })
  return Response.json({ ok: true, slug: fait.slug })
}
