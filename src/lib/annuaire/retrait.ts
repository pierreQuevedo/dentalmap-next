/**
 * Fiches retirées : à la demande du professionnel, depuis son espace pro, ou
 * par l'équipe, depuis le SAV WordPress.
 *
 * Le retrait est modélisé dans `praticiens.retire_le` (voir `appliquerRetrait`
 * dans `src/lib/espace-pro/revendication.ts` et `supprimerFiche` dans
 * `src/lib/moderation/suppression.ts`) : la fiche est marquée supprimée et
 * datée, et la synchronisation ne la recrée pas. L'adresse de la fiche
 * redirige vers la liste de sa commune, ou de son département si la commune
 * n'a plus personne de la même profession, où un avis dit au visiteur que le
 * praticien n'est plus présent.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { LIBELLE, enDepartement } from './libelles'
import { BASE_URL, nomAffiche, type Profession } from './types'

/** Ce que le proxy sert à la place d'une fiche retirée. */
export type Retrait = {
  retireLe: string
  /** Liste de la commune, du département, ou de la profession à défaut. */
  destination: string
  /** L'avis affiché sur la page d'arrivée. */
  avis: { titre: string; texte: string }
}

/**
 * Le retrait d'une fiche, résolu comme `getPraticien` sur le couple
 * département et commune : une URL non canonique n'est pas une fiche retirée.
 * `null` si la fiche n'existe pas ou n'a pas été retirée.
 *
 * Le tag `praticien:<slug>` est invalidé par le retrait et par son annulation.
 */
export async function getRetrait(
  profession: Profession,
  departementSlug: string,
  communeSlug: string,
  slug: string,
): Promise<Retrait | null> {
  'use cache: remote'
  cacheLife('praticien')
  cacheTag('annuaire', `praticien:${slug}`)
  const { rows } = await db.execute<{
    retire_le: string
    nom: string
    prenom: string | null
    raison_sociale: string | null
    commune_nom: string
    departement_nom: string
    commune_pourvue: boolean
    departement_pourvu: boolean
  }>(sql`
    SELECT p.retire_le, p.nom, p.prenom, p.raison_sociale, c.nom AS commune_nom, d.nom AS departement_nom,
      EXISTS (
        SELECT 1 FROM praticiens q JOIN lieux_exercice lq ON lq.praticien_id = q.id
        WHERE q.profession = p.profession AND q.deleted_at IS NULL AND q.indexable AND lq.code_insee = c.code_insee
      ) AS commune_pourvue,
      EXISTS (
        SELECT 1 FROM praticiens q JOIN lieux_exercice lq ON lq.praticien_id = q.id JOIN communes cq ON cq.code_insee = lq.code_insee
        WHERE q.profession = p.profession AND q.deleted_at IS NULL AND q.indexable AND cq.departement_code = d.code
      ) AS departement_pourvu
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.slug = ${slug}
      AND p.profession = ${profession}
      AND p.retire_le IS NOT NULL
      AND c.slug = ${communeSlug}
      AND d.slug = ${departementSlug}
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null

  const base = BASE_URL[profession]
  const pluriel = LIBELLE[profession].pluriel
  const [destination, ou] = r.commune_pourvue
    ? [`/${base}/${departementSlug}/${communeSlug}/`, `à ${r.commune_nom}`]
    : r.departement_pourvu
      ? [`/${base}/${departementSlug}/`, enDepartement(r.departement_nom)]
      : [`/${base}/`, 'près de chez vous']
  const nom = nomAffiche({ profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale })
  return {
    retireLe: r.retire_le,
    destination,
    avis: { titre: `${nom} n’est plus présent sur DentalMap`, texte: `Vous trouverez ci-dessous des ${pluriel} ${ou}.` },
  }
}
