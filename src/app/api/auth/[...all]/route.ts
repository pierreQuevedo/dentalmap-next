import { auth } from '@/lib/auth'

/**
 * Point d'entrée de Better Auth.
 *
 * `trailingSlash: true` dans la configuration Next redirige toute URL vers sa
 * variante barrée : le client appelle `/api/auth/get-session`, Next répond 308
 * vers `/api/auth/get-session/`, et le routeur interne de Better Auth ne
 * reconnaît pas ce chemin et renvoie 404. Toutes les routes d'authentification
 * étaient donc inaccessibles, connexion comprise.
 *
 * On retire donc la barre finale avant de passer la main. Le corps est relu en
 * mémoire plutôt que réutilisé tel quel : reconstruire une requête autour d'un
 * flux demanderait `duplex: 'half'`, et les charges utiles d'authentification
 * tiennent dans quelques centaines d'octets.
 */
async function sansBarreFinale(request: Request): Promise<Request> {
  const url = new URL(request.url)
  if (!url.pathname.endsWith('/')) return request
  url.pathname = url.pathname.replace(/\/+$/, '')

  const init: RequestInit = { method: request.method, headers: request.headers, redirect: 'manual' }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }
  return new Request(url, init)
}

export async function GET(request: Request) {
  return auth.handler(await sansBarreFinale(request))
}

export async function POST(request: Request) {
  return auth.handler(await sansBarreFinale(request))
}
