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

/* ------------------------------------------------------------------ */
/* Créer un poste : les étapes                                          */
/* ------------------------------------------------------------------ */

/**
 * Les pages enfant de « Créer un poste ». La première porte les informations
 * du cabinet, communes à toutes ses offres ; les suivantes, celles du poste.
 */
export const ETAPES_OFFRE = [
  { cle: 'cabinet', titre: 'Le cabinet', detail: 'Commun à toutes vos offres' },
  { cle: 'poste', titre: 'Le poste', detail: 'Métier, contrat, temps, lieu' },
  { cle: 'remuneration', titre: 'Rémunération', detail: 'Fourchette obligatoire' },
  { cle: 'annonce', titre: 'L’annonce', detail: 'Présentation, missions, profil' },
  { cle: 'publication', titre: 'Publication', detail: 'Relire et publier' },
] as const

export type EtapeOffre = (typeof ETAPES_OFFRE)[number]['cle']

export function estEtapeOffre(v: string): v is EtapeOffre {
  return ETAPES_OFFRE.some((e) => e.cle === v)
}

export function etapeSuivante(e: EtapeOffre): EtapeOffre | null {
  const i = ETAPES_OFFRE.findIndex((x) => x.cle === e)
  return ETAPES_OFFRE[i + 1]?.cle ?? null
}

export function etapePrecedente(e: EtapeOffre): EtapeOffre | null {
  const i = ETAPES_OFFRE.findIndex((x) => x.cle === e)
  return i > 0 ? ETAPES_OFFRE[i - 1].cle : null
}

/** Présentation du poste : 80 caractères au moins pour publier. */
export const PRESENTATION_MIN = 80

/**
 * Ce qui manque à une offre pour être publiée, étape par étape ; vide quand
 * elle peut l'être. Les mêmes règles servent à chaque étape d'une offre déjà
 * en ligne, qui ne doit jamais redevenir incomplète.
 */
export function manquesOffre(o: { contrat: CodeContrat; min: number; max: number; titre: string; presentation: string }): { etape: EtapeOffre; message: string }[] {
  const m: { etape: EtapeOffre; message: string }[] = []
  const mode = modeDuContrat(o.contrat)
  const pourcent = enPourcentage(o.contrat)
  if (o.titre.trim().length < 5) m.push({ etape: 'poste', message: 'Un intitulé de 5 caractères au moins.' })
  if (mode !== 'gratification' && (o.min <= 0 || o.max <= 0)) m.push({ etape: 'remuneration', message: 'La rémunération est obligatoire : indiquez une fourchette.' })
  else if (o.max < o.min) m.push({ etape: 'remuneration', message: 'La fourchette haute doit être au moins égale à la fourchette basse.' })
  else if (pourcent && o.max > 100) m.push({ etape: 'remuneration', message: 'Un pourcentage des honoraires ne dépasse pas 100.' })
  else if (mode === 'salaire' && o.min < 500) m.push({ etape: 'remuneration', message: 'La rémunération se saisit en euros bruts par mois.' })
  if (o.presentation.trim().length < PRESENTATION_MIN) m.push({ etape: 'annonce', message: `Une présentation du poste de ${PRESENTATION_MIN} caractères au moins.` })
  return m
}
