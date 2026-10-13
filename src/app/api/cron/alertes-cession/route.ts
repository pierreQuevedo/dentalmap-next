import { NextRequest } from 'next/server'
import { envoyerAlertesCession } from '@/lib/cessions/alertes'

/**
 * Envoi des alertes cessions (job `alertes-cession`), en secours des envois
 * faits à la publication d'une annonce. Protégée par `CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await envoyerAlertesCession()) })
}
