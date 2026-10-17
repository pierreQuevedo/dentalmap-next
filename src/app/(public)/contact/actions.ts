'use server'

import { z } from 'zod'
import { envoyerMessageContact as envoyerCourriel } from '@/lib/email'
import { CLES_OBJETS, libelleObjet } from '@/lib/contact/objets'
import { FORMULAIRES, libelleDetail } from '@/lib/contact/formulaires'
import { deposerTicketSav } from '@/lib/wp/sav'

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
 * Il devient un ticket dans l'espace SAV du back-office et part aussi par
 * courriel à l'équipe, avec l'objet en sujet. Il suffit que l'un des deux
 * aboutisse pour que le message ne soit pas perdu. La case de consentement
 * est exigée côté serveur aussi, un formulaire sans script ne doit pas la
 * contourner.
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

  // Le ticket du SAV porte aussi les champs propres au formulaire.
  const message = details.length ? `${r.data.message}\n\n${details.map((d) => `${d.libelle} : ${d.valeur}`).join('\n')}` : r.data.message
  const [ticket, courriel] = await Promise.allSettled([
    deposerTicketSav({ ...r.data, message }),
    envoyerCourriel({ ...r.data, objet: libelleObjet(r.data.objet), details }),
  ])
  if (ticket.status === 'rejected') console.error('[contact] ticket SAV impossible', ticket.reason)
  if (courriel.status === 'rejected') console.error('[contact] envoi impossible', courriel.reason)

  const ticketCree = ticket.status === 'fulfilled' && ticket.value !== 'coupe'
  if (!ticketCree && courriel.status === 'rejected') {
    return { ok: false, message: 'Votre message n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return {
    ok: true,
    message: 'Merci, votre message est envoyé. Une personne de l’équipe vous répond sous quelques jours ouvrés.',
  }
}
