import { getRetrait } from '@/lib/annuaire/retrait'
import { PROFESSION_PAR_BASE, estBaseUrl } from '@/lib/annuaire/types'

/**
 * Date de retrait d'une fiche, pour `src/proxy.ts`.
 *
 * Le proxy ne peut pas appeler une fonction `use cache` (elle exige le
 * contexte de rendu de l'App Router) : il passe par cette route, qui lit la
 * même requête en cache que la page « fiche retirée ». Rien de privé : la date
 * d'un retrait est affichée publiquement sur la page 410.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams
  const base = p.get('base') ?? ''
  const departement = p.get('departement')
  const commune = p.get('commune')
  const slug = p.get('slug')
  if (!estBaseUrl(base) || !departement || !commune || !slug) return Response.json({ retireLe: null }, { status: 400 })
  const retireLe = await getRetrait(PROFESSION_PAR_BASE[base], departement, commune, slug)
  return Response.json({ retireLe })
}
