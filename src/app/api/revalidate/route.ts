import { revalidateTag } from 'next/cache'
import { after, NextRequest } from 'next/server'
import { z } from 'zod'
import { envoyerAlertesFicheCreee } from '@/lib/espace-pro/alertes'
import { envoyerAlertesFormation } from '@/lib/formation/alertes'
import { memeSecret } from '@/lib/secret'

const Body = z.object({ tags: z.array(z.string().min(1)).min(1).max(100) })

export async function POST(req: NextRequest) {
  if (!memeSecret(process.env.REVALIDATE_SECRET, req.headers.get('x-revalidate-secret'))) {
    return Response.json({ ok: false }, { status: 401 })
  }
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false, error: 'tags invalides' }, { status: 400 })
  for (const tag of parsed.data.tags) revalidateTag(tag, 'max')
  // Appelée par n8n après chaque synchronisation : des fiches attendues ont pu apparaître.
  after(async () => {
    const r = await envoyerAlertesFicheCreee()
    if (r.envoyees || r.echecs) console.log('[alertes] fiche créée', r)
    // Une formation privée publiée ou modifiée dans WordPress : les alertes des praticiens (une par semaine au plus).
    if (parsed.data.tags.some((t) => t.startsWith('wp:formation') || t === 'wp')) {
      const f = await envoyerAlertesFormation()
      if (f.envoyes || f.echecs) console.log('[alertes] formations', f)
    }
  })
  return Response.json({ ok: true, tags: parsed.data.tags, at: Date.now() })
}
