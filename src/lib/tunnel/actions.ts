'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { chemin } from '@/lib/navigation'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'
import {
  envoyerAModerer,
  envoyerRevendicationAcceptee,
  envoyerRevendicationRefusee,
} from '@/lib/email'
import { enregistrerProfil, estModerateur, getCompte } from './compte'
import { estRole, prochaineEtape, retourSur, type Role } from './etapes'

/**
 * Actions du tunnel. Chaque action relit la session : l'interface cache ce
 * qui n'est pas permis, mais c'est ici que l'accès se décide.
 */
export type Resultat = { ok: true } | { ok: false; erreur: string }

/* ------------------------------------------------------------------ */
/* Étape 1 : l'email                                                    */
/* ------------------------------------------------------------------ */

/**
 * Le compte existe-t-il ? Décide entre « connexion » et « qui êtes-vous ? ».
 *
 * Ce choix de parcours révèle qu'une adresse est inscrite. C'est assumé pour
 * un annuaire dont les comptes ne sont pas secrets ; le code envoyé, lui, ne
 * part que vers l'adresse elle-même.
 */
export async function etatCompte(email: string): Promise<{ existe: boolean; role: Role | null }> {
  const adresse = email.trim().toLowerCase()
  if (!z.string().email().safeParse(adresse).success) return { existe: false, role: null }
  const { rows } = await db.execute<{ role: string | null }>(sql`SELECT role FROM "user" WHERE lower(email) = ${adresse} LIMIT 1`)
  const u = rows[0]
  return { existe: !!u, role: u && estRole(u.role) ? u.role : null }
}

/* ------------------------------------------------------------------ */
/* Étape 2b et 3 : qui êtes-vous ?                                      */
/* ------------------------------------------------------------------ */

const schemaProfil = z.object({
  role: z.enum(['patient', 'dentiste', 'prothesiste', 'medecin']),
  nom: z.string().trim().min(2, 'Indiquez votre nom').max(120),
  retour: z.string().optional(),
})

/** Enregistre le rôle et le nom, puis conduit à l'étape suivante. */
export async function choisirProfil(donnees: FormData): Promise<never> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(chemin('/connexion/?retour=%2Finscription%2Fprofil%2F'))
  const r = schemaProfil.safeParse({ role: donnees.get('role'), nom: donnees.get('nom'), retour: donnees.get('retour') ?? undefined })
  if (!r.success) redirect(chemin(`/inscription/profil/?erreur=${encodeURIComponent(r.error.issues[0]?.message ?? 'Formulaire incomplet')}`))

  await enregistrerProfil(r.data.role, r.data.nom)
  const compte = await getCompte()
  redirect(chemin(prochaineEtape(compte!.etat, retourSur(r.data.retour, r.data.role === 'patient' ? '/' : '/espace-pro/'))))
}

/* ------------------------------------------------------------------ */
/* Favoris                                                              */
/* ------------------------------------------------------------------ */

/** Ajoute ou retire une fiche des favoris, et revient sur la page d'origine. */
export async function basculerFavori(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('slug') ?? '')
  const retour = retourSur(String(donnees.get('retour') ?? ''), '/favoris/')
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  if (slug) {
    const { rows } = await db.execute<{ id: string }>(sql`SELECT id FROM praticiens WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1`)
    const praticien = rows[0]
    if (praticien) {
      const { rowCount } = await db.execute(sql`DELETE FROM favoris WHERE user_id = ${compte.id}::uuid AND praticien_id = ${praticien.id}`)
      if (!rowCount) {
        await db.execute(sql`INSERT INTO favoris (id, user_id, praticien_id) VALUES (${randomUUID()}, ${compte.id}::uuid, ${praticien.id}) ON CONFLICT DO NOTHING`)
      }
    }
  }
  redirect(chemin(retour))
}

/* ------------------------------------------------------------------ */
/* Étape 5 bis : ma fiche n'existe pas                                  */
/* ------------------------------------------------------------------ */

const schemaCreation = z.object({
  profession: z.enum(['dentiste', 'prothesiste', 'maxillo_facial', 'stomatologue', 'orl']),
  nom: z.string().trim().min(2).max(120),
  prenom: z.string().trim().max(120).optional(),
  raisonSociale: z.string().trim().max(200).optional(),
  rpps: z.string().trim().regex(/^\d{11}$/, 'Un numéro RPPS compte 11 chiffres').optional().or(z.literal('')),
  siret: z.string().trim().regex(/^\d{14}$/, 'Un SIRET compte 14 chiffres').optional().or(z.literal('')),
  adresse: z.string().trim().min(4).max(200),
  codePostal: z.string().trim().regex(/^\d{5}$/, 'Code postal à 5 chiffres'),
  ville: z.string().trim().min(2).max(120),
  telephone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional(),
})

