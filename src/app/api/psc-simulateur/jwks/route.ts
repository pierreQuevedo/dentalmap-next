import { simulateurActif } from '@/lib/psc/config'
import { cles } from '@/lib/psc/simulateur'

export async function GET() {
  if (!simulateurActif()) return new Response('Introuvable', { status: 404 })
  const { jwk } = await cles()
  return Response.json({ keys: [jwk] }, { headers: { 'cache-control': 'no-store' } })
}
