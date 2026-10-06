import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/** Le code à six chiffres de Better Auth, selon ce qu'il sert à faire. */
const OBJET_CODE = {
  'sign-in': { sujet: 'Votre code de connexion DentalMap', phrase: 'Voici votre code pour vous connecter' },
  'email-verification': { sujet: 'Confirmez votre adresse DentalMap', phrase: 'Voici votre code pour confirmer votre adresse' },
  'forget-password': { sujet: 'Réinitialisez votre mot de passe DentalMap', phrase: 'Voici votre code pour choisir un nouveau mot de passe' },
  'change-email': { sujet: 'Confirmez votre nouvelle adresse DentalMap', phrase: 'Voici votre code pour confirmer votre nouvelle adresse' },
} as const

export async function envoyerCode(to: string, code: string, type: keyof typeof OBJET_CODE) {
  const objet = OBJET_CODE[type]
  if (!resend) {
    console.log(`[dev] code ${type} pour ${to} : ${code}`)
    return
  }
  await resend.emails.send({
    from: 'DentalMap <connexion@dentalmap.fr>',
    to,
    subject: objet.sujet,
    text: `Bonjour,\n\n${objet.phrase}, valable 10 minutes :\n\n${code}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\nDentalMap`,
  })
}

const CONTACT = process.env.CONTACT_EMAIL ?? 'contact@dentalmap.fr'

export async function envoyerDemandePartenariat(d: {
  prenom: string
  nom: string
  email: string
  organisme: string
  fonction: string
  message: string
}) {
  const texte =
    `Demande de partenariat depuis l'accueil DentalMap\n\n` +
    `Nom : ${d.prenom} ${d.nom}\nCourriel : ${d.email}\nOrganisme : ${d.organisme}\nFonction : ${d.fonction}\n\n${d.message}\n`
  if (!resend) {
    console.log(`[dev] demande de partenariat pour ${CONTACT} :\n${texte}`)
    return
  }
  await resend.emails.send({
    from: 'DentalMap <connexion@dentalmap.fr>',
    to: CONTACT,
    replyTo: d.email,
    subject: `Partenariat : ${d.prenom} ${d.nom}`,
    text: texte,
  })
}

export async function envoyerMessageContact(d: {
  prenom: string
  nom: string
  email: string
  telephone?: string
  objet: string
  fiche?: string
  message: string
}) {
  const texte =
    `Message depuis la page contact DentalMap\n\n` +
    `Objet : ${d.objet}\nNom : ${d.prenom} ${d.nom}\nCourriel : ${d.email}\n` +
    (d.telephone ? `Téléphone : ${d.telephone}\n` : '') +
    (d.fiche ? `Fiche concernée : ${d.fiche}\n` : '') +
    `\n${d.message}\n`
  if (!resend) {
    console.log(`[dev] message de contact pour ${CONTACT} :\n${texte}`)
    return
  }
  await resend.emails.send({
    from: 'DentalMap <connexion@dentalmap.fr>',
    to: CONTACT,
    replyTo: d.email,
    subject: `Contact (${d.objet}) : ${d.prenom} ${d.nom}`,
    text: texte,
  })
}

/* ------------------------------------------------------------------ */
/* Emails du tunnel de connexion                                        */
/* ------------------------------------------------------------------ */

const SITE = (process.env.BETTER_AUTH_URL ?? 'https://dentalmap.fr').replace(/\/$/, '')
const EXPEDITEUR = 'DentalMap <connexion@dentalmap.fr>'

async function envoyer(to: string, subject: string, text: string, replyTo?: string) {
  if (!resend) {
    console.log(`[dev] email pour ${to} : ${subject}\n${text}`)
    return
  }
  await resend.emails.send({ from: EXPEDITEUR, to, subject, text, ...(replyTo ? { replyTo } : {}) })
}

/** Après la création du compte, quel que soit le rôle choisi ensuite. */
export async function envoyerBienvenue(to: string, nom?: string | null) {
  await envoyer(
    to,
    'Bienvenue sur DentalMap',
    `Bonjour${nom ? ` ${nom}` : ''},\n\nVotre compte DentalMap est ouvert. Vous pouvez y revenir à tout moment depuis ${SITE}/connexion/ : un lien de connexion vous sera envoyé par email, sans mot de passe à retenir.\n\nSi vous êtes chirurgien-dentiste ou prothésiste, votre espace professionnel vous attend pour retrouver votre fiche et la compléter : ${SITE}/espace-pro/\n\nDentalMap`,
  )
}

/** Accusé de réception d'une demande de revendication manuelle. */
export async function envoyerRevendicationRecue(to: string, fiche: string) {
  await envoyer(
    to,
    'Votre demande a bien été reçue',
    `Bonjour,\n\nNous avons bien reçu votre demande pour la fiche « ${fiche} ». Nous la vérifions sous 48 heures ouvrées et vous écrivons dès qu'elle est traitée.\n\nEn attendant, vous pouvez déjà préparer vos horaires, vos langues et l'accessibilité de vos locaux : ${SITE}/espace-pro/\n\nDentalMap`,
  )
}

/** La fiche est attribuée : le praticien peut publier ce qu'il a préparé. */
export async function envoyerRevendicationAcceptee(to: string, fiche: string, cheminFiche: string) {
  await envoyer(
    to,
    `La fiche « ${fiche} » est à vous`,
    `Bonjour,\n\nVotre demande est acceptée : la fiche « ${fiche} » est désormais gérée par vous. Ce que vous avez déjà renseigné est publié, et vous pouvez compléter le reste depuis votre espace : ${SITE}/espace-pro/\n\nVotre fiche publique : ${SITE}${cheminFiche}\n\nDentalMap`,
  )
}

/** Refus motivé, avec la marche à suivre pour réessayer. */
export async function envoyerRevendicationRefusee(to: string, fiche: string, motif: string | null) {
  await envoyer(
    to,
    `Votre demande pour « ${fiche} » n'a pas pu être acceptée`,
    `Bonjour,\n\nNous n'avons pas pu vous attribuer la fiche « ${fiche} ».${motif ? `\n\nMotif : ${motif}` : ''}\n\nSi vous êtes bien le titulaire de cette fiche, répondez à cet email avec un justificatif (attestation d'inscription à l'Ordre, extrait Kbis, ou un email depuis l'adresse professionnelle de la structure) et nous reprendrons l'examen.\n\nDentalMap`,
    CONTACT,
  )
}

/** Le parcours d'accueil est terminé : la fiche complétée est en ligne. */
export async function envoyerFichePubliee(to: string, fiche: string, cheminFiche: string) {
  await envoyer(
    to,
    `Votre fiche « ${fiche} » est complète`,
    `Bonjour,\n\nVos horaires, langues, accessibilité et modes de paiement sont en ligne sur votre fiche : ${SITE}${cheminFiche}\n\nVous pouvez les modifier à tout moment depuis votre espace : ${SITE}/espace-pro/\n\nDentalMap`,
  )
}

/** Signale aux modérateurs une demande à traiter. */
export async function envoyerAModerer(objet: string, texte: string) {
  await envoyer(CONTACT, `À modérer : ${objet}`, texte)
}
