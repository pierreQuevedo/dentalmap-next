'use server'

import { randomBytes, randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { decouperDescription } from './format'
import { CODES_CONTRAT, CODES_METIER, metierDepuisCode, type CodeContrat } from './metiers'
import { AVANTAGES, DUREE_OFFRE_JOURS, PRESENTATION_MIN, estEtapeOffre, etapeSuivante, manquesOffre, modeDuContrat, slugOffre, type EtapeOffre } from './offre-pro'
import { getCabinetRecrutement, invalider, recruteur } from './recruteur'

/**
 * Les étapes de « Créer un poste » (`/espace-pro/emploi/creer/<etape>/`).
 * Chaque étape enregistre ce qu'elle porte, puis mène à la suivante :
 *
 * - `cabinet` : présentation, avantages et lieu par défaut, communs à toutes
 *   les offres de la fiche (`recrutement_cabinets`) ;
 * - `poste` : crée le brouillon à la première visite, le met à jour ensuite ;
 * - `remuneration`, `annonce` : complètent l'offre ;
 * - `publication` : la met en ligne, palier Ambassadeur requis.
 *
 * Un brouillon se remplit librement. Une offre déjà en ligne garde à chaque
 * étape les règles de publication : elle ne redevient jamais incomplète.
 */

/** Sur une erreur, la saisie revient avec le message : le formulaire ne se vide pas. */
export type EtatEtape = { erreur?: string; champ?: string; saisie?: Record<string, string | string[]>; n?: number } | null

const lignes = (v: string | undefined) =>
  (v ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')

const tableau = (valeurs: string[]) => sql`ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(valeurs)}::jsonb))::text[]`

const Cabinet = z.object({
  presentation: z.string().trim().max(1200, 'La présentation du cabinet dépasse 1 200 caractères.'),
  lieu: z.string().optional(),
})

const Poste = z.object({
  metier: z.enum(CODES_METIER),
  titre: z.string().trim().min(5, 'Un intitulé de 5 caractères au moins.').max(120),
  contrat: z.enum(CODES_CONTRAT),
  temps: z.enum(['plein', 'partiel']),
  heures: z.coerce.number().int().min(1).max(48).optional().or(z.literal('').transform(() => undefined)),
  debut: z.string().trim().max(40).optional(),
  fin: z.string().trim().max(40).optional(),
  lieu: z.string().min(1, 'Choisissez le lieu du poste.'),
})

const Remuneration = z.object({
  min: z.coerce.number({ message: 'Indiquez une rémunération minimum.' }).int().min(0),
  max: z.coerce.number({ message: 'Indiquez une rémunération maximum.' }).int().min(0),
})

const Annonce = z.object({
  presentation: z.string().trim().max(700, 'La présentation dépasse 700 caractères.'),
  missions: z.string().trim().max(800, 'Les missions dépassent 800 caractères.').optional(),
  profil: z.string().trim().max(800).optional(),
})

function erreurDe(e: z.ZodError): EtatEtape {
  const p = e.issues[0]
  return { erreur: p.message.startsWith('Invalid') || p.message.startsWith('Too') ? 'Un champ est incomplet.' : p.message, champ: String(p.path[0] ?? '') }
}

type LigneOffre = { id: string; slug: string; statut: string; contrat: CodeContrat; titre: string; remuneration_min: number; remuneration_max: number; description: string }

export async function enregistrerEtape(precedent: EtatEtape, donnees: FormData): Promise<EtatEtape> {
  const etat = await enregistrer(donnees)
  if (!etat) return etat
  const saisie: Record<string, string | string[]> = {}
  for (const k of new Set(donnees.keys())) {
    const v = donnees.getAll(k).map(String)
    saisie[k] = k === 'avantages' ? v : (v[0] ?? '')
  }
  return { ...etat, saisie, n: (precedent?.n ?? 0) + 1 }
}

async function enregistrer(donnees: FormData): Promise<EtatEtape> {
  const etape = String(donnees.get('etape') ?? '')
  if (!estEtapeOffre(etape)) return { erreur: 'Étape inconnue.' }
  const intention = String(donnees.get('intention') ?? 'suivant')
  const publier = etape === 'publication' && intention === 'publier'
  const r = await recruteur(String(donnees.get('fiche') ?? ''), publier)
  if (!r) return { erreur: publier ? 'Publier une offre demande une fiche vérifiée au palier Ambassadeur.' : 'Une offre demande une fiche à l’identité vérifiée.' }
  const { compte, espace } = r
  const praticien = espace.fiche.id
  const q = espace.autres.length ? `fiche=${encodeURIComponent(espace.fiche.slug)}&` : ''
  let id = String(donnees.get('offre') ?? '') || null

  let offre: LigneOffre | null = null
  if (id) {
    const { rows } = await db.execute<LigneOffre>(sql`
      SELECT id, slug, statut, contrat, titre, remuneration_min, remuneration_max, description FROM offres WHERE id = ${id} AND praticien_id = ${praticien}
    `)
    offre = rows[0] ?? null
    if (!offre) return { erreur: 'Offre introuvable.' }
  }
  const enLigne = offre?.statut === 'en_ligne'
  // Une offre en ligne garde les règles de publication ; un brouillon se remplit librement.
  const strict = enLigne || intention === 'suivant'

  if (etape === 'cabinet') {
    const lu = Cabinet.safeParse(Object.fromEntries(donnees))
    if (!lu.success) return erreurDe(lu.error)
    const lieu = espace.fiche.lieux.find((l) => l.id === lu.data.lieu)?.id ?? null
    const avantages = donnees.getAll('avantages').map(String).filter((a) => (AVANTAGES as readonly string[]).includes(a))
    await db.execute(sql`
      INSERT INTO recrutement_cabinets (praticien_id, presentation, avantages, lieu_id, maj_le)
      VALUES (${praticien}, ${lu.data.presentation || null}, ${tableau(avantages)}, ${lieu}, now())
      ON CONFLICT (praticien_id) DO UPDATE SET presentation = excluded.presentation, avantages = excluded.avantages, lieu_id = excluded.lieu_id, maj_le = now()
    `)
    // Le cabinet s'affiche sur la page de chaque offre en ligne.
    const { rows } = await db.execute<{ slug: string }>(sql`SELECT slug FROM offres WHERE praticien_id = ${praticien} AND statut = 'en_ligne'`)
    for (const o of rows) invalider(o.slug, espace.fiche.slug)
  }

  if (etape === 'poste') {
    const lu = Poste.safeParse(Object.fromEntries(donnees))
    if (!lu.success) return erreurDe(lu.error)
    const v = lu.data
    const lieu = espace.fiche.lieux.find((l) => l.id === v.lieu)
    if (!lieu) return { erreur: 'Ce lieu n’est pas l’un de vos lieux d’exercice.', champ: 'lieu' }
    const { rows: geo } = await db.execute<{ code_insee: string; departement_code: string; commune_slug: string }>(sql`
      SELECT c.code_insee, c.departement_code, c.slug AS commune_slug
      FROM lieux_exercice l JOIN communes c ON c.code_insee = l.code_insee WHERE l.id = ${lieu.id}
    `)
    if (!geo[0]) return { erreur: 'La commune de ce lieu est inconnue : choisissez-en un autre.', champ: 'lieu' }
    const mode = modeDuContrat(v.contrat)
    const champs = sql`
      metier = ${v.metier}, titre = ${v.titre}, contrat = ${v.contrat}, temps_plein = ${v.temps === 'plein'},
      heures_hebdo = ${v.heures ?? null}, debut = ${v.debut || null}, fin = ${v.fin || null}, mode_remuneration = ${mode},
      lieu_id = ${lieu.id}, commune_code = ${geo[0].code_insee}, departement_code = ${geo[0].departement_code},
      position = (SELECT position FROM lieux_exercice WHERE id = ${lieu.id}), maj_le = now()`
    if (offre) {
      const changeDeMode = modeDuContrat(offre.contrat) !== mode
      if (enLigne && changeDeMode) return { erreur: 'Une offre en ligne garde sa famille de contrat : publiez une nouvelle offre pour celui-ci.', champ: 'contrat' }
      // Changer de famille de contrat change d'unité : la fourchette est à ressaisir.
      await db.execute(sql`
        UPDATE offres SET ${champs}${changeDeMode ? sql`, remuneration_min = 0, remuneration_max = 0` : sql``}
        WHERE id = ${offre.id} AND praticien_id = ${praticien}
      `)
      if (enLigne) invalider(offre.slug, espace.fiche.slug)
    } else {
      const cabinet = await getCabinetRecrutement(praticien)
      id = randomUUID()
      const slug = slugOffre(metierDepuisCode(v.metier).slug, geo[0].commune_slug, randomBytes(3).toString('hex'))
      await db.execute(sql`
        INSERT INTO offres (id, auteur_user_id, praticien_id, lieu_id, slug, metier, contrat, temps_plein, heures_hebdo, debut, fin,
          mode_remuneration, remuneration_min, remuneration_max, titre, description, avantages,
          commune_code, departement_code, position, statut)
        VALUES (${id}, ${compte.id}::uuid, ${praticien}, ${lieu.id}, ${slug}, ${v.metier}, ${v.contrat}, ${v.temps === 'plein'}, ${v.heures ?? null},
          ${v.debut || null}, ${v.fin || null}, ${mode}, 0, 0, ${v.titre}, '', ${tableau(cabinet.avantages)},
          ${geo[0].code_insee}, ${geo[0].departement_code}, (SELECT position FROM lieux_exercice WHERE id = ${lieu.id}), 'brouillon')
      `)
    }
  }

  if (etape === 'remuneration') {
    if (!offre) return { erreur: 'Commencez par le poste.' }
    const lu = Remuneration.safeParse(Object.fromEntries(donnees))
    if (!lu.success) return erreurDe(lu.error)
    if (strict) {
      const manque = manquesOffre({ contrat: offre.contrat, min: lu.data.min, max: lu.data.max, titre: offre.titre, presentation: '' }).find((m) => m.etape === 'remuneration')
      if (manque) return { erreur: manque.message, champ: 'min' }
    }
    await db.execute(sql`UPDATE offres SET remuneration_min = ${lu.data.min}, remuneration_max = ${lu.data.max}, maj_le = now() WHERE id = ${offre.id} AND praticien_id = ${praticien}`)
    if (enLigne) invalider(offre.slug, espace.fiche.slug)
  }

  if (etape === 'annonce') {
    if (!offre) return { erreur: 'Commencez par le poste.' }
    const lu = Annonce.safeParse(Object.fromEntries(donnees))
    if (!lu.success) return erreurDe(lu.error)
    const v = lu.data
    if (strict && v.presentation.length < PRESENTATION_MIN) return { erreur: `Une présentation du poste de ${PRESENTATION_MIN} caractères au moins.`, champ: 'presentation' }
    const avantages = donnees.getAll('avantages').map(String).filter((a) => (AVANTAGES as readonly string[]).includes(a))
    // La description publique : la présentation, puis une mission par ligne (`decouperDescription`).
    const description = [v.presentation.replace(/\s*\n\s*/g, ' '), lignes(v.missions)].filter(Boolean).join('\n\n')
    await db.execute(sql`
      UPDATE offres SET description = ${description}, profil = ${lignes(v.profil) || null}, avantages = ${tableau(avantages)}, maj_le = now()
      WHERE id = ${offre.id} AND praticien_id = ${praticien}
    `)
    if (enLigne) invalider(offre.slug, espace.fiche.slug)
  }

  if (etape === 'publication') {
    if (!offre) return { erreur: 'Commencez par le poste.' }
    if (intention === 'publier') {
      const manque = manquesOffre({ contrat: offre.contrat, min: offre.remuneration_min, max: offre.remuneration_max, titre: offre.titre, presentation: decouperDescription(offre.description).resume })[0]
      if (manque) return { erreur: manque.message }
      if (!enLigne) {
        await db.execute(sql`
          UPDATE offres SET statut = 'en_ligne', publiee_le = now(), confirmee_le = now(), expire_le = now() + make_interval(days => ${DUREE_OFFRE_JOURS}), cloturee_le = NULL, maj_le = now()
          WHERE id = ${offre.id} AND praticien_id = ${praticien}
        `)
      }
      invalider(offre.slug, espace.fiche.slug)
      redirect(chemin(`/espace-pro/emploi/${offre.id}/?${q}${enLigne ? 'modifiee' : 'publiee'}=1`))
    }
  }

  const offreQ = id ? `offre=${id}&` : ''
  // Enregistrer et quitter : la page de l'offre, ou la liste quand il n'y en a pas encore.
  if (intention === 'brouillon' || etape === 'publication') {
    redirect(chemin(id ? `/espace-pro/emploi/${id}/?${q}brouillon=1` : `/espace-pro/emploi/?${q}cabinet=1`))
  }
  const suivante: EtapeOffre = etapeSuivante(etape) ?? 'publication'
  const qs = (q + offreQ).replace(/&$/, '')
  redirect(chemin(`/espace-pro/emploi/creer/${suivante}/${qs ? `?${qs}` : ''}`))
}

