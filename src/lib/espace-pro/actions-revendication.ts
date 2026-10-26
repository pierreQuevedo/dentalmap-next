'use server'

import { avertirTitulaire } from './contestation'
import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerAModerer, envoyerMandatAuGerant, envoyerRevendicationRecue } from '@/lib/email'
import { nomAffiche } from '@/lib/annuaire/types'
import { exigerConnexion } from '@/lib/tunnel/compte'
import { cheminInterne } from '@/lib/tunnel/etapes'
import { COOKIE_IDENTITE, descellerIdentite } from '@/lib/psc/etat'
import { accorderParPsc } from './revendication'
import { getFicheRevendication } from './parcours'
import { controlerJustificatif, rangerJustificatif, typeDepuisNom } from './justificatif'
import { nettoyerRpps, rppsValide } from './rpps'
import { nettoyerNumero, siretValide } from './labo'
import { consulterSiret } from './sirene'
import { DELAI_ANNULATION_RETRAIT_JOURS, REVENDIQUER, apresAccord } from './chemins'

/**
 * Les actions du parcours de revendication d'un soignant.
 *
 * Aucune n'accorde une fiche sur parole : seules Pro Santé Connect (le
 * registre répond lui-même) et la décision de l'équipe (Kbis d'un
 * laboratoire, demande examinée avec le praticien) donnent la main. Le reste enregistre une intention : une alerte, un choix
 * de lieux, une demande à examiner.
 */

/* ------------------------------------------------------------------ */
/* PSC2 : confirmer la fiche retrouvée par Pro Santé Connect           */
/* ------------------------------------------------------------------ */

export async function confirmerPsc(): Promise<never> {
  const compte = await exigerConnexion(`${REVENDIQUER}/psc/confirmer/`)
  const pot = await cookies()
  const identite = descellerIdentite(pot.get(COOKIE_IDENTITE)?.value, compte.id)
  if (!identite) redirect(chemin(`${REVENDIQUER}/psc/erreur/?code=etat`))
  const fiche = await getFicheRevendication(identite.fiche, compte.id)
  if (!fiche || fiche.rpps !== identite.rpps) redirect(chemin(`${REVENDIQUER}/psc/erreur/?code=fiche`))
  pot.set(COOKIE_IDENTITE, '', { path: `${REVENDIQUER}/`, maxAge: 0 })

  // Déjà gérée par un autre compte : la preuve est forte, mais l'autre compte a sept jours pour répondre.
  if (fiche.gereeParUnAutre) {
    await db.execute(sql`
      INSERT INTO revendications (id, praticien_id, user_id, statut, methode, identifiant_psc, rpps_verifie, message)
      VALUES (${randomUUID()}, ${fiche.id}, ${compte.id}::uuid, 'en_attente', 'pro_sante_connect', ${identite.identifiantNational}, ${identite.rpps},
              'Contestation : identité prouvée par Pro Santé Connect, fiche déjà gérée par un autre compte.')
      ON CONFLICT (praticien_id, user_id) DO UPDATE SET statut = 'en_attente', methode = 'pro_sante_connect', objet = 'revendication',
        identifiant_psc = EXCLUDED.identifiant_psc, rpps_verifie = EXCLUDED.rpps_verifie, message = EXCLUDED.message, demande_le = now()
    `)
    await envoyerAModerer(`contestation de ${nomAffiche(fiche)}`, `Le compte ${compte.email} a prouvé par Pro Santé Connect être ${nomAffiche(fiche)} (RPPS ${identite.rpps}), fiche déjà gérée par un autre compte. Délai de réponse : 7 jours.`)
    await avertirTitulaire(fiche.id, compte.id, nomAffiche(fiche)).catch((e) => console.error('[contestation] titulaire', e))
    redirect(chemin(`${REVENDIQUER}/suivi/?fiche=${encodeURIComponent(fiche.slug)}`))
  }

  await accorderParPsc({ praticienId: fiche.id, userId: compte.id, identifiantNational: identite.identifiantNational, rpps: identite.rpps })
  revalidateTag('annuaire', 'max')
  redirect(chemin(apresAccord(fiche.slug, fiche.lieux.length)))
}

