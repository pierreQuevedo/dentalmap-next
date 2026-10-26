'use server'

import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidateTag, updateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import {
  envoyerAccusePartenariat,
  envoyerAjoutEtablissementRecu,
  envoyerAModerer,
  envoyerAttestationRecue,
  envoyerDemandePartenariat,
} from '@/lib/email'
import { enregistrerProfil, estModerateur, exigerConnexion, type Compte } from '@/lib/tunnel/compte'
import { synchroniserFormation } from '@/lib/wp/ecriture'
import { deciderAjoutEtablissement, deciderAttestation as deciderAttestationModeration } from '@/lib/moderation/decisions'
import { COOKIE_PARTENARIAT, SPECIALITES, TYPES_PARTENARIAT, adresseReconnue, controlerUai, CentreSoins, Cycle, Donnees, FormationDeclaree, Photo, VoieAcces, type Bloc } from './etablissement'
import { ESPACE_ETAB, ORGANISME, getFicheEtablissement, getGestions, getSourceEtablissement, initialiserFiche, reprendreFiche, type Gestion } from './etablissement-donnees'
import { cheminTeleverseValide, controlerJustificatif, rangerJustificatif, typeDepuisNom } from './justificatif'
import { contenuConforme } from '@/lib/fichier-reel'

/**
 * Les actions du couloir « École ou organisme ».
 *
 * La main sur un établissement ne se donne que par une adresse sur son
 * domaine, ou par la décision de l'équipe sur une attestation de fonction.
 * Ce que l'établissement déclare reste en brouillon jusqu'à « Publier ».
 */

const avec = (ici: string, cle: string, valeur: string) => chemin(`${ici}${ici.includes('?') ? '&' : '?'}${cle}=${encodeURIComponent(valeur)}`)

/** Le compte, avec un rôle : un compte sans profil devient « organisme ». */
async function compteOrganisme(ici: string): Promise<Compte> {
  const compte = await exigerConnexion(ici)
  if (!compte.role) await enregistrerProfil('organisme', compte.nom)
  return compte
}

/* ------------------------------------------------------------------ */
/* O1 : type d'organisme                                                */
/* ------------------------------------------------------------------ */

export async function choisirOrganisme(donnees: FormData): Promise<never> {
  await compteOrganisme(`${ORGANISME}/`)
  const choix = String(donnees.get('organisme') ?? '')
  if (choix === 'continue') redirect(chemin(`${ORGANISME}/liste-d-attente/`))
  if (choix === 'partenaire') redirect(chemin(`${ORGANISME}/partenariat/`))
  redirect(chemin(`${ORGANISME}/etablissement/`))
}

/* ------------------------------------------------------------------ */
/* O2a : c'est mon établissement                                        */
/* ------------------------------------------------------------------ */

export async function choisirEtablissement(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('etablissement') ?? '')
  const q = String(donnees.get('q') ?? '')
  const ici = `${ORGANISME}/etablissement/${q ? `?q=${encodeURIComponent(q)}` : ''}`
  const compte = await compteOrganisme(ici)
  const source = slug ? await getSourceEtablissement(slug) : null
  if (!source) redirect(avec(ici, 'erreur', 'Choisissez votre établissement dans la liste.'))

  const deja = (await getGestions(compte.id)).find((g) => g.slug === slug)
  if (deja?.statut === 'acceptee') redirect(chemin(`${ORGANISME}/formations/?fiche=${encodeURIComponent(slug)}`))

  if (adresseReconnue(compte.email, source.domaines)) {
    await db.execute(sql`
      INSERT INTO revendications_etablissement (id, user_id, slug, titre, type, methode, statut, traite_le)
      VALUES (${randomUUID()}, ${compte.id}::uuid, ${slug}, ${source.titre}, ${source.type}, 'domaine', 'acceptee', now())
      ON CONFLICT (user_id, slug) DO UPDATE SET methode = 'domaine', statut = 'acceptee', traite_le = now(), motif_refus = NULL
    `)
    await initialiserFiche(source, compte.id)
    await reprendreFiche(source, compte.id)
    redirect(chemin(`${ORGANISME}/formations/?fiche=${encodeURIComponent(slug)}`))
  }
  redirect(chemin(`${ORGANISME}/etablissement/attestation/?fiche=${encodeURIComponent(slug)}`))
}

