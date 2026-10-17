import { Resend } from 'resend'
import { composer, type Email } from './email-gabarit'

/**
 * Les emails de DentalMap, mis en forme par le gabarit commun (Figma,
 * couloir « Emails ») avec leur version texte brut. Sans clé Resend, en
 * développement, ils sont écrits dans la console au lieu de partir.
 */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SITE = (process.env.BETTER_AUTH_URL ?? 'https://dentalmap.fr').replace(/\/$/, '')
const EXPEDITEUR = 'DentalMap <connexion@dentalmap.fr>'
const CONTACT = process.env.CONTACT_EMAIL ?? 'contact@dentalmap.fr'

async function envoyer(to: string, subject: string, email: Email, replyTo?: string) {
  const { html, text } = composer(email, SITE)
  if (!resend) {
    console.log(`[dev] email pour ${to} : ${subject}\n${text}`)
    return
  }
  await resend.emails.send({ from: EXPEDITEUR, to, subject, html, text, ...(replyTo ? { replyTo } : {}) })
}

const ESPACE = { type: 'bouton' as const, libelle: 'Ouvrir mon espace professionnel', url: `${SITE}/espace-pro/` }

/* ------------------------------------------------------------------ */
/* Codes et compte                                                      */
/* ------------------------------------------------------------------ */

/** Le code à six chiffres de Better Auth, selon ce qu'il sert à faire. */
const OBJET_CODE = {
  'sign-in': { sujet: 'Votre code de connexion DentalMap', titre: 'Votre code de connexion', phrase: 'Voici votre code pour vous connecter' },
  'email-verification': { sujet: 'Confirmez votre adresse DentalMap', titre: 'Confirmez votre adresse', phrase: 'Voici votre code pour confirmer votre adresse' },
  'forget-password': { sujet: 'Réinitialisez votre mot de passe DentalMap', titre: 'Réinitialisez votre mot de passe', phrase: 'Voici votre code pour choisir un nouveau mot de passe' },
  'change-email': { sujet: 'Confirmez votre nouvelle adresse DentalMap', titre: 'Confirmez votre nouvelle adresse', phrase: 'Voici votre code pour confirmer votre nouvelle adresse' },
} as const

export async function envoyerCode(to: string, code: string, type: keyof typeof OBJET_CODE) {
  const o = OBJET_CODE[type]
  await envoyer(to, o.sujet, {
    titre: o.titre,
    blocs: [
      { type: 'texte', texte: `${o.phrase}, valable 10 minutes :` },
      { type: 'code', code },
      { type: 'encart', texte: 'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.' },
    ],
    raison: 'Vous recevez cet email parce qu’un code a été demandé pour cette adresse sur DentalMap.',
  })
}

/** Après la création du compte, quel que soit le rôle choisi ensuite. */
export async function envoyerBienvenue(to: string, nom?: string | null) {
  await envoyer(to, 'Bienvenue sur DentalMap', {
    titre: 'Bienvenue sur DentalMap',
    salutation: `Bonjour${nom ? ` ${nom}` : ''},`,
    blocs: [
      { type: 'texte', texte: 'Votre compte DentalMap est ouvert. Vous pouvez y revenir à tout moment avec votre adresse et votre mot de passe.' },
      { type: 'lien', libelle: 'Se connecter à DentalMap', url: `${SITE}/connexion/` },
      { type: 'texte', texte: 'Si vous êtes chirurgien-dentiste ou prothésiste, votre espace professionnel vous attend pour retrouver votre fiche et la compléter.' },
      ESPACE,
    ],
    raison: 'Vous recevez cet email parce qu’un compte DentalMap vient d’être créé avec cette adresse.',
  })
}

/* ------------------------------------------------------------------ */
/* Revendication d'une fiche                                            */
/* ------------------------------------------------------------------ */