/* ------------------------------------------------------------------ */
/* JD1 : déposer un justificatif                                       */
/* ------------------------------------------------------------------ */

export async function deposerJustificatif(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const objet = donnees.get('objet') === 'retrait' ? 'retrait' : 'revendication'
  const ici = `${REVENDIQUER}/${encodeURIComponent(slug)}/justificatif/${objet === 'retrait' ? '?objet=retrait' : ''}`
  const compte = await exigerConnexion(ici)
  const fiche = await getFicheRevendication(slug, compte.id)
  if (!fiche) redirect(chemin(`${REVENDIQUER}/`))
  // Un soignant ne dépose plus de document (JD1 retiré) : seul le Kbis d'un laboratoire passe ici.
  if (fiche.profession !== 'prothesiste') redirect(chemin(`${REVENDIQUER}/${encodeURIComponent(fiche.slug)}/methode/${objet === 'retrait' ? '?objet=retrait' : ''}`))

  const avecErreur = (message: string) => chemin(`${ici}${ici.includes('?') ? '&' : '?'}erreur=${encodeURIComponent(message)}`)

  // Deux arrivées par document : le chemin d'un fichier déjà téléversé vers
  // le stockage privé (production), ou le fichier lui-même (développement).
  const lireDocument = async (nom: string, requis: boolean): Promise<{ rangement: string; nom: string; taille: number } | null> => {
    const televerse = String(donnees.get(`chemin_${nom}`) ?? '')
    const nomFichier = String(donnees.get(`nom_${nom}`) ?? nom)
    const tailleFichier = Number(donnees.get(`taille_${nom}`) ?? 0)
    if (televerse) {
      if (!televerse.startsWith(`justificatifs/${fiche.id}/`)) redirect(avecErreur('Le document n’a pas pu être rattaché à cette fiche.'))
      // Kbis et mandat en PDF seulement, comme le justificatif d'un soignant.
      const controle = controlerJustificatif({ type: typeDepuisNom(televerse), size: tailleFichier || 1, name: nomFichier }, { pdfSeul: true })
      if (!controle.ok) redirect(avecErreur(controle.erreur))
      return { rangement: `blob:${televerse}`, nom: nomFichier, taille: tailleFichier }
    }
    const fichier = donnees.get(nom)
    if (!(fichier instanceof File) || !fichier.size) {
      if (requis) redirect(avecErreur('Choisissez un fichier.'))
      return null
    }
    const controle = controlerJustificatif(fichier, { pdfSeul: true })
    if (!controle.ok) redirect(avecErreur(controle.erreur))
    return { rangement: await rangerJustificatif(fichier, fiche.id), nom: fichier.name, taille: fichier.size }
  }
  const document = (await lireDocument('document', true))!
  const rangement = document.rangement
  const nomFichier = document.nom
  const tailleFichier = document.taille

  // Laboratoire : le rôle déclaré, et pour un salarié mandaté le mandat et l'adresse du gérant.
  const role = (['gerant', 'mandate'] as const).find((r) => r === donnees.get('role')) ?? null
  const mandat = role === 'mandate' ? await lireDocument('mandat', true) : null
  const gerantEmail = role === 'mandate' ? String(donnees.get('gerantEmail') ?? '').trim().toLowerCase() : null
  if (role === 'mandate' && !z.string().email().safeParse(gerantEmail).success) redirect(avecErreur('Indiquez l’adresse électronique du gérant.'))
  const connus = new Set(fiche.lieux.map((l) => l.id))
  const lieux = String(donnees.get('lieux') ?? '').split(',').filter((id) => connus.has(id))

  await db.execute(sql`
    INSERT INTO revendications (id, praticien_id, user_id, statut, methode, objet, justificatif_chemin, justificatif_nom, justificatif_taille,
                                role_labo, mandat_chemin, mandat_nom, gerant_email, lieux_geres)
    VALUES (${randomUUID()}, ${fiche.id}, ${compte.id}::uuid, 'en_attente', 'justificatif', ${objet}, ${rangement}, ${nomFichier.slice(0, 200)}, ${tailleFichier},
            ${role}, ${mandat?.rangement ?? null}, ${mandat?.nom.slice(0, 200) ?? null}, ${gerantEmail}, ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(lieux)}::jsonb))::text[])
    ON CONFLICT (praticien_id, user_id) DO UPDATE SET
      statut = 'en_attente', methode = 'justificatif', objet = EXCLUDED.objet,
      justificatif_chemin = EXCLUDED.justificatif_chemin, justificatif_nom = EXCLUDED.justificatif_nom, justificatif_taille = EXCLUDED.justificatif_taille,
      role_labo = EXCLUDED.role_labo, mandat_chemin = EXCLUDED.mandat_chemin, mandat_nom = EXCLUDED.mandat_nom, gerant_email = EXCLUDED.gerant_email,
      lieux_geres = EXCLUDED.lieux_geres,
      motif_refus = NULL, commentaire_refus = NULL, traite_le = NULL, demande_le = now()
  `)
  const nom = nomAffiche(fiche)
  try {
    await Promise.all([
      envoyerRevendicationRecue(compte.email, nom, objet, fiche.gereeParUnAutre),
      ...(gerantEmail ? [envoyerMandatAuGerant(gerantEmail, nom, compte.nom || compte.email)] : []),
      envoyerAModerer(
        `${objet === 'retrait' ? 'retrait' : 'justificatif'} pour ${nom}`,
        `Le compte ${compte.email} a déposé ${role === 'mandate' ? 'un Kbis et un mandat' : role === 'gerant' ? 'un Kbis' : 'un justificatif'} (${nomFichier}) pour ${objet === 'retrait' ? 'retirer' : 'revendiquer'} la fiche ${nom}${fiche.gereeParUnAutre ? ', déjà gérée par un autre compte (contestation, 7 jours)' : ''}. À examiner sous 48 heures ouvrées.`,
      ),
    ])
  } catch (e) {
    console.error('[revendication] courriel du Kbis', e)
  }
  // Contestation : le titulaire a sept jours pour répondre.
  if (fiche.gereeParUnAutre && objet === 'revendication') await avertirTitulaire(fiche.id, compte.id, nom).catch((e) => console.error('[contestation] titulaire', e))
  // Comme côté dentiste, rien ne bloque : le laboratoire enchaîne sur sa fiche, en brouillon jusqu'à l'accord.
  // Un retrait, ou une contestation (la fiche a déjà un titulaire), attend la décision.
  const attendre = objet === 'retrait' || fiche.gereeParUnAutre
  redirect(chemin(attendre ? `${REVENDIQUER}/suivi/?fiche=${encodeURIComponent(fiche.slug)}` : `/espace-pro/laboratoire/onboarding/?fiche=${encodeURIComponent(fiche.slug)}&demande=1`))
}

