import { destinationRecherche } from '@/lib/annuaire/destination-lieu'

/**
 * Destination d'une recherche, pour `src/proxy.ts` : l'adresse habituelle de
 * ce qui est cherché (`/dentistes/gironde/bordeaux/`), ou `null` pour rester
 * sur `/recherche/`. Le proxy ne peut pas appeler les requêtes en `use cache`
 * lui-même ; cette route les lit pour lui.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams
  const destination = await destinationRecherche({
    profession: p.get('profession'),
    lieu: p.get('lieu'),
    q: p.get('q'),
    bbox: p.get('bbox'),
  })
  return Response.json({ destination })
}
