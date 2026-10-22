'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerAModerer } from '@/lib/email'
import { estModerateur, exigerConnexion, getCompte } from '@/lib/tunnel/compte'
import { ESPACE_ETAB, getGestions, getSourceEtablissement } from '@/lib/espace-pro/etablissement-donnees'
import { Avis, MOTIFS_SIGNALEMENT, REPONSE_MAX, libelleLien, refusTexte, type MotifSignalement } from './avis'

/**
 * Les avis : déposer ou modifier le sien (une personne connectée, un avis par
 * établissement, pas sur une page qu'elle gère), répondre au nom de
 * l'établissement, signaler, et la décision de l'équipe sur un signalement.
 * Un avis paraît dès son dépôt ; seul un avis retiré par l'équipe disparaît.
 */

export type EtatAvis = { erreur?: string; champ?: string } | null

const rafraichir = (slug: string) => {
  updateTag('avis')
  updateTag(`avis:${slug}`)
}

export async function deposerAvis(_: EtatAvis, donnees: FormData): Promise<EtatAvis> {
  const slug = String(donnees.get('slug') ?? '')
  const source = await getSourceEtablissement(slug)
  if (!source) return { erreur: 'Cet établissement n’existe plus.' }
  const formulaire = `${source.lien}avis/`
  const compte = await exigerConnexion(formulaire)
  const gere = (await getGestions(compte.id)).some((g) => g.slug === slug && g.statut !== 'refusee')
  if (gere) return { erreur: 'Vous gérez la page de cet établissement : vous ne pouvez pas lui laisser d’avis.' }

  const lu = Avis.safeParse(Object.fromEntries(donnees))
  if (!lu.success) {
    const p = lu.error.issues[0]!
    return { erreur: p.message.startsWith('Invalid') ? 'Un champ est incomplet.' : p.message, champ: String(p.path[0] ?? '') }
  }
  const v = lu.data
  if (v.lien === 'patient' && source.type !== 'faculte') return { erreur: 'Indiquez votre lien avec l’établissement.', champ: 'lien' }
  const refus = refusTexte(v.texte)
  if (refus) return { erreur: refus, champ: 'texte' }
  if (v.annee && refusTexte(v.annee)) return { erreur: 'Indiquez seulement une promotion ou une année.', champ: 'annee' }

  await db.execute(sql`
    INSERT INTO avis_etablissement (id, slug, user_id, lien, annee, note, texte)
    VALUES (${randomUUID()}, ${slug}, ${compte.id}::uuid, ${v.lien}, ${v.annee ?? null}, ${v.note}, ${v.texte})
    ON CONFLICT (slug, user_id) DO UPDATE SET lien = EXCLUDED.lien, annee = EXCLUDED.annee, note = EXCLUDED.note, texte = EXCLUDED.texte, modifie_le = now()
  `)
  rafraichir(slug)
  redirect(chemin(`${source.lien}?avis=merci#avis`))
}

/** La page de l'avis, si le compte gère cet établissement (gestion vérifiée). */
async function avisDuGestionnaire(id: string, userId: string): Promise<{ slug: string } | null> {
  const { rows } = await db.execute<{ slug: string }>(sql`SELECT slug FROM avis_etablissement WHERE id = ${id}`)
  const slug = rows[0]?.slug
  if (!slug) return null
  const ok = (await getGestions(userId)).some((g) => g.slug === slug && g.statut === 'acceptee')
  return ok ? { slug } : null
}

const versPartager = (slug: string, plusieurs: boolean, fait: string) => chemin(`${ESPACE_ETAB}/partager/?${plusieurs ? `fiche=${encodeURIComponent(slug)}&` : ''}fait=${fait}#avis`)

