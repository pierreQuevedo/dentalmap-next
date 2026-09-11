import { Suspense } from 'react'
import { connection } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { getConseilsRecents } from '@/lib/wp/queries'

// Tableau de bord de l'avancement, à supprimer avant la bascule en production.
//
// `connection()` rend chaque bloc dynamique : la page doit refléter l'état
// courant, pas un instantané figé au build. Sans elle, Cache Components
// prérendrait la page pendant `next build` et une source injoignable ferait
// échouer la compilation.
//
// Chaque source est interrogée dans une fonction qui renvoie un résultat plutôt
// que de lever, pour que l'indisponibilité de l'une soit affichée au lieu de
// casser la page.

type Resultat<T> = { ok: true; valeur: T } | { ok: false; message: string }

async function tenter<T>(travail: () => Promise<T>): Promise<Resultat<T>> {
  try {
    return { ok: true, valeur: await travail() }
  } catch (erreur) {
    return { ok: false, message: erreur instanceof Error ? erreur.message : String(erreur) }
  }
}

const nombre = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

function Erreur({ source, message }: { source: string; message: string }) {
  return (
    <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      {source} indisponible : {message}
    </p>
  )
}

function Carte({ titre, enfants }: { titre: string; enfants: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{titre}</h2>
      {enfants}
    </section>
  )
}

function Ligne({ label, valeur, note }: { label: string; valeur: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-700">{label}</span>
      <span className="text-right">
        <span className="font-medium tabular-nums">{valeur}</span>
        {note ? <span className="ml-2 text-xs text-slate-500">{note}</span> : null}
      </span>
    </div>
  )
}

async function lireAnnuaire() {
  const [geo] = (
    await db.execute<{ regions: number; departements: number; communes: number; arrondissements: number }>(sql`
      SELECT
        (SELECT count(*)::int FROM regions) AS regions,
        (SELECT count(*)::int FROM departements) AS departements,
        (SELECT count(*)::int FROM communes WHERE type = 'commune') AS communes,
        (SELECT count(*)::int FROM communes WHERE type = 'arrondissement') AS arrondissements
    `)
  ).rows
  const [pra] = (
    await db.execute<{ total: number; indexables: number; lieux: number; positions: number }>(sql`
      SELECT
        (SELECT count(*)::int FROM praticiens WHERE deleted_at IS NULL) AS total,
        (SELECT count(*)::int FROM praticiens WHERE deleted_at IS NULL AND indexable) AS indexables,
        (SELECT count(*)::int FROM lieux_exercice) AS lieux,
        (SELECT count(*)::int FROM lieux_exercice WHERE position IS NOT NULL) AS positions
    `)
  ).rows
  const [ver] = (await db.execute<{ postgis: string }>(sql`SELECT postgis_version() AS postgis`)).rows
  return { geo, pra, postgis: ver?.postgis ?? 'inconnu' }
}

async function AnnuaireStatus() {
  await connection()
  const r = await tenter(lireAnnuaire)
  if (!r.ok) return <Erreur source="Neon" message={r.message} />
  const { geo, pra, postgis } = r.valeur
  return (
    <div className="text-sm">
      <Ligne label="Régions" valeur={nombre(geo?.regions ?? 0)} />
      <Ligne label="Départements et collectivités" valeur={nombre(geo?.departements ?? 0)} />
      <Ligne label="Communes" valeur={nombre(geo?.communes ?? 0)} />
      <Ligne label="Arrondissements municipaux" valeur={nombre(geo?.arrondissements ?? 0)} note="Paris, Lyon, Marseille" />
      <Ligne label="Praticiens" valeur={nombre(pra?.total ?? 0)} note="import à venir" />
      <Ligne label="dont indexables" valeur={nombre(pra?.indexables ?? 0)} />
      <Ligne label="Lieux d'exercice" valeur={nombre(pra?.lieux ?? 0)} />
      <Ligne label="dont géolocalisés" valeur={nombre(pra?.positions ?? 0)} />
      <Ligne label="PostGIS" valeur={postgis.split(' ')[0] ?? postgis} />
    </div>
  )
}

