import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { Compte } from '@/lib/tunnel/compte'
import { getFicheRevendication, type FicheRevendication } from './parcours'
import { getFicheCompleteeParPraticien } from './revendication'
import { FICHE_VIDE, type FicheCompletee } from './fiche-completee'
import { calculerForce, distinctionsDe, filtresDe, fraicheurDe, missionsDe, palierDe, prochaineMission, type Contexte } from './force'
import { calculerForceLabo, distinctionsLabo, filtresLabo, fraicheurLabo, missionsLabo } from './force-labo'

/**
 * L'espace d'un soignant : sa fiche courante et tout ce qui s'en déduit.
 *
 * La fiche courante est celle de l'adresse (`?fiche=`) si le compte la
 * détient, sinon la première fiche du compte, acceptée d'abord. Jamais en
 * cache : tout dépend du compte et change à chaque enregistrement.
 */
export type Espace = NonNullable<Awaited<ReturnType<typeof getEspace>>>

export async function slugsDuCompte(userId: string): Promise<{ slug: string; statut: 'en_attente' | 'acceptee' | 'refusee' }[]> {
  const { rows } = await db.execute<{ slug: string; statut: 'en_attente' | 'acceptee' | 'refusee' }>(sql`
    SELECT p.slug, r.statut FROM revendications r JOIN praticiens p ON p.id = r.praticien_id AND p.deleted_at IS NULL
    WHERE r.user_id = ${userId}::uuid AND r.objet = 'revendication' AND r.statut <> 'refusee'
      -- Une contestation en attente n'ouvre pas l'espace de la fiche : elle a déjà un titulaire.
      AND (r.statut = 'acceptee' OR NOT EXISTS (
        SELECT 1 FROM revendications a WHERE a.praticien_id = r.praticien_id AND a.user_id <> r.user_id AND a.statut = 'acceptee' AND a.objet = 'revendication'
      ))
    ORDER BY (r.statut = 'acceptee') DESC, r.demande_le ASC
  `)
  return rows
}

export async function getEspace(compte: Compte, slugDemande?: string | null, maintenant = new Date()) {
  const slugs = await slugsDuCompte(compte.id)
  const choisi = slugs.find((s) => s.slug === slugDemande) ?? slugs[0]
  if (!choisi) return null
  const fiche = await getFicheRevendication(choisi.slug, compte.id)
  if (!fiche?.demande) return null
  const completee = await getFicheCompleteeParPraticien(fiche.id)
  const ctx: Contexte = {
    identiteVerifiee: fiche.demande.statut === 'acceptee',
    viaPsc: fiche.demande.methode === 'pro_sante_connect' && fiche.demande.statut === 'acceptee',
    nombreDeLieux: fiche.lieux.length,
    lieuxGeres: fiche.demande.lieuxGeres.length,
  }
  // Deux barèmes : le laboratoire de prothèse a le sien.
  const labo = fiche.profession === 'prothesiste'
  const force = labo ? calculerForceLabo(completee, ctx, maintenant) : calculerForce(completee, ctx, maintenant)
  const missions = labo ? missionsLabo(completee) : missionsDe(completee)
  return {
    fiche,
    completee,
    ctx,
    labo,
    force,
    palier: palierDe(force.total),
    missions,
    prochaine: prochaineMission(missions),
    filtres: labo ? filtresLabo(completee, maintenant) : filtresDe(completee, maintenant),
    fraicheur: labo ? fraicheurLabo(completee, maintenant) : fraicheurDe(completee, maintenant),
    distinctions: labo ? distinctionsLabo(completee, ctx, force, maintenant) : distinctionsDe(completee, ctx, force),
    /** Autres fiches du compte, pour passer de l'une à l'autre. */
    autres: slugs.filter((s) => s.slug !== choisi.slug),
  }
}

/** La force qu'aurait la fiche avec ces valeurs : le « +20 % » annoncé avant de valider. */
export function forceAvec(completee: FicheCompletee | null, ctx: Contexte, changements: Partial<FicheCompletee>, labo = false, maintenant = new Date()): number {
  const fusion: FicheCompletee = { ...(completee ?? FICHE_VIDE), ...changements, majLe: maintenant.toISOString() }
  return (labo ? calculerForceLabo : calculerForce)(fusion, ctx, maintenant).total
}

export type { FicheRevendication }
