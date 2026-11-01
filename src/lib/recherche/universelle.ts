/**
 * La recherche de l'en-tête, sur tout le site : les professionnels par nom,
 * les formations, les offres d'emploi et les annonces de cession. Les lieux
 * ont déjà leur route (`/api/geo/autocomplete/`).
 *
 * Les professionnels sont cherchés en base, accents et tirets ignorés, parmi
 * les fiches indexables. S'y ajoutent, après elles, les praticiens vérifiés
 * dont le registre ne donne aucune adresse positionnée : ils n'ont pas de
 * page publique, le résultat mène à la revendication de leur fiche, où ils
 * renseignent leur adresse. Les trois autres sources sont des listes déjà
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
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
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
  indexable: boolean
  commune_nom: string | null
  commune_slug: string | null
  departement_slug: string | null
}

async function chercherProfessionnels(q: string): Promise<ResultatUniversel[]> {
  'use cache: remote'
  cacheLife('listing')
  cacheTag('annuaire')
  const motif = `%${q}%`
  const { rows } = await db.execute<LignePro>(sql`
    SELECT p.profession, p.slug, p.nom, p.prenom, p.raison_sociale, p.indexable,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug
    FROM praticiens p
    LEFT JOIN LATERAL (
      SELECT l.code_insee FROM lieux_exercice l WHERE l.praticien_id = p.id ORDER BY l.principal DESC, l.id LIMIT 1
    ) l ON true
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE p.deleted_at IS NULL AND (
      p.indexable
      -- Sans adresse positionnée, mais identité vérifiée et ni radié ni cessé : la règle de \`recalculerIndexables\`, moins le lieu.
      OR (p.statut_verification = 'verifie'
          AND NOT EXISTS (SELECT 1 FROM lieux_exercice x WHERE x.praticien_id = p.id AND x.position IS NOT NULL)
          AND NOT EXISTS (SELECT 1 FROM verifications v WHERE v.praticien_id = p.id AND v.statut IN ('radie', 'cesse')))
    ) AND (
      ${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} LIKE ${motif}
      OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} LIKE ${motif}
      OR ${cherchable(sql`coalesce(p.raison_sociale, '')`)} LIKE ${motif}
    )
    -- Les fiches publiques d'abord ; puis le nom de la personne, le nom de la société ensuite ; à égalité, ce qui commence par la saisie.
    ORDER BY p.indexable DESC, (${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} LIKE ${motif} OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} LIKE ${motif}) DESC,
             (${cherchable(sql`coalesce(p.raison_sociale, p.nom)`)} LIKE ${`${q}%`}) DESC, p.nom, p.prenom
    LIMIT ${PAR_GROUPE}
  `)
  return rows.map((r) => {
    const titre = nomAffiche({ profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale })
    const libelle = LIBELLE[r.profession].singulier.replace(/^./, (c) => c.toUpperCase())
    if (r.indexable && r.departement_slug && r.commune_slug) {
      return { titre, detail: `${libelle} · ${r.commune_nom}`, href: cheminPraticien(BASE_URL[r.profession], r.departement_slug, r.commune_slug, r.slug) }
    }
    const lieu = r.commune_nom ? `${r.commune_nom}, adresse à confirmer` : 'Adresse non déclarée'
    return { titre, detail: `${libelle} · ${lieu}, revendiquer la fiche`, href: `${REVENDIQUER}/${encodeURIComponent(r.slug)}/` }
  })
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
