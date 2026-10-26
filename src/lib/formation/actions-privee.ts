'use server'

import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { revalidateTag, updateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerAModerer, envoyerConfirmationAlerteFormation, envoyerFormationDecidee, envoyerFormationRecue } from '@/lib/email'
import { consulterSiren } from '@/lib/espace-pro/sirene'
import { estModerateur, exigerConnexion } from '@/lib/tunnel/compte'
import { creerFormationPrivee } from '@/lib/wp/ecriture'
import { THEMES_FORMATION } from './themes'
import { PRISES_EN_CHARGE, PUBLICS_FORMATION, Proposition, REGIONS_FORMATION, SOURCES_VERIFICATION, type Verifications } from './privee'
import { PROPOSER } from './privee-donnees'
import { alerteDesinscription, condensat, envoyerAlertesFormation, nouveauJeton } from './alertes'

/**
 * Les actions des formations privées : proposer (A), décider (B), s'inscrire
 * à l'alerte (C). Rien n'est publié sans la décision de l'équipe.
 */

export type EtatProposition = { erreur: string } | null

/** A : la proposition, envoyée en JSON par le formulaire ; l'erreur revient au formulaire, qui garde la saisie. */
export async function proposerFormation(_e: EtatProposition, donnees: FormData): Promise<EtatProposition> {
  const compte = await exigerConnexion(`${PROPOSER}/`)
  if (compte.role === 'patient' || compte.role === 'candidat') return { erreur: 'La proposition de formation est réservée aux professionnels.' }
  let brut: unknown
  try {
    brut = JSON.parse(String(donnees.get('proposition') ?? '{}'))
  } catch {
    return { erreur: 'Le formulaire est illisible. Rechargez la page.' }
  }
  const r = Proposition.safeParse(brut)
  if (!r.success) return { erreur: r.error.issues[0]?.message ?? 'Un champ est incomplet.' }
  const p = r.data
  if (p.siren) {
    const e = await consulterSiren(p.siren)
    if (e === 'introuvable') return { erreur: 'Ce SIREN est introuvable au répertoire Sirene. Vérifiez-le, ou laissez le champ vide.' }
    if (e && !e.actif) return { erreur: 'Ce SIREN correspond à une entreprise fermée au répertoire Sirene.' }
  }
  await db.execute(sql`
    INSERT INTO demandes_formation (id, user_id, donnees) VALUES (${randomUUID()}, ${compte.id}::uuid, ${JSON.stringify(p)}::jsonb)
  `)
  try {
    await Promise.all([
      envoyerFormationRecue(compte.email, p.intitule),
      envoyerAModerer(`formation proposée : ${p.intitule}`, `${compte.nom} (${compte.email}) propose « ${p.intitule} », par ${p.organisme}${p.siren ? ` (SIREN ${p.siren})` : ''}. Thème ${p.theme}, ${p.sessions.length} session${p.sessions.length > 1 ? 's' : ''}.`),
    ])
  } catch (e) {
    console.error('[formation-privee] courriel de proposition', e)
  }
  redirect(chemin(`${PROPOSER}/?envoye=1`))
}

/* ------------------------------------------------------------------ */
/* B : décisions de l'équipe                                            */
/* ------------------------------------------------------------------ */

async function exigerModeration() {
  const compte = await exigerConnexion('/espace-pro/moderation/')
  if (!estModerateur(compte.email)) redirect(chemin('/espace-pro/'))
  return compte
}

type Ligne = { id: string; donnees: unknown; statut: string; email: string; wp_slug: string | null }
async function lireDemande(id: string): Promise<(Ligne & { d: Proposition }) | null> {
  const { rows } = await db.execute<Ligne>(sql`
    SELECT d.id, d.donnees, d.statut, u.email, d.wp_slug FROM demandes_formation d JOIN "user" u ON u.id = d.user_id WHERE d.id = ${id}
  `)
  const r = rows[0]
  const d = r ? Proposition.safeParse(r.donnees) : null
  return r && d?.success ? { ...r, d: d.data } : null
}

