'use server'

import { z } from 'zod'
import { envoyerMessageContact as envoyerCourriel } from '@/lib/email'
import { CLES_OBJETS, libelleObjet } from '@/lib/contact/objets'
import { FORMULAIRES, libelleDetail } from '@/lib/contact/formulaires'

export type EtatContact = { ok: boolean; message: string } | null

const Message = z.object({
  prenom: z.string().trim().min(1, 'Votre prénom manque.').max(80),
  nom: z.string().trim().min(1, 'Votre nom manque.').max(80),
  email: z.string().trim().email('Adresse électronique invalide.'),
  telephone: z.string().trim().max(30).optional(),
  objet: z.enum(CLES_OBJETS, { message: 'Choisissez l’objet de votre message.' }),
  message: z.string().trim().min(10, 'Dites-nous en un peu plus.').max(4000),
  consentement: z.literal('on', { message: 'Cochez la case pour que nous puissions traiter votre message.' }),
})

/**
 * Message déposé depuis l'un des formulaires dédiés de la page contact
 * (`src/lib/contact/formulaires.ts`).
 *
 * Rien n'est stocké : le message part par courriel à l'équipe, avec l'objet
 * en sujet, et la personne reçoit un accusé à l'écran. La case de
 * consentement est exigée côté serveur aussi, un formulaire sans script ne
 * doit pas la contourner.
 */
export async function envoyerMessageContact(_etat: EtatContact, donnees: FormData): Promise<EtatContact> {
  const brut = Object.fromEntries(donnees.entries())
  const r = Message.safeParse(brut)
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }
  if (r.data.objet === 'partenariat') return { ok: false, message: 'Les partenariats passent par la page Devenir partenaire.' }

  // Les champs propres à l'entrée : seuls ceux de son formulaire, bornés, et
  // les obligatoires vérifiés ici aussi.
  const formulaire = FORMULAIRES[r.data.objet]
  const details: { libelle: string; valeur: string }[] = []
  for (const champ of formulaire.champs) {
    const v = typeof brut[champ.nom] === 'string' ? (brut[champ.nom] as string).trim().slice(0, 300) : ''
    if (!v) {
      if (champ.requis) return { ok: false, message: `${champ.libelle} : ce champ manque.` }
      continue
    }
    if (champ.options && !champ.options.some(([o]) => o === v)) return { ok: false, message: `${champ.libelle} : choix inconnu.` }
    details.push(libelleDetail(r.data.objet, champ.nom, v))
  }

  try {
    await envoyerCourriel({ ...r.data, objet: libelleObjet(r.data.objet), details })
  } catch (e) {
    console.error('[contact] envoi impossible', e)
    return { ok: false, message: 'Votre message n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return {
    ok: true,
    message: 'Merci, votre message est envoyé. Une personne de l’équipe vous répond sous quelques jours ouvrés.',
  }
}
