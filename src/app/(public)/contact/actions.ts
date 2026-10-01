'use server'

import { z } from 'zod'
import { envoyerMessageContact as envoyerCourriel } from '@/lib/email'
import { CLES_OBJETS, libelleObjet } from '@/lib/contact/objets'

export type EtatContact = { ok: boolean; message: string } | null

const Message = z.object({
  prenom: z.string().trim().min(1, 'Votre prénom manque.').max(80),
  nom: z.string().trim().min(1, 'Votre nom manque.').max(80),
  email: z.string().trim().email('Adresse électronique invalide.'),
  telephone: z.string().trim().max(30).optional(),
  objet: z.enum(CLES_OBJETS, { message: 'Choisissez l’objet de votre message.' }),
  fiche: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => v || undefined),
  message: z.string().trim().min(10, 'Dites-nous en un peu plus.').max(4000),
  consentement: z.literal('on', { message: 'Cochez la case pour que nous puissions traiter votre message.' }),
})

/**
 * Message déposé depuis la page contact.
 *
 * Rien n'est stocké : le message part par courriel à l'équipe, avec l'objet
 * en sujet, et la personne reçoit un accusé à l'écran. La case de
 * consentement est exigée côté serveur aussi, un formulaire sans script ne
 * doit pas la contourner.
 */
export async function envoyerMessageContact(_etat: EtatContact, donnees: FormData): Promise<EtatContact> {
  const r = Message.safeParse(Object.fromEntries(donnees.entries()))
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }

  try {
    await envoyerCourriel({ ...r.data, objet: libelleObjet(r.data.objet) })
  } catch (e) {
    console.error('[contact] envoi impossible', e)
    return { ok: false, message: 'Votre message n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return {
    ok: true,
    message: 'Merci, votre message est envoyé. Une personne de l’équipe vous répond sous quelques jours ouvrés.',
  }
}
