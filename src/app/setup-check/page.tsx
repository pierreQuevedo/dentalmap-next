import { Suspense } from 'react'
import { connection } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { getConseilsRecents } from '@/lib/wp/queries'

// Page de contrôle du socle, à supprimer avant la bascule en production.
//
// `connection()` rend les deux blocs dynamiques : une page de diagnostic doit refléter
// l'état courant, pas un instantané figé au build. Sans elle, Cache Components prérend
// la page pendant `next build` et une source injoignable fait échouer la compilation.
//
// Chaque source est interrogée dans une fonction qui renvoie un résultat plutôt que de
// lever, pour que l'indisponibilité de l'une soit affichée au lieu de casser la page.

type Resultat<T> = { ok: true; valeur: T } | { ok: false; message: string }

async function tenter<T>(travail: () => Promise<T>): Promise<Resultat<T>> {
  try {
    return { ok: true, valeur: await travail() }
  } catch (erreur) {
    return { ok: false, message: erreur instanceof Error ? erreur.message : String(erreur) }
  }
}

async function lireNeon() {
  // db.execute renvoie { rows, rowCount, ... } avec le driver neon-http, pas un tableau.
  const version = await db.execute<{ postgis: string }>(sql`SELECT postgis_version() AS postgis`)
  const total = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM praticiens`)
  return { postgis: version.rows[0]?.postgis ?? 'inconnu', praticiens: total.rows[0]?.n ?? 0 }
}

async function DbStatus() {
  await connection()
  const r = await tenter(lireNeon)
  if (!r.ok) return <p className="text-red-700">Neon indisponible : {r.message}</p>
  return (
    <p>
      Neon OK, PostGIS {r.valeur.postgis}, {r.valeur.praticiens} praticien(s) en base.
    </p>
  )
}

async function WpStatus() {
  await connection()
  const r = await tenter(() => getConseilsRecents(3))
  if (!r.ok) return <p className="text-red-700">WordPress indisponible : {r.message}</p>
  if (r.valeur.length === 0) return <p>WordPress répond, aucun conseil publié.</p>
  return (
    <ul>
      {r.valeur.map((c) => (
        <li key={c.id}>
          {c.title} ({c.conseilFields?.tempsLecture ?? '?'} min)
        </li>
      ))}
    </ul>
  )
}

export default function SetupCheck() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-xl font-medium">Contrôle du socle</h1>
      <Suspense fallback={<p>Base…</p>}>
        <DbStatus />
      </Suspense>
      <Suspense fallback={<p>WordPress…</p>}>
        <WpStatus />
      </Suspense>
    </main>
  )
}
