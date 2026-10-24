import { NextRequest } from 'next/server'
import { relancerContestations } from '@/lib/espace-pro/contestation'

/** Les contestations restées sept jours sans réponse du titulaire : l'équipe est relancée, une fois, chaque jour. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, relancees: await relancerContestations() })
}