/** Accusé de réception d'une demande examinée par l'équipe : revendication, ou retrait de la fiche. */
export async function envoyerRevendicationRecue(to: string, fiche: string, objet: 'revendication' | 'retrait' = 'revendication') {
  const retrait = objet === 'retrait'
  await envoyer(to, 'Votre demande a bien été reçue', {
    titre: 'Votre demande a bien été reçue',
    blocs: retrait
      ? [
          { type: 'texte', texte: `Nous avons bien reçu votre demande de retrait de la fiche « ${fiche} ». Nous la vérifions sous 48 heures ouvrées et vous écrivons dès qu’elle est traitée.` },
          { type: 'encart', texte: 'D’ici là, la fiche reste en ligne. Vous pouvez annuler la demande depuis votre espace.' },
          ESPACE,
        ]
      : [
          { type: 'texte', texte: `Nous avons bien reçu votre demande pour la fiche « ${fiche} ». Nous la vérifions sous 48 heures ouvrées et vous écrivons dès qu’elle est traitée.` },
          { type: 'texte', texte: 'En attendant, vous pouvez déjà préparer vos horaires, vos langues et l’accessibilité de vos locaux.' },
          ESPACE,
        ],
    raison: 'Vous recevez cet email parce que vous avez déposé un document pour une fiche sur DentalMap.',
  })
}

/** La fiche est attribuée : le praticien peut publier ce qu'il a préparé. */
export async function envoyerRevendicationAcceptee(to: string, fiche: string, cheminFiche: string) {
  await envoyer(to, `La fiche « ${fiche} » est à vous`, {
    titre: `La fiche « ${fiche} » est à vous`,
    blocs: [
      { type: 'texte', texte: `Votre demande est acceptée : la fiche « ${fiche} » est désormais gérée par vous. Ce que vous avez déjà renseigné est publié, et vous pouvez compléter le reste depuis votre espace.` },
      ESPACE,
      { type: 'lien', libelle: 'Voir votre fiche publique', url: `${SITE}${cheminFiche}` },
    ],
    raison: 'Vous recevez cet email parce que vous avez demandé à gérer cette fiche sur DentalMap.',
  })
}

/** Refus motivé, avec la marche à suivre pour réessayer. */
export async function envoyerRevendicationRefusee(to: string, fiche: string, motif: string | null) {
  await envoyer(
    to,
    `Votre demande pour « ${fiche} » n’a pas pu être acceptée`,
    {
      titre: 'Votre demande n’a pas pu être acceptée',
      blocs: [
        { type: 'texte', texte: `Nous n’avons pas pu vous attribuer la fiche « ${fiche} ».` },
        ...(motif ? [{ type: 'encart' as const, texte: `Motif : ${motif}` }] : []),
        { type: 'texte', texte: 'Si vous êtes bien le titulaire de cette fiche, répondez à cet email : nous reprendrons la vérification avec vous. Pour un chirurgien-dentiste, Pro Santé Connect règle la question en une minute ; pour un laboratoire, joignez un extrait Kbis récent.' },
      ],
      raison: `Vous recevez cet email parce que vous avez demandé à gérer cette fiche sur DentalMap. Votre réponse arrive à l’équipe, à ${CONTACT}.`,
    },
    CONTACT,
  )
}

/** Le gérant d'un laboratoire est prévenu qu'un salarié demande à gérer la fiche en son nom. */
export async function envoyerMandatAuGerant(to: string, fiche: string, demandeur: string) {
  await envoyer(
    to,
    `Une demande pour gérer « ${fiche} » en votre nom`,
    {
      titre: `Une demande pour gérer « ${fiche} » en votre nom`,
      blocs: [
        { type: 'texte', texte: `${demandeur} nous a transmis un mandat signé de votre part pour gérer la fiche « ${fiche} » sur DentalMap. Nous l’examinons sous 48 heures ouvrées.` },
        { type: 'texte', texte: 'Si vous n’êtes pas à l’origine de ce mandat, répondez à ce message : la demande sera refusée.' },
      ],
      raison: 'Vous recevez cet email parce que votre adresse a été donnée comme celle du gérant dans une demande déposée sur DentalMap.',
    },
    CONTACT,
  )
}