/** Dépose une demande de création de fiche et prévient les modérateurs. */
export async function demanderCreationFiche(donnees: FormData): Promise<never> {
  const compte = await getCompte()
  if (!compte) redirect(chemin('/connexion/?retour=%2Fespace-pro%2Ffiche%2Fcreer%2F'))
  const brut = Object.fromEntries([...donnees.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']))
  const r = schemaCreation.safeParse({ ...brut, profession: brut.profession || (compte.role === 'medecin' ? '' : compte.role) })
  if (!r.success) redirect(chemin(`/espace-pro/fiche/creer/?erreur=${encodeURIComponent(r.error.issues[0]?.message ?? 'Formulaire incomplet')}`))
  const d = r.data
  await db.execute(sql`
    INSERT INTO demandes_creation_fiche (id, user_id, profession, nom, prenom, raison_sociale, rpps, siret, adresse, code_postal, ville, telephone, email, message)
    VALUES (${randomUUID()}, ${compte.id}::uuid, ${d.profession}, ${d.nom}, ${d.prenom || null}, ${d.raisonSociale || null}, ${d.rpps || null}, ${d.siret || null},
            ${d.adresse}, ${d.codePostal}, ${d.ville}, ${d.telephone || null}, ${d.email || null}, ${d.message || null})
  `)
  await envoyerAModerer(
    `création de fiche, ${d.profession}, ${d.nom}`,
    `Compte : ${compte.email}\nProfession : ${d.profession}\nNom : ${d.prenom ?? ''} ${d.nom}\nRaison sociale : ${d.raisonSociale ?? ''}\nRPPS : ${d.rpps ?? ''}\nSIRET : ${d.siret ?? ''}\nAdresse : ${d.adresse}, ${d.codePostal} ${d.ville}\nTéléphone : ${d.telephone ?? ''}\nEmail pro : ${d.email ?? ''}\n\n${d.message ?? ''}`,
  )
  await auth.api.updateUser({ headers: await headers(), body: { etapeTunnel: 'attente' } })
  redirect(chemin('/espace-pro/attente/'))
}

/* ------------------------------------------------------------------ */
/* Modération                                                           */
/* ------------------------------------------------------------------ */

async function moderateurOuRien(): Promise<Resultat & { ok: true } | { ok: false; erreur: string }> {
  const compte = await getCompte()
  if (!compte || !estModerateur(compte.email)) return { ok: false, erreur: 'Réservé aux modérateurs.' }
  return { ok: true }
}

type Demande = {
  id: string
  praticien_id: string
  user_id: string
  statut: string
  email: string
  slug: string
  profession: Profession
  nom: string
  prenom: string | null
  raison_sociale: string | null
  commune_slug: string | null
  departement_slug: string | null
}

async function lireDemande(id: string): Promise<Demande | null> {
  const { rows } = await db.execute<Demande>(sql`
    SELECT r.id, r.praticien_id, r.user_id, r.statut, u.email, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale,
           c.slug AS commune_slug, d.slug AS departement_slug
    FROM revendications r
    JOIN "user" u ON u.id = r.user_id
    JOIN praticiens p ON p.id = r.praticien_id
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id AND l.principal
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE r.id = ${id} LIMIT 1
  `)
  return rows[0] ?? null
}

function cheminDe(d: Demande): string {
  return d.commune_slug && d.departement_slug ? cheminPraticien(BASE_URL[d.profession], d.departement_slug, d.commune_slug, d.slug) : '/'
}

/** Accepte une revendication manuelle : la fiche est attribuée, le praticien prévenu, les pages rafraîchies. */
export async function accepterRevendication(donnees: FormData): Promise<never> {
  const garde = await moderateurOuRien()
  if (!garde.ok) redirect(chemin('/espace-pro/'))
  const d = await lireDemande(String(donnees.get('id') ?? ''))
  if (d && d.statut === 'en_attente') {
    await db.execute(sql`UPDATE revendications SET statut = 'acceptee', traite_le = now() WHERE id = ${d.id}`)
    revalidateTag('annuaire', 'max')
    revalidateTag('praticien', 'max')
    await envoyerRevendicationAcceptee(d.email, nomAffiche({ profession: d.profession, nom: d.nom, prenom: d.prenom, raisonSociale: d.raison_sociale }), cheminDe(d))
  }
  redirect(chemin('/espace-pro/moderation/'))
}

/** Refuse une revendication, avec un motif transmis au demandeur. */
export async function refuserRevendication(donnees: FormData): Promise<never> {
  const garde = await moderateurOuRien()
  if (!garde.ok) redirect(chemin('/espace-pro/'))
  const d = await lireDemande(String(donnees.get('id') ?? ''))
  const motif = String(donnees.get('motif') ?? '').trim().slice(0, 1000) || null
  if (d && d.statut === 'en_attente') {
    await db.execute(sql`UPDATE revendications SET statut = 'refusee', traite_le = now() WHERE id = ${d.id}`)
    await envoyerRevendicationRefusee(d.email, nomAffiche({ profession: d.profession, nom: d.nom, prenom: d.prenom, raisonSociale: d.raison_sociale }), motif)
  }
  redirect(chemin('/espace-pro/moderation/'))
}

/** Clôt une demande de création de fiche ; la fiche elle-même est créée par la synchronisation, pas ici. */
export async function traiterDemandeCreation(donnees: FormData): Promise<never> {
  const garde = await moderateurOuRien()
  if (!garde.ok) redirect(chemin('/espace-pro/'))
  const id = String(donnees.get('id') ?? '')
  const decision = String(donnees.get('decision') ?? '') === 'acceptee' ? 'acceptee' : 'refusee'
  const slug = String(donnees.get('slug') ?? '').trim()
  if (id) {
    const { rows } = slug ? await db.execute<{ id: string }>(sql`SELECT id FROM praticiens WHERE slug = ${slug} LIMIT 1`) : { rows: [] as { id: string }[] }
    await db.execute(sql`
      UPDATE demandes_creation_fiche SET statut = ${decision}, traite_le = now(), praticien_id = ${rows[0]?.id ?? null}
      WHERE id = ${id} AND statut = 'en_attente'
    `)
  }
  redirect(chemin('/espace-pro/moderation/'))
}