/* ------------------------------------------------------------------ */
/* S3b : demander à l'équipe                                           */
/* ------------------------------------------------------------------ */

/**
 * Sans carte CPS ni e-CPS : la demande part à l'équipe, qui vérifie à la main
 * (appel au cabinet, échange par email). Elle crée une revendication en
 * attente : le praticien prépare sa fiche en brouillon, rien n'est publié
 * avant l'accord. Aucun document n'est demandé.
 */
export async function demanderEquipe(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const objet = donnees.get('objet') === 'retrait' ? 'retrait' : 'revendication'
  const ici = `${REVENDIQUER}/${encodeURIComponent(slug)}/equipe/${objet === 'retrait' ? '?objet=retrait' : ''}`
  const compte = await exigerConnexion(ici)
  const fiche = await getFicheRevendication(slug, compte.id)
  if (!fiche) redirect(chemin(`${REVENDIQUER}/`))
  const telephone = String(donnees.get('telephone') ?? '').trim().slice(0, 30)
  const mot = String(donnees.get('message') ?? '').trim().slice(0, 1000)
  const message = [telephone && `Téléphone : ${telephone}`, mot, fiche.gereeParUnAutre && 'Contestation : fiche déjà gérée par un autre compte.'].filter(Boolean).join('\n') || null

  // Le justificatif PDF, obligatoire : déjà téléversé en stockage privé, ou envoyé avec le formulaire.
  const avecErreur = (texte: string) => chemin(`${ici}${ici.includes('?') ? '&' : '?'}erreur=${encodeURIComponent(texte)}`)
  const televerse = String(donnees.get('chemin_document') ?? '')
  const nomFichier = String(donnees.get('nom_document') ?? 'justificatif.pdf').slice(0, 200)
  let rangement: string
  let tailleFichier = Number(donnees.get('taille_document') ?? 0)
  if (televerse) {
    if (!televerse.startsWith(`justificatifs/${fiche.id}/`)) redirect(avecErreur('Le document n’a pas pu être rattaché à cette fiche.'))
    const controle = controlerJustificatif({ type: typeDepuisNom(televerse), size: tailleFichier || 1, name: nomFichier }, { pdfSeul: true })
    if (!controle.ok) redirect(avecErreur(controle.erreur))
    rangement = `blob:${televerse}`
  } else {
    const fichier = donnees.get('document')
    if (!(fichier instanceof File) || !fichier.size) redirect(avecErreur('Joignez votre justificatif en PDF.'))
    const controle = controlerJustificatif(fichier, { pdfSeul: true })
    if (!controle.ok) redirect(avecErreur(controle.erreur))
    rangement = await rangerJustificatif(fichier, fiche.id)
    tailleFichier = fichier.size
  }

  await db.execute(sql`
    INSERT INTO revendications (id, praticien_id, user_id, statut, methode, objet, message, justificatif_chemin, justificatif_nom, justificatif_taille)
    VALUES (${randomUUID()}, ${fiche.id}, ${compte.id}::uuid, 'en_attente', 'justificatif', ${objet}, ${message}, ${rangement}, ${nomFichier}, ${tailleFichier})
    ON CONFLICT (praticien_id, user_id) DO UPDATE SET
      statut = 'en_attente', methode = 'justificatif', objet = EXCLUDED.objet, message = EXCLUDED.message,
      justificatif_chemin = EXCLUDED.justificatif_chemin, justificatif_nom = EXCLUDED.justificatif_nom, justificatif_taille = EXCLUDED.justificatif_taille,
      motif_refus = NULL, commentaire_refus = NULL, traite_le = NULL, demande_le = now()
  `)
  const nom = nomAffiche(fiche)
  try {
    await Promise.all([
      envoyerRevendicationRecue(compte.email, nom, objet, fiche.gereeParUnAutre),
      envoyerAModerer(
        `${objet === 'retrait' ? 'retrait' : 'revendication'} sans carte pour ${nom}`,
        `Le compte ${compte.email} demande à ${objet === 'retrait' ? 'retirer' : 'gérer'} la fiche ${nom} (RPPS ${fiche.rpps ?? 'aucun'}), sans carte CPS ni e-CPS, justificatif PDF joint (${nomFichier}), à examiner dans « Demandes à valider » du back-office. Identité à vérifier avec lui${telephone ? `, joignable au ${telephone}` : ''}.${fiche.gereeParUnAutre ? ' Fiche déjà gérée par un autre compte (contestation, 7 jours).' : ''}${mot ? ` Son message : « ${mot} »` : ''}`,
      ),
    ])
  } catch (e) {
    console.error('[revendication] courriel de demande à l’équipe', e)
  }
  if (fiche.gereeParUnAutre && objet === 'revendication') await avertirTitulaire(fiche.id, compte.id, nom).catch((e) => console.error('[contestation] titulaire', e))
  // Rien ne bloque : le praticien enchaîne sur sa fiche, en brouillon jusqu'à l'accord. Un retrait attend la décision.
  // Un retrait, ou une contestation (la fiche a déjà un titulaire), attend la décision.
  const attendre = objet === 'retrait' || fiche.gereeParUnAutre
  redirect(chemin(attendre ? `${REVENDIQUER}/suivi/?fiche=${encodeURIComponent(fiche.slug)}` : `/espace-pro/onboarding/?fiche=${encodeURIComponent(fiche.slug)}&demande=1`))
}

