/**
 * La recherche de l'en-tête, sur tout le site : les professionnels par nom,
 * les formations, les offres d'emploi et les annonces de cession. Les lieux
 * ont déjà leur route (`/api/geo/autocomplete/`).
 *
 * Les professionnels sont cherchés en base, accents et tirets ignorés, parmi
 * les fiches indexables. Les trois autres sources sont des listes déjà
 * cachées, filtrées en mémoire : quelques centaines d'entrées au plus.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { getFormations } from '@/lib/wp/queries'
import { FAMILLES, lienFormation, typeDe } from '@/lib/formation/types'
import { getOffresRecentes } from '@/lib/emploi/queries'
import { cheminOffre } from '@/lib/emploi/chemins'
import { METIERS } from '@/lib/emploi/metiers'
import { getAnnoncesFrance } from '@/lib/cessions/queries'
import { cheminAnnonceCession } from '@/lib/cessions/routes'
import { LIBELLE_TYPE } from '@/lib/cessions/types'
import { AUCUN_RESULTAT, type ResultatUniversel, type ResultatsUniversels } from './types'

/** Par groupe : le panneau doit tenir sur un écran. */
const PAR_GROUPE = 5

/** Minuscules, sans accents, apostrophes et tirets en espaces. */
export function normaliserRecherche(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Vrai si chaque mot de la saisie figure dans l'un des textes. */
function correspond(mots: string[], ...textes: (string | null | undefined)[]): boolean {
  const botte = normaliserRecherche(textes.filter(Boolean).join(' '))
  return mots.every((m) => botte.includes(m))
}

/** Translittération SQL alignée sur `normaliserRecherche`, comme dans `/api/geo/autocomplete/`. */
const cherchable = (colonne: SQL) =>
  sql`lower(translate(${colonne}, 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇàâäéèêëîïôöùûüç''-', 'AAAEEEEIIOOUUUCaaaeeeeiioouuuc  '))`

type LignePro = {
  profession: Profession
  slug: string
  nom: string
  prenom: string | null
  raison_sociale: string | null
  commune_nom: string
  commune_slug: string
  departement_slug: string
}

async function chercherProfessionnels(q: string): Promise<ResultatUniversel[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const motif = `%${q}%`
  const { rows } = await db.execute<LignePro>(sql`
    SELECT p.profession, p.slug, p.nom, p.prenom, p.raison_sociale,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug
    FROM praticiens p
    JOIN LATERAL (
      SELECT l.code_insee FROM lieux_exercice l WHERE l.praticien_id = p.id ORDER BY l.principal DESC, l.id LIMIT 1
    ) l ON true
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.deleted_at IS NULL AND p.indexable AND (
      ${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} LIKE ${motif}
      OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} LIKE ${motif}
      OR ${cherchable(sql`coalesce(p.raison_sociale, '')`)} LIKE ${motif}
    )
    -- Le nom de la personne d'abord, le nom de la société ensuite ; à égalité, ce qui commence par la saisie.
    ORDER BY (${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} LIKE ${motif} OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} LIKE ${motif}) DESC,
             (${cherchable(sql`coalesce(p.raison_sociale, p.nom)`)} LIKE ${`${q}%`}) DESC, p.nom, p.prenom
    LIMIT ${PAR_GROUPE}
  `)
  return rows.map((r) => ({
    titre: nomAffiche({ profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale }),
    detail: `${LIBELLE[r.profession].singulier.replace(/^./, (c) => c.toUpperCase())} · ${r.commune_nom}`,
    href: cheminPraticien(BASE_URL[r.profession], r.departement_slug, r.commune_slug, r.slug),
  }))
}

async function chercherFormations(mots: string[]): Promise<ResultatUniversel[]> {
  const formations = await getFormations()
  return formations
    .filter((f) => correspond(mots, f.titre, f.ville, f.diplome))
    .slice(0, PAR_GROUPE)
    .map((f) => ({ titre: f.titre, detail: [FAMILLES[typeDe(f)].pastille, f.ville].filter(Boolean).join(' · '), href: lienFormation(f) }))
}

async function chercherOffres(mots: string[]): Promise<ResultatUniversel[]> {
  const offres = await getOffresRecentes({ limite: 500 })
  return offres
    .filter((o) => correspond(mots, o.titre, o.recruteur, o.commune, METIERS.find((m) => m.code === o.metier)?.nom))
    .slice(0, PAR_GROUPE)
    .map((o) => ({ titre: o.titre, detail: [o.recruteur, o.commune].filter(Boolean).join(' · '), href: cheminOffre(o.slug) }))
}

async function chercherAnnonces(mots: string[]): Promise<ResultatUniversel[]> {
  const annonces = await getAnnoncesFrance()
  return annonces
    .filter((a) => correspond(mots, a.titre, a.secteur, a.communeNom, a.departementNom, LIBELLE_TYPE[a.type]))
    .slice(0, PAR_GROUPE)
    .map((a) => ({ titre: a.titre, detail: [LIBELLE_TYPE[a.type], a.secteur].filter(Boolean).join(' · '), href: cheminAnnonceCession(a.departementSlug, a.slug) }))
}

export async function rechercheUniverselle(saisie: string): Promise<ResultatsUniversels> {
  const q = normaliserRecherche(saisie)
  if (q.length < 2) return AUCUN_RESULTAT
  const mots = q.split(' ')
  const [professionnels, formations, emploi, annonces] = await Promise.all([
    // Un nom de trois lettres au moins : en deçà, des milliers de fiches répondent.
    q.length >= 3 ? chercherProfessionnels(q) : Promise.resolve([]),
    chercherFormations(mots),
    chercherOffres(mots),
    chercherAnnonces(mots),
  ])
  return { professionnels, formations, emploi, annonces }
}
