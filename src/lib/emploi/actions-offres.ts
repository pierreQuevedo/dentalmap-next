'use server'

import { randomBytes, randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { getCompte } from '@/lib/tunnel/compte'
import { getEspace } from '@/lib/espace-pro/espace'
import { pointsDeLEspace } from '@/lib/espace-pro/progression-donnees'
import { PALIER_EMPLOI, progressionDe } from '@/lib/espace-pro/progression'
import { CODES_CONTRAT, CODES_METIER, metierDepuisCode } from './metiers'
import { AVANTAGES, DUREE_OFFRE_JOURS, enPourcentage, modeDuContrat, slugOffre } from './offre-pro'

/**
 * Les offres d'emploi d'une fiche, côté recruteur (D-EMPLOI). Réservé au
 * titulaire d'une fiche à l'identité vérifiée, pour l'un de ses lieux
 * d'exercice. Rémunération obligatoire. Publiée 30 jours ; le recruteur la
 * confirme tous les 15 jours.
 */

export type EtatFormulaireOffre = { erreur?: string; champ?: string } | null

/** Le titulaire vérifié de la fiche ; `null` sinon. `publier` : il tient en plus le palier Ambassadeur, qui ouvre la publication. */
async function recruteur(slug: string, publier = false) {
  const compte = await getCompte()
  if (!compte) return null
  const espace = await getEspace(compte, slug || null)
  if (!espace || !espace.ctx.identiteVerifiee || espace.fiche.demande?.statut !== 'acceptee') return null
  if (publier) {
    const points = await pointsDeLEspace(espace)
    if ((progressionDe(points.total, points.verifiee).actuel?.niveau ?? 0) < PALIER_EMPLOI) return null
  }
  return { compte, espace }
}

/** Les caches publics qui montrent l'offre : la recherche d'emploi, la page de l'offre, la fiche (« Recrute »). */
function invalider(offreSlug: string, ficheSlug: string) {
  updateTag('emploi')
  updateTag(`emploi:offre:${offreSlug}`)
  updateTag(`praticien:${ficheSlug}`)
}

const Offre = z.object({
  metier: z.enum(CODES_METIER),
  titre: z.string().trim().min(5, 'Un intitulé de 5 caractères au moins.').max(120),
  contrat: z.enum(CODES_CONTRAT),
  temps: z.enum(['plein', 'partiel']),
  heures: z.coerce.number().int().min(1).max(48).optional().or(z.literal('').transform(() => undefined)),
  debut: z.string().trim().max(40).optional(),
  fin: z.string().trim().max(40).optional(),
  min: z.coerce.number({ message: 'Indiquez une rémunération minimum.' }).int().min(0),
  max: z.coerce.number({ message: 'Indiquez une rémunération maximum.' }).int().min(0),
  lieu: z.string().min(1, 'Choisissez le lieu du poste.'),
  presentation: z.string().trim().max(700, 'La présentation dépasse 700 caractères.'),
  missions: z.string().trim().max(800, 'Les missions dépassent 800 caractères.').optional(),
  profil: z.string().trim().max(800).optional(),
})

/** Publier ou enregistrer en brouillon une offre, nouvelle ou existante. */
export async function enregistrerOffre(_: EtatFormulaireOffre, donnees: FormData): Promise<EtatFormulaireOffre> {
  const brouillonDemande = donnees.get('intention') === 'brouillon'
  const r = await recruteur(String(donnees.get('fiche') ?? ''), !brouillonDemande)
  if (!r) return { erreur: brouillonDemande ? 'Une offre demande une fiche à l’identité vérifiée.' : 'Publier une offre demande une fiche vérifiée au palier Ambassadeur.' }
  const { compte, espace } = r
  const brouillon = donnees.get('intention') === 'brouillon'
  const lu = Offre.safeParse(Object.fromEntries(donnees))
  if (!lu.success) {
    const p = lu.error.issues[0]
    return { erreur: p.message.startsWith('Invalid') || p.message.startsWith('Too') ? 'Un champ est incomplet.' : p.message, champ: String(p.path[0] ?? '') }
  }
  const v = lu.data
  const pourcent = enPourcentage(v.contrat)
  const mode = modeDuContrat(v.contrat)
  if (!brouillon) {
    if (v.presentation.length < 80) return { erreur: 'Une présentation du poste de 80 caractères au moins pour publier.', champ: 'presentation' }
    if (mode !== 'gratification' && (v.min <= 0 || v.max <= 0)) return { erreur: 'La rémunération est obligatoire : indiquez une fourchette.', champ: 'min' }
    if (v.max < v.min) return { erreur: 'Le maximum doit être au moins égal au minimum.', champ: 'max' }
    if (pourcent && v.max > 100) return { erreur: 'Un pourcentage des honoraires ne dépasse pas 100.', champ: 'max' }
    if (!pourcent && mode === 'salaire' && v.min < 500) return { erreur: 'La rémunération se saisit en euros bruts par mois.', champ: 'min' }
  }
  const lieu = espace.fiche.lieux.find((l) => l.id === v.lieu)
  if (!lieu) return { erreur: 'Ce lieu n’est pas l’un de vos lieux d’exercice.', champ: 'lieu' }
  const { rows: geo } = await db.execute<{ code_insee: string; departement_code: string; commune_slug: string }>(sql`
    SELECT c.code_insee, c.departement_code, c.slug AS commune_slug
    FROM lieux_exercice l JOIN communes c ON c.code_insee = l.code_insee WHERE l.id = ${lieu.id}
  `)
  if (!geo[0]) return { erreur: 'La commune de ce lieu est inconnue : choisissez-en un autre.', champ: 'lieu' }
  const avantages = donnees.getAll('avantages').map(String).filter((a) => (AVANTAGES as readonly string[]).includes(a))
  const id = String(donnees.get('offre') ?? '') || null
  const statut = brouillon ? 'brouillon' : 'en_ligne'
  const champs = {
    metier: v.metier,
    titre: v.titre,
    contrat: v.contrat,
    tempsPlein: v.temps === 'plein',
    heures: v.heures ?? null,
    debut: v.debut || null,
    fin: v.fin || null,
    mode,
    min: v.min,
    max: v.max,
    // La description publique : la présentation, puis une mission par ligne (`decouperDescription`).
    description: [v.presentation.replace(/\s*\n\s*/g, ' '), (v.missions ?? '').split('\n').map((l) => l.trim()).filter(Boolean).join('\n')].filter(Boolean).join('\n\n'),
    profil: v.profil || null,
  }

  let slug: string
  if (id) {
    const { rows } = await db.execute<{ slug: string; statut: string }>(sql`
      UPDATE offres SET metier = ${champs.metier}, titre = ${champs.titre}, contrat = ${champs.contrat}, temps_plein = ${champs.tempsPlein},
        heures_hebdo = ${champs.heures}, debut = ${champs.debut}, fin = ${champs.fin}, mode_remuneration = ${champs.mode},
        remuneration_min = ${champs.min}, remuneration_max = ${champs.max}, description = ${champs.description}, profil = ${champs.profil},
        avantages = ${sql`ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(avantages)}::jsonb))::text[]`},
        lieu_id = ${lieu.id}, commune_code = ${geo[0].code_insee}, departement_code = ${geo[0].departement_code},
        position = (SELECT position FROM lieux_exercice WHERE id = ${lieu.id}),
        statut = CASE WHEN ${statut} = 'en_ligne' THEN 'en_ligne' ELSE statut END,
        publiee_le = CASE WHEN ${statut} = 'en_ligne' AND statut <> 'en_ligne' THEN now() ELSE publiee_le END,
        confirmee_le = CASE WHEN ${statut} = 'en_ligne' THEN now() ELSE confirmee_le END,
        expire_le = CASE WHEN ${statut} = 'en_ligne' AND statut <> 'en_ligne' THEN now() + make_interval(days => ${DUREE_OFFRE_JOURS}) ELSE expire_le END,
        maj_le = now()
      WHERE id = ${id} AND praticien_id = ${espace.fiche.id}
      RETURNING slug, statut
    `)
    if (!rows[0]) return { erreur: 'Offre introuvable.' }
    slug = rows[0].slug
  } else {
    slug = slugOffre(metierDepuisCode(v.metier).slug, geo[0].commune_slug, randomBytes(3).toString('hex'))
    await db.execute(sql`
      INSERT INTO offres (id, auteur_user_id, praticien_id, lieu_id, slug, metier, contrat, temps_plein, heures_hebdo, debut, fin,
        mode_remuneration, remuneration_min, remuneration_max, titre, description, profil, avantages,
        commune_code, departement_code, position, statut, publiee_le, confirmee_le, expire_le)
      VALUES (${randomUUID()}, ${compte.id}::uuid, ${espace.fiche.id}, ${lieu.id}, ${slug}, ${champs.metier}, ${champs.contrat}, ${champs.tempsPlein}, ${champs.heures},
        ${champs.debut}, ${champs.fin}, ${champs.mode}, ${champs.min}, ${champs.max}, ${champs.titre}, ${champs.description}, ${champs.profil},
        ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(avantages)}::jsonb))::text[],
        ${geo[0].code_insee}, ${geo[0].departement_code}, (SELECT position FROM lieux_exercice WHERE id = ${lieu.id}), ${statut},
        ${brouillon ? null : sql`now()`}, ${brouillon ? null : sql`now()`}, ${brouillon ? null : sql`now() + make_interval(days => ${DUREE_OFFRE_JOURS})`})
    `)
  }
  invalider(slug, espace.fiche.slug)
  const q = espace.autres.length ? `?fiche=${encodeURIComponent(espace.fiche.slug)}&` : '?'
  // Une offre modifiée revient sur sa page ; une nouvelle, sur la liste.
  redirect(chemin(`/espace-pro/emploi/${id ? `${id}/` : ''}${q}${brouillon ? 'brouillon=1' : 'publiee=1'}`))
}

