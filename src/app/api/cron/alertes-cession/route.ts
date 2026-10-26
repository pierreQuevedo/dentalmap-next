import { NextRequest } from 'next/server'
import { envoyerAlertesCession } from '@/lib/cessions/alertes'
import { memeSecret } from '@/lib/secret'

/**
 * Envoi des alertes cessions (job `alertes-cession`), en secours des envois
 * faits à la publication d'une annonce. Protégée par `CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || !memeSecret(`Bearer ${secret}`, req.headers.get('authorization'))) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await envoyerAlertesCession()) })
}