/** Mise en ligne : la page publique est rafraîchie et les alertes partent après la réponse. */
async function mettreEnLigne(id: string, slug: string, email: string, intitule: string) {
  await db.execute(sql`UPDATE demandes_formation SET statut = 'publiee', wp_slug = ${slug}, publiee_le = now(), traite_le = COALESCE(traite_le, now()) WHERE id = ${id}`)
  updateTag(`formation-privee:${slug}`)
  revalidateTag('wp:formation', 'max')
  try {
    await envoyerFormationDecidee(email, intitule, { statut: 'publiee', lien: `/formation/formations-privees/${slug}/` })
  } catch (e) {
    console.error('[formation-privee] courriel de mise en ligne', e)
  }
  after(async () => {
    const r = await envoyerAlertesFormation()
    if (r.envoyes || r.echecs) console.log('[alertes-formation]', r)
  })
}

export async function accepterFormation(donnees: FormData): Promise<never> {
  await exigerModeration()
  const demande = await lireDemande(String(donnees.get('id') ?? ''))
  if (!demande || demande.statut !== 'en_attente') redirect(chemin('/espace-pro/moderation/'))
  const ville = demande.d.sessions.find((s) => s.ville)?.ville ?? null
  const wp = await creerFormationPrivee({ intitule: demande.d.intitule, ville, duree: demande.d.duree, siteWeb: demande.d.siteOrganisme, resume: demande.d.resume })
  if (wp.etat === 'ok') {
    await mettreEnLigne(demande.id, wp.slug, demande.email, demande.d.intitule)
  } else {
    if (wp.etat === 'echec') console.error('[formation-privee] article WordPress non créé, à faire à la main', demande.id)
    await db.execute(sql`UPDATE demandes_formation SET statut = 'acceptee', traite_le = now() WHERE id = ${demande.id}`)
    try {
      await envoyerFormationDecidee(demande.email, demande.d.intitule, { statut: 'acceptee' })
    } catch (e) {
      console.error('[formation-privee] courriel d’acceptation', e)
    }
  }
  redirect(chemin('/espace-pro/moderation/'))
}

/** L'article a été créé à la main dans WordPress : on le relie par son slug et la formation passe en ligne. */
export async function publierFormation(donnees: FormData): Promise<never> {
  await exigerModeration()
  const demande = await lireDemande(String(donnees.get('id') ?? ''))
  const slug = String(donnees.get('slug') ?? '').trim().toLowerCase()
  if (!demande || demande.statut !== 'acceptee' || !/^[a-z0-9-]{3,200}$/.test(slug)) redirect(chemin('/espace-pro/moderation/'))
  await mettreEnLigne(demande.id, slug, demande.email, demande.d.intitule)
  redirect(chemin('/espace-pro/moderation/'))
}

export async function refuserFormation(donnees: FormData): Promise<never> {
  await exigerModeration()
  const demande = await lireDemande(String(donnees.get('id') ?? ''))
  if (!demande || !['en_attente', 'acceptee'].includes(demande.statut)) redirect(chemin('/espace-pro/moderation/'))
  const motif = String(donnees.get('motif') ?? '').trim().slice(0, 500) || null
  await db.execute(sql`UPDATE demandes_formation SET statut = 'refusee', motif = ${motif}, traite_le = now() WHERE id = ${demande.id}`)
  try {
    await envoyerFormationDecidee(demande.email, demande.d.intitule, { statut: 'refusee', motif })
  } catch (e) {
    console.error('[formation-privee] courriel de refus', e)
  }
  redirect(chemin('/espace-pro/moderation/'))
}