/* ------------------------------------------------------------------ */
/* S1-0, PSC-0, REMP : m'avertir                                       */
/* ------------------------------------------------------------------ */

const schemaAlerte = z.discriminatedUnion('motif', [
  z.object({ motif: z.literal('prothesiste_salarie'), fiche: z.string().optional(), retour: z.string() }),
  z.object({ motif: z.literal('fiche_creee'), rpps: z.string().refine(rppsValide), retour: z.string() }),
  z.object({ motif: z.literal('remplacant'), exercice: z.enum(['remplacant', 'collaborateur', 'salarie']), fiche: z.string().optional(), retour: z.string() }),
])

export async function poserAlerte(donnees: FormData): Promise<never> {
  const brut = Object.fromEntries(donnees.entries())
  const r = schemaAlerte.safeParse(brut)
  const retour = cheminInterne(brut.retour) ? brut.retour : `${REVENDIQUER}/`
  const compte = await exigerConnexion(retour)
  if (!r.success) redirect(chemin(retour))

  if (r.data.motif === 'fiche_creee') {
    await db.execute(sql`
      INSERT INTO alertes_espace_pro (id, user_id, motif, rpps) VALUES (${randomUUID()}, ${compte.id}::uuid, 'fiche_creee', ${nettoyerRpps(r.data.rpps)})
      ON CONFLICT (user_id, motif, rpps) DO NOTHING
    `)
  } else {
    const { rows } = r.data.fiche ? await db.execute<{ id: string }>(sql`SELECT id FROM praticiens WHERE slug = ${r.data.fiche} LIMIT 1`) : { rows: [] }
    await db.execute(sql`
      INSERT INTO alertes_espace_pro (id, user_id, motif, exercice, praticien_id)
      VALUES (${randomUUID()}, ${compte.id}::uuid, ${r.data.motif}, ${r.data.motif === 'remplacant' ? r.data.exercice : null}, ${rows[0]?.id ?? null})
    `)
  }
  redirect(chemin(`${retour}${retour.includes('?') ? '&' : '?'}alerte=1`))
}

