import { NextRequest } from 'next/server'
import { envoyerRappelsFraicheur } from '@/lib/espace-pro/taches'

/** Rappels de fraîcheur, chaque jour : un email par fiche et par mois au plus. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await envoyerRappelsFraicheur()) })
}