/* ------------------------------------------------------------------ */
/* OAT : attestation de fonction                                        */
/* ------------------------------------------------------------------ */

export async function deposerAttestation(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const ici = `${ORGANISME}/etablissement/attestation/?fiche=${encodeURIComponent(slug)}`
  const compte = await compteOrganisme(ici)
  const source = await getSourceEtablissement(slug)
  if (!source) redirect(chemin(`${ORGANISME}/etablissement/`))

  const dossier = `etablissement-${slug}`.slice(0, 120)
  const televerse = String(donnees.get('chemin_document') ?? '')
  const nom = String(donnees.get('nom_document') ?? 'attestation.pdf').slice(0, 200)
  const taille = Number(donnees.get('taille_document') ?? 0)
  let rangement: string
  if (televerse) {
    if (!cheminTeleverseValide(televerse, dossier)) redirect(avec(ici, 'erreur', 'Le document n’a pas pu être rattaché à cet établissement.'))
    if (typeDepuisNom(televerse) !== 'application/pdf') redirect(avec(ici, 'erreur', 'L’attestation doit être un PDF signé.'))
    rangement = `blob:${televerse}`
  } else {
    const fichier = donnees.get('document')
    if (!(fichier instanceof File) || !fichier.size) redirect(avec(ici, 'erreur', 'Choisissez un fichier.'))
    const controle = controlerJustificatif(fichier)
    if (!controle.ok) redirect(avec(ici, 'erreur', controle.erreur))
    if (fichier.type !== 'application/pdf' || !(await contenuConforme(fichier, ['pdf']))) redirect(avec(ici, 'erreur', 'L’attestation doit être un PDF signé.'))
    rangement = await rangerJustificatif(fichier, dossier)
  }

  await db.execute(sql`
    INSERT INTO revendications_etablissement (id, user_id, slug, titre, type, methode, statut, justificatif_chemin, justificatif_nom, justificatif_taille)
    VALUES (${randomUUID()}, ${compte.id}::uuid, ${slug}, ${source.titre}, ${source.type}, 'attestation', 'en_attente', ${rangement}, ${nom}, ${taille || null})
    ON CONFLICT (user_id, slug) DO UPDATE SET
      methode = 'attestation', statut = 'en_attente', justificatif_chemin = EXCLUDED.justificatif_chemin,
      justificatif_nom = EXCLUDED.justificatif_nom, justificatif_taille = EXCLUDED.justificatif_taille,
      demande_le = now(), traite_le = NULL, motif_refus = NULL
    WHERE revendications_etablissement.statut <> 'acceptee'
  `)
  await initialiserFiche(source, compte.id)
  try {
    await Promise.all([
      envoyerAttestationRecue(compte.email, source.titre),
      envoyerAModerer(`attestation pour ${source.titre}`, `${compte.nom} (${compte.email}) a déposé une attestation de fonction pour « ${source.titre} ».\n\nÀ examiner dans l'espace pro, rubrique Modération.`),
    ])
  } catch (e) {
    console.error('[etablissement] courriel d’attestation', e)
  }
  redirect(chemin(`${ORGANISME}/formations/?fiche=${encodeURIComponent(slug)}`))
}

/* ------------------------------------------------------------------ */
/* OA1 : établissement absent                                           */
/* ------------------------------------------------------------------ */