async function lireRuns() {
  const { rows } = await db.execute<{
    registre: string
    statut: string
    demarre_le: string
    duree: string | null
    lignes_lues: number
    inserees: number
    erreurs: number
  }>(sql`
    SELECT registre, statut, to_char(demarre_le AT TIME ZONE 'Europe/Paris', 'DD/MM à HH24:MI') AS demarre_le,
           to_char(termine_le - demarre_le, 'MI:SS') AS duree,
           lignes_lues, inserees, coalesce(jsonb_array_length(erreurs), 0)::int AS erreurs
    FROM sync_runs ORDER BY demarre_le DESC LIMIT 8
  `)
  return rows
}

async function RunsStatus() {
  await connection()
  const r = await tenter(lireRuns)
  if (!r.ok) return <Erreur source="Neon" message={r.message} />
  if (r.valeur.length === 0) return <p className="text-sm text-slate-500">Aucune synchronisation lancée.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
          <th className="pb-2 font-medium">Job</th>
          <th className="pb-2 font-medium">Quand</th>
          <th className="pb-2 font-medium">Durée</th>
          <th className="pb-2 text-right font-medium">Lues</th>
          <th className="pb-2 text-right font-medium">Écrites</th>
          <th className="pb-2 text-right font-medium">Erreurs</th>
          <th className="pb-2 text-right font-medium">Statut</th>
        </tr>
      </thead>
      <tbody>
        {r.valeur.map((run, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-0">
            <td className="py-2 font-medium">{run.registre}</td>
            <td className="py-2 text-slate-600">{run.demarre_le}</td>
            <td className="py-2 tabular-nums text-slate-600">{run.duree ?? '—'}</td>
            <td className="py-2 text-right tabular-nums">{nombre(run.lignes_lues)}</td>
            <td className="py-2 text-right tabular-nums">{nombre(run.inserees)}</td>
            <td className="py-2 text-right tabular-nums">{run.erreurs > 0 ? run.erreurs : '—'}</td>
            <td className="py-2 text-right">
              <span
                className={
                  run.statut === 'termine'
                    ? 'rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800'
                    : run.statut === 'bloque'
                      ? 'rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900'
                      : 'rounded bg-red-100 px-2 py-0.5 text-xs text-red-800'
                }
              >
                {run.statut}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

async function WpStatus() {
  await connection()
  const r = await tenter(() => getConseilsRecents(3))
  if (!r.ok) return <Erreur source="WordPress" message={r.message} />
  if (r.valeur.length === 0) return <p className="text-sm text-slate-500">WordPress répond, aucun conseil publié.</p>
  return (
    <ul className="space-y-1 text-sm">
      {r.valeur.map((c) => (
        <li key={c.id} className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
          <span className="text-slate-700">{c.title}</span>
          <span className="shrink-0 text-xs text-slate-500">{c.conseilFields?.tempsLecture ?? '?'} min de lecture</span>
        </li>
      ))}
    </ul>
  )
}

export default function SetupCheck() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 bg-slate-50 p-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">DentalMap, état du chantier</h1>
        <p className="mt-1 text-sm text-slate-600">
          Page de contrôle interne. Elle lit les deux sources de données en direct et disparaîtra à la mise en ligne.
        </p>
      </header>

      <Carte
        titre="Base annuaire (Neon)"
        enfants={
          <Suspense fallback={<p className="text-sm text-slate-400">Lecture…</p>}>
            <AnnuaireStatus />
          </Suspense>
        }
      />

      <Carte
        titre="Dernières synchronisations"
        enfants={
          <Suspense fallback={<p className="text-sm text-slate-400">Lecture…</p>}>
            <RunsStatus />
          </Suspense>
        }
      />

      <Carte
        titre="Contenu éditorial (WordPress)"
        enfants={
          <Suspense fallback={<p className="text-sm text-slate-400">Lecture…</p>}>
            <WpStatus />
          </Suspense>
        }
      />

      <footer className="text-xs text-slate-500">
        Administration WordPress :{' '}
        <a className="underline" href="https://cms.dentalmap.fr/wp-admin/">
          cms.dentalmap.fr/wp-admin
        </a>
      </footer>
    </main>
  )
}
