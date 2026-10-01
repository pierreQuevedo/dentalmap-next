import { type NextRequest } from 'next/server'
import { configPsc, simulateurActif } from '@/lib/psc/config'
import { consommerCode, emettreAcces, emettreIdToken } from '@/lib/psc/simulateur'

/** Point de terminaison des jetons : échange du code contre id_token et access_token. */
export async function POST(request: NextRequest) {
  if (!simulateurActif()) return new Response('Introuvable', { status: 404 })
  const config = configPsc()!
  const f = new URLSearchParams(await request.text())

  const erreur = (code: string, status = 400) => Response.json({ error: code }, { status })
  if (f.get('grant_type') !== 'authorization_code') return erreur('unsupported_grant_type')
  if (f.get('client_id') !== config.clientId || f.get('client_secret') !== config.clientSecret) {
    return erreur('invalid_client', 401)
  }
  const c = consommerCode(f.get('code') ?? '', f.get('code_verifier') ?? '', f.get('redirect_uri') ?? '')
  if (!c) return erreur('invalid_grant')

  return Response.json({
    token_type: 'Bearer',
    expires_in: 300,
    access_token: emettreAcces(c.identite),
    id_token: await emettreIdToken({ issuer: config.issuer, clientId: config.clientId, identite: c.identite, nonce: c.nonce }),
  })
}