/* ------------------------------------------------------------------ */
/* R1, R2 : retrait                                                    */
/* ------------------------------------------------------------------ */

export async function annulerRetrait(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const compte = await exigerConnexion(`${REVENDIQUER}/${encodeURIComponent(slug)}/retrait/confirme/`)
  const fiche = await getFicheRevendication(slug, compte.id, { retirees: true })
  // Seul le compte qui a obtenu le retrait peut l'annuler, et seulement dans le délai.
  if (fiche?.retireLe && fiche.demande?.objet === 'retrait' && fiche.demande.statut === 'acceptee') {
    await db.execute(sql`
      UPDATE praticiens SET deleted_at = NULL, retire_le = NULL, updated_at = now()
      WHERE id = ${fiche.id} AND retire_le > now() - make_interval(days => ${DELAI_ANNULATION_RETRAIT_JOURS})
    `)
    await db.execute(sql`DELETE FROM revendications WHERE id = ${fiche.demande.id}`)
    revalidateTag('annuaire', 'max')
  }
  redirect(chemin(`${REVENDIQUER}/${encodeURIComponent(slug)}/`))
}

/* ------------------------------------------------------------------ */
/* M1 : les lieux gérés                                                */
/* ------------------------------------------------------------------ */

export async function choisirLieux(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const ici = `/espace-pro/lieux/?fiche=${encodeURIComponent(slug)}`
  const compte = await exigerConnexion(ici)
  const fiche = await getFicheRevendication(slug, compte.id)
  if (!fiche || fiche.demande?.statut !== 'acceptee') redirect(chemin('/espace-pro/'))
  const connus = new Set(fiche.lieux.map((l) => l.id))
  const choisis = donnees.getAll('lieu').map(String).filter((id) => connus.has(id))
  if (choisis.length === 0) redirect(chemin(`${ici}&erreur=1`))
  await db.execute(sql`
    UPDATE revendications SET lieux_geres = ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(choisis)}::jsonb))::text[]
    WHERE id = ${fiche.demande.id}
  `)
  redirect(chemin('/espace-pro/'))
}

