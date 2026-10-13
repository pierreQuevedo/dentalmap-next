'use server'

import { z } from 'zod'
import { envoyerAccusePartenariat, envoyerDemandePartenariat as envoyerCourriel } from '@/lib/email'

const ORGANISMES = { ordre: 'Ordre professionnel', ecole: 'École ou faculté', syndicat: 'Syndicat', editeur: 'Éditeur', formation: 'Organisme de formation', collectivite: 'Collectivité ou ARS', autre: 'Autre' } as const
const FONCTIONS = { dentiste: 'Chirurgien-dentiste', prothesiste: 'Prothésiste', direction: 'Direction', enseignement: 'Enseignement', autre: 'Autre' } as const

export type EtatDemande = { ok: boolean; message: string } | null

const Demande = z.object({
  prenom: z.string().trim().min(1, 'Votre prénom manque.').max(80),
  nom: z.string().trim().min(1, 'Votre nom manque.').max(80),
  email: z.string().trim().email('Adresse électronique invalide.'),
  organisme: z.enum(['ordre', 'ecole', 'syndicat', 'editeur', 'formation', 'collectivite', 'autre'], { message: 'Choisissez un type d’organisme.' }),
  fonction: z.enum(['dentiste', 'prothesiste', 'direction', 'enseignement', 'autre'], { message: 'Indiquez votre fonction.' }),
  message: z.string().trim().min(10, 'Dites-nous en un peu plus sur votre projet.').max(4000),
})

/**
 * Demande de partenariat déposée depuis l'accueil.
 *
 * Rien n'est stocké : la demande part par courriel à l'équipe, et la personne
 * reçoit un accusé à l'écran et par email. Un partenariat se conclut par une convention
 * signée, pas par un formulaire, et c'est ce que le message rappelle.
 */
export async function envoyerDemandePartenariat(_etat: EtatDemande, donnees: FormData): Promise<EtatDemande> {
  const r = Demande.safeParse(Object.fromEntries(donnees.entries()))
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }

  try {
    await envoyerCourriel({ ...r.data, organisme: ORGANISMES[r.data.organisme], fonction: FONCTIONS[r.data.fonction], origine: 'accueil' })
    await envoyerAccusePartenariat(r.data.email)
  } catch (e) {
    console.error('[partenariat] envoi impossible', e)
    return { ok: false, message: 'Votre demande n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return {
    ok: true,
    message: 'Merci, votre demande est envoyée. Une personne de l’équipe vous répond, et tout partenariat passe par une convention écrite.',
  }
}
