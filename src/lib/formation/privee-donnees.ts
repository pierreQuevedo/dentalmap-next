import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { Proposition, type Verifications } from './privee'
import { assembler, type FormationPriveeVue } from './privee-liste'
import { getFormations } from '@/lib/wp/queries'

/**
 * Les lectures des formations privées : les propositions d'un compte, la
 * file de l'équipe, et le détail d'une formation publiée pour sa page.
 */

export const PROPOSER = '/espace-pro/compte/formation'

export type StatutProposition = 'en_attente' | 'acceptee' | 'publiee' | 'refusee'

/** Une proposition lue en base : un document abîmé ne casse pas la page, il est ignoré. */
const lire = (brut: unknown): Proposition | null => {
  const r = Proposition.safeParse(brut)
  return r.success ? r.data : null
}

export type PropositionCompte = { id: string; intitule: string; organisme: string; statut: StatutProposition; motif: string | null; demandeLe: string; wpSlug: string | null }

export async function getPropositions(userId: string): Promise<PropositionCompte[]> {
  const { rows } = await db.execute<{ id: string; donnees: unknown; statut: StatutProposition; motif: string | null; demande_le: string; wp_slug: string | null }>(sql`
    SELECT id, donnees, statut, motif, demande_le, wp_slug FROM demandes_formation WHERE user_id = ${userId}::uuid ORDER BY demande_le DESC LIMIT 50
  `)
  return rows.flatMap((r) => {
    const d = lire(r.donnees)
    return d ? [{ id: r.id, intitule: d.intitule, organisme: d.organisme, statut: r.statut, motif: r.motif, demandeLe: r.demande_le, wpSlug: r.wp_slug }] : []
  })
}

export type PropositionAModerer = { id: string; statut: StatutProposition; d: Proposition; verifications: Verifications; demandeLe: string; compteEmail: string; compteNom: string }

/** Les propositions à décider, et celles acceptées qui attendent leur article WordPress. */
export async function getPropositionsAModerer(): Promise<PropositionAModerer[]> {
  const { rows } = await db.execute<{ id: string; statut: StatutProposition; donnees: unknown; verifications: Verifications; demande_le: string; email: string; name: string }>(sql`
    SELECT d.id, d.statut, d.donnees, d.verifications, d.demande_le, u.email, u.name
    FROM demandes_formation d JOIN "user" u ON u.id = d.user_id
    WHERE d.statut IN ('en_attente', 'acceptee') ORDER BY d.statut DESC, d.demande_le ASC LIMIT 100
  `)
  return rows.flatMap((r) => {
    const d = lire(r.donnees)
    return d ? [{ id: r.id, statut: r.statut, d, verifications: r.verifications ?? {}, demandeLe: r.demande_le, compteEmail: r.email, compteNom: r.name }] : []
  })
}

export type FormationPubliee = { d: Proposition; verifications: Verifications; publieeLe: string }

/** Le détail déclaré d'une formation privée publiée, pour sa page. Invalidé à chaque décision. */
export async function getFormationPrivee(wpSlug: string): Promise<FormationPubliee | null> {
  'use cache: remote'
  cacheLife('editorial')
  cacheTag('wp:formation', `formation-privee:${wpSlug}`)
  const { rows } = await db.execute<{ donnees: unknown; verifications: Verifications; publiee_le: string }>(sql`
    SELECT donnees, verifications, publiee_le FROM demandes_formation WHERE wp_slug = ${wpSlug} AND statut = 'publiee'
  `)
  const r = rows[0]
  const d = r ? lire(r.donnees) : null
  return r && d ? { d, verifications: r.verifications ?? {}, publieeLe: r.publiee_le } : null
}

/**
 * Le détail de toutes les formations privées publiées, par adresse
 * WordPress, pour la liste et les « autres formations » d'une fiche.
 */
export async function getFormationsPriveesPubliees(): Promise<(FormationPubliee & { wpSlug: string })[]> {
  'use cache: remote'
  cacheLife('editorial')
  cacheTag('wp:formation', 'formations-privees')
  const { rows } = await db.execute<{ wp_slug: string; donnees: unknown; verifications: Verifications; publiee_le: string }>(sql`
    SELECT wp_slug, donnees, verifications, publiee_le FROM demandes_formation
    WHERE statut = 'publiee' AND wp_slug IS NOT NULL ORDER BY wp_slug
  `)
  return rows.flatMap((r) => {
    const d = lire(r.donnees)
    return d ? [{ wpSlug: r.wp_slug, d, verifications: r.verifications ?? {}, publieeLe: r.publiee_le }] : []
  })
}

/**
 * Les formations privées publiques : un article WordPress de type `privee`
 * (filtré par `aUnType`) dont le détail est publié dans Neon.
 */
export async function getVuesFormationsPrivees(): Promise<FormationPriveeVue[]> {
  'use cache: remote'
  // Mise en cache une heure : les sessions passées sortent dans l'heure qui suit minuit.
  cacheLife('editorial')
  cacheTag('wp:formation', 'formations-privees')
  const [articles, details] = await Promise.all([getFormations(), getFormationsPriveesPubliees()])
  return assembler(
    articles.filter((a) => a.type === 'privee'),
    new Map(details.map(({ wpSlug, ...det }) => [wpSlug, det])),
  )
}