/** LC1 : quelqu'un demande à rejoindre l'équipe d'une fiche ; le titulaire décide. */
export async function envoyerDemandeInvitation(to: string, fiche: string, demandeur: string, adresseDemandeur: string) {
  await envoyer(to, `${demandeur} demande à rejoindre « ${fiche} »`, {
    titre: `${demandeur} demande à rejoindre « ${fiche} »`,
    blocs: [
      { type: 'texte', texte: `${demandeur} (${adresseDemandeur}) souhaite gérer la fiche « ${fiche} » avec vous sur DentalMap.` },
      { type: 'texte', texte: 'Si vous connaissez cette personne, invitez son adresse depuis votre espace, rubrique Équipe.' },
      { type: 'bouton', libelle: 'Ouvrir la rubrique Équipe', url: `${SITE}/espace-pro/equipe/` },
      { type: 'texte', texte: 'Sinon, ignorez ce message : rien ne change sur votre fiche.' },
    ],
    raison: 'Vous recevez cet email parce que vous gérez cette fiche sur DentalMap.',
  })
}

/** U-COL : une invitation à gérer une fiche. Le lien est à usage unique, trente jours. */
export async function envoyerInvitation(to: string, fiche: string, invitePar: string, jeton: string) {
  const url = `${SITE}/espace-pro/invitation/${jeton}/`
  await envoyer(to, `${invitePar} vous invite à rejoindre « ${fiche} »`, {
    titre: `${invitePar} vous invite à rejoindre « ${fiche} »`,
    blocs: [
      { type: 'texte', texte: `${invitePar} vous invite à rejoindre l’équipe qui gère la fiche « ${fiche} » sur DentalMap.` },
      { type: 'texte', texte: 'Pour accepter, ouvrez ce lien et connectez-vous avec cette adresse (créez un compte si vous n’en avez pas).' },
      { type: 'bouton', libelle: 'Accepter l’invitation', url },
      { type: 'lienBrut', url },
      { type: 'encart', texte: `Le lien vaut trente jours. Si vous ne connaissez pas ${invitePar}, ignorez ce message.` },
    ],
    raison: `Vous recevez cet email parce que ${invitePar} a invité cette adresse sur DentalMap.`,
  })
}

/** Alerte « fiche créée » : le RPPS attendu a maintenant sa fiche, on peut la revendiquer. */
export async function envoyerFicheEnLigne(to: string, fiche: string, chemin: string) {
  await envoyer(to, 'Votre fiche est en ligne sur DentalMap', {
    titre: 'Votre fiche est en ligne sur DentalMap',
    blocs: [
      { type: 'texte', texte: `La fiche « ${fiche} » vient d’apparaître dans l’annuaire, après la synchronisation avec l’Annuaire Santé. Vous pouvez maintenant la revendiquer.` },
      { type: 'bouton', libelle: 'Revendiquer ma fiche', url: `${SITE}${chemin}` },
    ],
    raison: 'Vous recevez ce message parce que vous avez demandé une alerte à la création de cette fiche. Il ne sera pas renvoyé.',
  })
}

/* ------------------------------------------------------------------ */
/* École ou organisme                                                   */
/* ------------------------------------------------------------------ */

/** OAT : l'attestation de fonction est reçue, l'équipe l'examine. */
export async function envoyerAttestationRecue(to: string, etablissement: string) {
  await envoyer(to, 'Votre attestation de fonction est reçue', {
    titre: 'Votre attestation de fonction est reçue',
    blocs: [
      { type: 'texte', texte: `Nous avons bien reçu votre attestation pour « ${etablissement} ». Nous la vérifions sous 48 heures ouvrées.` },
      { type: 'texte', texte: 'Vous pouvez déjà compléter vos formations depuis votre espace : elles seront publiées dès la vérification.' },
      ESPACE,
    ],
    raison: 'Vous recevez cet email parce que vous avez déposé une attestation de fonction sur DentalMap.',
  })
}

