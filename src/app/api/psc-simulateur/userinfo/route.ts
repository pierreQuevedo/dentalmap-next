import { type NextRequest } from 'next/server'
import { simulateurActif } from '@/lib/psc/config'
import { lireAcces, userinfo } from '@/lib/psc/simulateur'

export async function GET(request: NextRequest) {
  if (!simulateurActif()) return new Response('Introuvable', { status: 404 })
  const identite = lireAcces(request.headers.get('authorization'))
  if (!identite) return Response.json({ error: 'invalid_token' }, { status: 401 })
  return Response.json(userinfo(identite), { headers: { 'cache-control': 'no-store' } })
}
