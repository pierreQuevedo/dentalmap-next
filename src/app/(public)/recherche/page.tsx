import Link from 'next/link'
import type { Metadata } from 'next'
import { chercherCommune, getCommuneParCode, getPraticiensProches } from '@/lib/annuaire/queries'
import { nomAffiche, PROFESSION_PAR_BASE, type BaseUrl } from '@/lib/annuaire/types'
import { Adresse, chemin, Telephone, Verification } from '@/components/annuaire/primitives'
import { Carte } from '@/components/map/carte'
import { ChampLieu } from '@/components/map/champ-lieu'

/**
 * Recherche par localisation.
 *
 * Volontairement hors index : les combinaisons de paramètres sont infinies et
 * les pages canoniques sont les pages hiérarchiques par commune. Le robots.txt
 * l'exclut également.
 *
 * Le classement est la distance, puis l'ordre alphabétique à égalité. C'est la
 * seule règle de tri du site, et elle est affichée sur la page.
 */
export const metadata: Metadata = {
  title: 'Rechercher un professionnel',
  robots: { index: false, follow: true },
}

export const instant = false

const RAYON_METRES = 20_000

/** Distance lisible : mètres en dessous du kilomètre, virgule décimale française. */
function distance(metres: number): string {
  if (metres < 1000) return `${metres} m`
  return `${(metres / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
}

type Params = { profession?: string; lieu?: string; q?: string }

export default async function Recherche(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const base: BaseUrl = sp.profession === 'prothesistes' ? 'prothesistes' : 'dentistes'
  const profession = PROFESSION_PAR_BASE[base]

  // `lieu` porte un code INSEE choisi dans les suggestions ; `q` la saisie brute
  // quand le formulaire est envoyé sans JavaScript.
  const commune = sp.lieu ? await getCommuneParCode(sp.lieu) : sp.q ? await chercherCommune(sp.q) : null

  const resultats =
    commune?.lon != null && commune.lat != null
      ? await getPraticiensProches(profession, commune.lon, commune.lat, RAYON_METRES)
      : []

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Rechercher un professionnel</h1>

      <form method="get" action="/recherche/" className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <ChampLieu valeurInitiale={commune?.nom ?? sp.q ?? ''} profession={base} />
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-slate-700">
            Profession
          </label>
          <select
            id="profession"
            name="profession"
            defaultValue={base}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
          >
            <option value="dentistes">Chirurgiens-dentistes</option>
            <option value="prothesistes">Laboratoires de prothèse</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Rechercher
        </button>
      </form>

      {!commune && (
        <p className="mt-8 text-slate-600">
          Saisissez une commune ou un code postal pour voir les professionnels les plus proches.
        </p>
      )}

      {commune && (
        <>
          <p className="mt-6 text-slate-600">
            {resultats.length > 0 ? (
              <>
                {resultats.length} {resultats.length > 1 ? 'professionnels' : 'professionnel'} à moins de{' '}
                {RAYON_METRES / 1000} km de {commune.nom}, du plus proche au plus éloigné.
              </>
            ) : (
              <>Aucun professionnel géolocalisé à moins de {RAYON_METRES / 1000} km de {commune.nom}.</>
            )}
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <ol className="divide-y divide-slate-200 border-y border-slate-200 lg:max-h-[600px] lg:overflow-y-auto">
              {resultats.map((p) => (
                <li key={p.slug} className="py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-medium">
                      <Link
                        href={chemin(`/${base}/${p.departementSlug}/${p.communeSlug}/${p.slug}/`)}
                        className="text-slate-900 hover:underline"
                      >
                        {nomAffiche({ profession, nom: p.nom, prenom: p.prenom, raisonSociale: p.raisonSociale })}
                      </Link>
                    </h2>
                    <span className="shrink-0 text-sm tabular-nums text-slate-500">
                      {distance(p.metres)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    <Adresse ligne={p.adresseLigne} codePostal={p.codePostal} commune={p.communeNom} />
                    {p.telephone && (
                      <p className="mt-1">
                        <Telephone numero={p.telephone} />
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Verification statut={p.statutVerification} />
                  </div>
                </li>
              ))}
            </ol>

            {commune.lon != null && commune.lat != null && (
              <Carte profession={base} centre={[commune.lon, commune.lat]} zoom={12} />
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-sm text-slate-600">
        Les résultats sont classés par distance, puis par ordre alphabétique à égalité. Aucune mise en avant payante
        n&apos;existe sur DentalMap. Les professionnels dont la position n&apos;est qu&apos;approximative, faute
        d&apos;adresse exploitable, sont exclus de ce classement mais restent accessibles par leur commune.
      </p>
    </main>
  )
}
