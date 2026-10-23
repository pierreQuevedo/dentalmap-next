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
/** Le mot d'accueil, selon le profil choisi à l'inscription : une école n'a pas de fiche de soignant à retrouver. */
export async function envoyerBienvenue(to: string, nom?: string | null, role?: string | null) {
  const ecole = role === 'organisme'
  await envoyer(to, 'Bienvenue sur DentalMap', {
    titre: 'Bienvenue sur DentalMap',
    salutation: `Bonjour${nom ? ` ${nom}` : ''},`,
    blocs: [
      { type: 'texte', texte: 'Votre compte DentalMap est ouvert. Vous pouvez y revenir à tout moment avec votre adresse et votre mot de passe.' },
      { type: 'lien', libelle: 'Se connecter à DentalMap', url: `${SITE}/connexion/` },
      ecole
        ? { type: 'texte', texte: 'Votre espace établissement vous attend pour retrouver votre école ou votre faculté, compléter ses formations et la publier.' }
        : { type: 'texte', texte: 'Si vous êtes chirurgien-dentiste ou prothésiste, votre espace professionnel vous attend pour retrouver votre fiche et la compléter.' },
      ecole ? { type: 'bouton', libelle: 'Ouvrir mon espace établissement', url: `${SITE}/espace-pro/organisme/` } : ESPACE,
    ],
    raison: 'Vous recevez cet email parce qu’un compte DentalMap vient d’être créé avec cette adresse.',
  })
}

/* ------------------------------------------------------------------ */
/* Revendication d'une fiche                                            */
/* ------------------------------------------------------------------ */

/** Accusé de réception d'une demande examinée par l'équipe : revendication, ou retrait de la fiche. */
export async function envoyerRevendicationRecue(to: string, fiche: string, objet: 'revendication' | 'retrait' = 'revendication', contestation = false) {
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
          {
            type: 'texte',
            texte: contestation
              ? 'Cette fiche est déjà gérée par un autre compte : l’équipe examine votre justificatif et vous écrit dès sa décision. Vous ne pouvez pas la modifier d’ici là.'
              : 'En attendant, vous pouvez déjà préparer vos horaires, vos langues et l’accessibilité de vos locaux.',
          },
          ESPACE,
        ],
    raison: 'Vous recevez cet email parce que vous avez demandé à gérer ou à retirer une fiche sur DentalMap.',
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

/** Le parrainage : un confrère invite cette adresse à revendiquer sa fiche. `relance` : le rappel, sept jours après. */
export async function envoyerInvitationParrainage(to: string, parrain: string, code: string, relance = false) {
  const url = `${SITE}/parrainage/${code}/`
  await envoyer(to, relance ? `Rappel : ${parrain} vous invite sur DentalMap` : `${parrain} vous invite à prendre la main sur votre fiche DentalMap`, {
    titre: `${parrain} vous invite sur DentalMap`,
    blocs: [
      { type: 'texte', texte: `${parrain} vous invite à revendiquer votre fiche sur DentalMap, l’annuaire des professionnels du dentaire établi à partir des registres officiels.` },
      { type: 'texte', texte: 'Votre fiche existe déjà. En la revendiquant, vous complétez ce que les patients cherchent : horaires, conventionnement, accueil, photo et présentation.' },
      { type: 'encart', texte: `Une fois votre identité vérifiée, votre fiche et celle de ${parrain} gagnent chacune un bonus de mise en avant pendant 90 jours.` },
      { type: 'bouton', libelle: 'Revendiquer ma fiche', url },
      { type: 'lienBrut', url },
      { type: 'lien', libelle: 'Ne plus recevoir d’invitation', url: `${SITE}/parrainage/${code}/desinscription/` },
    ],
    raison: `Vous recevez cet email parce que ${parrain} a invité cette adresse sur DentalMap. ${relance ? 'C’est le seul rappel.' : 'Vous recevrez au plus un rappel.'}`,
  })
}

