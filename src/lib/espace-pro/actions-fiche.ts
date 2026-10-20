'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidateTag, updateTag } from 'next/cache'
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { fichesCompletees } from '@/db/schema'
import { chemin } from '@/lib/navigation'
import { exigerConnexion } from '@/lib/tunnel/compte'
import { retourSur } from '@/lib/tunnel/etapes'
import { detientLaFiche, getFicheCompleteeParPraticien } from './revendication'
import { getFicheRevendication } from './parcours'
import { getEspace } from './espace'
import { garderSaisie } from './saisie'
import {
  ACCES_PMR,
  AGES_MINIMUM,
  LANGUES,
  PRESENTATION_MAX,
  SECTEURS,
  TIERS_PAYANT,
  lienValide,
  orientationsDe,
  schemaHoraires,
  type CodeAccesPmr,
} from './fiche-completee'
import type { CleFraicheur } from './force'
import { DELAI_MAX, DELAI_MIN, JOURS_RAMASSAGE, MATERIAUX, PIECES, RAYON_MAX, RAYON_MIN, REALISATIONS_MAX, TECHNIQUES } from './labo'

/**
 * Les écritures de la fiche d'un soignant : onboarding, missions,
 * reconfirmations.
 *
 * Chaque action vérifie que le compte détient la fiche (acceptée, ou demande
 * en cours : on prépare sa fiche sans attendre, elle n'est publiée qu'une
 * fois attribuée), écrit la ligne de `fiches_completees`, invalide la fiche
 * publique et poursuit vers `suite`.
 */
type Valeurs = Partial<typeof fichesCompletees.$inferInsert>

async function ecrire(donnees: FormData, valeurs: (fiche: { id: string; slug: string }) => Valeurs | Promise<Valeurs>, defaut: string): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const suite = retourSur(String(donnees.get('suite') ?? ''), defaut)
  const compte = await exigerConnexion(suite)
  const fiche = slug ? await getFicheRevendication(slug, compte.id) : null
  if (!fiche || !(await detientLaFiche(compte.id, fiche.id))) redirect(chemin('/espace-pro/'))

  const v = { ...(await valeurs(fiche)), userId: compte.id, updatedAt: new Date() }
  await db
    .insert(fichesCompletees)
    .values({ id: randomUUID(), praticienId: fiche.id, ...v })
    .onConflictDoUpdate({ target: fichesCompletees.praticienId, set: v })
  updateTag(`praticien:${fiche.slug}`)
  // Le remplissage ordonne les listes de commune : celles des lieux de la fiche (et de leur commune parente, Paris pour un arrondissement) sont recalculées.
  const { rows: communes } = await db.execute<{ code: string }>(sql`
    SELECT DISTINCT unnest(ARRAY[c.code_insee, c.commune_parente_code]) AS code
    FROM lieux_exercice l JOIN communes c ON c.code_insee = l.code_insee
    WHERE l.praticien_id = ${fiche.id}
  `)
  for (const { code } of communes) if (code) revalidateTag(`commune:${code}`, 'max')

  // Le palier Exemplaire franchi par cet enregistrement : la célébration (J).
  const avant = Number(donnees.get('avant') ?? NaN)
  if (avant < 90) {
    const apres = await getEspace(compte, fiche.slug)
    if (apres && apres.force.total >= 90) redirect(chemin(`/espace-pro/?fiche=${encodeURIComponent(fiche.slug)}&bravo=1`))
  }
  // De retour dans le tableau de bord, la coque dit « Enregistré ». Pas dans l'onboarding, qui passe à l'étape suivante.
  const tableau = suite.startsWith('/espace-pro/') && !/^\/espace-pro\/(laboratoire\/)?onboarding\//.test(suite)
  redirect(chemin(tableau ? `${suite}${suite.includes('?') ? '&' : '?'}enregistre=1` : suite))
}

/** Le chemin d'erreur : la même page, avec le message, et la saisie gardée pour ne pas la perdre. */
async function erreur(donnees: FormData, message: string): Promise<never> {
  const ici = retourSur(String(donnees.get('ici') ?? ''), '/espace-pro/')
  await garderSaisie(donnees, ici)
  redirect(chemin(`${ici}${ici.includes('?') ? '&' : '?'}erreur=${encodeURIComponent(message)}`))
}

/* ------------------------------------------------------------------ */
/* Onboarding                                                           */
/* ------------------------------------------------------------------ */

