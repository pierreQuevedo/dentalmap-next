/**
 * Accès aux offres d'emploi.
 *
 * Toutes les fonctions sont en `use cache`, profil `listing`, tag `emploi`,
 * plus un tag précis quand il existe : `emploi:offre:{slug}` pour une offre,
 * `emploi:commune:{code}` pour une commune. Les offres d'une fiche de
 * l'annuaire (pastille « Recrute ») sont lues par `src/lib/annuaire/recrutement.ts`. L'espace pro invalide `emploi` et `emploi:offre:{slug}` à
 * chaque publication, confirmation, clôture ou retrait.
 *
 * Une offre est visible quand elle est `en_ligne`, pas encore expirée, et que
 * la fiche du recruteur existe toujours. Ordre des listes locales : distance
 * au point d'origine de la page, puis ordre alphabétique du titre. Jamais de
 * score. Les listes nationales, sans origine, vont des plus récentes aux plus
 * anciennes.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, type Profession } from '@/lib/annuaire/types'
import { resumeDepuisLigne, type LigneOffre } from './ligne'
import type { CodeContrat, CodeMetier } from './metiers'
import type { OffreDetail, OffreResume } from './types'
import { offreEnLigne } from './en-ligne'

/** Taille d'une page de liste départementale ou nationale. */
export const PAR_PAGE_EMPLOI = 20

const VISIBLE = sql`${offreEnLigne()} AND p.deleted_at IS NULL`

/** Les colonnes d'une offre résumée ; `metres` est la distance à `origine`, ou nulle. */
function colonnes(origine: SQL | null): SQL {
  const metres = origine ? sql`ST_Distance(o.position::geography, ${origine}::geography)::int` : sql`NULL::int`
  return sql`
    o.id, o.slug, o.titre, o.metier, o.contrat, o.temps_plein, o.heures_hebdo, o.debut, o.fin,
    o.mode_remuneration, o.remuneration_min, o.remuneration_max, o.publiee_le,
    p.profession, p.nom, p.prenom, p.raison_sociale,
    l.adresse_ligne, l.code_postal, l.finess,
    c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
    ST_X(o.position) AS lon, ST_Y(o.position) AS lat,
    ${metres} AS metres,
    (SELECT f.photo_url FROM fiches_completees f
      WHERE f.praticien_id = p.id
        AND EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee' AND v.objet = 'revendication')
    ) AS photo_url`
}

const JOINTURES = sql`
  FROM offres o
  JOIN praticiens p ON p.id = o.praticien_id
  JOIN communes c ON c.code_insee = o.commune_code
  JOIN departements d ON d.code = o.departement_code
  LEFT JOIN lieux_exercice l ON l.id = o.lieu_id`

function filtreMetier(metier: CodeMetier | null): SQL {
  return metier ? sql`AND o.metier = ${metier}` : sql``
}

function filtreContrats(contrats: CodeContrat[] | null): SQL {
  return contrats?.length ? sql`AND o.contrat IN (${sql.join(contrats.map((c) => sql`${c}`), sql`, `)})` : sql``
}

const centreCommune = (code: string) => sql`(SELECT centre FROM communes WHERE code_insee = ${code})`

/* ------------------------------------------------------------------ */
/* Offre                                                               */
/* ------------------------------------------------------------------ */

/**
 * Une offre par son slug, quel que soit son statut : la page répond 404 si
 * `visible` est faux. `null` si le slug n'a jamais existé.
 */
