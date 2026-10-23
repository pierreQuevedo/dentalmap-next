import { NextRequest } from 'next/server'
import { rappelerConfirmations } from '@/lib/emploi/rappels-confirmation'

/** La confirmation des offres d'emploi (job `confirmations-offres`) : rappel au recruteur, puis avis de sortie de la recherche, chaque jour. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await rappelerConfirmations()) })
}