/** B1 : les horaires, envoyés en JSON par le formulaire. */
export async function enregistrerHoraires(donnees: FormData): Promise<never> {
  let brut: unknown
  try {
    brut = JSON.parse(String(donnees.get('horaires') ?? '{}'))
  } catch {
    return erreur(donnees, 'Horaires illisibles.')
  }
  const r = schemaHoraires.safeParse(brut)
  if (!r.success) return erreur(donnees, r.error.issues[0]?.message ?? 'Horaires invalides.')
  const ouverts = Object.values(r.data).filter((p) => p && p.length > 0).length
  if (ouverts === 0) return erreur(donnees, 'Indiquez au moins un jour d’ouverture, ou passez cette étape.')
  return ecrire(donnees, () => ({ horaires: r.data, horairesConfirmesLe: new Date(), etape: 1 }), '/espace-pro/')
}

const schemaConventionnement = z.object({
  secteur: z.enum(SECTEURS.map((s) => s.code) as [string, ...string[]]),
  tiersPayant: z.enum(TIERS_PAYANT.map((t) => t.code) as [string, ...string[]]),
})

/** B2 : secteur et tiers payant, tous deux requis pour les dix points. */
export async function enregistrerConventionnement(donnees: FormData): Promise<never> {
  const r = schemaConventionnement.safeParse({ secteur: donnees.get('secteur'), tiersPayant: donnees.get('tiersPayant') })
  if (!r.success) return erreur(donnees, 'Choisissez le secteur et le tiers payant.')
  return ecrire(
    donnees,
    () => ({
      secteur: r.data.secteur as 'secteur_1',
      tiersPayant: r.data.tiersPayant as 'aucun',
      conventionnementConfirmeLe: new Date(),
      etape: 2,
    }),
    '/espace-pro/',
  )
}

/** B3 : langues, accès PMR et âge minimum. « Oui » au PMR alimente aussi le filtre de la recherche. */
export async function enregistrerAccueil(donnees: FormData): Promise<never> {
  const codes = new Set<string>(LANGUES.map((l) => l.code))
  const langues = donnees.getAll('langue').map(String).filter((c) => codes.has(c))
  const pmr = String(donnees.get('pmr') ?? '')
  const age = Number(donnees.get('age'))
  if (!langues.length || !ACCES_PMR.some((a) => a.code === pmr) || !(AGES_MINIMUM as readonly number[]).includes(age)) {
    return erreur(donnees, 'Répondez aux trois questions : langues, accès et âge.')
  }
  return ecrire(
    donnees,
    async ({ id }) => {
      const actuelle = await getFicheCompleteeParPraticien(id)
      const accessibilite = new Set(actuelle?.accessibilite ?? [])
      if (pmr === 'oui') accessibilite.add('pmr')
      else accessibilite.delete('pmr')
      return { langues, accesPmr: pmr as CodeAccesPmr, ageMinimum: age, accessibilite: [...accessibilite], accueilConfirmeLe: new Date(), etape: 3 }
    },
    '/espace-pro/',
  )
}

/** B7 : publier. La fiche est en ligne dès que la revendication est acceptée. */
export async function publierFiche(donnees: FormData): Promise<never> {
  return ecrire(donnees, () => ({ publieeLe: new Date(), termineLe: new Date(), etape: 4 }), '/espace-pro/')
}

/* ------------------------------------------------------------------ */
/* Missions                                                             */
/* ------------------------------------------------------------------ */

export async function enregistrerPresentation(donnees: FormData): Promise<never> {
  const texte = String(donnees.get('presentation') ?? '').trim()
  if (texte.length > PRESENTATION_MAX) return erreur(donnees, `${PRESENTATION_MAX} caractères au plus.`)
  return ecrire(donnees, () => ({ presentation: texte || null, presentationConfirmeeLe: new Date() }), '/espace-pro/progression/')
}

export async function enregistrerSoins(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const profession = String(donnees.get('profession') ?? 'dentiste') as Parameters<typeof orientationsDe>[0]
  const permis = new Set(orientationsDe(profession).map((o) => o.code))
  const orientations = donnees.getAll('orientation').map(String).filter((c) => permis.has(c))
  if (!slug) return erreur(donnees, 'Fiche introuvable.')
  return ecrire(donnees, () => ({ orientations }), '/espace-pro/progression/')
}

export async function enregistrerLiens(donnees: FormData): Promise<never> {
  const site = String(donnees.get('site') ?? '').trim()
  const rdv = String(donnees.get('rdv') ?? '').trim()
  if ((site && !lienValide(site)) || (rdv && !lienValide(rdv))) return erreur(donnees, 'Une adresse ne ressemble pas à un lien web : elle doit commencer par https://')
  return ecrire(donnees, () => ({ siteWeb: site || null, rdvEnLigne: rdv || null, liensEchecs: {}, liensTestesLe: null }), '/espace-pro/progression/')
}

