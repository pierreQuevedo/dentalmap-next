import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendMagicLink(to: string, url: string) {
  if (!resend) {
    console.log(`[dev] lien magique pour ${to} : ${url}`)
    return
  }
  await resend.emails.send({
    from: 'DentalMap <connexion@dentalmap.fr>',
    to,
    subject: 'Votre lien de connexion DentalMap',
    text: `Bonjour,\n\nVoici votre lien de connexion, valable 5 minutes : ${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\nDentalMap`,
  })
}
