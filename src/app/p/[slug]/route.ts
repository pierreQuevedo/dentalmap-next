import { NextResponse, type NextRequest } from 'next/server'
import { cibleLienCourt } from '@/lib/espace-pro/lien-court'
import { compterVisite } from '@/lib/espace-pro/statistiques'

/**
 * Le lien court d'une fiche, `/p/<slug>/`, à coller sur le site du cabinet ou
 * ailleurs. Il mène à la fiche, où qu'elle soit rangée, et survit à un
 * changement de commune. Chaque visite compte en « Lien direct » dans les
 * statistiques ; les liens marqués par canal sont dans `[source]/`. Redirection
 * temporaire : une redirection permanente serait mise en cache, et les visites
 * suivantes ne passeraient plus ici.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [cible] = await Promise.all([cibleLienCourt(slug), compterVisite(slug, 'direct', request.headers)])
  return NextResponse.redirect(new URL(cible, request.url), 307)
}