export async function demanderAjoutEtablissement(donnees: FormData): Promise<never> {
  const ici = `${ORGANISME}/etablissement/ajout/`
  const compte = await compteOrganisme(ici)
  const nom = String(donnees.get('nom') ?? '').trim()
  const ville = String(donnees.get('ville') ?? '').trim()
  const uai = controlerUai(String(donnees.get('uai') ?? ''))
  const garder = `nom=${encodeURIComponent(nom)}&ville=${encodeURIComponent(ville)}&uai=${encodeURIComponent(String(donnees.get('uai') ?? ''))}`
  if (nom.length < 3) redirect(chemin(`${ici}?${garder}&erreur=${encodeURIComponent('Indiquez le nom de l’établissement.')}`))
  if (!uai.ok) redirect(chemin(`${ici}?${garder}&champ=uai&erreur=${encodeURIComponent(uai.erreur)}`))
  if (ville.length < 2) redirect(chemin(`${ici}?${garder}&erreur=${encodeURIComponent('Indiquez la ville.')}`))

  await db.execute(sql`
    INSERT INTO demandes_ajout_etablissement (id, user_id, nom, uai, ville)
    VALUES (${randomUUID()}, ${compte.id}::uuid, ${nom.slice(0, 200)}, ${uai.uai}, ${ville.slice(0, 120)})
  `)
  try {
    await Promise.all([
      envoyerAjoutEtablissementRecu(compte.email, nom),
      envoyerAModerer(`ajout d’établissement : ${nom}`, `${compte.nom} (${compte.email}) demande l'ajout de « ${nom} », ${ville}, UAI ${uai.uai}.`),
    ])
  } catch (e) {
    console.error('[etablissement] courriel d’ajout', e)
  }
  redirect(chemin(`${ici}?envoye=1`))
}

/* ------------------------------------------------------------------ */
/* W1 : liste d'attente de la formation continue                        */
/* ------------------------------------------------------------------ */

export async function inscrireListeAttente(donnees: FormData): Promise<never> {
  const ici = `${ORGANISME}/liste-d-attente/`
  const compte = await compteOrganisme(ici)
  const organisme = String(donnees.get('organisme') ?? '').trim()
  const specialites = donnees.getAll('specialites').map(String).filter((s) => (SPECIALITES as readonly string[]).includes(s))
  const garder = `organisme=${encodeURIComponent(organisme)}${specialites.map((s) => `&specialites=${encodeURIComponent(s)}`).join('')}`
  if (organisme.length < 2) redirect(chemin(`${ici}?${garder}&erreur=${encodeURIComponent('Indiquez le nom de l’organisme.')}`))
  if (!specialites.length) redirect(chemin(`${ici}?${garder}&erreur=${encodeURIComponent('Choisissez au moins une spécialité.')}`))
  await db.execute(sql`
    INSERT INTO liste_attente_formation (id, user_id, email, organisme, specialites)
    VALUES (${randomUUID()}, ${compte.id}::uuid, ${compte.email.toLowerCase()}, ${organisme.slice(0, 200)}, ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(specialites)}::jsonb))::text[])
    ON CONFLICT (email) DO UPDATE SET organisme = EXCLUDED.organisme, specialites = EXCLUDED.specialites, user_id = EXCLUDED.user_id
  `)
  redirect(chemin(`${ici}?inscrit=1`))
}

/* ------------------------------------------------------------------ */
/* O2b : partenariat                                                    */
/* ------------------------------------------------------------------ */

const Partenariat = z.object({
  organisme: z.string().trim().min(2, 'Indiquez l’organisme.').max(200),
  fonction: z.string().trim().min(2, 'Indiquez votre fonction.').max(120),
  email: z.string().trim().toLowerCase().email('Adresse électronique invalide.'),
  projet: z.string().trim().min(10, 'Dites-nous en un peu plus sur votre projet.').max(4000),
})

