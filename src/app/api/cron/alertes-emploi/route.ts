import { NextRequest } from 'next/server'
import { envoyerAlertesEmploi } from '@/lib/emploi/alertes-envoi'
import { memeSecret } from '@/lib/secret'

/** L'envoi des alertes emploi (job `alertes-emploi`), chaque matin. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || !memeSecret(`Bearer ${secret}`, req.headers.get('authorization'))) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await envoyerAlertesEmploi()) })
}
