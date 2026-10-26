import { NextRequest } from 'next/server'
import { purgerDocuments } from '@/lib/espace-pro/taches'
import { memeSecret } from '@/lib/secret'

/** Suppression des Kbis, mandats et attestations 30 jours après la décision, chaque jour. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || !memeSecret(`Bearer ${secret}`, req.headers.get('authorization'))) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true, ...(await purgerDocuments()) })
}