/** Répondre, ou modifier sa réponse ; vide, la réponse est retirée. */
export async function repondreAvis(_: EtatAvis, donnees: FormData): Promise<EtatAvis> {
  const compte = await exigerConnexion(`${ESPACE_ETAB}/partager/`)
  const id = String(donnees.get('avis') ?? '')
  const cible = await avisDuGestionnaire(id, compte.id)
  if (!cible) return { erreur: 'Seul le gestionnaire vérifié de la page peut répondre.' }
  const reponse = String(donnees.get('reponse') ?? '').trim()
  if (reponse.length > REPONSE_MAX) return { erreur: `${REPONSE_MAX.toLocaleString('fr-FR')} caractères au plus.`, champ: 'reponse' }
  const refus = reponse ? refusTexte(reponse) : null
  if (refus) return { erreur: refus, champ: 'reponse' }
  await db.execute(sql`UPDATE avis_etablissement SET reponse = ${reponse || null}, repondu_le = ${reponse ? sql`now()` : null} WHERE id = ${id}`)
  rafraichir(cible.slug)
  const plusieurs = (await getGestions(compte.id)).filter((g) => g.statut !== 'refusee').length > 1
  redirect(versPartager(cible.slug, plusieurs, reponse ? 'reponse' : 'reponse-retiree'))
}

/**
 * Signaler un avis : le gestionnaire depuis son espace, ou un lecteur
 * connecté depuis la page. L'avis reste en ligne jusqu'à la décision de
 * l'équipe, prévenue par email.
 */
export async function signalerAvis(_: EtatAvis, donnees: FormData): Promise<EtatAvis> {
  const id = String(donnees.get('avis') ?? '')
  const { rows } = await db.execute<{ slug: string; texte: string; note: number; lien: string }>(sql`SELECT slug, texte, note, lien FROM avis_etablissement WHERE id = ${id}`)
  const avis = rows[0]
  if (!avis) return { erreur: 'Cet avis n’existe plus.' }
  const source = await getSourceEtablissement(avis.slug)
  const compte = await exigerConnexion(source ? `${source.lien}#avis` : '/formation/')
  const motif = String(donnees.get('motif') ?? '') as MotifSignalement
  if (!MOTIFS_SIGNALEMENT.some((m) => m.cle === motif)) return { erreur: 'Choisissez la raison du signalement.', champ: 'motif' }
  const detail = String(donnees.get('detail') ?? '').trim().slice(0, 500) || null
  const gestions = await getGestions(compte.id)
  const parEtablissement = gestions.some((g) => g.slug === avis.slug && g.statut === 'acceptee')

  await db.execute(sql`
    INSERT INTO signalements_avis (id, avis_id, user_id, par_etablissement, motif, detail)
    VALUES (${randomUUID()}, ${id}, ${compte.id}::uuid, ${parEtablissement}, ${motif}, ${detail})
    ON CONFLICT (avis_id, user_id) DO UPDATE SET motif = EXCLUDED.motif, detail = EXCLUDED.detail, statut = 'ouvert', cree_le = now(), traite_le = NULL
  `)
  await envoyerAModerer(
    `avis signalé sur ${source?.titre ?? avis.slug}`,
    `Signalé par ${parEtablissement ? 'le gestionnaire de la page' : 'un lecteur'} : ${MOTIFS_SIGNALEMENT.find((m) => m.cle === motif)!.libelle}.${detail ? `\n\nPrécision : ${detail}` : ''}\n\nAvis (${avis.note}/5, ${libelleLien(avis.lien)}) : « ${avis.texte.slice(0, 400)} »`,
  )
  if (parEtablissement) redirect(versPartager(avis.slug, gestions.filter((g) => g.statut !== 'refusee').length > 1, 'signale'))
  redirect(chemin(`${source?.lien ?? '/formation/'}?avis=signale#avis`))
}

/** La décision de l'équipe : maintenir l'avis, ou le retirer avec un motif. */
export async function deciderSignalementAvis(donnees: FormData): Promise<never> {
  const compte = await getCompte()
  if (!compte || !estModerateur(compte.email)) redirect(chemin('/espace-pro/'))
  const id = String(donnees.get('avis') ?? '')
  const retirer = donnees.get('decision') === 'retirer'
  const motif = String(donnees.get('motif') ?? '').trim().slice(0, 300) || null
  const { rows } = await db.execute<{ slug: string }>(sql`
    UPDATE avis_etablissement SET statut = ${retirer ? 'retire' : 'publie'}, motif_retrait = ${retirer ? motif : null} WHERE id = ${id} RETURNING slug
  `)
  await db.execute(sql`UPDATE signalements_avis SET statut = ${retirer ? 'retire' : 'maintenu'}, traite_le = now() WHERE avis_id = ${id} AND statut = 'ouvert'`)
  if (rows[0]) rafraichir(rows[0].slug)
  redirect(chemin('/espace-pro/moderation/#avis'))
}
