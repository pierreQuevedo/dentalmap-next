import { NextRequest } from 'next/server'
import { testerLiens } from '@/lib/espace-pro/taches'
import { memeSecret } from '@/lib/secret'

/**
 * Test des liens du cabinet. Appelée chaque jour, elle ne reprend que les
 * fiches testées il y a plus d'une semaine, par lots : chaque lien l'est
 * donc une fois par semaine. Protégée par `CRON_SECRET`.
 */
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || !memeSecret(`Bearer ${secret}`, req.headers.get('authorization'))) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await testerLiens(50)) })
}