/** Décision sur une attestation de fonction : la page de l'établissement est à vous, ou le motif du refus. */
export async function envoyerAttestationDecidee(to: string, etablissement: string, decision: { acceptee: true; lien: string } | { acceptee: false; motif: string | null }) {
  if (decision.acceptee) {
    await envoyer(to, `La page « ${etablissement} » est à vous`, {
      titre: `La page « ${etablissement} » est à vous`,
      blocs: [
        { type: 'texte', texte: `Votre attestation est acceptée : vous gérez désormais la page « ${etablissement} ». Vos formations sont publiées dès que vous les validez depuis votre espace.` },
        ESPACE,
        { type: 'lien', libelle: 'Voir la page publique', url: `${SITE}${decision.lien}` },
      ],
      raison: 'Vous recevez cet email parce que vous avez déposé une attestation de fonction sur DentalMap.',
    })
    return
  }
  await envoyer(
    to,
    `Votre attestation pour « ${etablissement} » n’a pas pu être acceptée`,
    {
      titre: 'Votre attestation n’a pas pu être acceptée',
      blocs: [
        { type: 'texte', texte: `Nous n’avons pas pu vous confier la page « ${etablissement} ».` },
        ...(decision.motif ? [{ type: 'encart' as const, texte: `Motif : ${decision.motif}` }] : []),
        { type: 'texte', texte: 'Vous pouvez répondre à cet email avec une attestation de fonction signée par la direction, datée de moins de trois mois, ou vous connecter avec une adresse sur le domaine de l’établissement.' },
      ],
      raison: `Vous recevez cet email parce que vous avez déposé une attestation de fonction sur DentalMap. Votre réponse arrive à l’équipe, à ${CONTACT}.`,
    },
    CONTACT,
  )
}

/** OA1 : la demande d'ajout est reçue ; rien n'est publié avant contrôle de l'UAI. */
export async function envoyerAjoutEtablissementRecu(to: string, nom: string) {
  await envoyer(to, 'Votre demande d’ajout est reçue', {
    titre: 'Votre demande d’ajout est reçue',
    blocs: [
      { type: 'texte', texte: `Nous avons bien reçu votre demande d’ajout de « ${nom} ». Nous vérifions le numéro UAI auprès du référentiel de l’Éducation nationale, puis nous créons la page et vous écrivons pour que vous puissiez la compléter.` },
    ],
    raison: 'Vous recevez cet email parce que vous avez demandé l’ajout d’un établissement sur DentalMap.',
  })
}

/** OA1, suite : la page demandée est créée, la personne peut la revendiquer. */
export async function envoyerEtablissementAjoute(to: string, nom: string) {
  await envoyer(to, `La page « ${nom} » est créée`, {
    titre: `La page « ${nom} » est créée`,
    blocs: [
      { type: 'texte', texte: `Le numéro UAI est vérifié et la page « ${nom} » est créée. Vous pouvez maintenant la retrouver et compléter vos formations.` },
      { type: 'bouton', libelle: 'Retrouver mon établissement', url: `${SITE}/espace-pro/organisme/etablissement/?q=${encodeURIComponent(nom)}` },
    ],
    raison: 'Vous recevez cet email parce que vous avez demandé l’ajout de cet établissement sur DentalMap.',
  })
}

/** O3b : accusé de réception d'une demande de partenariat, avec ce qui suit. */
export async function envoyerAccusePartenariat(to: string, organisme?: string) {
  await envoyer(to, 'Votre demande de partenariat est reçue', {
    titre: 'Votre demande de partenariat est reçue',
    blocs: [
      { type: 'texte', texte: `Nous avons bien reçu votre demande de partenariat${organisme ? ` pour « ${organisme} »` : ''}. Une personne de l’équipe la lit sous sept jours et vous répond à cette adresse.` },
      { type: 'texte', texte: 'Si le projet convient, nous échangerons sur une convention écrite. Cette demande ne crée pas de compte professionnel.' },
    ],
    raison: 'Vous recevez cet email parce qu’une demande de partenariat a été envoyée avec cette adresse depuis DentalMap.',
  })
}

/* ------------------------------------------------------------------ */
/* Emails à l'équipe                                                    */
/* ------------------------------------------------------------------ */