/** MIS-1 : la photo, déjà téléversée en stockage public ; ici, son adresse. Vide : retirer. */
export async function enregistrerPhoto(donnees: FormData): Promise<never> {
  const url = String(donnees.get('photo') ?? '').trim()
  const droits = donnees.get('droits') === 'on'
  if (url && !droits) return erreur(donnees, 'Confirmez que vous détenez les droits de cette photo.')
  if (url && !/^(https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\/|\/uploads\/|\/photos\/[0-9a-f-]{36}\.jpg$)/.test(url)) return erreur(donnees, 'Photo non reconnue.')
  return ecrire(donnees, () => ({ photoUrl: url || null, photoConfirmeeLe: url ? new Date() : null }), '/espace-pro/progression/')
}

/* ------------------------------------------------------------------ */
/* Fraîcheur                                                            */
/* ------------------------------------------------------------------ */

const COLONNE_CONFIRMATION: Record<CleFraicheur | 'delais' | 'zone' | 'savoir_faire' | 'realisations', keyof Valeurs> = {
  horaires: 'horairesConfirmesLe',
  conventionnement: 'conventionnementConfirmeLe',
  accueil: 'accueilConfirmeLe',
  presentation: 'presentationConfirmeeLe',
  photo: 'photoConfirmeeLe',
  delais: 'delaisConfirmesLe',
  zone: 'zoneConfirmeeLe',
  savoir_faire: 'savoirFaireConfirmeLe',
  realisations: 'realisationsConfirmeesLe',
}

/** « C'est toujours juste » : un clic, sans ressaisie, remet le compteur à zéro. */
export async function reconfirmer(donnees: FormData): Promise<never> {
  const bloc = String(donnees.get('bloc') ?? '') as keyof typeof COLONNE_CONFIRMATION
  const colonne = COLONNE_CONFIRMATION[bloc]
  if (!colonne) return erreur(donnees, 'Bloc inconnu.')
  return ecrire(donnees, () => ({ [colonne]: new Date() }), '/espace-pro/fraicheur/')
}

/* ------------------------------------------------------------------ */
/* Laboratoire                                                          */
/* ------------------------------------------------------------------ */

const codesDe = (liste: readonly { code: string }[]) => new Set(liste.map((e) => e.code))

/** LO1 : techniques, matériaux, usinage CFAO. Trois techniques au moins pour les points. */
export async function enregistrerSavoirFaire(donnees: FormData): Promise<never> {
  const t = codesDe(TECHNIQUES)
  const m = codesDe(MATERIAUX)
  const techniques = donnees.getAll('technique').map(String).filter((c) => t.has(c))
  const materiaux = donnees.getAll('materiau').map(String).filter((c) => m.has(c))
  if (!techniques.length && !materiaux.length) return erreur(donnees, 'Choisissez au moins une technique ou un matériau, ou passez cette étape.')
  return ecrire(
    donnees,
    () => ({
      techniques,
      materiaux,
      usinage: donnees.get('usinage') === 'on',
      empreintesStl: donnees.get('stl') === 'on' || techniques.includes('cfao'),
      impression3d: donnees.get('impression3d') === 'on',
      savoirFaireConfirmeLe: new Date(),
      etape: 1,
    }),
    '/espace-pro/',
  )
}

function lireDelais(donnees: FormData): Record<string, number> | null {
  const codes = codesDe(PIECES)
  const delais: Record<string, number> = {}
  for (const [cle, valeur] of donnees.entries()) {
    if (!cle.startsWith('delai_')) continue
    const code = cle.slice(6)
    const j = Math.round(Number(valeur))
    if (!codes.has(code) || !Number.isFinite(j)) continue
    if (j < DELAI_MIN || j > DELAI_MAX) return null
    delais[code] = j
  }
  return delais
}

function lireZone(donnees: FormData) {
  const rayon = Math.round(Number(donnees.get('rayon')))
  if (!Number.isFinite(rayon) || rayon < RAYON_MIN || rayon > RAYON_MAX) return null
  const jours = codesDe(JOURS_RAMASSAGE)
  return {
    rayonKm: rayon,
    ramassage: donnees.get('ramassage') === 'on',
    joursRamassage: donnees.getAll('jour').map(String).filter((j) => jours.has(j)),
    transporteur: donnees.has('transporteur') ? donnees.get('transporteur') === 'on' : undefined,
    zoneConfirmeeLe: new Date(),
  }
}

