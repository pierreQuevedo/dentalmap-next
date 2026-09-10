import { Suspense } from 'react'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { getConseilsRecents } from '@/lib/wp/queries'

// Page de contrôle du socle, à supprimer avant la bascule en production.

async function DbStatus() {
  // db.execute renvoie { rows, rowCount, ... } avec le driver neon-http, pas un tableau.
  const version = await db.execute<{ postgis: string }>(sql`SELECT postgis_version() AS postgis`)
  const count = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM praticiens`)
  return (
    <p>
      Neon OK, PostGIS {version.rows[0]?.postgis ?? 'inconnu'}, {count.rows[0]?.n ?? 0} praticien(s) en base.
    </p>
  )
}

async function WpStatus() {
  const conseils = await getConseilsRecents(3)
  if (conseils.length === 0) return <p>WordPress répond, aucun conseil publié.</p>
  return (
    <ul>
      {conseils.map((c) => (
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
