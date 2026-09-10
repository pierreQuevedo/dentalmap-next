import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const Body = z.object({ tags: z.array(z.string().min(1)).min(1).max(100) })

export async function POST(req: NextRequest) {
  if (req.headers.get('x-revalidate-secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 })
  }
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false, error: 'tags invalides' }, { status: 400 })
  for (const tag of parsed.data.tags) revalidateTag(tag, 'max')
  return Response.json({ ok: true, tags: parsed.data.tags, at: Date.now() })
}
