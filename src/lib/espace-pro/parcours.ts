import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import type { PraticienProche } from '@/lib/annuaire/queries'
import { PROFESSIONS_RPPS, type Profession } from '@/lib/annuaire/types'
import { nettoyerRpps, ressembleRpps } from './rpps'

/**
 * Lectures du parcours de revendication d'un soignant (S0 à M1).
 *
 * Jamais mises en cache : tout dépend du compte connecté, et l'état d'une
 * revendication change d'un écran à l'autre.
 */

export type LieuRevendication = {
  id: string
  adresseLigne: string | null
  codePostal: string | null
  communeNom: string | null
  principal: boolean
  lon: number | null
  lat: number | null
}

export type DemandeDuCompte = {
  id: string
  statut: 'en_attente' | 'acceptee' | 'refusee'
  methode: 'manuelle' | 'pro_sante_connect' | 'justificatif' | 'invitation'
  objet: 'revendication' | 'retrait'
  justificatifNom: string | null
  justificatifTaille: number | null
  motifRefus: string | null
  commentaireRefus: string | null
  lieuxGeres: string[]
  roleLabo: 'gerant' | 'mandate' | 'salarie' | null
  demandeLe: string
  traiteLe: string | null
}

export type FicheRevendication = {
  id: string
  slug: string
  profession: Profession
  rpps: string | null
  nom: string
  prenom: string | null
  raisonSociale: string | null
  specialite: string | null
  modeExercice: string | null
  retireLe: string | null
  /** Le résumé que la carte de résultat attend, au lieu principal. */
  resume: PraticienProche
  lieux: LieuRevendication[]
  /** Une revendication acceptée existe pour un autre compte que celui-ci. */
  gereeParUnAutre: boolean
  /** La demande de ce compte sur cette fiche, s'il en a une. */
  demande: DemandeDuCompte | null
}

const colonnesResume = sql`
  p.id, p.slug, p.profession, p.rpps, p.civilite, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
  p.specialite, p.mode_exercice, p.retire_le,
  l.id AS lieu_id, l.adresse_ligne, l.code_postal, (l.telephone_officiel IS NOT NULL) AS a_telephone, l.precision_position,
  EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee' AND v.objet = 'revendication') AS revendiquee,
  c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
  ST_X(l.position) AS lon, ST_Y(l.position) AS lat`

type LigneResume = {
  id: string
  slug: string
  profession: Profession
  rpps: string | null
  civilite: PraticienProche['civilite']
  nom: string
  prenom: string | null
  raison_sociale: string | null
  statut_verification: PraticienProche['statutVerification']
  specialite: string | null
  mode_exercice: string | null
  retire_le: string | null
  lieu_id: string | null
  adresse_ligne: string | null
  code_postal: string | null
  a_telephone: boolean
  precision_position: PraticienProche['precisionPosition']
  revendiquee: boolean
  commune_nom: string | null
  commune_slug: string | null
  departement_slug: string | null
  lon: number | null
  lat: number | null
}

function resumeDe(r: LigneResume): PraticienProche {
  return {
    slug: r.slug,
    lieuId: r.lieu_id ?? '',
    civilite: r.civilite,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    statutVerification: r.statut_verification,
    adresseLigne: r.adresse_ligne,
    codePostal: r.code_postal,
    aTelephone: r.a_telephone,
    revendiquee: r.revendiquee,
    communeNom: r.commune_nom,
    communeSlug: r.commune_slug,
    departementSlug: r.departement_slug,
    precisionPosition: r.precision_position,
    lon: r.lon,
    lat: r.lat,
    metres: 0,
  }
}

