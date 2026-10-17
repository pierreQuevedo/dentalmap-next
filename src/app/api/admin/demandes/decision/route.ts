import { z } from 'zod'
import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { deciderAjoutEtablissement, deciderAttestation, deciderDemandeCreation, deciderRevendication } from '@/lib/moderation/decisions'

const Corps = z.object({
  type: z.enum(['revendication', 'creation', 'attestation', 'ajout']),
  id: z.string().min(1).max(100),
  decision: z.enum(['acceptee', 'refusee']),
  motif: z.string().max(500).optional(),
  commentaire: z.string().max(1000).optional(),
  /** Création de fiche : slug de la fiche créée, pour la rattacher. */
  slug: z.string().max(200).optional(),
  /** Personne de l'équipe qui décide, pour le journal. */
  par: z.string().max(200).optional(),
})

/**
 * Décision prise depuis le SAV WordPress. Réponse 409 quand la demande n'est
 * plus en attente (déjà traitée, ici ou depuis la page de modération).
 */
export async function POST(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const r = Corps.safeParse(await requete.json().catch(() => null))
  if (!r.success) return Response.json({ ok: false, erreur: r.error.issues[0]?.message }, { status: 400 })
  const { type, id, decision, motif, commentaire, slug, par } = r.data

  const fait =
    type === 'revendication'
      ? await deciderRevendication(id, decision, { motif, commentaire })
      : type === 'creation'
        ? await deciderDemandeCreation(id, decision, slug)
        : type === 'attestation'
          ? await deciderAttestation(id, decision, motif)
          : await deciderAjoutEtablissement(id, decision)

  if (!fait) return Response.json({ ok: false, erreur: 'deja-traitee' }, { status: 409 })
  console.info('[moderation] décision depuis le back-office', { type, id, decision, par })
  return Response.json({ ok: true })
}