/* ------------------------------------------------------------------ */
/* H1 : la fiche choisie parmi les homonymes                           */
/* ------------------------------------------------------------------ */

export async function ouvrirFiche(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  redirect(chemin(slug ? `${REVENDIQUER}/${encodeURIComponent(slug)}/` : `${REVENDIQUER}/recherche/`))
}

/* ------------------------------------------------------------------ */
/* Laboratoire : LA1                                                   */
/* ------------------------------------------------------------------ */

/**
 * LA1 : un laboratoire absent de l'annuaire. Le SIRET est contrôlé dans
 * Sirene : établissement actif, activité 32.50A ou examen manuel. Aucune
 * fiche n'est créée ici : la demande, avec son Kbis, part en modération.
 */
export async function demanderAjoutLabo(donnees: FormData): Promise<never> {
  const ici = '/espace-pro/laboratoire/ajout/'
  const compte = await exigerConnexion(ici)
  const avecErreur = (m: string) => chemin(`${ici}?erreur=${encodeURIComponent(m)}`)
  const siret = nettoyerNumero(String(donnees.get('siret') ?? ''))
  const raison = String(donnees.get('raison') ?? '').trim().slice(0, 200)
  if (!siretValide(siret)) redirect(avecErreur('Ce SIRET ne passe pas le contrôle de clé : vérifiez les quatorze chiffres.'))
  if (raison.length < 2) redirect(avecErreur('Indiquez la raison sociale du laboratoire.'))

  const etab = await consulterSiret(siret)
  if (etab && !etab.actif) redirect(avecErreur('Sirene indique cet établissement comme fermé : il ne peut pas être ajouté.'))

  const dossier = `ajout-${compte.id}`
  const televerse = String(donnees.get('chemin_document') ?? '')
  let rangement: string
  let nomFichier = String(donnees.get('nom_document') ?? 'kbis')
  if (televerse) {
    if (!televerse.startsWith(`justificatifs/${dossier}/`)) redirect(avecErreur('Le Kbis n’a pas pu être rattaché à la demande.'))
    const controle = controlerJustificatif({ type: typeDepuisNom(televerse), size: Number(donnees.get('taille_document') ?? 0) || 1, name: nomFichier }, { pdfSeul: true })
    if (!controle.ok) redirect(avecErreur(controle.erreur))
    rangement = `blob:${televerse}`
  } else {
    const f = donnees.get('document')
    if (!(f instanceof File) || !f.size) redirect(avecErreur('Joignez un extrait Kbis de moins de trois mois.'))
    const controle = controlerJustificatif(f, { pdfSeul: true })
    if (!controle.ok) redirect(avecErreur(controle.erreur))
    rangement = await rangerJustificatif(f, dossier)
    nomFichier = f.name
  }

  const note = !etab
    ? 'Établissement introuvable dans Sirene au moment de la demande : vérification manuelle.'
    : etab.naf === '32.50A'
      ? 'Sirene : établissement actif, activité 32.50A.'
      : `Sirene : établissement actif, activité ${etab.naf ?? 'inconnue'} (hors 32.50A) : examen manuel de l’activité.`
  await db.execute(sql`
    INSERT INTO demandes_creation_fiche (id, user_id, profession, nom, raison_sociale, siret, adresse, code_postal, ville, email, message, justificatif_chemin, justificatif_nom)
    VALUES (${randomUUID()}, ${compte.id}::uuid, 'prothesiste', ${raison}, ${raison}, ${siret}, ${etab?.adresse ?? 'À vérifier'}, ${etab?.codePostal ?? ''}, ${etab?.ville ?? ''},
            ${compte.email}, ${note}, ${rangement}, ${nomFichier.slice(0, 200)})
  `)
  await envoyerAModerer(`ajout du laboratoire ${raison}`, `Le compte ${compte.email} demande l'ajout de « ${raison} », SIRET ${siret}. ${note}`)
  redirect(chemin(`${ici}?envoyee=1`))
}