/** Une fiche et ses lieux, vue par un compte. `retirees` inclut les fiches retirées (R2, annulation). */
export async function getFicheRevendication(slug: string, userId: string, { retirees = false } = {}): Promise<FicheRevendication | null> {
  const { rows } = await db.execute<LigneResume>(sql`
    SELECT DISTINCT ON (p.id) ${colonnesResume}
    FROM praticiens p
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE p.slug = ${slug} AND ${retirees ? sql`(p.deleted_at IS NULL OR p.retire_le IS NOT NULL)` : sql`p.deleted_at IS NULL`}
    ORDER BY p.id, l.principal DESC
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null

  const [{ rows: lieux }, { rows: demandes }, { rows: autres }] = await Promise.all([
    db.execute<{ id: string; adresse_ligne: string | null; code_postal: string | null; commune_nom: string | null; principal: boolean; lon: number | null; lat: number | null }>(sql`
      SELECT l.id, l.adresse_ligne, l.code_postal, c.nom AS commune_nom, l.principal, ST_X(l.position) AS lon, ST_Y(l.position) AS lat
      FROM lieux_exercice l LEFT JOIN communes c ON c.code_insee = l.code_insee
      WHERE l.praticien_id = ${r.id}
      ORDER BY l.principal DESC, c.nom, l.adresse_ligne
    `),
    db.execute<{
      id: string
      statut: DemandeDuCompte['statut']
      methode: DemandeDuCompte['methode']
      objet: DemandeDuCompte['objet']
      justificatif_nom: string | null
      justificatif_taille: number | null
      motif_refus: string | null
      commentaire_refus: string | null
      lieux_geres: string[] | null
      role_labo: DemandeDuCompte['roleLabo']
      demande_le: string
      traite_le: string | null
    }>(sql`
      SELECT id, statut, methode, objet, justificatif_nom, justificatif_taille, motif_refus, commentaire_refus, lieux_geres, role_labo, demande_le, traite_le
      FROM revendications WHERE praticien_id = ${r.id} AND user_id = ${userId}::uuid LIMIT 1
    `),
    db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM revendications
      WHERE praticien_id = ${r.id} AND statut = 'acceptee' AND objet = 'revendication' AND user_id <> ${userId}::uuid
    `),
  ])
  const d = demandes[0]

  return {
    id: r.id,
    slug: r.slug,
    profession: r.profession,
    rpps: r.rpps,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    specialite: r.specialite,
    modeExercice: r.mode_exercice,
    retireLe: r.retire_le,
    resume: resumeDe(r),
    lieux: lieux.map((l) => ({
      id: l.id,
      adresseLigne: l.adresse_ligne,
      codePostal: l.code_postal,
      communeNom: l.commune_nom,
      principal: l.principal,
      lon: l.lon,
      lat: l.lat,
    })),
    gereeParUnAutre: (autres[0]?.n ?? 0) > 0,
    demande: d
      ? {
          id: d.id,
          statut: d.statut,
          methode: d.methode,
          objet: d.objet,
          justificatifNom: d.justificatif_nom,
          justificatifTaille: d.justificatif_taille,
          motifRefus: d.motif_refus,
          commentaireRefus: d.commentaire_refus,
          lieuxGeres: d.lieux_geres ?? [],
          roleLabo: d.role_labo,
          demandeLe: d.demande_le,
          traiteLe: d.traite_le,
        }
      : null,
  }
}

/** Le slug de la fiche qui porte ce RPPS, s'il y en a une. */
export async function slugParRpps(rpps: string): Promise<string | null> {
  const { rows } = await db.execute<{ slug: string }>(sql`
    SELECT slug FROM praticiens WHERE rpps = ${nettoyerRpps(rpps)} AND deleted_at IS NULL LIMIT 1
  `)
  return rows[0]?.slug ?? null
}

export type ResultatRecherche = PraticienProche & { profession: Profession; rpps: string | null }

/**
 * S1 : retrouver sa fiche par RPPS, ou par nom.
 *
 * Un numéro de onze chiffres est cherché tel quel, toutes professions du RPPS
 * confondues : il désigne une personne, la profession cochée n'a pas à le
 * contredire. Un nom l'est dans la profession choisie, en « prénom nom » ou
 * « nom prénom », accents et tirets ignorés, avec une tolérance aux fautes.
 * Vingt résultats au plus, par ordre alphabétique puis commune.
 */
