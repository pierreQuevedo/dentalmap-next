import { NextRequest } from 'next/server'
import { envoyerAlertesEmploi } from '@/lib/emploi/alertes-envoi'

/** L'envoi des alertes emploi (job `alertes-emploi`), chaque matin. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await envoyerAlertesEmploi()) })
}
