/**
 * Lien entre l'annuaire et l'emploi : une fiche « recrute » tant qu'au moins
 * une offre de la structure est en ligne (`offres.statut = 'en_ligne'`).
 *
 * Neutralité : l'information est purement descriptive. Elle n'entre dans aucun
 * tri, les listes restent classées par distance puis par ordre alphabétique,
 * et elle est ajoutée après le tri et la pagination.
 *
 * Tags : `emploi` pour toutes les offres, que la publication, le retrait et le
 * job d'échéance invalident ; `praticien:{slug}` pour la fiche concernée.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { PraticienResume } from './types'

export type MetierOffre = 'assistant_dentaire' | 'secretaire' | 'prothesiste' | 'aide_dentaire' | 'chirurgien_dentiste' | 'assistant_specialise'
export type ContratOffre = 'cdi' | 'cdd' | 'alternance' | 'stage' | 'remplacement' | 'collaboration'
export type ModeRemuneration = 'salaire' | 'retrocession' | 'redevance' | 'gratification'

/** Une offre en ligne, telle que la fiche la résume. Le détail vit sur `/emploi/offre/[slug]/`. */
export type OffreFiche = {
  slug: string
  titre: string
  metier: MetierOffre
  contrat: ContratOffre
  tempsPlein: boolean
  heuresHebdo: number | null
  modeRemuneration: ModeRemuneration
  /** Fourchette brute mensuelle en euros, ou pourcentage pour une rétrocession ou une redevance. */
  remunerationMin: number
  remunerationMax: number
  communeNom: string | null
  /** Date ISO de publication. */
  publieeLe: string | null
}

/**
 * Garde-fou provisoire : la table `offres` arrive avec la migration 0018, pas
 * encore appliquée partout. Tant qu'elle manque, Postgres répond 42P01
 * (« relation does not exist ») et la fiche doit s'afficher sans offre plutôt
 * que tomber. Toute autre erreur remonte telle quelle.
 *
 * À retirer, avec `sansTableOffres`, une fois la migration 0018 appliquée sur
 * toutes les bases.
 */
function tableOffresAbsente(e: unknown): boolean {
  // Drizzle enveloppe l'erreur du pilote dans `cause` : on remonte la chaîne.
  for (let courant: unknown = e, i = 0; courant && i < 5; i++) {
    if (typeof courant === 'object' && (courant as { code?: unknown }).code === '42P01') return true
    courant = (courant as { cause?: unknown }).cause
  }
  return false
}

async function sansTableOffres<T>(requete: () => Promise<T>, repli: T): Promise<T> {
  try {
    return await requete()
  } catch (e) {
    if (tableOffresAbsente(e)) return repli
    throw e
  }
}

/**
 * Offres en ligne d'un praticien, les plus récentes d'abord. Le slug ne sert
 * qu'au tag : la Server Action qui publie une offre invalide la fiche.
 */
export async function getOffresEnLigne(praticienId: string, slug: string): Promise<OffreFiche[]> {
  'use cache'
  cacheLife('praticien')
  cacheTag('emploi', `praticien:${slug}`)
  return sansTableOffres(async () => {
    const { rows } = await db.execute<{
      slug: string
      titre: string
      metier: MetierOffre
      contrat: ContratOffre
      temps_plein: boolean
      heures_hebdo: number | null
      mode_remuneration: ModeRemuneration
      remuneration_min: number
      remuneration_max: number
      commune_nom: string | null
      publiee_le: string | null
    }>(sql`
      SELECT o.slug, o.titre, o.metier, o.contrat, o.temps_plein, o.heures_hebdo, o.mode_remuneration,
             o.remuneration_min, o.remuneration_max, c.nom AS commune_nom, o.publiee_le
      FROM offres o
      LEFT JOIN communes c ON c.code_insee = o.commune_code
      WHERE o.praticien_id = ${praticienId} AND o.statut = 'en_ligne'
      ORDER BY o.publiee_le DESC NULLS LAST, o.titre
    `)
    return rows.map((r) => ({
      slug: r.slug,
      titre: r.titre,
      metier: r.metier,
      contrat: r.contrat,
      tempsPlein: r.temps_plein,
      heuresHebdo: r.heures_hebdo,
      modeRemuneration: r.mode_remuneration,
      remunerationMin: r.remuneration_min,
      remunerationMax: r.remuneration_max,
      communeNom: r.commune_nom,
      publieeLe: r.publiee_le ? new Date(r.publiee_le).toISOString() : null,
    }))
  }, [])
}

/**
 * Parmi les praticiens donnés, ceux qui ont au moins une offre en ligne.
 *
 * Les listes de résultats ne portent que le slug (unique, voir
 * `praticiens.slug`) : la requête part donc des slugs plutôt que des
 * identifiants internes, qui n'ont pas à circuler jusqu'au navigateur.
 * L'ordre d'entrée n'a pas d'importance : la liste est triée pour que deux
 * pages identiques partagent la même entrée de cache.
 */
export async function getPraticiensQuiRecrutent(slugs: string[]): Promise<string[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  if (slugs.length === 0) return []
  return sansTableOffres(async () => {
    const { rows } = await db.execute<{ slug: string }>(sql`
      SELECT p.slug
      FROM praticiens p
      WHERE p.slug IN (${sql.join(
        slugs.map((s) => sql`${s}`),
        sql`, `,
      )})
        AND EXISTS (SELECT 1 FROM offres o WHERE o.praticien_id = p.id AND o.statut = 'en_ligne')
    `)
    return rows.map((r) => r.slug)
  }, [])
}

/**
 * Marque `recrute` sur une liste déjà triée et paginée. L'ordre est conservé
 * tel quel : la pastille n'influence jamais le classement.
 */
export async function marquerRecruteurs<T extends Pick<PraticienResume, 'slug'>>(liste: T[]): Promise<(T & { recrute: boolean })[]> {
  const recruteurs = new Set(await getPraticiensQuiRecrutent([...new Set(liste.map((p) => p.slug))].sort()))
  return liste.map((p) => ({ ...p, recrute: recruteurs.has(p.slug) }))
}