export async function chercherFiches(profession: Profession, saisie: string): Promise<ResultatRecherche[]> {
  const texte = saisie.trim()
  if (texte.length < 2) return []
  const cherchable = (colonne: SQL) =>
    sql`lower(translate(${colonne}, 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇàâäéèêëîïôöùûüç''-', 'AAAEEEEIIOOUUUCaaaeeeeiioouuuc  '))`
  const q = texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['-]/g, ' ')
    .replace(/\s+/g, ' ')

  const filtre = ressembleRpps(texte)
    ? sql`p.rpps = ${nettoyerRpps(texte)} AND p.profession IN (${sql.join(
        PROFESSIONS_RPPS.map((x) => sql`${x}`),
        sql`, `,
      )})`
    : sql`p.profession = ${profession} AND (
        ${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} LIKE ${`%${q}%`}
        OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} LIKE ${`%${q}%`}
        OR similarity(${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)}, ${q}) > 0.5
      )`

  const { rows } = await db.execute<LigneResume>(sql`
    SELECT DISTINCT ON (p.id) ${colonnesResume}
    FROM praticiens p
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE p.deleted_at IS NULL AND ${filtre}
    ORDER BY p.id, l.principal DESC
    LIMIT 60
  `)
  return rows
    .map((r) => ({ ...resumeDe(r), profession: r.profession, rpps: r.rpps }))
    .sort(
      (a, b) =>
        `${a.nom} ${a.prenom ?? ''}`.localeCompare(`${b.nom} ${b.prenom ?? ''}`, 'fr') ||
        (a.communeNom ?? '').localeCompare(b.communeNom ?? '', 'fr'),
    )
    .slice(0, 20)
}

/**
 * L1 : retrouver un laboratoire. Un SIREN (9 chiffres) ou un SIRET (14, dont
 * les 9 premiers sont le SIREN) est cherché tel quel ; une raison sociale,
 * accents ignorés, avec une tolérance aux fautes, le plus pertinent d'abord.
 * Vingt résultats au plus.
 */
export async function chercherLabos(saisie: string): Promise<ResultatRecherche[]> {
  const texte = saisie.trim()
  if (texte.length < 2) return []
  const chiffres = texte.replace(/[\s.-]/g, '')
  const cherchable = (colonne: SQL) =>
    sql`lower(translate(${colonne}, 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇàâäéèêëîïôöùûüç''-', 'AAAEEEEIIOOUUUCaaaeeeeiioouuuc  '))`
  const q = texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['-]/g, ' ').replace(/\s+/g, ' ')
  const nom = cherchable(sql`coalesce(p.raison_sociale, p.nom)`)
  const filtre = /^\d{9}(\d{5})?$/.test(chiffres) ? sql`p.siren = ${chiffres.slice(0, 9)}` : sql`(${nom} LIKE ${`%${q}%`} OR similarity(${nom}, ${q}) > 0.45)`
  // La pertinence d'abord : le nom exact, puis ce qui commence par la saisie, puis ce qui la contient, puis le plus ressemblant.
  // Sans elle, « Laboratoire Dupont » se perdait parmi tous les « laboratoire dentaire ».
  const pertinence = sql`CASE WHEN ${nom} = ${q} THEN 0 WHEN ${nom} LIKE ${`${q}%`} THEN 1 WHEN ${nom} LIKE ${`%${q}%`} THEN 2 ELSE 3 END`
  const { rows } = await db.execute<LigneResume & { pertinence: number; ressemblance: number }>(sql`
    SELECT * FROM (
      SELECT DISTINCT ON (p.id) ${colonnesResume}, ${pertinence} AS pertinence, similarity(${nom}, ${q}) AS ressemblance
      FROM praticiens p
      LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
      LEFT JOIN communes c ON c.code_insee = l.code_insee
      LEFT JOIN departements d ON d.code = c.departement_code
      WHERE p.deleted_at IS NULL AND p.profession = 'prothesiste' AND ${filtre}
      ORDER BY p.id, l.principal DESC
    ) t
    ORDER BY t.pertinence, t.ressemblance DESC
    LIMIT 20
  `)
  return rows.map((r) => ({ ...resumeDe(r), profession: r.profession, rpps: r.rpps }))
}

/** Le SIREN d'une fiche de laboratoire. */
export async function sirenDe(praticienId: string): Promise<string | null> {
  const { rows } = await db.execute<{ siren: string | null }>(sql`SELECT siren FROM praticiens WHERE id = ${praticienId} LIMIT 1`)
  return rows[0]?.siren ?? null
}

/**
 * LK1 : un laboratoire intégré à un cabinet. Le gérant porte le même nom
 * qu'un chirurgien-dentiste de l'annuaire, au même code postal : on propose de
 * relier les deux fiches, qui restent distinctes. Rien sinon.
 */
export async function candidatLiaison(labo: FicheRevendication, nomCompte: string): Promise<ResultatRecherche | null> {
  const cp = labo.resume.codePostal
  const q = nomCompte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['-]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cp || q.length < 4) return null
  const cherchable = (colonne: SQL) =>
    sql`lower(translate(${colonne}, 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇàâäéèêëîïôöùûüç''-', 'AAAEEEEIIOOUUUCaaaeeeeiioouuuc  '))`
  const { rows } = await db.execute<LigneResume>(sql`
    SELECT DISTINCT ON (p.id) ${colonnesResume}
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id AND l.code_postal = ${cp}
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE p.deleted_at IS NULL AND p.profession = 'dentiste'
      AND (${cherchable(sql`coalesce(p.prenom, '') || ' ' || p.nom`)} = ${q} OR ${cherchable(sql`p.nom || ' ' || coalesce(p.prenom, '')`)} = ${q})
    ORDER BY p.id
    LIMIT 1
  `)
  return rows[0] ? { ...resumeDe(rows[0]), profession: rows[0].profession, rpps: rows[0].rpps } : null
}