export async function proposerPartenariat(donnees: FormData): Promise<never> {
  const ici = `${ORGANISME}/partenariat/`
  const compte = await exigerConnexion(ici)
  const brut = Object.fromEntries(['organisme', 'fonction', 'email', 'projet'].map((k) => [k, String(donnees.get(k) ?? '')]))
  const r = Partenariat.safeParse(brut)
  if (!r.success) {
    const garder = Object.entries(brut).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    redirect(chemin(`${ici}?${garder}&erreur=${encodeURIComponent(r.error.issues[0]?.message ?? 'Formulaire incomplet.')}`))
  }
  // Les types cochés passent en tête du message : l'équipe voit d'emblée l'orientation du projet.
  const types = donnees.getAll('types').map(String).filter((t) => (TYPES_PARTENARIAT as readonly string[]).includes(t))
  const message = types.length ? `Type de partenariat : ${types.join(', ')}\n\n${r.data.projet}` : r.data.projet
  try {
    // Même circuit que le formulaire de l'accueil : un courriel à l'équipe, rien de stocké, aucun compte pro.
    await envoyerDemandePartenariat({ prenom: '', nom: compte.nom, email: r.data.email, organisme: r.data.organisme, fonction: r.data.fonction, message, origine: 'espace-pro' })
    await envoyerAccusePartenariat(r.data.email, r.data.organisme)
  } catch (e) {
    console.error('[partenariat] envoi impossible', e)
    redirect(chemin(`${ici}?erreur=${encodeURIComponent('Votre demande n’a pas pu partir. Réessayez dans quelques minutes.')}`))
  }
  ;(await cookies()).set(COOKIE_PARTENARIAT, r.data.email, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' })
  redirect(chemin(`${ici}recu/`))
}

/* ------------------------------------------------------------------ */
/* O3a et tableau de bord : ce que l'établissement déclare              */
/* ------------------------------------------------------------------ */

/**
 * Un gestionnaire de cet établissement (accepté ou en attente), ou la recherche.
 *
 * Pour écrire, une demande en attente ne suffit plus dès que la page est
 * publiée ou qu'un autre gestionnaire est validé : la page publique lit ce
 * même document, et une attestation quelconque permettait de la réécrire
 * (audit du 2026-10-26). En attente, on prépare seulement une page que
 * personne ne gère encore.
 */
async function exigerGestion(slug: string, ici: string, ecriture = false): Promise<{ compte: Compte; gestion: Gestion }> {
  const compte = await exigerConnexion(ici)
  const gestion = (await getGestions(compte.id)).find((g) => g.slug === slug && g.statut !== 'refusee')
  if (!gestion) redirect(chemin(`${ORGANISME}/etablissement/`))
  if (ecriture && gestion.statut !== 'acceptee') {
    const { rows } = await db.execute<{ bloque: boolean }>(sql`
      SELECT EXISTS (SELECT 1 FROM fiches_etablissement WHERE slug = ${slug} AND publiee_le IS NOT NULL)
          OR EXISTS (SELECT 1 FROM revendications_etablissement WHERE slug = ${slug} AND statut = 'acceptee' AND user_id <> ${compte.id}::uuid) AS bloque
    `)
    if (rows[0]?.bloque) redirect(avec(ici, 'erreur', 'Cette page est déjà gérée par l’établissement : vous pourrez la modifier une fois votre fonction vérifiée par notre équipe.'))
  }
  return { compte, gestion }
}

async function ecrireDonnees(slug: string, userId: string, maj: (d: Donnees) => Donnees, bloc: Bloc): Promise<Donnees> {
  const fiche = await getFicheEtablissement(slug)
  if (!fiche) throw new Error(`Fiche d'établissement absente : ${slug}`)
  const suivant = maj(fiche.donnees)
  suivant.confirmeLe = { ...suivant.confirmeLe, [bloc]: new Date().toISOString() }
  await db.execute(sql`
    UPDATE fiches_etablissement SET donnees = ${JSON.stringify(Donnees.parse(suivant))}::jsonb, mis_a_jour_le = now(), mis_a_jour_par = ${userId}::uuid
    WHERE slug = ${slug}
  `)
  updateTag(`etablissement:${slug}`)
  return suivant
}

function lireJson<T>(schema: z.ZodType<T>, brut: FormDataEntryValue | null): T | null {
  try {
    const r = schema.safeParse(JSON.parse(String(brut ?? 'null')))
    return r.success ? r.data : null
  } catch {
    return null
  }
}

/** O3a : enregistrer les formations, puis publier ou terminer plus tard. */
export async function enregistrerFormationsOnboarding(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const ici = `${ORGANISME}/formations/?fiche=${encodeURIComponent(slug)}`
  const { compte, gestion } = await exigerGestion(slug, ici, true)
  const formations = lireJson(z.array(FormationDeclaree).max(20), donnees.get('formations'))
  if (!formations) redirect(avec(ici, 'erreur', 'Une formation est incomplète : vérifiez son intitulé.'))
  const publier = donnees.get('suite') === 'publier'
  if (publier && !formations.some((f) => f.active)) redirect(avec(ici, 'erreur', 'Activez au moins une formation pour publier.'))

  const d = await ecrireDonnees(slug, compte.id, (x) => ({ ...x, formations }), 'formations')
  if (!publier) redirect(chemin(`${ESPACE_ETAB}/?fiche=${encodeURIComponent(slug)}`))

  if (gestion.statut === 'acceptee') {
    await db.execute(sql`UPDATE fiches_etablissement SET publiee_le = COALESCE(publiee_le, now()) WHERE slug = ${slug}`)
    await synchroniserFormation(slug, d)
    revalidateTag('wp:formation', 'max')
  }
  redirect(chemin(`${ORGANISME}/publie/?fiche=${encodeURIComponent(slug)}`))
}

const BLOCS = {
  formations: z.object({ formations: z.array(FormationDeclaree).max(20) }),
  portesOuvertes: z.object({ portesOuvertes: Donnees.shape.portesOuvertes, aucunePorteOuverte: z.boolean() }),
  presentation: z.object({ accroche: Donnees.shape.accroche, presentation: Donnees.shape.presentation }),
  galerie: z.object({ galerie: z.array(Photo).max(24), credit: Donnees.shape.credit, droitsAttestes: z.boolean() }),
  voiesAcces: z.object({ voiesAcces: z.array(VoieAcces).max(10) }),
  cursus: z.object({ cycles: z.array(Cycle).max(6), autresDiplomes: z.array(z.string().trim().min(2).max(140)).max(20) }),
  centres: z.object({ centres: z.array(CentreSoins).max(8) }),
} satisfies Record<Bloc, z.ZodType>

/** Les blocs simples arrivent en champs de formulaire ; les listes, en JSON dans `valeur`. */
function valeurDepuisFormulaire(bloc: Bloc, donnees: FormData): unknown {
  const texteOuNull = (cle: string) => String(donnees.get(cle) ?? '').trim() || null
  if (bloc === 'portesOuvertes') {
    const aucune = donnees.get('aucune') === 'on'
    return { portesOuvertes: aucune ? null : texteOuNull('date'), aucunePorteOuverte: aucune }
  }
  if (bloc === 'presentation') return { accroche: texteOuNull('accroche'), presentation: texteOuNull('presentation') }
  if (bloc === 'galerie') {
    try {
      return { galerie: JSON.parse(String(donnees.get('photos') ?? '[]')), credit: texteOuNull('credit'), droitsAttestes: donnees.get('droits') === 'on' }
    } catch {
      return null
    }
  }
  try {
    return JSON.parse(String(donnees.get('valeur') ?? 'null'))
  } catch {
    return null
  }
}

/**
 * Le tableau de bord : un bloc de la page à la fois, validé ici, puis la
 * page publique est rafraîchie.
 */
export async function enregistrerBloc(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const bloc = String(donnees.get('bloc') ?? '') as Bloc
  const retour = String(donnees.get('retour') ?? `${ESPACE_ETAB}/`)
  const ici = `${retour.startsWith(ESPACE_ETAB) ? retour : `${ESPACE_ETAB}/`}`
  const { compte } = await exigerGestion(slug, ici, true)
  const schema = BLOCS[bloc]
  if (!schema) redirect(avec(ici, 'erreur', 'Bloc inconnu.'))
  const valeur = (schema as z.ZodType<Partial<Donnees>>).safeParse(valeurDepuisFormulaire(bloc, donnees)).data ?? null
  if (!valeur) redirect(avec(ici, 'erreur', 'Un champ est incomplet ou trop long.'))
  if (bloc === 'galerie' && valeur.galerie?.length && !valeur.droitsAttestes) redirect(avec(ici, 'erreur', 'Attestez que l’établissement détient les droits des photos.'))
  if (bloc === 'presentation' && valeur.presentation && valeur.presentation.length > 0 && valeur.presentation.length < 200) {
    redirect(avec(ici, 'erreur', 'La présentation compte 200 caractères au moins.'))
  }
  await ecrireDonnees(slug, compte.id, (x) => ({ ...x, ...valeur }), bloc)
  redirect(avec(ici, 'enregistre', bloc))
}

/** Republier sans rien changer : confirme que le bloc est toujours juste. */
export async function confirmerBloc(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const bloc = String(donnees.get('bloc') ?? '') as Bloc
  const ici = `${ESPACE_ETAB}/?fiche=${encodeURIComponent(slug)}`
  const { compte } = await exigerGestion(slug, ici, true)
  if (!(bloc in BLOCS)) redirect(chemin(ici))
  await ecrireDonnees(slug, compte.id, (x) => x, bloc)
  redirect(avec(ici, 'enregistre', bloc))
}

/** Publier depuis le tableau de bord, une fois l'identité vérifiée. */
export async function publierEtablissement(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const ici = `${ESPACE_ETAB}/?fiche=${encodeURIComponent(slug)}`
  const { gestion } = await exigerGestion(slug, ici)
  const fiche = await getFicheEtablissement(slug)
  if (gestion.statut !== 'acceptee' || !fiche) redirect(chemin(ici))
  if (!fiche.donnees.formations.some((f) => f.active)) redirect(avec(ici, 'erreur', 'Activez au moins une formation pour publier.'))
  await db.execute(sql`UPDATE fiches_etablissement SET publiee_le = COALESCE(publiee_le, now()) WHERE slug = ${slug}`)
  await synchroniserFormation(slug, fiche.donnees)
  updateTag(`etablissement:${slug}`)
  revalidateTag('wp:formation', 'max')
  redirect(chemin(`${ORGANISME}/publie/?fiche=${encodeURIComponent(slug)}`))
}

/* ------------------------------------------------------------------ */
/* Modération                                                           */
/* ------------------------------------------------------------------ */

export async function deciderAttestation(donnees: FormData): Promise<never> {
  const compte = await exigerConnexion('/espace-pro/moderation/')
  if (!estModerateur(compte.email)) redirect(chemin('/espace-pro/'))
  await deciderAttestationModeration(
    String(donnees.get('id') ?? ''),
    donnees.get('decision') === 'acceptee' ? 'acceptee' : 'refusee',
    String(donnees.get('motif') ?? ''),
  )
  redirect(chemin('/espace-pro/moderation/'))
}

/** OA1, côté équipe : la page a été créée dans WordPress, ou la demande est refusée. */
export async function traiterAjoutEtablissement(donnees: FormData): Promise<never> {
  const compte = await exigerConnexion('/espace-pro/moderation/')
  if (!estModerateur(compte.email)) redirect(chemin('/espace-pro/'))
  await deciderAjoutEtablissement(String(donnees.get('id') ?? ''), donnees.get('decision') === 'acceptee' ? 'acceptee' : 'refusee')
  redirect(chemin('/espace-pro/moderation/'))
}
