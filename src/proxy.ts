import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { COOKIE_AVIS_RETRAIT, COOKIE_FICHE, DELAI_ANNULATION_RETRAIT_JOURS } from '@/lib/espace-pro/chemins'
import { destinationImmediate } from '@/lib/annuaire/destination-recherche'

/**
 * Fiche retirée, par le professionnel ou par l'équipe : redirection vers la
 * liste de sa commune, ou de son département si la commune n'a plus personne
 * de la même profession. Un cookie de courte durée porte l'avis « n'est plus
 * présent sur DentalMap », que la page d'arrivée affiche puis efface : l'URL
 * d'arrivée reste l'adresse canonique de la liste, et la liste reste en cache.
 *
 * Temporaire (307) pendant les trente jours où le professionnel peut annuler
 * son retrait, et l'équipe le rétablir sans surprise, permanente (301) ensuite : un navigateur garde une 301 en
 * mémoire, et la fiche rétablie resterait introuvable pour lui.
 *
 * Le matcher limite le proxy aux URL de fiche, quatre segments sous une base
 * de l'annuaire. Le retrait vient de `/api/annuaire/retrait/`, qui lit une
 * requête en `use cache` (interdite dans le proxy lui-même). Une erreur ou une
 * lenteur de cette lecture laisse passer la requête vers la fiche plutôt que
 * de la bloquer.
 */
/**
 * Espace pro et favoris sans session : la connexion, avant tout rendu.
 *
 * Les pages vérifient la session elles-mêmes, mais leur redirection arrive au
 * milieu d'une navigation côté client : depuis une fiche, « Revendiquer cette
 * fiche » chargeait la page en arrière-plan et l'écran ne changeait pas. Une
 * redirection du proxy est une vraie réponse HTTP, que le routeur suit. Le
 * contrôle reste optimiste (présence du cookie) : la page vérifie la session.
 */
const PUBLIQUES = ['/espace-pro/laboratoire/modele-mandat/']

function exigerSession(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl
  if (!pathname.startsWith('/espace-pro') && !pathname.startsWith('/favoris')) return null
  if (PUBLIQUES.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (getSessionCookie(request)) return memoriserFiche(request, NextResponse.next())
  const connexion = new URL('/connexion/', request.url)
  connexion.searchParams.set('retour', `${pathname}${search}`)
  return NextResponse.redirect(connexion)
}

/**
 * La fiche visée par le parcours de revendication, gardée trente jours : en
 * revenant sur « Revendiquer ma fiche » sans fiche dans l'adresse, on retombe
 * dessus (S0 la relit).
 */
const HORS_FICHE = new Set(['recherche', 'psc', 'suivi'])
function memoriserFiche(request: NextRequest, reponse: NextResponse): NextResponse {
  const { pathname, searchParams } = request.nextUrl
  const m = pathname.match(/^\/espace-pro\/(?:laboratoire\/)?revendiquer\/([^/]+)\//)
  const slug = searchParams.get('fiche') ?? (m && !HORS_FICHE.has(m[1]) ? decodeURIComponent(m[1]) : null)
  if (slug && /^[a-z0-9-]{3,200}$/.test(slug) && pathname.startsWith('/espace-pro/')) {
    reponse.cookies.set(COOKIE_FICHE, slug, { path: '/', maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:' })
  }
  return reponse
}

/**
 * La page de recherche mène à l'adresse habituelle de ce qui est cherché :
 * `/recherche/?profession=dentistes&q=` vers `/dentistes/`, `q=Bordeaux` vers
 * `/dentistes/gironde/bordeaux/`. La page est envoyée en flux : sa propre
 * redirection n'arriverait qu'au navigateur, après l'ouverture. Le proxy en
 * fait une vraie réponse HTTP 307, que suivent aussi les robots.
 *
 * Formation et recherche vide se décident sans la base ; un lieu passe par
 * `/api/annuaire/destination/`. Une erreur ou une lenteur laisse la page
 * décider, comme pour le retrait.
 */
// Matcher `/recherche` sans barre finale : avec, Next.js servait une page vide.
async function rediriger(request: NextRequest): Promise<NextResponse | null> {
  const p = request.nextUrl.searchParams
  const params = { profession: p.get('profession'), lieu: p.get('lieu'), q: p.get('q'), bbox: p.get('bbox') }
  let destination = destinationImmediate(params)
  if (destination === undefined) {
    destination = null
    try {
      const api = new URL('/api/annuaire/destination/', request.url)
      api.search = request.nextUrl.search
      const reponse = await fetch(api, { signal: AbortSignal.timeout(2_000) })
      if (reponse.ok) destination = ((await reponse.json()) as { destination: string | null }).destination
    } catch (e) {
      console.error('proxy : destination de la recherche impossible', e)
    }
  }
  return destination ? NextResponse.redirect(new URL(destination, request.url)) : null
}

export async function proxy(request: NextRequest) {
  const session = exigerSession(request)
  if (session) return session
  if (request.nextUrl.pathname.startsWith('/recherche')) return (await rediriger(request)) ?? NextResponse.next()
  const [base, departement, commune, slug] = request.nextUrl.pathname.split('/').filter(Boolean)
  if (!slug) return NextResponse.next()

  let retrait = null as { retireLe: string; destination: string; avis: { titre: string; texte: string } } | null
  try {
    const api = new URL('/api/annuaire/retrait/', request.url)
    api.search = new URLSearchParams({ base, departement, commune, slug }).toString()
    const reponse = await fetch(api, { signal: AbortSignal.timeout(2_000) })
    if (reponse.ok) retrait = ((await reponse.json()) as { retrait: typeof retrait }).retrait
  } catch (e) {
    console.error('proxy : lecture du retrait impossible', e)
  }
  if (!retrait) return NextResponse.next()
  const annulable = new Date(retrait.retireLe).getTime() + DELAI_ANNULATION_RETRAIT_JOURS * 86_400_000 > Date.now()
  const reponse = NextResponse.redirect(new URL(retrait.destination, request.url), annulable ? 307 : 301)
  // Next.js encode lui-même la valeur du cookie.
  reponse.cookies.set(COOKIE_AVIS_RETRAIT, JSON.stringify(retrait.avis), {
    path: '/',
    maxAge: 120,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  })
  return reponse
}

export const config = {
  matcher: ['/:base(dentistes|prothesistes|maxillo-faciaux|stomatologues|orl)/:departement/:commune/:slug', '/espace-pro/:path*', '/favoris/:path*', '/recherche'],
}
