'use server'

import { z } from 'zod'
import { envoyerDemandePartenariat as envoyerCourriel } from '@/lib/email'

export type EtatDemande = { ok: boolean; message: string } | null

const Demande = z.object({
  prenom: z.string().trim().min(1, 'Votre prénom manque.').max(80),
  nom: z.string().trim().min(1, 'Votre nom manque.').max(80),
  email: z.string().trim().email('Adresse électronique invalide.'),
  organisme: z.enum(['ordre', 'ecole', 'syndicat', 'editeur', 'autre'], { message: 'Choisissez un type d’organisme.' }),
  fonction: z.enum(['dentiste', 'prothesiste', 'direction', 'enseignement', 'autre'], { message: 'Indiquez votre fonction.' }),
  message: z.string().trim().min(10, 'Dites-nous en un peu plus sur votre projet.').max(4000),
})

/**
 * Demande de partenariat déposée depuis l'accueil.
 *
 * Rien n'est stocké : la demande part par courriel à l'équipe, et la personne
 * reçoit un accusé à l'écran. Un partenariat se conclut par une convention
 * signée, pas par un formulaire, et c'est ce que le message rappelle.
 */
export async function envoyerDemandePartenariat(_etat: EtatDemande, donnees: FormData): Promise<EtatDemande> {
  const r = Demande.safeParse(Object.fromEntries(donnees.entries()))
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }

  try {
    await envoyerCourriel(r.data)
  } catch (e) {
    console.error('[partenariat] envoi impossible', e)
    return { ok: false, message: 'Votre demande n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return {
    ok: true,
    message: 'Merci, votre demande est envoyée. Une personne de l’équipe vous répond, et tout partenariat passe par une convention écrite.',
  }
}
