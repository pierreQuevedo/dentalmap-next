/**
 * Les offres côté recruteur, partie pure : durée de publication, confirmation
 * tous les 15 jours, mode de rémunération selon le contrat, état d'une offre.
 * Importé par la page Emploi de l'espace pro, les actions et les tests.
 */
import type { CodeContrat, ModeRemuneration } from './metiers'

/** Une offre reste en ligne 30 jours, renouvelable d'un clic. */
export const DUREE_OFFRE_JOURS = 30
/** Le recruteur confirme son offre tous les 15 jours ; sans confirmation, elle est retirée (tâche planifiée). */
export const CONFIRMATION_JOURS = 15
/** Les candidatures sont supprimées 6 mois après la clôture. */
export const CONSERVATION_CANDIDATURES_MOIS = 6

export const AVANTAGES = ['Tickets restaurant', 'Mutuelle', 'Prime annuelle', 'Samedi libre', 'Formation continue', 'Stationnement', 'Transports remboursés', 'Logement possible'] as const

/** Le mode de rémunération va avec le contrat : salaire, gratification de stage, rétrocession ou redevance. */
export function modeDuContrat(contrat: CodeContrat): ModeRemuneration {
  if (contrat === 'stage') return 'gratification'
  if (contrat === 'remplacement') return 'retrocession'
  if (contrat === 'collaboration') return 'redevance'
  return 'salaire'
}

/** La rémunération se saisit en euros bruts mensuels, ou en pourcentage des honoraires. */
export function enPourcentage(contrat: CodeContrat): boolean {
  const mode = modeDuContrat(contrat)
  return mode === 'retrocession' || mode === 'redevance'
}

export type StatutOffre = 'brouillon' | 'en_ligne' | 'pourvue' | 'expiree' | 'retiree'

export type EtatOffre =
  | { etat: 'brouillon' }
  | { etat: 'en_ligne'; depuisJours: number; resteJours: number; aConfirmer: boolean; confirmerAvant: Date }
  | { etat: 'pourvue' | 'expiree' | 'retiree'; le: Date | null }

const JOUR = 86_400_000

/** Où en est une offre aujourd'hui. Une offre en ligne dont l'échéance est passée est expirée. */
export function etatOffre(
  o: { statut: StatutOffre; publieeLe: Date | null; confirmeeLe: Date | null; expireLe: Date | null; clotureeLe: Date | null },
  maintenant = new Date(),
): EtatOffre {
  if (o.statut === 'brouillon') return { etat: 'brouillon' }
  if (o.statut === 'en_ligne' && o.expireLe && o.expireLe.getTime() <= maintenant.getTime()) return { etat: 'expiree', le: o.expireLe }
  if (o.statut !== 'en_ligne') return { etat: o.statut, le: o.clotureeLe ?? o.expireLe }
  const publiee = o.publieeLe ?? maintenant
  const confirmee = o.confirmeeLe ?? publiee
  const confirmerAvant = new Date(confirmee.getTime() + CONFIRMATION_JOURS * JOUR)
  return {
    etat: 'en_ligne',
    depuisJours: Math.max(0, Math.floor((maintenant.getTime() - publiee.getTime()) / JOUR)),
    resteJours: o.expireLe ? Math.max(0, Math.round((o.expireLe.getTime() - maintenant.getTime()) / JOUR)) : DUREE_OFFRE_JOURS,
    // À confirmer dans les trois derniers jours de la quinzaine, ou en retard.
    aConfirmer: confirmerAvant.getTime() - maintenant.getTime() <= 3 * JOUR,
    confirmerAvant,
  }
}

/** Un slug lisible et unique : métier, commune, suffixe aléatoire. */
export function slugOffre(metierSlug: string, communeSlug: string, aleatoire: string): string {
  return `${metierSlug}-${communeSlug}-${aleatoire}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-')
}
