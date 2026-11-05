import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'

/**
 * La base des professionnels, pour la rubrique « Base pros » de wp-admin :
 * les comptes de l'espace pro, avec les fiches qu'ils ont revendiquées ou
 * demandées, et les contacts que l'équipe saisit à la main (`contacts_pro`).
 *
 * Sans contrôle d'accès : les routes /api/admin/ s'en chargent par la clé
 * partagée. Jamais en cache : la liste doit refléter la dernière saisie.
 *
 * Les deux sources sont lues entières puis filtrées en mémoire : quelques
 * centaines de lignes aujourd'hui. Au-delà de quelques milliers, passer le
 * filtre et la pagination en SQL.
 */

export type ProfessionContact = Profession | 'autre'
export const STATUTS_CONTACT = ['prospect', 'contacte', 'interesse', 'inscrit', 'pas_interesse'] as const
export type StatutContact = (typeof STATUTS_CONTACT)[number]

export type FicheLiee = {
  nom: string
  profession: Profession
  rpps: string | null
  siren: string | null
  commune: string | null
  url: string | null
  /** Pour un compte : revendication acceptée, ou en attente de l'équipe. */
  statut?: 'acceptee' | 'en_attente'
}

export type LigneBase = {
  type: 'compte' | 'contact'
  id: string
  nom: string
  structure: string | null
  email: string | null
  telephone: string | null
  profession: ProfessionContact | null
  ville: string | null
  fiches: FicheLiee[]
  /** Compte : revendiqué (une fiche acceptée), en attente, ou sans fiche. Contact : son statut de suivi. */
  etat: 'revendique' | 'en_attente' | 'sans_fiche' | StatutContact
  /** Le compte du même e-mail, pour un contact ; le contact du même e-mail, pour un compte. */
  lie: string | null
  creeLe: string
  derniereActivite: string | null
}

export type Vue = 'tous' | 'revendiques' | 'comptes' | 'contacts'

type FicheJson = {
  statut: 'acceptee' | 'en_attente'
  slug: string
  profession: Profession
  nom: string
  prenom: string | null
  raison_sociale: string | null
  rpps: string | null
  siren: string | null
  commune: string | null
  commune_slug: string | null
  departement_slug: string | null
}

function ficheDepuis(f: Omit<FicheJson, 'statut'> & { statut?: FicheJson['statut'] }): FicheLiee {
  return {
    nom: nomAffiche({ profession: f.profession, nom: f.nom, prenom: f.prenom, raisonSociale: f.raison_sociale }),
    profession: f.profession,
    rpps: f.rpps,
    siren: f.siren,
    commune: f.commune,
    url: f.departement_slug && f.commune_slug ? cheminPraticien(BASE_URL[f.profession], f.departement_slug, f.commune_slug, f.slug) : null,
    ...(f.statut ? { statut: f.statut } : {}),
  }
}

/** Les colonnes d'une fiche, en objet JSON, pour `json_agg` ou une ligne seule. */
const ficheJson = sql`json_build_object(
  'slug', p.slug, 'profession', p.profession, 'nom', p.nom, 'prenom', p.prenom, 'raison_sociale', p.raison_sociale,
  'rpps', p.rpps, 'siren', p.siren, 'commune', c.nom, 'commune_slug', c.slug, 'departement_slug', d.slug)`

const lieuDeLaFiche = sql`
  LEFT JOIN LATERAL (
    SELECT l.code_insee FROM lieux_exercice l WHERE l.praticien_id = p.id ORDER BY l.principal DESC, l.id LIMIT 1
  ) l ON true
  LEFT JOIN communes c ON c.code_insee = l.code_insee
  LEFT JOIN departements d ON d.code = c.departement_code`

async function lireComptes(): Promise<LigneBase[]> {
  const { rows } = await db.execute<{
    id: string
    name: string
    email: string
    telephone: string | null
    role: 'dentiste' | 'prothesiste' | null
    created_at: string
    derniere_activite_le: string | null
    contact_id: string | null
    fiches: FicheJson[]
  }>(sql`
    SELECT u.id, u.name, u.email, u.telephone, u.role, u.created_at, u.derniere_activite_le,
           (SELECT k.id FROM contacts_pro k WHERE lower(k.email) = lower(u.email) LIMIT 1) AS contact_id,
           coalesce(json_agg(${ficheJson}::jsonb || jsonb_build_object('statut', r.statut)) FILTER (WHERE r.id IS NOT NULL), '[]') AS fiches
    FROM "user" u
    LEFT JOIN revendications r ON r.user_id = u.id AND r.objet = 'revendication' AND r.statut IN ('acceptee', 'en_attente')
    LEFT JOIN praticiens p ON p.id = r.praticien_id AND p.deleted_at IS NULL
    ${lieuDeLaFiche}
    WHERE u.role IN ('dentiste', 'prothesiste') OR r.id IS NOT NULL
    GROUP BY u.id
  `)
  return rows.map((r) => {
    const fiches = r.fiches.filter((f) => f.slug).map(ficheDepuis)
    return {
      type: 'compte',
      id: r.id,
      nom: r.name,
      structure: null,
      email: r.email,
      telephone: r.telephone,
      profession: r.role ?? fiches[0]?.profession ?? null,
      ville: fiches[0]?.commune ?? null,
      fiches,
      etat: fiches.some((f) => f.statut === 'acceptee') ? 'revendique' : fiches.length ? 'en_attente' : 'sans_fiche',
      lie: r.contact_id,
      creeLe: r.created_at,
      derniereActivite: r.derniere_activite_le,
    }
  })
}

