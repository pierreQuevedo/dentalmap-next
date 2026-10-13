import { NextRequest } from 'next/server'
import { envoyerAlertesFicheCreee } from '@/lib/espace-pro/alertes'

/**
 * Envoi des alertes « fiche créée », en secours de l'appel fait après chaque
 * synchronisation. Protégée par `CRON_SECRET` (en-tête `Authorization:
 * Bearer …`, celui que posent les tâches planifiées de Vercel).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await envoyerAlertesFicheCreee()) })
}
