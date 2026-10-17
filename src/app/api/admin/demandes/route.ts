import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { MOTIFS_REFUS } from '@/lib/espace-pro/chemins'
import { getModerationEtablissements } from '@/lib/espace-pro/etablissement-donnees'
import { getDemandesCreationEnAttente, getRevendicationsEnAttente } from '@/lib/tunnel/compte'

/**
 * Les demandes en attente, pour l'écran « Demandes à valider » du SAV
 * WordPress : mêmes listes que la page /espace-pro/moderation/.
 */
export async function GET(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const [revendications, creations, etablissements] = await Promise.all([
    getRevendicationsEnAttente(),
    getDemandesCreationEnAttente(),
    getModerationEtablissements(),
  ])
  return Response.json(
    {
      revendications,
      creations,
      attestations: etablissements.attestations,
      ajouts: etablissements.ajouts,
      motifsRefus: MOTIFS_REFUS,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
