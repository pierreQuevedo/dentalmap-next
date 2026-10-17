import { NextResponse, type NextRequest } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getCompte } from '@/lib/tunnel/compte'

/**
 * Jeton de téléversement de la photo du cabinet (MIS-1).
 *
 * La photo est publique : elle s'affiche sur la fiche et dans Google. Elle
 * arrive déjà recadrée et ré-encodée par le navigateur, sans métadonnées.
 * Le jeton n'est délivré qu'à un compte connecté, pour un JPEG sous
 * `cabinets/`, 5 Mo au plus.
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
        if (!/^cabinets\/[\w-]+\.jpg$/.test(chemin)) throw new Error('Chemin refusé.')
        return { allowedContentTypes: ['image/jpeg'], maximumSizeInBytes: 5 * 1024 * 1024, addRandomSuffix: true }
      },
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(reponse)
  } catch (e) {
    return NextResponse.json({ erreur: e instanceof Error ? e.message : 'Téléversement refusé.' }, { status: 400 })
  }
}
