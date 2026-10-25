import { NextRequest } from 'next/server'
import { avertirComptesInactifs, purgerOffres, supprimerComptesInactifs } from '@/lib/conservation'

/** Les durées de conservation de la politique de confidentialité, chaque nuit : offres closes, comptes inactifs. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return Response.json({ ok: false }, { status: 401 })
  const offres = await purgerOffres()
  const supprimes = await supprimerComptesInactifs()
  const avertis = await avertirComptesInactifs()
  return Response.json({ ok: true, offres, comptes: { ...avertis, ...supprimes } })
}