/** L1 : le laboratoire choisi parmi plusieurs résultats. */
export async function ouvrirFicheLabo(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  redirect(chemin(slug ? `/espace-pro/laboratoire/revendiquer/${encodeURIComponent(slug)}/` : '/espace-pro/laboratoire/revendiquer/'))
}

/**
 * S1-0 : un chirurgien-dentiste ou un spécialiste installé depuis la dernière
 * synchronisation de l'Annuaire Santé demande sa fiche. Rien n'est créé sans
 * examen : l'équipe retrouve le RPPS dans l'Annuaire Santé, crée la fiche, et
 * le praticien la revendique ensuite comme les autres.
 */
export async function demanderAjoutPraticien(donnees: FormData): Promise<never> {
  const ici = '/espace-pro/revendiquer/ajout/'
  const compte = await exigerConnexion(ici)
  const champ = (n: string, max = 200) => String(donnees.get(n) ?? '').trim().slice(0, max)
  const profession = (['dentiste', 'stomatologue', 'maxillo_facial', 'orl'] as const).find((p) => p === donnees.get('profession')) ?? 'dentiste'
  const rpps = nettoyerRpps(champ('rpps', 20))
  const [prenom, nom, adresse, codePostal, ville, message] = [champ('prenom', 100), champ('nom', 100), champ('adresse'), champ('code_postal', 5), champ('ville', 100), champ('message', 1000)]
  const garder = `profession=${profession}&rpps=${encodeURIComponent(rpps)}&prenom=${encodeURIComponent(prenom)}&nom=${encodeURIComponent(nom)}&adresse=${encodeURIComponent(adresse)}&code_postal=${encodeURIComponent(codePostal)}&ville=${encodeURIComponent(ville)}`
  const avecErreur = (m: string) => chemin(`${ici}?${garder}&erreur=${encodeURIComponent(m)}`)
  if (!rppsValide(rpps)) redirect(avecErreur('Ce numéro RPPS ne passe pas le contrôle de clé : vérifiez les onze chiffres.'))
  if (nom.length < 2) redirect(avecErreur('Indiquez votre nom, comme à l’Ordre.'))
  if (adresse.length < 4 || !/^\d{5}$/.test(codePostal) || ville.length < 2) redirect(avecErreur('Indiquez l’adresse complète du cabinet : rue, code postal, ville.'))
  const { rows: existe } = await db.execute<{ slug: string }>(sql`SELECT slug FROM praticiens WHERE rpps = ${rpps} AND deleted_at IS NULL LIMIT 1`)
  if (existe[0]) redirect(chemin(`${REVENDIQUER}/${encodeURIComponent(existe[0].slug)}/`))
  const { rows: deja } = await db.execute<{ id: string }>(sql`SELECT id FROM demandes_creation_fiche WHERE rpps = ${rpps} AND statut = 'en_attente' LIMIT 1`)
  if (!deja[0]) {
    await db.execute(sql`
      INSERT INTO demandes_creation_fiche (id, user_id, profession, nom, prenom, rpps, adresse, code_postal, ville, email, message)
      VALUES (${randomUUID()}, ${compte.id}::uuid, ${profession}, ${nom}, ${prenom || null}, ${rpps}, ${adresse}, ${codePostal}, ${ville}, ${compte.email}, ${message || null})
    `)
    await envoyerAModerer(`ajout de la fiche de ${[prenom, nom].filter(Boolean).join(' ')}`, `Le compte ${compte.email} demande l'ajout de sa fiche : RPPS ${rpps}, ${adresse}, ${codePostal} ${ville}. À retrouver dans l'Annuaire Santé avant création.`)
  }
  redirect(chemin(`${ici}?envoyee=1`))
}
