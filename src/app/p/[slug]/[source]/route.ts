import { NextResponse, type NextRequest } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { cibleLienCourt } from '@/lib/espace-pro/lien-court'
import { vientDeGoogle } from '@/lib/espace-pro/lien-google'
import { sourceDuCode } from '@/lib/espace-pro/sources'
import { compterVisite } from '@/lib/espace-pro/statistiques'

/**
 * Un lien de partage marqué, `/p/<slug>/<code>/` : la fiche Google (`g`), la
 * story (`st`), le code QR (`q`), les publications (`r`), le badge du site
 * (`b`). Il compte la visite pour les statistiques, puis mène à la fiche.
 *
 * Pour la fiche Google, un clic venu de Google (recherche ou Maps) prouve en
 * plus que le lien est en place : le premier valide, chacun renouvelle la
 * validité (voir `lien-google.ts`). Aucun appel d'API, rien du visiteur.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string; source: string }> }) {
  const { slug, source: code } = await params
  const source = sourceDuCode(code)
  const travaux: Promise<unknown>[] = [compterVisite(slug, source, request.headers)]
  if (source === 'google' && vientDeGoogle(request.headers.get('referer'))) {
    travaux.push(
      db
        .execute(sql`
          UPDATE fiches_completees f SET lien_google_le = COALESCE(f.lien_google_le, now()), lien_google_dernier_le = now(),
            lien_google_clics = f.lien_google_clics + 1, lien_google_relance_le = NULL
          FROM praticiens p WHERE p.id = f.praticien_id AND p.slug = ${slug}
        `)
        .catch((e) => console.error('[lien-google] clic non compté', slug, e)),
    )
  }
  const [cible] = await Promise.all([cibleLienCourt(slug), ...travaux])
  return NextResponse.redirect(new URL(cible as string, request.url), 307)
}