type LigneContact = {
  id: string
  profession: ProfessionContact
  prenom: string | null
  nom: string
  structure: string | null
  email: string | null
  telephone: string | null
  ville: string | null
  code_postal: string | null
  rpps: string | null
  siren: string | null
  statut: StatutContact
  source: string | null
  notes: string | null
  cree_par: string | null
  modifie_par: string | null
  cree_le: string
  modifie_le: string
  compte_id: string | null
  fiche: Omit<FicheJson, 'statut'> | null
}

async function lireContacts(id?: string): Promise<LigneContact[]> {
  const { rows } = await db.execute<LigneContact>(sql`
    SELECT k.id, k.profession, k.prenom, k.nom, k.structure, k.email, k.telephone, k.ville, k.code_postal, k.rpps, k.siren,
           k.statut, k.source, k.notes, k.cree_par, k.modifie_par, k.cree_le, k.modifie_le,
           (SELECT u.id FROM "user" u WHERE lower(u.email) = lower(k.email) LIMIT 1) AS compte_id,
           CASE WHEN p.id IS NULL THEN NULL ELSE ${ficheJson} END AS fiche
    FROM contacts_pro k
    LEFT JOIN praticiens p ON p.id = k.praticien_id AND p.deleted_at IS NULL
    ${lieuDeLaFiche}
    ${id ? sql`WHERE k.id = ${id}::uuid` : sql``}
    ORDER BY k.modifie_le DESC
  `)
  return rows
}

function ligneContact(k: LigneContact): LigneBase {
  return {
    type: 'contact',
    id: k.id,
    nom: [k.prenom, k.nom].filter(Boolean).join(' '),
    structure: k.structure,
    email: k.email,
    telephone: k.telephone,
    profession: k.profession,
    ville: k.ville,
    fiches: k.fiche ? [ficheDepuis(k.fiche)] : [],
    etat: k.statut,
    lie: k.compte_id,
    creeLe: k.cree_le,
    derniereActivite: k.modifie_le,
  }
}

/** Minuscules, sans accents ni ponctuation : la recherche ignore « É », « - » et « ' ». */
const normaliser = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9@.]+/g, ' ').trim()

const PAR_PAGE = 50

export async function listerBase(o: { q?: string; vue?: Vue; profession?: string; page?: number; tout?: boolean }) {
  const [comptes, contacts] = await Promise.all([lireComptes(), lireContacts()])
  const lignes = [...comptes, ...contacts.map(ligneContact)]
  const compteurs = {
    tous: lignes.length,
    revendiques: comptes.filter((c) => c.etat === 'revendique').length,
    comptes: comptes.length,
    contacts: contacts.length,
  }

  const mots = normaliser(o.q ?? '').split(' ').filter(Boolean)
  const filtrees = lignes
    .filter((l) => {
      if (o.vue === 'revendiques' && l.etat !== 'revendique') return false
      if (o.vue === 'comptes' && l.type !== 'compte') return false
      if (o.vue === 'contacts' && l.type !== 'contact') return false
      if (o.profession && l.profession !== o.profession && !l.fiches.some((f) => f.profession === o.profession)) return false
      if (!mots.length) return true
      const botte = normaliser(
        [l.nom, l.structure, l.email, l.telephone, l.ville, ...l.fiches.flatMap((f) => [f.nom, f.rpps, f.siren, f.commune])].filter(Boolean).join(' '),
      )
      return mots.every((m) => botte.includes(m))
    })
    // Les plus récemment créés ou modifiés d'abord.
    .sort((a, b) => (b.derniereActivite ?? b.creeLe).localeCompare(a.derniereActivite ?? a.creeLe))

  const page = Math.max(1, o.page ?? 1)
  return {
    lignes: o.tout ? filtrees : filtrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE),
    total: filtrees.length,
    pages: Math.max(1, Math.ceil(filtrees.length / PAR_PAGE)),
    page,
    compteurs,
  }
}

/** Un compte et ses fiches, en lecture seule : l'espace pro reste maître de ces données. */
export async function getCompte(id: string): Promise<LigneBase | null> {
  return (await lireComptes()).find((c) => c.id === id) ?? null
}