export async function getOffre(slug: string): Promise<OffreDetail | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi', `emploi:offre:${slug}`)
  const { rows } = await db.execute<
    LigneOffre & {
      statut: OffreDetail['statut']
      visible: boolean
      description: string
      profil: string | null
      avantages: string[] | null
      confirmee_le: string | null
      expire_le: string | null
      departement_nom: string
      departement_code: string
      region_nom: string
      commune_code: string
      praticien_slug: string
      fiche_commune_slug: string | null
      fiche_departement_slug: string | null
      presentation: string | null
      presentation_confirmee_le: string | null
    }
  >(sql`
    SELECT ${colonnes(sql`c.centre`)},
           o.statut, (${VISIBLE}) AS visible, o.description, o.profil, o.avantages, o.confirmee_le, o.expire_le,
           d.nom AS departement_nom, d.code AS departement_code, r.nom AS region_nom, c.code_insee AS commune_code,
           p.slug AS praticien_slug,
           fc.slug AS fiche_commune_slug, fd.slug AS fiche_departement_slug,
           -- « Le cabinet » : la présentation commune aux offres (« Créer un poste »), sinon celle de la fiche.
           coalesce(nullif(rc.presentation, ''), (SELECT f.presentation FROM fiches_completees f WHERE f.praticien_id = p.id
              AND EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee' AND v.objet = 'revendication'))) AS presentation,
           CASE WHEN nullif(rc.presentation, '') IS NOT NULL THEN rc.maj_le
                ELSE (SELECT f.presentation_confirmee_le FROM fiches_completees f WHERE f.praticien_id = p.id) END AS presentation_confirmee_le
    ${JOINTURES}
    JOIN regions r ON r.code = d.region_code
    LEFT JOIN recrutement_cabinets rc ON rc.praticien_id = p.id
    -- La fiche publique du recruteur : la commune du lieu de l'offre, sinon celle de son lieu principal.
    LEFT JOIN LATERAL (
      SELECT x.code_insee FROM lieux_exercice x
      WHERE x.praticien_id = p.id AND x.code_insee IS NOT NULL
      ORDER BY (x.id = o.lieu_id) DESC, x.principal DESC, x.id LIMIT 1
    ) lf ON true
    LEFT JOIN communes fc ON fc.code_insee = lf.code_insee
    LEFT JOIN departements fd ON fd.code = fc.departement_code
    WHERE o.slug = ${slug}
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null
  const date = (v: string | Date | null) => (v == null ? null : v instanceof Date ? v.toISOString() : v)
  const resume = resumeDepuisLigne(r)
  return {
    ...resume,
    metres: null,
    metresCentre: r.metres,
    statut: r.statut,
    visible: r.visible,
    description: r.description,
    profil: r.profil,
    avantages: r.avantages ?? [],
    confirmeeLe: date(r.confirmee_le),
    expireLe: date(r.expire_le),
    departementNom: r.departement_nom,
    departementCode: r.departement_code,
    regionNom: r.region_nom,
    communeCode: r.commune_code,
    praticien: {
      slug: r.praticien_slug,
      profession: r.profession,
      chemin:
        r.fiche_commune_slug && r.fiche_departement_slug
          ? cheminPraticien(BASE_URL[r.profession as Profession], r.fiche_departement_slug, r.fiche_commune_slug, r.praticien_slug)
          : null,
      presentation: r.presentation,
      presentationConfirmeeLe: date(r.presentation_confirmee_le),
    },
  }
}

/**
 * Les offres visibles les plus proches d'une offre, même métier, elle exclue.
 * Pour un chirurgien-dentiste, même famille de contrat : un remplacement
 * appelle des remplacements et des collaborations, un poste salarié d'autres
 * postes salariés.
 */
export async function getOffresProches(slug: string, limite = 3): Promise<OffreResume[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi', `emploi:offre:${slug}`)
  const { rows } = await db.execute<LigneOffre>(sql`
    WITH ref AS (SELECT id, metier, contrat, position FROM offres WHERE slug = ${slug})
    SELECT ${colonnes(sql`(SELECT position FROM ref)`)}
    ${JOINTURES}
    WHERE ${VISIBLE}
      AND o.id <> (SELECT id FROM ref)
      AND o.metier = (SELECT metier FROM ref)
      AND ((o.contrat IN ('remplacement', 'collaboration')) = ((SELECT contrat FROM ref) IN ('remplacement', 'collaboration')))
      AND o.position IS NOT NULL AND (SELECT position FROM ref) IS NOT NULL
    ORDER BY metres, o.titre, o.id
    LIMIT ${limite}
  `)
  return rows.map(resumeDepuisLigne)
}

/* ------------------------------------------------------------------ */
/* Listes nationales                                                    */
/* ------------------------------------------------------------------ */

/** Les dernières offres publiées, partout en France. */
export async function getOffresRecentes(options: { metier?: CodeMetier; contrats?: CodeContrat[]; limite?: number } = {}): Promise<OffreResume[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  const { rows } = await db.execute<LigneOffre>(sql`
    SELECT ${colonnes(null)}
    ${JOINTURES}
    WHERE ${VISIBLE} ${filtreMetier(options.metier ?? null)} ${filtreContrats(options.contrats ?? null)}
    ORDER BY o.publiee_le DESC NULLS LAST, o.titre, o.id
    LIMIT ${options.limite ?? 8}
  `)
  return rows.map(resumeDepuisLigne)
}

export type ComptesEmploi = {
  total: number
  /** Structures distinctes ayant au moins une offre en ligne. */
  recruteurs: number
  parMetier: Partial<Record<CodeMetier, number>>
  parContrat: Partial<Record<CodeContrat, number>>
  /** Métier et contrat croisés, pour les liens « Autres offres ». */
  croises: { metier: CodeMetier; contrat: CodeContrat; total: number }[]
}

/**
 * Les compteurs d'offres visibles, en France ou sur un territoire. Tous
 * calculés, jamais saisis : à zéro offre, ils valent zéro et les pages
 * n'affichent pas de bloc de chiffres.
 */
export async function getComptes(territoire: { departementCode?: string; communeCode?: string } = {}): Promise<ComptesEmploi> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  const filtre = territoire.communeCode
    ? sql`AND (c.code_insee = ${territoire.communeCode} OR c.commune_parente_code = ${territoire.communeCode})`
    : territoire.departementCode
      ? sql`AND o.departement_code = ${territoire.departementCode}`
      : sql``
  const { rows } = await db.execute<{ metier: CodeMetier; contrat: CodeContrat; total: number; recruteurs: number }>(sql`
    SELECT o.metier, o.contrat, count(*)::int AS total, count(DISTINCT o.praticien_id)::int AS recruteurs
    FROM offres o JOIN praticiens p ON p.id = o.praticien_id JOIN communes c ON c.code_insee = o.commune_code
    WHERE ${VISIBLE} ${filtre}
    GROUP BY GROUPING SETS ((o.metier, o.contrat), ())
  `)
  const comptes: ComptesEmploi = { total: 0, recruteurs: 0, parMetier: {}, parContrat: {}, croises: [] }
  for (const r of rows) {
    if (r.metier == null) {
      comptes.total = r.total
      comptes.recruteurs = r.recruteurs
      continue
    }
    comptes.croises.push({ metier: r.metier, contrat: r.contrat, total: r.total })
    comptes.parMetier[r.metier] = (comptes.parMetier[r.metier] ?? 0) + r.total
    comptes.parContrat[r.contrat] = (comptes.parContrat[r.contrat] ?? 0) + r.total
  }
  return comptes
}

/** Les départements qui ont le plus d'offres d'un métier ou de certains contrats. Vide sans offre. */
export async function getDepartementsQuiRecrutent(
  filtre: { metier?: CodeMetier; contrats?: CodeContrat[] },
  limite = 8,
): Promise<{ nom: string; slug: string; total: number }[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  const { rows } = await db.execute<{ nom: string; slug: string; total: number }>(sql`
    SELECT d.nom, d.slug, count(*)::int AS total
    FROM offres o JOIN praticiens p ON p.id = o.praticien_id JOIN departements d ON d.code = o.departement_code
    WHERE ${VISIBLE} ${filtreMetier(filtre.metier ?? null)} ${filtreContrats(filtre.contrats ?? null)}
    GROUP BY d.code, d.nom, d.slug
    ORDER BY total DESC, d.nom
    LIMIT ${limite}
  `)
  return rows
}

/* ------------------------------------------------------------------ */
/* Département                                                          */
/* ------------------------------------------------------------------ */

/**
 * Point d'origine d'un département : le centre de sa commune la plus peuplée.
 * La table des départements ne porte pas de chef-lieu ; c'est lui dans la
 * plupart des cas.
 */
export async function getOrigineDepartement(codeDepartement: string): Promise<{ nom: string; codeInsee: string } | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  const { rows } = await db.execute<{ nom: string; code_insee: string }>(sql`
    SELECT nom, code_insee FROM communes
    WHERE departement_code = ${codeDepartement} AND type = 'commune' AND centre IS NOT NULL
    ORDER BY population DESC NULLS LAST, nom LIMIT 1
  `)
  return rows[0] ? { nom: rows[0].nom, codeInsee: rows[0].code_insee } : null
}

/**
 * Les offres d'un département, par distance à son origine puis par titre.
 * `metier` ou `contrats` restreignent la liste ; l'un des deux au moins est
 * attendu.
 */
export async function getOffresDepartement(
  codeDepartement: string,
  filtre: { metier?: CodeMetier; contrats?: CodeContrat[] },
  page = 1,
): Promise<{ offres: OffreResume[]; total: number }> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  const origine = sql`(SELECT centre FROM communes WHERE departement_code = ${codeDepartement} AND type = 'commune' AND centre IS NOT NULL
                        ORDER BY population DESC NULLS LAST, nom LIMIT 1)`
  const { rows } = await db.execute<LigneOffre & { total: number }>(sql`
    SELECT ${colonnes(origine)}, count(*) OVER ()::int AS total
    ${JOINTURES}
    WHERE ${VISIBLE} AND o.departement_code = ${codeDepartement}
      ${filtreMetier(filtre.metier ?? null)} ${filtreContrats(filtre.contrats ?? null)}
    ORDER BY metres NULLS LAST, o.titre, o.id
    LIMIT ${PAR_PAGE_EMPLOI} OFFSET ${(page - 1) * PAR_PAGE_EMPLOI}
  `)
  return { offres: rows.map(resumeDepuisLigne), total: rows[0]?.total ?? 0 }
}

/** Les communes d'un département avec des offres d'un métier, les plus fournies d'abord. */
export async function getCommunesAvecOffres(metier: CodeMetier, codeDepartement: string): Promise<{ nom: string; slug: string; total: number }[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  // Un arrondissement compte pour sa commune mère : la page commune les agrège.
  const { rows } = await db.execute<{ nom: string; slug: string; total: number }>(sql`
    SELECT m.nom, m.slug, count(*)::int AS total
    FROM offres o
    JOIN praticiens p ON p.id = o.praticien_id
    JOIN communes c ON c.code_insee = o.commune_code
    JOIN communes m ON m.code_insee = coalesce(c.commune_parente_code, c.code_insee)
    WHERE ${VISIBLE} AND o.metier = ${metier} AND o.departement_code = ${codeDepartement}
    GROUP BY m.code_insee, m.nom, m.slug
    ORDER BY total DESC, m.nom
  `)
  return rows
}

/* ------------------------------------------------------------------ */
/* Commune                                                              */
/* ------------------------------------------------------------------ */

/**
 * Les offres d'un métier dans une commune, arrondissements compris, par
 * distance au centre de la commune puis par titre. Toutes à la fois : une
 * commune en compte quelques dizaines au plus, et les filtres de la page
 * s'appliquent sur cette liste.
 */
export async function getOffresCommune(metier: CodeMetier, codeInsee: string): Promise<OffreResume[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi', `emploi:commune:${codeInsee}`)
  const { rows } = await db.execute<LigneOffre>(sql`
    SELECT ${colonnes(centreCommune(codeInsee))}
    ${JOINTURES}
    WHERE ${VISIBLE} AND o.metier = ${metier}
      AND (c.code_insee = ${codeInsee} OR c.commune_parente_code = ${codeInsee})
    ORDER BY metres NULLS LAST, o.titre, o.id
  `)
  return rows.map(resumeDepuisLigne)
}

/**
 * Les offres d'un métier autour d'une commune, hors de la commune, dans un
 * rayon donné : les offres voisines d'une commune vide, et le compte de
 * « élargir à 10 km ».
 */
export async function getOffresAutour(
  metier: CodeMetier,
  codeInsee: string,
  rayonMetres: number,
  limite = 10,
): Promise<{ offres: OffreResume[]; total: number }> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi', `emploi:commune:${codeInsee}`)
  const { rows } = await db.execute<LigneOffre & { total: number }>(sql`
    SELECT ${colonnes(centreCommune(codeInsee))}, count(*) OVER ()::int AS total
    ${JOINTURES}
    WHERE ${VISIBLE} AND o.metier = ${metier}
      AND c.code_insee <> ${codeInsee} AND coalesce(c.commune_parente_code, '') <> ${codeInsee}
      AND ST_DWithin(o.position::geography, ${centreCommune(codeInsee)}::geography, ${rayonMetres})
    ORDER BY metres, o.titre, o.id
    LIMIT ${limite}
  `)
  return { offres: rows.map(resumeDepuisLigne), total: rows[0]?.total ?? 0 }
}

/** Les communes voisines qui ont des offres d'un métier, les plus proches d'abord, à 50 km au plus. */
export async function getCommunesVoisinesAvecOffres(
  metier: CodeMetier,
  codeInsee: string,
  limite = 6,
): Promise<{ nom: string; slug: string; departementSlug: string; km: number; total: number }[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi', `emploi:commune:${codeInsee}`)
  const { rows } = await db.execute<{ nom: string; slug: string; departement_slug: string; km: number; total: number }>(sql`
    WITH origine AS (SELECT centre FROM communes WHERE code_insee = ${codeInsee})
    SELECT m.nom, m.slug, dm.slug AS departement_slug, count(*)::int AS total,
           round((ST_Distance(m.centre::geography, (SELECT centre FROM origine)::geography) / 1000)::numeric, 1)::float8 AS km
    FROM offres o
    JOIN praticiens p ON p.id = o.praticien_id
    JOIN communes c ON c.code_insee = o.commune_code
    JOIN communes m ON m.code_insee = coalesce(c.commune_parente_code, c.code_insee)
    JOIN departements dm ON dm.code = m.departement_code
    WHERE ${VISIBLE} AND o.metier = ${metier} AND m.code_insee <> ${codeInsee} AND m.centre IS NOT NULL
      AND ST_DWithin(m.centre::geography, (SELECT centre FROM origine)::geography, 50000)
    GROUP BY m.code_insee, m.nom, m.slug, dm.slug, m.centre
    ORDER BY km, m.nom
    LIMIT ${limite}
  `)
  return rows.map((r) => ({ nom: r.nom, slug: r.slug, departementSlug: r.departement_slug, km: r.km, total: r.total }))
}

/**
 * La recherche de poste de l'espace pro : les offres visibles dans un rayon
 * autour d'un point (le lieu du cabinet, ou une commune choisie), un métier
 * ou tous, par distance puis par titre. Les filtres de contrat, de temps et de
 * rémunération s'appliquent ensuite sur la liste, comme sur une page commune.
 */
export async function getOffresRayon(options: {
  metier: CodeMetier | null
  lon: number
  lat: number
  rayonMetres: number
  limite?: number
  /** « Offres pour vous » : les contrats du profil, et les structures masquées par la personne. */
  contrats?: CodeContrat[]
  exclure?: string[]
}): Promise<OffreResume[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('emploi')
  const origine = sql`ST_SetSRID(ST_MakePoint(${options.lon}, ${options.lat}), 4326)`
  const { rows } = await db.execute<LigneOffre>(sql`
    SELECT ${colonnes(origine)}
    ${JOINTURES}
    WHERE ${VISIBLE} ${filtreMetier(options.metier)} ${filtreContrats(options.contrats ?? null)}
      ${options.exclure?.length ? sql`AND p.slug NOT IN (${sql.join(options.exclure.map((x) => sql`${x}`), sql`, `)})` : sql``}
      AND ST_DWithin(o.position::geography, ${origine}::geography, ${options.rayonMetres})
    ORDER BY metres, o.titre, o.id
    LIMIT ${options.limite ?? 100}
  `)
  return rows.map(resumeDepuisLigne)
}