export async function envoyerDemandePartenariat(d: {
  prenom: string
  nom: string
  email: string
  organisme: string
  fonction: string
  message: string
  /** D'où vient la demande : le formulaire de l'accueil, ou le parcours O2b de l'espace pro. */
  origine?: 'accueil' | 'espace-pro'
}) {
  const nom = [d.prenom, d.nom].map((s) => s.trim()).filter(Boolean).join(' ')
  await envoyer(
    CONTACT,
    `Partenariat : ${nom}`,
    {
      titre: d.origine === 'espace-pro' ? 'Demande de partenariat depuis l’espace pro' : 'Demande de partenariat depuis l’accueil',
      salutation: null,
      interne: true,
      blocs: [
        { type: 'champs', lignes: [['Nom', nom], ['Courriel', d.email], ['Organisme', d.organisme], ['Fonction', d.fonction]] },
        { type: 'texte', texte: d.message },
      ],
      raison: `Envoyé à ${CONTACT}. « Répondre » écrit directement à l’auteur de la demande.`,
    },
    d.email,
  )
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
  const nom = [d.prenom, d.nom].map((s) => s.trim()).filter(Boolean).join(' ')
  const lignes: [string, string][] = [['Objet', d.objet], ['Nom', nom], ['Courriel', d.email]]
  if (d.telephone) lignes.push(['Téléphone', d.telephone])
  if (d.fiche) lignes.push(['Fiche concernée', d.fiche])
  await envoyer(
    CONTACT,
    `Contact (${d.objet}) : ${nom}`,
    {
      titre: 'Message depuis la page contact',
      salutation: null,
      interne: true,
      blocs: [{ type: 'champs', lignes }, { type: 'texte', texte: d.message }],
      raison: `Envoyé à ${CONTACT}. « Répondre » écrit directement à l’auteur du message.`,
    },
    d.email,
  )
}

/** Signale aux modérateurs une demande à traiter. */
export async function envoyerAModerer(objet: string, texte: string) {
  await envoyer(CONTACT, `À modérer : ${objet}`, {
    titre: `À modérer : ${objet}`,
    salutation: null,
    interne: true,
    blocs: [
      ...texte.split(/\n\s*\n/).filter(Boolean).map((t) => ({ type: 'texte' as const, texte: t.trim() })),
      { type: 'bouton', libelle: 'Ouvrir la modération', url: `${SITE}/espace-pro/moderation/` },
    ],
    raison: `Envoyé à ${CONTACT} à chaque demande à traiter.`,
  })
}

/* ------------------------------------------------------------------ */
/* Formations privées                                                   */
/* ------------------------------------------------------------------ */

/** A : la proposition est reçue ; rien n'est publié avant la vérification de l'équipe. */
export async function envoyerFormationRecue(to: string, intitule: string) {
  await envoyer(to, 'Votre proposition de formation est reçue', {
    titre: 'Votre proposition de formation est reçue',
    blocs: [
      { type: 'texte', texte: `Nous avons bien reçu votre proposition « ${intitule} ». L’équipe la vérifie avant toute publication : organisme, sessions, liens et mentions de prise en charge.` },
      { type: 'texte', texte: 'Vous recevez un email dès qu’elle est traitée. Vous pouvez suivre son état depuis votre espace.' },
      { type: 'bouton', libelle: 'Suivre mes propositions', url: `${SITE}/espace-pro/compte/formation/` },
    ],
    raison: 'Vous recevez cet email parce que vous avez proposé une formation sur DentalMap.',
  })
}