/** LO2 : délais moyens par pièce et zone desservie. */
export async function enregistrerDelaisEtZone(donnees: FormData): Promise<never> {
  const delais = lireDelais(donnees)
  const zone = lireZone(donnees)
  if (!delais || !zone) return erreur(donnees, `Délais de ${DELAI_MIN} à ${DELAI_MAX} jours ouvrés, rayon de ${RAYON_MIN} à ${RAYON_MAX} km.`)
  return ecrire(donnees, () => ({ delais, delaisConfirmesLe: new Date(), ...zone, etape: 2 }), '/espace-pro/')
}

/** Délais seuls, depuis le tableau de bord. */
export async function enregistrerDelais(donnees: FormData): Promise<never> {
  const delais = lireDelais(donnees)
  if (!delais || !Object.keys(delais).length) return erreur(donnees, `Un délai au moins, de ${DELAI_MIN} à ${DELAI_MAX} jours ouvrés.`)
  return ecrire(donnees, () => ({ delais, delaisConfirmesLe: new Date() }), '/espace-pro/delais/')
}

/** Zone et logistique, depuis le tableau de bord. */
export async function enregistrerZone(donnees: FormData): Promise<never> {
  const zone = lireZone(donnees)
  if (!zone) return erreur(donnees, `Rayon de ${RAYON_MIN} à ${RAYON_MAX} km.`)
  return ecrire(donnees, () => ({ ...zone, transporteur: donnees.get('transporteur') === 'on' }), '/espace-pro/zone/')
}

/** Réalisations : une à huit photos déjà téléversées, avec légende et crédit. */
export async function enregistrerRealisations(donnees: FormData): Promise<never> {
  let photos: { url: string; legende: string }[] = []
  try {
    photos = JSON.parse(String(donnees.get('realisations') ?? '[]'))
  } catch {
    return erreur(donnees, 'Photos illisibles.')
  }
  photos = photos
    .filter((p) => typeof p?.url === 'string' && /^(https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\/|\/uploads\/|\/photos\/[0-9a-f-]{36}\.jpg$)/.test(p.url))
    .slice(0, REALISATIONS_MAX)
    .map((p) => ({ url: p.url, legende: String(p.legende ?? '').trim().slice(0, 120) }))
  if (photos.length && donnees.get('droits') !== 'on') return erreur(donnees, 'Confirmez que le laboratoire détient les droits de ces photos.')
  const credit = String(donnees.get('credit') ?? '').trim().slice(0, 120) || null
  return ecrire(donnees, () => ({ realisations: photos, creditPhotos: credit, realisationsConfirmeesLe: photos.length ? new Date() : null }), '/espace-pro/realisations/')
}

/** Déclaration ANSM : numéro et date. Vide : retirer. */
export async function enregistrerAnsm(donnees: FormData): Promise<never> {
  const numero = String(donnees.get('numero') ?? '').trim().toUpperCase()
  const date = String(donnees.get('date') ?? '')
  if (numero && !/^[A-Z0-9-]{4,40}$/.test(numero)) return erreur(donnees, 'Le numéro ne ressemble pas à une référence de déclaration.')
  const le = date ? new Date(date) : null
  if (numero && (!le || Number.isNaN(le.getTime()) || le > new Date())) return erreur(donnees, 'Indiquez la date de la déclaration.')
  return ecrire(donnees, () => ({ ansmNumero: numero || null, ansmDeclareLe: numero ? le : null }), '/espace-pro/conformite/')
}

/** LK1 : relier le laboratoire à la fiche du praticien qui le dirige. Les deux fiches restent distinctes. */
export async function lierPraticien(donnees: FormData): Promise<never> {
  const cible = String(donnees.get('praticien') ?? '')
  const { rows } = cible ? await db.execute<{ id: string }>(sql`SELECT id FROM praticiens WHERE slug = ${cible} AND profession = 'dentiste' AND deleted_at IS NULL LIMIT 1`) : { rows: [] }
  if (!rows[0]) return erreur(donnees, 'Fiche praticien introuvable.')
  return ecrire(donnees, () => ({ praticienLieId: rows[0].id }), '/espace-pro/')
}

/* ------------------------------------------------------------------ */
/* Rappels par email                                                    */
/* ------------------------------------------------------------------ */

/** Rétablir les rappels coupés depuis un email : un bouton de « Fraîcheur ». */
export async function retablirRappels(donnees: FormData): Promise<never> {
  return ecrire(donnees, () => ({ rappelsCoupesLe: null }), '/espace-pro/fraicheur/')
}
