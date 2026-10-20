'use server'

import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { nomAffiche } from '@/lib/annuaire/types'
import { envoyerCandidatureNonRetenue } from '@/lib/email'
import { invalider, recruteur } from './recruteur'
import { DUREE_OFFRE_JOURS } from './offre-pro'

/**
 * Les offres d'emploi d'une fiche, côté recruteur (D-EMPLOI). Réservé au
 * titulaire d'une fiche à l'identité vérifiée, pour l'un de ses lieux
 * d'exercice. Publiée 30 jours ; le recruteur la confirme tous les 15 jours.
 * La création et la modification passent par « Créer un poste »
 * (`actions-etapes.ts`) ; ici, les gestes sur une offre existante.
 */

/** Les gestes sur une offre existante : confirmer (15 jours), pourvue, retirer, republier (30 jours). */
export async function agirSurOffre(donnees: FormData): Promise<never> {
  const ficheSlug = String(donnees.get('fiche') ?? '')
  const geste0 = String(donnees.get('geste') ?? '')
  // Remettre une offre en ligne demande le palier Ambassadeur ; la confirmer, la clore ou la retirer, non.
  const r = await recruteur(ficheSlug, geste0 === 'republier')
  const q = r?.espace.autres.length ? `?fiche=${encodeURIComponent(r.espace.fiche.slug)}` : ''
  if (!r) redirect(chemin('/espace-pro/'))
  const id = String(donnees.get('offre') ?? '')
  const geste = String(donnees.get('geste') ?? '')
  const requete =
    geste === 'confirmer'
      ? sql`UPDATE offres SET confirmee_le = now(), maj_le = now() WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut = 'en_ligne' RETURNING slug`
      : geste === 'pourvue'
        ? sql`UPDATE offres SET statut = 'pourvue', cloturee_le = now(), maj_le = now() WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut = 'en_ligne' RETURNING slug`
        : geste === 'retirer'
          ? sql`UPDATE offres SET statut = 'retiree', cloturee_le = now(), maj_le = now() WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut IN ('en_ligne', 'brouillon') RETURNING slug`
          : geste === 'republier'
            ? sql`UPDATE offres SET statut = 'en_ligne', publiee_le = now(), confirmee_le = now(), expire_le = now() + make_interval(days => ${DUREE_OFFRE_JOURS}), cloturee_le = NULL, maj_le = now()
                  WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut IN ('pourvue', 'expiree', 'retiree', 'en_ligne') RETURNING slug`
            : null
  if (!requete) redirect(chemin(`/espace-pro/emploi/${q}`))
  const { rows } = await db.execute<{ slug: string }>(requete)
  if (rows[0]) invalider(rows[0].slug, r.espace.fiche.slug)
  // Offre pourvue : les candidatures encore ouvertes sont closes, et leurs candidats prévenus.
  if (rows[0] && geste === 'pourvue') {
    const { rows: closes } = await db.execute<{ email: string; titre: string }>(sql`
      WITH closes AS (
        UPDATE candidatures SET statut = 'non_retenue', maj_le = now()
        WHERE offre_id = ${id} AND statut NOT IN ('retenue', 'non_retenue')
        RETURNING candidat_user_id
      )
      SELECT u.email, (SELECT titre FROM offres WHERE id = ${id}) AS titre FROM closes JOIN "user" u ON u.id = closes.candidat_user_id
    `)
    const nom = nomAffiche({ profession: r.espace.fiche.profession, nom: r.espace.fiche.nom, prenom: r.espace.fiche.prenom, raisonSociale: r.espace.fiche.raisonSociale })
    for (const c of closes) await envoyerCandidatureNonRetenue(c.email, nom, c.titre)
  }
  // Depuis la page d'une offre, on y revient ; sinon, la liste.
  const retour = String(donnees.get('retour') ?? '')
  const page = /^\/espace-pro\/emploi\/[\w-]+\/$/.test(retour) ? retour : '/espace-pro/emploi/'
  redirect(chemin(`${page}${q}${q ? '&' : '?'}fait=${encodeURIComponent(geste)}`))
}
