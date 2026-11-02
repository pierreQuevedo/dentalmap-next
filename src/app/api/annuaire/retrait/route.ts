import { getRetrait } from '@/lib/annuaire/retrait'
import { PROFESSION_PAR_BASE, estBaseUrl } from '@/lib/annuaire/types'

/**
 * Retrait d'une fiche, pour `src/proxy.ts` : sa date, la liste vers laquelle
 * rediriger et l'avis à y afficher.
 *
 * Le proxy ne peut pas appeler une fonction `use cache` (elle exige le
 * contexte de rendu de l'App Router) : il passe par cette route, qui lit la
 * requête en cache. Rien de privé : l'avis est affiché à tout visiteur de
 * l'ancienne adresse.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams
  const base = p.get('base') ?? ''
  const departement = p.get('departement')
  const commune = p.get('commune')
  const slug = p.get('slug')
  if (!estBaseUrl(base) || !departement || !commune || !slug) return Response.json({ retrait: null }, { status: 400 })
  const retrait = await getRetrait(PROFESSION_PAR_BASE[base], departement, commune, slug)
  return Response.json({ retrait })
}
