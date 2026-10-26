import { NextResponse, type NextRequest } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getCompte } from '@/lib/tunnel/compte'
import { TAILLE_MAX_JUSTIFICATIF, TYPES_JUSTIFICATIF } from '@/lib/espace-pro/justificatif'

/**
 * Jeton de téléversement d'un justificatif (JD1).
 *
 * Le document part du navigateur droit vers le stockage privé : une fonction
 * Vercel n'accepte pas plus de 4,5 Mo de corps, un justificatif peut en faire
 * 10. Le jeton n'est délivré qu'à un compte connecté, pour un chemin sous
 * `justificatifs/`, aux seuls types et à la seule taille admis.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const reponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (chemin) => {
        const compte = await getCompte()
        if (!compte) throw new Error('Connexion requise.')
        if (!/^justificatifs\/[\w-]+\/[\w-]+(\.[a-z0-9]+)?$/i.test(chemin)) throw new Error('Chemin refusé.')
        return {
          allowedContentTypes: [...TYPES_JUSTIFICATIF],
          maximumSizeInBytes: TAILLE_MAX_JUSTIFICATIF,
          addRandomSuffix: true,
          tokenPayload: compte.id,
        }
      },
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(reponse)
  } catch (e) {
    return NextResponse.json({ erreur: e instanceof Error ? e.message : 'Téléversement refusé.' }, { status: 400 })
  }
}