/** Les gestes sur une offre existante : confirmer (15 jours), pourvue, retirer, republier (30 jours). */
export async function agirSurOffre(donnees: FormData): Promise<never> {
  const ficheSlug = String(donnees.get('fiche') ?? '')
  const geste0 = String(donnees.get('geste') ?? '')
  // Remettre une offre en ligne demande le palier Ambassadeur ; la confirmer, la clore ou la retirer, non.
  const r = await recruteur(ficheSlug, geste0 === 'republier')
  const q = r?.espace.autres.length ? `?fiche=${encodeURIComponent(r.espace.fiche.slug)}` : ''
  if (!r) redirect(chemin('/espace-pro/'))
  const id = String(donnees.get('offre') ?? '')
  const geste = String(donnees.get('geste') ?? '')
  const requete =
    geste === 'confirmer'
      ? sql`UPDATE offres SET confirmee_le = now(), maj_le = now() WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut = 'en_ligne' RETURNING slug`
      : geste === 'pourvue'
        ? sql`UPDATE offres SET statut = 'pourvue', cloturee_le = now(), maj_le = now() WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut = 'en_ligne' RETURNING slug`
        : geste === 'retirer'
          ? sql`UPDATE offres SET statut = 'retiree', cloturee_le = now(), maj_le = now() WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut IN ('en_ligne', 'brouillon') RETURNING slug`
          : geste === 'republier'
            ? sql`UPDATE offres SET statut = 'en_ligne', publiee_le = now(), confirmee_le = now(), expire_le = now() + make_interval(days => ${DUREE_OFFRE_JOURS}), cloturee_le = NULL, maj_le = now()
                  WHERE id = ${id} AND praticien_id = ${r.espace.fiche.id} AND statut IN ('pourvue', 'expiree', 'retiree', 'en_ligne') RETURNING slug`
            : null
  if (!requete) redirect(chemin(`/espace-pro/emploi/${q}`))
  const { rows } = await db.execute<{ slug: string }>(requete)
  if (rows[0]) invalider(rows[0].slug, r.espace.fiche.slug)
  // Depuis la page d'une offre, on y revient ; sinon, la liste.
  const retour = String(donnees.get('retour') ?? '')
  const page = /^\/espace-pro\/emploi\/[\w-]+\/$/.test(retour) ? retour : '/espace-pro/emploi/'
  redirect(chemin(`${page}${q}${q ? '&' : '?'}fait=${encodeURIComponent(geste)}`))
}
