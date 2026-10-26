import { NextRequest } from 'next/server'
import { envoyerRappelsFraicheur, relancerLiensGoogle } from '@/lib/espace-pro/taches'
import { feliciterParrainages, relancerParrainages } from '@/lib/espace-pro/parrainage-donnees'
import { memeSecret } from '@/lib/secret'

/** Rappels de fraîcheur (un email par fiche et par mois au plus), relance des liens Google inactifs, relance et réussites des parrainages, chaque jour. Protégée par `CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || !memeSecret(`Bearer ${secret}`, req.headers.get('authorization'))) return Response.json({ ok: false }, { status: 401 })
  const [fraicheur, google, relances, reussis] = await Promise.all([envoyerRappelsFraicheur(), relancerLiensGoogle(), relancerParrainages(), feliciterParrainages()])
  return Response.json({ ok: true, ...fraicheur, ...google, ...relances, ...reussis })
}
