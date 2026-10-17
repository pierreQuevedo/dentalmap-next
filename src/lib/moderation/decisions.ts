import { revalidateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { envoyerAttestationDecidee, envoyerEtablissementAjoute, envoyerRevendicationAcceptee, envoyerRevendicationRefusee } from '@/lib/email'
import { appliquerRetrait } from '@/lib/espace-pro/revendication'
import { getSourceEtablissement } from '@/lib/espace-pro/etablissement-donnees'

/**
 * Les décisions de modération, sans contrôle d'accès : l'appelant s'en charge
 * (la page /espace-pro/moderation/ par la session d'un modérateur, les routes
 * /api/admin/ du back-office WordPress par la clé partagée).
 *
 * Chaque décision ne porte que sur une demande encore en attente : une
 * seconde décision sur la même demande ne fait rien et renvoie `false`.
 * Les courriels partent comme depuis la page de modération.
 */

export type Decision = 'acceptee' | 'refusee'

type Demande = {
  id: string
  objet: 'revendication' | 'retrait'
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

async function lireRevendication(id: string): Promise<Demande | null> {
  const { rows } = await db.execute<Demande>(sql`
    SELECT r.id, r.objet, r.praticien_id, r.user_id, r.statut, u.email, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale,
           c.slug AS commune_slug, d.slug AS departement_slug
    FROM revendications r
    JOIN "user" u ON u.id = r.user_id
    JOIN praticiens p ON p.id = r.praticien_id
    LEFT JOIN LATERAL (SELECT x.code_postal, x.code_insee FROM lieux_exercice x WHERE x.praticien_id = p.id ORDER BY x.principal DESC, x.id LIMIT 1) l ON true
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE r.id = ${id} LIMIT 1
  `)
  return rows[0] ?? null
}

/**
 * Revendication ou retrait d'une fiche. Accepter une revendication attribue
 * la fiche et la retire à l'éventuel compte qui la gérait (contestation) ;
 * accepter un retrait retire la fiche de l'annuaire.
 */
export async function deciderRevendication(id: string, decision: Decision, refus: { motif?: string | null; commentaire?: string | null } = {}): Promise<boolean> {
  const d = await lireRevendication(id)
  if (!d || d.statut !== 'en_attente') return false
  const fiche = nomAffiche({ profession: d.profession, nom: d.nom, prenom: d.prenom, raisonSociale: d.raison_sociale })

  if (decision === 'refusee') {
    const motif = refus.motif?.trim().slice(0, 200) || null
    const commentaire = refus.commentaire?.trim().slice(0, 1000) || null
    await db.execute(sql`UPDATE revendications SET statut = 'refusee', motif_refus = ${motif}, commentaire_refus = ${commentaire}, traite_le = now() WHERE id = ${d.id} AND statut = 'en_attente'`)
    await envoyerRevendicationRefusee(d.email, fiche, [motif, commentaire].filter(Boolean).join('. ') || null)
    return true
  }

  if (d.objet === 'retrait') {
    await appliquerRetrait({ praticienId: d.praticien_id, userId: d.user_id, methode: 'justificatif' })
  } else {
    await db.execute(sql`UPDATE revendications SET statut = 'acceptee', traite_le = now() WHERE id = ${d.id} AND statut = 'en_attente'`)
    await db.execute(sql`
      UPDATE revendications SET statut = 'refusee', motif_refus = 'Fiche transférée', traite_le = now()
      WHERE praticien_id = ${d.praticien_id} AND id <> ${d.id} AND statut = 'acceptee' AND objet = 'revendication'
    `)
    const cheminFiche = d.commune_slug && d.departement_slug ? cheminPraticien(BASE_URL[d.profession], d.departement_slug, d.commune_slug, d.slug) : '/'
    await envoyerRevendicationAcceptee(d.email, fiche, cheminFiche)
  }
  revalidateTag('annuaire', 'max')
  revalidateTag('praticien', 'max')
  return true
}

/**
 * Demande de création d'une fiche absente des registres. La fiche elle-même
 * est créée par la synchronisation ; `slug` la rattache quand elle existe.
 */
export async function deciderDemandeCreation(id: string, decision: Decision, slug?: string | null): Promise<boolean> {
  const { rows } = slug ? await db.execute<{ id: string }>(sql`SELECT id FROM praticiens WHERE slug = ${slug.trim()} LIMIT 1`) : { rows: [] as { id: string }[] }
  const r = await db.execute<{ id: string }>(sql`
    UPDATE demandes_creation_fiche SET statut = ${decision}, traite_le = now(), praticien_id = ${rows[0]?.id ?? null}
    WHERE id = ${id} AND statut = 'en_attente'
    RETURNING id
  `)
  return r.rows.length > 0
}

/** Demande de gestion d'une page d'établissement par attestation de fonction (OAT). */
export async function deciderAttestation(id: string, decision: Decision, motif?: string | null): Promise<boolean> {
  const m = motif?.trim().slice(0, 500) || null
  const { rows } = await db.execute<{ slug: string; titre: string; email: string }>(sql`
    UPDATE revendications_etablissement r SET statut = ${decision}, traite_le = now(), motif_refus = ${decision === 'refusee' ? m : null}
    FROM "user" u WHERE r.id = ${id} AND r.statut = 'en_attente' AND u.id = r.user_id
    RETURNING r.slug, r.titre, u.email
  `)
  const r = rows[0]
  if (!r) return false
  revalidateTag(`etablissement:${r.slug}`, 'max')
  const source = await getSourceEtablissement(r.slug)
  try {
    await envoyerAttestationDecidee(r.email, r.titre, decision === 'acceptee' ? { acceptee: true, lien: source?.lien ?? '/formation/' } : { acceptee: false, motif: m })
  } catch (e) {
    console.error('[etablissement] courriel de décision', e)
  }
  return true
}

/** Établissement absent de l'annuaire (OA1) : accepté une fois sa page créée dans WordPress. */
export async function deciderAjoutEtablissement(id: string, decision: Decision): Promise<boolean> {
  const { rows } = await db.execute<{ nom: string; email: string }>(sql`
    UPDATE demandes_ajout_etablissement d SET statut = ${decision}, traite_le = now()
    FROM "user" u WHERE d.id = ${id} AND d.statut = 'en_attente' AND u.id = d.user_id
    RETURNING d.nom, u.email
  `)
  if (!rows[0]) return false
  if (decision === 'acceptee') {
    try {
      await envoyerEtablissementAjoute(rows[0].email, rows[0].nom)
    } catch (e) {
      console.error('[etablissement] courriel de page créée', e)
    }
  }
  return true
}