/** Le parrainage a réussi : le filleul est vérifié, les deux fiches ont leur bonus. */
export async function envoyerParrainageReussi(to: string, autre: string, role: 'parrain' | 'filleul', jusquau: Date) {
  const date = jusquau.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  await envoyer(to, 'Votre bonus de parrainage est actif', {
    titre: 'Votre bonus de parrainage est actif',
    blocs: [
      {
        type: 'texte',
        texte: role === 'parrain' ? `${autre} a revendiqué sa fiche et son identité est vérifiée : votre parrainage a réussi.` : `Votre identité est vérifiée : le parrainage de ${autre} a réussi.`,
      },
      { type: 'encart', texte: `Votre fiche bénéficie d’un bonus de mise en avant jusqu’au ${date}. ${role === 'parrain' ? 'Chaque nouveau parrainage réussi en ajoute un.' : 'Parrainez à votre tour un confrère pour en gagner un autre.'}` },
      { type: 'bouton', libelle: 'Parrainer un confrère', url: `${SITE}/espace-pro/partager/` },
    ],
    raison: 'Vous recevez cet email parce que vous gérez une fiche sur DentalMap.',
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

/**
 * Rappel de fraîcheur : les informations déclarées qui approchent de leur
 * échéance ou l'ont passée. Un par fiche et par mois au plus ; le lien du
 * bas coupe les rappels de cette fiche.
 */
export async function envoyerRappelFraicheur(to: string, fiche: string, slug: string, blocs: [string, string][], jetonCoupure: string) {
  const n = blocs.length
  await envoyer(to, n > 1 ? `${n} informations de votre fiche à reconfirmer` : 'Une information de votre fiche à reconfirmer', {
    titre: n > 1 ? `${n} informations à reconfirmer` : 'Une information à reconfirmer',
    blocs: [
      { type: 'texte', texte: `Sur la fiche « ${fiche} », ces informations n’ont pas été confirmées depuis longtemps. Si rien n’a changé, une confirmation suffit : un clic par bloc.` },
      { type: 'champs', lignes: blocs },
      { type: 'bouton', libelle: 'Reconfirmer mes informations', url: `${SITE}/espace-pro/fraicheur/?fiche=${encodeURIComponent(slug)}` },
      { type: 'texte', texte: 'Des horaires non confirmés depuis six mois sont signalés aux patients sur la fiche.' },
      { type: 'lien', libelle: 'Ne plus recevoir ces rappels pour cette fiche', url: `${SITE}/rappels/couper/${jetonCoupure}/` },
    ],
    raison: 'Vous recevez cet email parce que vous gérez cette fiche sur DentalMap.',
  })
}

/** Plus aucun clic venu de Google depuis 30 jours : le lien a peut-être été retiré de la fiche Google. */
export async function envoyerLienGoogleInactif(to: string, fiche: string, slug: string, jetonCoupure: string) {
  await envoyer(to, 'Votre lien DentalMap est-il toujours sur votre fiche Google ?', {
    titre: 'Votre lien est-il toujours sur Google ?',
    blocs: [
      { type: 'texte', texte: `Depuis 30 jours, aucun patient n’est arrivé sur la fiche « ${fiche} » depuis votre fiche Google. Le lien a peut-être été retiré ou remplacé.` },
      { type: 'texte', texte: 'Vérifiez votre fiche d’établissement Google : le lien DentalMap doit figurer dans « Site web » ou « Lien de prise de rendez-vous ». Il se revalide tout seul au prochain clic.' },
      { type: 'bouton', libelle: 'Retrouver mon lien', url: `${SITE}/espace-pro/partager/?fiche=${encodeURIComponent(slug)}` },
      { type: 'lien', libelle: 'Ne plus recevoir ces rappels pour cette fiche', url: `${SITE}/rappels/couper/${jetonCoupure}/` },
    ],
    raison: 'Vous recevez cet email parce que vous gérez cette fiche sur DentalMap.',
  })
}

/** Un lien du cabinet ne répond plus depuis deux semaines : il est masqué sur la fiche. */
export async function envoyerLienMasque(to: string, fiche: string, slug: string, liens: string[], jetonCoupure: string) {
  await envoyer(to, liens.length > 1 ? 'Deux liens de votre fiche ne répondent plus' : 'Un lien de votre fiche ne répond plus', {
    titre: liens.length > 1 ? 'Deux liens ne répondent plus' : 'Un lien ne répond plus',
    blocs: [
      { type: 'texte', texte: `Nous testons chaque semaine les liens de la fiche « ${fiche} ». Ces adresses n’ont pas répondu deux semaines de suite : leurs boutons sont masqués pour les patients.` },
      { type: 'champs', lignes: liens.map((l) => ['Lien', l] as [string, string]) },
      { type: 'bouton', libelle: 'Corriger les liens', url: `${SITE}/espace-pro/missions/liens/?fiche=${encodeURIComponent(slug)}` },
      { type: 'texte', texte: 'Dès que vous enregistrez une adresse, le bouton réapparaît et le test reprend.' },
      { type: 'lien', libelle: 'Ne plus recevoir ces rappels pour cette fiche', url: `${SITE}/rappels/couper/${jetonCoupure}/` },
    ],
    raison: 'Vous recevez cet email parce que vous gérez cette fiche sur DentalMap.',
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
  origine?: 'accueil' | 'espace-pro' | 'partenaires' | 'contact'
}) {
  const nom = [d.prenom, d.nom].map((s) => s.trim()).filter(Boolean).join(' ')
  await envoyer(
    CONTACT,
    `Partenariat : ${nom}`,
    {
      titre: d.origine === 'espace-pro' ? 'Demande de partenariat depuis l’espace pro' : d.origine === 'partenaires' ? 'Demande de partenariat depuis la page Devenir partenaire' : d.origine === 'contact' ? 'Demande de partenariat depuis la page contact' : 'Demande de partenariat depuis l’accueil',
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
  details?: { libelle: string; valeur: string }[]
  message: string
}) {
  const nom = [d.prenom, d.nom].map((s) => s.trim()).filter(Boolean).join(' ')
  const lignes: [string, string][] = [['Objet', d.objet], ['Nom', nom], ['Courriel', d.email]]
  if (d.telephone) lignes.push(['Téléphone', d.telephone])
  for (const x of d.details ?? []) lignes.push([x.libelle, x.valeur])
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

/* ------------------------------------------------------------------ */
/* Annonces de cession                                                  */
/* ------------------------------------------------------------------ */

/**
 * Un repreneur a écrit au cédant depuis l'annonce. Le message est rangé dans
 * la messagerie de l'espace pro ; l'email en donne un extrait, sans
 * l'adresse du repreneur : la réponse passe par la messagerie.
 */
export async function envoyerNouveauMessageCession(to: string, titreAnnonce: string, extrait: string, urlMessagerie: string) {
  await envoyer(to, `Nouveau message pour votre annonce « ${titreAnnonce} »`, {
    titre: 'Un repreneur vous a écrit',
    blocs: [
      { type: 'texte', texte: `Un praticien s’intéresse à votre annonce « ${titreAnnonce} » et vous a écrit :` },
      { type: 'encart', texte: extrait },
      { type: 'bouton', libelle: 'Lire et répondre', url: `${SITE}${urlMessagerie}` },
      { type: 'texte', texte: 'Vos coordonnées ne lui sont pas transmises : vous choisissez ce que vous lui communiquez dans votre réponse.' },
    ],
    raison: 'Vous recevez cet email parce que vous avez publié une annonce de cession sur DentalMap.',
  })
}

/** Confirmer l'alerte cessions (inscription sans compte). */
export async function envoyerConfirmationAlerteCession(to: string, jeton: string) {
  const url = `${SITE}/annonces/cession/alerte/confirmer/${jeton}/`
  await envoyer(to, 'Confirmez votre alerte cessions de cabinet', {
    titre: 'Confirmez votre alerte cessions',
    blocs: [
      { type: 'texte', texte: 'Vous avez demandé à être prévenu des nouvelles annonces de cession de cabinet publiées sur DentalMap. Confirmez votre adresse pour activer l’alerte.' },
      { type: 'bouton', libelle: 'Confirmer mon alerte', url },
      { type: 'lienBrut', url },
      { type: 'encart', texte: 'Un email par semaine au plus, seulement s’il y a du nouveau. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : rien ne sera envoyé.' },
    ],
    raison: 'Vous recevez cet email parce que cette adresse a été inscrite à l’alerte cessions de DentalMap.',
  })
}

/** Les annonces de cession nouvellement publiées qui répondent à l'alerte, une fois par semaine au plus. */
export async function envoyerAlerteCession(to: string, jeton: string, annonces: { titre: string; detail: string; lien: string }[]) {
  const desinscription = `${SITE}/annonces/cession/alerte/desinscrire/${jeton}/`
  const plusieurs = annonces.length > 1
  await envoyer(to, plusieurs ? `${annonces.length} nouvelles cessions de cabinet` : 'Une nouvelle cession de cabinet', {
    titre: plusieurs ? `${annonces.length} nouvelles cessions de cabinet` : 'Une nouvelle cession de cabinet',
    blocs: [
      { type: 'texte', texte: 'Ces annonces viennent d’être publiées et répondent à votre alerte.' },
      ...annonces.flatMap((a) => [
        { type: 'champs' as const, lignes: [['Annonce', a.titre], ['Repères', a.detail]] as [string, string][] },
        { type: 'lien' as const, libelle: 'Voir l’annonce', url: `${SITE}${a.lien}` },
      ]),
      { type: 'lien', libelle: 'Me désinscrire de l’alerte', url: desinscription },
    ],
    raison: 'Vous recevez cet email parce que vous avez confirmé une alerte cessions sur DentalMap. Un clic sur « Me désinscrire » l’arrête.',
  })
}

/* ------------------------------------------------------------------ */
/* Emploi                                                               */
/* ------------------------------------------------------------------ */

/** Confirmer l'alerte emploi (inscription sans compte). */
export async function envoyerConfirmationAlerteEmploi(to: string, jeton: string) {
  const url = `${SITE}/emploi/alerte/confirmer/${jeton}/`
  await envoyer(to, 'Confirmez votre alerte emploi', {
    titre: 'Confirmez votre alerte emploi',
    blocs: [
      { type: 'texte', texte: 'Vous avez demandé à recevoir les nouvelles offres d’emploi publiées sur DentalMap. Confirmez votre adresse pour activer l’alerte.' },
      { type: 'bouton', libelle: 'Confirmer mon alerte', url },
      { type: 'lienBrut', url },
      { type: 'encart', texte: 'Un email par semaine au plus, seulement s’il y a du nouveau. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : rien ne sera envoyé.' },
    ],
    raison: 'Vous recevez cet email parce que cette adresse a été inscrite à une alerte emploi de DentalMap.',
  })
}

/* ------------------------------------------------------------------ */
/* Candidatures                                                         */
/* ------------------------------------------------------------------ */

/** Au recruteur : une candidature arrive sur l'une de ses offres, avec les coordonnées pour la contacter directement. */
export async function envoyerNouvelleCandidature(to: string, d: { offre: string; candidat: string; email: string; telephone: string; url: string }) {
  await envoyer(to, `Nouvelle candidature : ${d.offre}`, {
    titre: 'Une nouvelle candidature',
    blocs: [
      { type: 'texte', texte: `${d.candidat} a postulé à votre offre « ${d.offre} ».` },
      {
        type: 'champs',
        lignes: [
          ['Téléphone', d.telephone],
          ['Email', d.email],
        ],
      },
      { type: 'bouton', libelle: 'Voir la candidature', url: `${SITE}${d.url}` },
      { type: 'texte', texte: 'Appelez ou écrivez directement à la personne. Indiquez ensuite dans votre espace si elle est retenue ou non.' },
    ],
    raison: 'Vous recevez cet email parce que vous avez publié une offre d’emploi sur DentalMap.',
  })
}

/** Au recruteur : son offre arrive au bout des 15 jours sans confirmation ; un clic la garde dans la recherche. */
export async function envoyerRappelConfirmationOffre(to: string, d: { offre: string; avant: Date; url: string }) {
  const date = d.avant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  await envoyer(to, `Votre offre « ${d.offre} » est-elle toujours d’actualité ?`, {
    titre: 'Votre offre est-elle toujours d’actualité ?',
    blocs: [
      { type: 'texte', texte: `Confirmez votre offre « ${d.offre} » avant le ${date} : elle reste alors dans la recherche d’emploi et sur votre fiche pour 15 jours de plus.` },
      { type: 'bouton', libelle: 'Confirmer mon offre', url: `${SITE}${d.url}` },
      { type: 'texte', texte: 'Sans confirmation, elle sort de la recherche. Elle n’est pas supprimée : vous la remettez en ligne d’un clic depuis votre espace.' },
    ],
    raison: 'Vous recevez cet email parce que vous avez publié une offre d’emploi sur DentalMap.',
  })
}

/** Au recruteur : faute de confirmation, son offre est sortie de la recherche ; elle reste dans son espace. */
export async function envoyerOffreNonConfirmee(to: string, d: { offre: string; url: string }) {
  await envoyer(to, `Votre offre « ${d.offre} » n’est plus visible`, {
    titre: 'Votre offre n’est plus visible',
    blocs: [
      { type: 'texte', texte: `Faute de confirmation depuis 15 jours, votre offre « ${d.offre} » n’apparaît plus dans la recherche d’emploi ni sur votre fiche.` },
      { type: 'bouton', libelle: 'Remettre mon offre en ligne', url: `${SITE}${d.url}` },
      { type: 'texte', texte: 'Elle n’est pas supprimée, et ses candidatures non plus. Si le poste est pourvu, indiquez-le depuis la même page.' },
    ],
    raison: 'Vous recevez cet email parce que vous avez publié une offre d’emploi sur DentalMap.',
  })
}

/** À un profil disponible : un recruteur l'invite à postuler à l'une de ses offres. Rien n'est transmis au recruteur. */
export async function envoyerInvitationAPostuler(to: string, d: { recruteur: string; offre: string; message: string | null; url: string }) {
  await envoyer(to, `${d.recruteur} vous invite à postuler`, {
    titre: 'Un recruteur vous invite à postuler',
    blocs: [
      { type: 'texte', texte: `${d.recruteur} a vu votre profil parmi les profils disponibles et vous propose son offre « ${d.offre} ».` },
      ...(d.message ? [{ type: 'encart' as const, texte: d.message }] : []),
      { type: 'bouton', libelle: 'Voir l’offre et postuler', url: `${SITE}${d.url}` },
      { type: 'texte', texte: 'Le recruteur n’a pas vos coordonnées : elles ne lui sont transmises que si vous postulez.' },
    ],
    raison: 'Vous recevez cet email parce que votre profil candidat est visible des recruteurs vérifiés sur DentalMap. Vous pouvez le rendre discret à tout moment.',
  })
}

/** Au candidat : sa candidature n'est pas retenue, ou l'offre est pourvue. */
export async function envoyerCandidatureNonRetenue(to: string, recruteur: string, offre: string) {
  await envoyer(to, `Votre candidature : ${offre}`, {
    titre: 'Votre candidature n’a pas été retenue',
    blocs: [
      { type: 'texte', texte: `${recruteur} vous remercie pour votre candidature à l’offre « ${offre} », qui n’a pas été retenue.` },
      { type: 'bouton', libelle: 'Voir d’autres offres', url: `${SITE}/emploi/` },
      { type: 'texte', texte: 'Votre candidature et votre CV sont supprimés 6 mois après la clôture de l’offre.' },
    ],
    raison: 'Vous recevez cet email parce que vous avez postulé à une offre d’emploi sur DentalMap.',
  })
}

/** L'alerte emploi : les nouvelles offres qui répondent aux critères, par distance. */
export async function envoyerAlerteEmploi(to: string, d: { titre: string; offres: { titre: string; detail: string; lien: string }[]; gerer: { libelle: string; url: string } }) {
  const plusieurs = d.offres.length > 1
  const objet = plusieurs ? `${d.offres.length} nouvelles offres : ${d.titre}` : `Une nouvelle offre : ${d.titre}`
  await envoyer(to, objet, {
    titre: plusieurs ? `${d.offres.length} nouvelles offres d’emploi` : 'Une nouvelle offre d’emploi',
    blocs: [
      { type: 'texte', texte: `Ces offres viennent d’être publiées et répondent à votre alerte « ${d.titre} ». La rémunération est toujours affichée.` },
      ...d.offres.flatMap((o) => [
        { type: 'champs' as const, lignes: [['Offre', o.titre], ['Repères', o.detail]] as [string, string][] },
        { type: 'lien' as const, libelle: 'Voir l’offre', url: `${SITE}${o.lien}` },
      ]),
      { type: 'lien', libelle: d.gerer.libelle, url: `${SITE}${d.gerer.url}` },
    ],
    raison: 'Vous recevez cet email parce que vous avez créé une alerte emploi sur DentalMap. Vous pouvez la mettre en pause ou l’arrêter à tout moment.',
  })
}