/** B : la décision de l'équipe. Acceptée et en ligne, acceptée en attente de mise en ligne, ou refusée avec le motif. */
export async function envoyerFormationDecidee(
  to: string,
  intitule: string,
  decision: { statut: 'publiee'; lien: string } | { statut: 'acceptee' } | { statut: 'refusee'; motif: string | null },
) {
  if (decision.statut === 'refusee') {
    await envoyer(
      to,
      `Votre formation « ${intitule} » n’a pas pu être publiée`,
      {
        titre: 'Votre formation n’a pas pu être publiée',
        blocs: [
          { type: 'texte', texte: `Nous n’avons pas pu publier la formation « ${intitule} ».` },
          ...(decision.motif ? [{ type: 'encart' as const, texte: `Motif : ${decision.motif}` }] : []),
          { type: 'texte', texte: 'Vous pouvez la proposer de nouveau une fois corrigée, ou répondre à cet email pour en parler avec l’équipe.' },
          { type: 'bouton', libelle: 'Proposer une formation', url: `${SITE}/espace-pro/compte/formation/` },
        ],
        raison: `Vous recevez cet email parce que vous avez proposé une formation sur DentalMap. Votre réponse arrive à l’équipe, à ${CONTACT}.`,
      },
      CONTACT,
    )
    return
  }
  const enLigne = decision.statut === 'publiee'
  await envoyer(to, enLigne ? `Votre formation « ${intitule} » est en ligne` : `Votre formation « ${intitule} » est acceptée`, {
    titre: enLigne ? 'Votre formation est en ligne' : 'Votre formation est acceptée',
    blocs: [
      {
        type: 'texte',
        texte: enLigne
          ? `La formation « ${intitule} » est publiée dans la rubrique des formations privées. Les praticiens qui suivent ce thème en sont prévenus.`
          : `La formation « ${intitule} » est acceptée. Elle sera mise en ligne sous peu ; nous vous écrivons à sa publication.`,
      },
      ...(enLigne ? [{ type: 'bouton' as const, libelle: 'Voir la formation', url: `${SITE}${decision.lien}` }] : []),
      { type: 'encart', texte: 'Les mentions de prise en charge s’affichent « déclarées par l’organisme » tant que l’équipe ne les a pas vérifiées à leur source.' },
    ],
    raison: 'Vous recevez cet email parce que vous avez proposé une formation sur DentalMap.',
  })
}

/** C : confirmer l'alerte (inscription sans compte). */
export async function envoyerConfirmationAlerteFormation(to: string, jeton: string) {
  const url = `${SITE}/formation/alerte/confirmer/${jeton}/`
  await envoyer(to, 'Confirmez votre alerte formations', {
    titre: 'Confirmez votre alerte formations',
    blocs: [
      { type: 'texte', texte: 'Vous avez demandé à être prévenu des nouvelles formations publiées sur DentalMap. Confirmez votre adresse pour activer l’alerte.' },
      { type: 'bouton', libelle: 'Confirmer mon alerte', url },
      { type: 'lienBrut', url },
      { type: 'encart', texte: 'Un email par semaine au plus, seulement s’il y a du nouveau. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : rien ne sera envoyé.' },
    ],
    raison: 'Vous recevez cet email parce que cette adresse a été inscrite à l’alerte formations de DentalMap.',
  })
}

/** C : les formations nouvellement publiées qui répondent à l'alerte, une fois par semaine au plus. */
export async function envoyerAlerteFormation(to: string, jeton: string, formations: { intitule: string; organisme: string; detail: string; lien: string }[]) {
  const desinscription = `${SITE}/formation/alerte/desinscrire/${jeton}/`
  await envoyer(to, formations.length > 1 ? `${formations.length} nouvelles formations pour vous` : 'Une nouvelle formation pour vous', {
    titre: formations.length > 1 ? `${formations.length} nouvelles formations` : 'Une nouvelle formation',
    blocs: [
      { type: 'texte', texte: 'Ces formations viennent d’être publiées et répondent à votre alerte.' },
      ...formations.flatMap((f) => [
        { type: 'champs' as const, lignes: [['Formation', f.intitule], ['Organisme', f.organisme], ['Repères', f.detail]] as [string, string][] },
        { type: 'lien' as const, libelle: 'Voir la formation', url: `${SITE}${f.lien}` },
      ]),
      { type: 'lien', libelle: 'Me désinscrire de l’alerte', url: desinscription },
    ],
    raison: 'Vous recevez cet email parce que vous avez confirmé une alerte formations sur DentalMap. Un clic sur « Me désinscrire » l’arrête.',
  })
}
