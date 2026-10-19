import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { SOURCES, estRobot, type CleSource } from './sources'

/** Compte une visite arrivée par un lien de partage. Sans effet pour un robot, un préchargement ou une fiche inconnue ; ne lève jamais. */
export async function compterVisite(slug: string, source: CleSource, entetes: Headers): Promise<void> {
  if (estRobot(entetes.get('user-agent'))) return
  if (/prefetch|prerender/i.test(`${entetes.get('purpose') ?? ''} ${entetes.get('sec-purpose') ?? ''}`)) return
  try {
    await db.execute(sql`
      INSERT INTO visites_partage (praticien_id, source, jour, nombre)
      SELECT p.id, ${source}, (now() AT TIME ZONE 'Europe/Paris')::date, 1 FROM praticiens p WHERE p.slug = ${slug} AND p.deleted_at IS NULL
      ON CONFLICT (praticien_id, source, jour) DO UPDATE SET nombre = visites_partage.nombre + 1
    `)
  } catch (e) {
    console.error('[statistiques] visite non comptée', slug, source, e)
  }
}

export type Statistiques = {
  jours: number
  total: number
  precedent: number
  /** Une entrée par jour, du plus ancien au plus récent, jours sans visite compris. */
  parJour: { jour: string; nombre: number }[]
  /** Toutes les sources, triées par visites décroissantes. */
  parSource: { cle: CleSource; libelle: string; detail: string; nombre: number; precedent: number }[]
}

/** Les visites des `jours` derniers jours, et celles de la période d'avant pour comparer. */
export async function getStatistiques(praticienId: string, jours = 30): Promise<Statistiques> {
  const { rows } = await db.execute<{ source: CleSource; jour: string; nombre: number }>(sql`
    SELECT source, to_char(jour, 'YYYY-MM-DD') AS jour, nombre FROM visites_partage
    WHERE praticien_id = ${praticienId} AND jour > (now() AT TIME ZONE 'Europe/Paris')::date - ${jours * 2}::int
  `)
  const aujourdhui = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }))
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const debut = new Date(aujourdhui.getTime() - (jours - 1) * 86_400_000)
  const parJour = Array.from({ length: jours }, (_, i) => ({ jour: iso(new Date(debut.getTime() + i * 86_400_000)), nombre: 0 }))
  const index = new Map(parJour.map((j, i) => [j.jour, i]))
  const courant = new Map<string, number>()
  const avant = new Map<string, number>()
  for (const r of rows) {
    const i = index.get(r.jour)
    if (i !== undefined) {
      parJour[i].nombre += r.nombre
      courant.set(r.source, (courant.get(r.source) ?? 0) + r.nombre)
    } else avant.set(r.source, (avant.get(r.source) ?? 0) + r.nombre)
  }
  const parSource = SOURCES.map((s) => ({ cle: s.cle, libelle: s.libelle, detail: s.detail, nombre: courant.get(s.cle) ?? 0, precedent: avant.get(s.cle) ?? 0 })).sort((a, b) => b.nombre - a.nombre)
  return {
    jours,
    total: parSource.reduce((t, s) => t + s.nombre, 0),
    precedent: parSource.reduce((t, s) => t + s.precedent, 0),
    parJour,
    parSource,
  }
}
