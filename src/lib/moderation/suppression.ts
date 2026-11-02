import { revalidateTag } from 'next/cache'
import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'

/**
 * Suppression d'une fiche par l'équipe, à la demande du professionnel, depuis
 * le SAV WordPress. Sans contrôle d'accès : les routes /api/admin/ s'en
 * chargent par la clé partagée.
 *
 * Toutes les professions. La fiche est retirée comme par le professionnel
 * lui-même (`appliquerRetrait`) : `deleted_at` et `retire_le` posés, la
 * synchronisation ne la recrée pas, les données déclaratives sont effacées,
 * et son adresse redirige vers la liste de sa commune (`src/proxy.ts`).
 */

export type FicheAdmin = {
  id: string
  slug: string
  profession: Profession
  nom: string
  commune: string | null
  departement: string | null
  rpps: string | null
  siren: string | null
  /** Publiée (indexable), en base sans page publique, retirée, ou sortie du registre. */
  etat: 'publiee' | 'sans_page' | 'retiree' | 'sortie_registre'
  retireLe: string | null
  revendiquee: boolean
  /** L'adresse publique, retirée ou non : une fiche retirée y redirige. */
  url: string | null
}

const cherchable = (colonne: SQL) =>
  sql`lower(translate(${colonne}, 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇàâäéèêëîïôöùûüç''-', 'AAAEEEEIIOOUUUCaaaeeeeiioouuuc  '))`

type Ligne = {
  id: string
  slug: string
  profession: Profession
  nom: string
  prenom: string | null
  raison_sociale: string | null
  rpps: string | null
  siren: string | null
  indexable: boolean
  deleted_at: string | null
  retire_le: string | null
  revendiquee: boolean
  commune_nom: string | null
  commune_slug: string | null
  departement_nom: string | null
  departement_slug: string | null
}

/**
 * Par nom, raison sociale, RPPS (11 chiffres) ou SIREN et SIRET (9 ou 14),
 * toutes professions, retirées comprises : vingt fiches au plus.
 */
export async function chercherFichesAdmin(saisie: string): Promise<FicheAdmin[]> {
  const texte = saisie.trim()
  if (texte.length < 2) return []
  const chiffres = texte.replace(/[\s.-]/g, '')
  const q = texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['-]/g, ' ').replace(/\s+/g, ' ')
  const filtre = /^\d{11}$/.test(chiffres)
    ? sql`p.rpps = ${chiffres}`
    : /^\d{9}(\d{5})?$/.test(chiffres)
      ? sql`p.siren = ${chiffres.slice(0, 9)}`
      : sql`(${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} LIKE ${`%${q}%`}
           OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} LIKE ${`%${q}%`}
           OR ${cherchable(sql`coalesce(p.raison_sociale, '')`)} LIKE ${`%${q}%`})`
  const { rows } = await db.execute<Ligne>(sql`
    SELECT p.id, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale, p.rpps, p.siren, p.indexable, p.deleted_at, p.retire_le,
           EXISTS (SELECT 1 FROM revendications r WHERE r.praticien_id = p.id AND r.objet = 'revendication' AND r.statut = 'acceptee') AS revendiquee,
           c.nom AS commune_nom, c.slug AS commune_slug, d.nom AS departement_nom, d.slug AS departement_slug
    FROM praticiens p
    LEFT JOIN LATERAL (
      SELECT l.code_insee FROM lieux_exercice l WHERE l.praticien_id = p.id ORDER BY l.principal DESC, l.id LIMIT 1
    ) l ON true
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE ${filtre}
    -- Les fiches en ligne d'abord, puis les retirées, puis celles sorties du registre.
    ORDER BY (p.deleted_at IS NULL) DESC, (p.retire_le IS NOT NULL) DESC, p.nom, p.prenom
    LIMIT 20
  `)
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    profession: r.profession,
    nom: nomAffiche({ profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale }),
    commune: r.commune_nom,
    departement: r.departement_nom,
    rpps: r.rpps,
    siren: r.siren,
    etat: r.retire_le ? 'retiree' : r.deleted_at ? 'sortie_registre' : r.indexable ? 'publiee' : 'sans_page',
    retireLe: r.retire_le,
    revendiquee: r.revendiquee,
    url: r.departement_slug && r.commune_slug ? cheminPraticien(BASE_URL[r.profession], r.departement_slug, r.commune_slug, r.slug) : null,
  }))
}

/** Supprime une fiche encore en ligne. `null` si elle n'existe pas ou est déjà supprimée. */
export async function supprimerFiche(id: string): Promise<{ slug: string } | null> {
  const { rows } = await db.execute<{ slug: string }>(sql`
    UPDATE praticiens SET deleted_at = now(), retire_le = now(), updated_at = now()
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING slug
  `)
  const fiche = rows[0]
  if (!fiche) return null
  await db.execute(sql`DELETE FROM fiches_completees WHERE praticien_id = ${id}`)
  revalidateTag('annuaire', 'max')
  // Sans attendre : l'adresse de la fiche redirige dès la requête suivante.
  revalidateTag(`praticien:${fiche.slug}`, { expire: 0 })
  return fiche
}

/**
 * Remet en ligne une fiche retirée, par erreur ou à la demande du
 * professionnel revenu sur sa décision. Les données déclaratives effacées au
 * retrait ne reviennent pas. `null` si la fiche n'est pas retirée.
 */
export async function retablirFiche(id: string): Promise<{ slug: string } | null> {
  const { rows } = await db.execute<{ slug: string }>(sql`
    UPDATE praticiens SET deleted_at = NULL, retire_le = NULL, updated_at = now()
    WHERE id = ${id} AND retire_le IS NOT NULL
    RETURNING slug
  `)
  const fiche = rows[0]
  if (!fiche) return null
  revalidateTag('annuaire', 'max')
  revalidateTag(`praticien:${fiche.slug}`, { expire: 0 })
  return fiche
}
