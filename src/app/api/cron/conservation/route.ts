import { NextRequest } from 'next/server'
import { avertirComptesInactifs, purgerOffres, supprimerComptesInactifs } from '@/lib/conservation'
import { memeSecret } from '@/lib/secret'

/** Les durées de conservation de la politique de confidentialité, chaque nuit : offres closes, comptes inactifs. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || !memeSecret(`Bearer ${secret}`, req.headers.get('authorization'))) return Response.json({ ok: false }, { status: 401 })
  const offres = await purgerOffres()
  const supprimes = await supprimerComptesInactifs()
  const avertis = await avertirComptesInactifs()
  return Response.json({ ok: true, offres, comptes: { ...avertis, ...supprimes } })
}
