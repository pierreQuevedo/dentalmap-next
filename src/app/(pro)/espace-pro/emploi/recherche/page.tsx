import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { CoqueEspace, Tuile } from '@/components/espace/coque'
import { OngletsEmploi } from '@/components/emploi/espace-offres'
import { ChampCommune } from '@/components/emploi/champ-commune'
import { Resultats, Vues, baseAvecCaches } from '@/components/emploi/liste'
import { chemin } from '@/lib/navigation'
import { getCommuneParCode } from '@/lib/annuaire/queries'
import { empriseOffres } from '@/lib/emploi/carte'
import { filtrerOffres, lireFiltres, urlFiltres, type RechercheEmploi } from '@/lib/emploi/filtres'
import { METIERS, metierDepuisSlug, type CodeContrat } from '@/lib/emploi/metiers'
import { getOffresRayon } from '@/lib/emploi/queries'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Rechercher un poste', robots: { index: false, follow: false } }
export const instant = false

const RAYONS = [5, 10, 20, 40, 80] as const
const ACTION = '/espace-pro/emploi/recherche/'

/**
 * « Rechercher un poste » : la recherche d'emploi du site, dans l'espace pro.
 * Un métier ou tous, autour du cabinet ou d'une commune, dans un rayon ;
 * puis les mêmes filtres et les mêmes vues liste et carte que les pages
 * commune. Les offres mènent à leur page publique : postuler ne demande
 * qu'un compte connecté, sans palier.
 */
export default async function Page(props: { searchParams: Promise<RechercheEmploi & { fiche?: string; metier?: string; commune?: string; rayon?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('emploi', sp.fiche, 'recherche')
  const { fiche } = espace
  const f = lireFiltres(sp)
  const metier = sp.metier ? metierDepuisSlug(sp.metier) : null
  const rayonKm = RAYONS.find((r) => String(r) === sp.rayon) ?? 20
  const lieu = fiche.lieux.find((l) => l.principal && l.lon != null) ?? fiche.lieux.find((l) => l.lon != null)
  const commune = sp.commune && /^\w{5}$/.test(sp.commune) ? await getCommuneParCode(sp.commune) : null
  const centre = commune?.lon != null && commune.lat != null ? { lon: commune.lon, lat: commune.lat } : lieu?.lon != null && lieu.lat != null ? { lon: lieu.lon, lat: lieu.lat } : null
  const ici = commune ? commune.nom : lieu?.communeNom ? `Mon cabinet, ${lieu.communeNom}` : 'Mon cabinet'

  const toutes = centre ? await getOffresRayon({ metier: metier?.code ?? null, lon: centre.lon, lat: centre.lat, rayonMetres: rayonKm * 1000 }) : []
  const offres = filtrerOffres(toutes, f)
  const comptes: Partial<Record<CodeContrat, number>> = {}
  for (const o of toutes) comptes[o.contrat] = (comptes[o.contrat] ?? 0) + 1
  const caches: Record<string, string> = {
    ...(sp.fiche ? { fiche: sp.fiche } : {}),
    ...(metier ? { metier: metier.slug } : {}),
    ...(commune ? { commune: commune.codeInsee } : {}),
    rayon: String(rayonKm),
  }
  const base = baseAvecCaches(ACTION, caches)
  const points = offres.flatMap((o) => (o.lon != null && o.lat != null ? [{ id: o.id, lon: o.lon, lat: o.lat }] : []))

  return (
    <CoqueEspace c={coque} actif="emploi" titre="Emploi" sousTitre="Rechercher un poste près de chez vous, ou ailleurs">
      <OngletsEmploi actif="rechercher" q={q} />

      <Tuile>
        <form action={chemin(ACTION)} method="get" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_8rem_auto] md:items-end">
          {sp.fiche && <input type="hidden" name="fiche" value={sp.fiche} />}
          {f.vue === 'carte' && <input type="hidden" name="vue" value="carte" />}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Métier</span>
            <select name="metier" defaultValue={metier?.slug ?? ''} className="squircle-xl h-11 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong">
              <option value="">Tous les métiers</option>
              {METIERS.map((m) => (
                <option key={m.code} value={m.slug}>
                  {m.nom}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-fg">Autour de</span>
            <ChampCommune code={commune?.codeInsee ?? null} libelle={commune?.nom ?? ''} cabinet={lieu?.communeNom ? `Mon cabinet, ${lieu.communeNom}` : 'Mon cabinet'} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">Rayon</span>
            <select name="rayon" defaultValue={String(rayonKm)} className="squircle-xl h-11 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong">
              {RAYONS.map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-bg">
            <Search className="size-4" aria-hidden /> Rechercher
          </button>
        </form>
      </Tuile>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-2">
          {metier ? metier.nom : 'Tous les métiers'} · {ici} · {rayonKm} km
        </p>
        {offres.length > 0 && <Vues mode={f.vue} liens={{ liste: urlFiltres(base, f, 'liste'), carte: urlFiltres(base, f, 'carte') }} />}
      </div>

      <Tuile className="mt-4 overflow-hidden p-0">
        {!centre ? (
          <p className="p-6 text-sm text-fg-2">Choisissez une commune pour lancer la recherche.</p>
        ) : (
          <Resultats
            g={{
              ariane: [],
              titre: '',
              intro: '',
              cadre: 'px-5',
              mode: f.vue,
              offres,
              total: offres.length,
              emprise: empriseOffres(points, centre, rayonKm * 1000),
              rayon: { ...centre, metres: rayonKm * 1000 },
              filtres: { f, comptes, action: ACTION, caches },
              avant:
                offres.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
                    <p className="font-semibold text-fg">Aucune offre {toutes.length ? 'avec ces filtres' : `dans un rayon de ${rayonKm} km`}</p>
                    <p className="mt-1 text-sm text-fg-2">{toutes.length ? 'Retirez un filtre pour voir les autres offres.' : 'Élargissez le rayon ou choisissez une autre commune.'}</p>
                  </div>
                ) : undefined,
            }}
          />
        )}
      </Tuile>
    </CoqueEspace>
  )
}