export type Contact = {
  id: string
  profession: ProfessionContact
  prenom: string | null
  nom: string
  structure: string | null
  email: string | null
  telephone: string | null
  ville: string | null
  codePostal: string | null
  rpps: string | null
  siren: string | null
  statut: StatutContact
  source: string | null
  notes: string | null
  creePar: string | null
  modifiePar: string | null
  creeLe: string
  modifieLe: string
  compteId: string | null
  fiche: FicheLiee | null
}

export async function getContact(id: string): Promise<Contact | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null
  const k = (await lireContacts(id))[0]
  if (!k) return null
  return {
    id: k.id,
    profession: k.profession,
    prenom: k.prenom,
    nom: k.nom,
    structure: k.structure,
    email: k.email,
    telephone: k.telephone,
    ville: k.ville,
    codePostal: k.code_postal,
    rpps: k.rpps,
    siren: k.siren,
    statut: k.statut,
    source: k.source,
    notes: k.notes,
    creePar: k.cree_par,
    modifiePar: k.modifie_par,
    creeLe: k.cree_le,
    modifieLe: k.modifie_le,
    compteId: k.compte_id,
    fiche: k.fiche ? ficheDepuis(k.fiche) : null,
  }
}

export type SaisieContact = {
  profession: ProfessionContact
  prenom?: string
  nom: string
  structure?: string
  email?: string
  telephone?: string
  ville?: string
  codePostal?: string
  rpps?: string
  siren?: string
  statut: StatutContact
  source?: string
  notes?: string
}

/**
 * La fiche de l'annuaire du contact : par RPPS, sinon par SIREN (le premier
 * établissement en ligne). `null` sans correspondance.
 */
async function ficheDuContact(s: SaisieContact): Promise<string | null> {
  const rpps = s.rpps?.replace(/\D/g, '')
  const siren = s.siren?.replace(/\D/g, '').slice(0, 9)
  if (!rpps && !siren) return null
  const { rows } = await db.execute<{ id: string }>(sql`
    SELECT id FROM praticiens
    WHERE deleted_at IS NULL AND ${rpps ? sql`rpps = ${rpps}` : sql`siren = ${siren}`}
    ORDER BY indexable DESC, id LIMIT 1
  `)
  return rows[0]?.id ?? null
}

/** Crée le contact, ou le met à jour avec `id`. Renvoie son identifiant, `null` si l'`id` est inconnu. */
export async function enregistrerContact(s: SaisieContact, par: string | undefined, id?: string): Promise<string | null> {
  const v = (t?: string) => (t?.trim() ? t.trim() : null)
  const praticienId = await ficheDuContact(s)
  const champs = {
    profession: s.profession,
    prenom: v(s.prenom),
    nom: s.nom.trim(),
    structure: v(s.structure),
    email: v(s.email)?.toLowerCase() ?? null,
    telephone: v(s.telephone),
    ville: v(s.ville),
    codePostal: v(s.codePostal),
    rpps: v(s.rpps)?.replace(/\D/g, '') ?? null,
    siren: v(s.siren)?.replace(/\D/g, '').slice(0, 9) ?? null,
    statut: s.statut,
    source: v(s.source),
    notes: v(s.notes),
  }
  if (id) {
    const { rows } = await db.execute<{ id: string }>(sql`
      UPDATE contacts_pro SET
        profession = ${champs.profession}, prenom = ${champs.prenom}, nom = ${champs.nom}, structure = ${champs.structure},
        email = ${champs.email}, telephone = ${champs.telephone}, ville = ${champs.ville}, code_postal = ${champs.codePostal},
        rpps = ${champs.rpps}, siren = ${champs.siren}, praticien_id = ${praticienId}, statut = ${champs.statut},
        source = ${champs.source}, notes = ${champs.notes}, modifie_par = ${par ?? null}, modifie_le = now()
      WHERE id = ${id}::uuid
      RETURNING id
    `)
    return rows[0]?.id ?? null
  }
  const { rows } = await db.execute<{ id: string }>(sql`
    INSERT INTO contacts_pro (profession, prenom, nom, structure, email, telephone, ville, code_postal, rpps, siren, praticien_id,
                              statut, source, notes, cree_par, modifie_par)
    VALUES (${champs.profession}, ${champs.prenom}, ${champs.nom}, ${champs.structure}, ${champs.email}, ${champs.telephone},
            ${champs.ville}, ${champs.codePostal}, ${champs.rpps}, ${champs.siren}, ${praticienId}, ${champs.statut},
            ${champs.source}, ${champs.notes}, ${par ?? null}, ${par ?? null})
    RETURNING id
  `)
  return rows[0].id
}

export async function supprimerContact(id: string): Promise<boolean> {
  const { rows } = await db.execute<{ id: string }>(sql`DELETE FROM contacts_pro WHERE id = ${id}::uuid RETURNING id`)
  return rows.length > 0
}