/** Vérifier une mention de prise en charge à sa source (ou retirer la vérification). */
export async function verifierMention(donnees: FormData): Promise<never> {
  await exigerModeration()
  const id = String(donnees.get('id') ?? '')
  const nom = PRISES_EN_CHARGE.find((p) => p === donnees.get('mention'))
  if (!nom) redirect(chemin('/espace-pro/moderation/'))
  const { rows } = await db.execute<{ verifications: Verifications; wp_slug: string | null }>(sql`SELECT verifications, wp_slug FROM demandes_formation WHERE id = ${id}`)
  const v: Verifications = { ...(rows[0]?.verifications ?? {}) }
  if (v[nom]) delete v[nom]
  else v[nom] = SOURCES_VERIFICATION[nom]
  await db.execute(sql`UPDATE demandes_formation SET verifications = ${JSON.stringify(v)}::jsonb WHERE id = ${id}`)
  if (rows[0]?.wp_slug) {
    updateTag(`formation-privee:${rows[0].wp_slug}`)
    // La liste publique montre aussi les mentions.
    updateTag('formations-privees')
  }
  redirect(chemin('/espace-pro/moderation/'))
}

/* ------------------------------------------------------------------ */
/* C : alerte des praticiens, sans compte                               */
/* ------------------------------------------------------------------ */

export type EtatAlerte = { ok: boolean; message: string } | null

const CODES_REGION = new Set<string>(REGIONS_FORMATION.map((r) => r.code))
const Alerte = z.object({
  email: z.string().trim().toLowerCase().email('Adresse électronique invalide.'),
  themes: z.array(z.enum(THEMES_FORMATION)),
  regions: z.array(z.string().refine((c) => CODES_REGION.has(c))),
  publics: z.array(z.enum(PUBLICS_FORMATION)),
})

export async function inscrireAlerteFormation(_e: EtatAlerte, donnees: FormData): Promise<EtatAlerte> {
  const r = Alerte.safeParse({
    email: String(donnees.get('email') ?? ''),
    themes: donnees.getAll('themes').map(String),
    regions: donnees.getAll('regions').map(String).filter(Boolean),
    publics: donnees.getAll('publics').map(String),
  })
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }
  const jeton = nouveauJeton()
  // Une adresse, une alerte : une nouvelle inscription remplace les critères et redemande la confirmation.
  // Une alerte déjà confirmée n'est pas touchée : sinon n'importe qui coupait l'alerte d'un autre en réinscrivant son adresse (audit du 2026-10-26).
  const { rows: inscrite } = await db.execute<{ id: string }>(sql`
    INSERT INTO alertes_formation (id, email, themes, regions, publics, jeton_hash)
    VALUES (${randomUUID()}, ${r.data.email},
            ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(r.data.themes)}::jsonb))::text[],
            ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(r.data.regions)}::jsonb))::text[],
            ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(r.data.publics)}::jsonb))::text[],
            ${condensat(jeton)})
    ON CONFLICT (email) DO UPDATE SET themes = EXCLUDED.themes, regions = EXCLUDED.regions, publics = EXCLUDED.publics,
      jeton_hash = EXCLUDED.jeton_hash, confirmee_le = NULL
      WHERE alertes_formation.confirmee_le IS NULL
    RETURNING id
  `)
  try {
    if (inscrite.length) await envoyerConfirmationAlerteFormation(r.data.email, jeton)
  } catch (e) {
    console.error('[alertes-formation] confirmation impossible', e)
    return { ok: false, message: 'L’email de confirmation n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return { ok: true, message: `Un email de confirmation vient de partir à ${r.data.email}. L’alerte s’active dès que vous cliquez sur son lien. Une alerte déjà active à cette adresse reste inchangée.` }
}

export async function confirmerAlerteFormation(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const { rows } = await db.execute<{ id: string }>(sql`
    UPDATE alertes_formation SET confirmee_le = COALESCE(confirmee_le, now()) WHERE jeton_hash = ${condensat(jeton)} RETURNING id
  `)
  redirect(chemin(`/formation/alerte/confirmer/${encodeURIComponent(jeton)}/?${rows.length ? 'fait=1' : 'invalide=1'}`))
}

export async function desinscrireAlerteFormation(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const id = alerteDesinscription(jeton)
  if (id) await db.execute(sql`DELETE FROM alertes_formation WHERE id = ${id}`)
  redirect(chemin(`/formation/alerte/desinscrire/${encodeURIComponent(jeton)}/?fait=1`))
}
