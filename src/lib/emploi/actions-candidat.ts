'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { getCompte } from '@/lib/tunnel/compte'
import { CV_MAX_OCTETS } from './candidature'
import { rangerCv } from './cv'
import { CODES_CONTRAT, type CodeContrat } from './metiers'
import {
  COMPETENCES,
  CODES_SITUATION,
  DISPONIBILITES,
  EXPERIENCES_MAX,
  QUALIFICATIONS,
  RAYONS_CANDIDAT,
  etapesBienvenue,
  lireCriteres,
  situationDe,
  type Criteres,
  type Experience,
  type Formation,
  type Situation,
} from './profil-candidat'

/**
 * Le profil candidat : parcours de bienvenue (SE1 à SE5), page « Mon
 * profil » (CAND-PROFIL) et visibilité (CAND-VISI). Un compte connecté
 * suffit, quel qu'il soit. Aucun document de vérification n'est conservé ;
 * seul le CV, facultatif, l'est, en stockage privé.
 */

export type EtatProfil = { erreur?: string; champ?: string } | null

const BIENVENUE = '/espace-candidat/bienvenue/'
const PROFIL = '/espace-candidat/profil/'

async function compteOuConnexion(retour: string) {
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  return compte
}

/** Un retour interne seulement (`/emploi/offre/…`), jamais une adresse extérieure. */
function retourSur(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '')
  return /^\/[\w\-/]*(\?[\w=&%-]*)?$/.test(s) && !s.startsWith('//') ? s : null
}

const tableau = (valeurs: string[]) => sql`ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(valeurs)}::jsonb))::text[]`

function lireCriteresSaisis(donnees: FormData, avant: Criteres): Criteres | { erreur: string; champ: string } {
  const contrats = donnees.getAll('contrats').map(String).filter((c): c is CodeContrat => (CODES_CONTRAT as readonly string[]).includes(c))
  const temps = String(donnees.get('temps') ?? 'tous')
  const commune = String(donnees.get('commune') ?? '')
  const communeNom = String(donnees.get('communeNom') ?? '').trim()
  const rayon = Number(donnees.get('rayon'))
  const disponibilite = String(donnees.get('disponibilite') ?? '')
  if (!contrats.length) return { erreur: 'Choisissez au moins un contrat.', champ: 'contrats' }
  if (!/^[0-9AB]{5}$/.test(commune) && !avant.commune) return { erreur: 'Choisissez votre ville dans la liste.', champ: 'commune' }
  return {
    contrats,
    temps: temps === 'plein' || temps === 'partiel' ? temps : 'tous',
    commune: /^[0-9AB]{5}$/.test(commune) ? commune : avant.commune,
    communeNom: /^[0-9AB]{5}$/.test(commune) ? communeNom.slice(0, 80) : avant.communeNom,
    rayonKm: (RAYONS_CANDIDAT as readonly number[]).includes(rayon) ? rayon : avant.rayonKm,
    disponibilite: (DISPONIBILITES as readonly string[]).includes(disponibilite) ? disponibilite : avant.disponibilite,
  }
}

async function profilBrut(userId: string) {
  const { rows } = await db.execute<{ situation: Situation; criteres: unknown }>(sql`SELECT situation, criteres FROM candidats WHERE user_id = ${userId}::uuid`)
  return rows[0] ?? null
}

/** Une étape du parcours de bienvenue, puis la suivante. */
export async function enregistrerBienvenue(_: EtatProfil, donnees: FormData): Promise<EtatProfil> {
  const etape = String(donnees.get('etape') ?? '')
  const retour = retourSur(donnees.get('retour'))
  const compte = await compteOuConnexion(`${BIENVENUE}situation/`)
  const avant = await profilBrut(compte.id)

  if (etape === 'situation') {
    const situation = String(donnees.get('situation') ?? '')
    if (!(CODES_SITUATION as string[]).includes(situation)) return { erreur: 'Choisissez votre situation.', champ: 'situation' }
    await db.execute(sql`
      INSERT INTO candidats (user_id, situation) VALUES (${compte.id}::uuid, ${situation})
      ON CONFLICT (user_id) DO UPDATE SET situation = excluded.situation, maj_le = now()
    `)
  } else {
    if (!avant) redirect(chemin(`${BIENVENUE}situation/`))
    if (etape === 'recherche') {
      const c = lireCriteresSaisis(donnees, lireCriteres(avant.criteres))
      if ('erreur' in c) return c
      await db.execute(sql`UPDATE candidats SET criteres = ${JSON.stringify(c)}::jsonb, maj_le = now() WHERE user_id = ${compte.id}::uuid`)
    } else if (etape === 'qualification') {
      const q = String(donnees.get('qualification') ?? '')
      if (!(QUALIFICATIONS as readonly string[]).includes(q)) return { erreur: 'Choisissez une réponse.', champ: 'qualification' }
      await db.execute(sql`UPDATE candidats SET qualification = ${q}, maj_le = now() WHERE user_id = ${compte.id}::uuid`)
    } else if (etape === 'formation') {
      const f = formationSaisie(donnees)
      await db.execute(sql`UPDATE candidats SET formation = ${JSON.stringify(f)}::jsonb, maj_le = now() WHERE user_id = ${compte.id}::uuid`)
    } else if (etape === 'visibilite') {
      const v = String(donnees.get('visibilite') ?? '')
      if (v !== 'visible' && v !== 'anonyme' && v !== 'discret') return { erreur: 'Choisissez qui peut voir votre profil.', champ: 'visibilite' }
      await db.execute(sql`UPDATE candidats SET visibilite = ${v}, maj_le = now() WHERE user_id = ${compte.id}::uuid`)
      if (donnees.get('alertes') === 'oui') await premiereAlerte(compte.id, avant.situation, lireCriteres(avant.criteres))
    } else if (etape === 'pret') {
      await db.execute(sql`UPDATE candidats SET termine_le = coalesce(termine_le, now()), maj_le = now() WHERE user_id = ${compte.id}::uuid`)
      redirect(chemin(retour ?? (donnees.get('suite') === 'profil' ? PROFIL : '/emploi/')))
    } else {
      return { erreur: 'Étape inconnue.' }
    }
  }

  const situation = etape === 'situation' ? (String(donnees.get('situation')) as Situation) : avant!.situation
  const etapes = etapesBienvenue(situation)
  const suivante = etapes[etapes.indexOf(etape as (typeof etapes)[number]) + 1] ?? 'pret'
  redirect(chemin(`${BIENVENUE}${suivante}/${retour ? `?retour=${encodeURIComponent(retour)}` : ''}`))
}

function formationSaisie(donnees: FormData): Formation {
  const [ecole = '', ecoleNom = ''] = String(donnees.get('ecole') ?? '').split('|')
  const recherche = donnees.getAll('recherche').map(String).filter((r): r is Formation['recherche'][number] => r === 'alternance' || r === 'stage' || r === 'job')
  return {
    ecole: ecole.slice(0, 200) || undefined,
    ecoleNom: ecoleNom.slice(0, 200) || undefined,
    cursus: String(donnees.get('cursus') ?? '').trim().slice(0, 120) || undefined,
    annee: String(donnees.get('annee') ?? '').slice(0, 40) || undefined,
    recherche,
  }
}

/** SE4 : la première alerte, aux critères de la recherche, si la personne l'accepte. Confirmée d'office : l'adresse du compte l'est déjà. */
async function premiereAlerte(userId: string, situation: Situation, c: Criteres) {
  const { rows } = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM alertes_emploi WHERE user_id = ${userId}::uuid`)
  if (rows[0]?.n) return
  const metier = situationDe(situation)?.metier
  const criteres = { metiers: metier ? [metier] : [], contrats: [...c.contrats].sort(), ...(c.commune ? { commune: c.commune, rayonKm: c.rayonKm } : {}) }
  await db.execute(sql`
    INSERT INTO alertes_emploi (id, user_id, criteres, confirmee_le, active) VALUES (${randomUUID()}, ${userId}::uuid, ${JSON.stringify(criteres)}::jsonb, now(), true)
  `)
}

/** CAND-PROFIL : tout le profil, d'un enregistrement. */
export async function enregistrerProfil(_: EtatProfil, donnees: FormData): Promise<EtatProfil> {
  const compte = await compteOuConnexion(PROFIL)
  const avant = await profilBrut(compte.id)
  if (!avant) redirect(chemin(`${BIENVENUE}situation/`))
  const situation = String(donnees.get('situation') ?? avant.situation)
  if (!(CODES_SITUATION as string[]).includes(situation)) return { erreur: 'Choisissez votre situation.', champ: 'situation' }
  const c = lireCriteresSaisis(donnees, lireCriteres(avant.criteres))
  if ('erreur' in c) return c
  const q = String(donnees.get('qualification') ?? '')
  const qualification = (QUALIFICATIONS as readonly string[]).includes(q) ? q : null

  const postes = donnees.getAll('poste').map(String)
  const structures = donnees.getAll('structure').map(String)
  const periodes = donnees.getAll('periode').map(String)
  const experiences: Experience[] = postes
    .map((poste, i) => ({ poste: poste.trim().slice(0, 80), structure: (structures[i] ?? '').trim().slice(0, 120), periode: (periodes[i] ?? '').trim().slice(0, 60) }))
    .filter((e) => e.poste)
    .slice(0, EXPERIENCES_MAX)
  const proposees = COMPETENCES[situation as Situation]
  const competences = donnees.getAll('competences').map(String).filter((x) => proposees.includes(x))

  const cv = donnees.get('cv')
  const avecCv = cv instanceof File && cv.size > 0
  if (avecCv && (cv.type !== 'application/pdf' || cv.size > CV_MAX_OCTETS)) return { erreur: 'Le CV doit être un PDF de 5 Mo au plus.', champ: 'cv' }
  const cvSql = avecCv
    ? sql`, cv_chemin = ${await rangerCv(cv, compte.id)}, cv_nom = ${cv.name.slice(0, 120)}, cv_taille = ${cv.size}`
    : donnees.get('cvRetirer') === 'oui'
      ? sql`, cv_chemin = NULL, cv_nom = NULL, cv_taille = NULL`
      : sql``

  await db.execute(sql`
    UPDATE candidats SET situation = ${situation}, qualification = ${qualification}, criteres = ${JSON.stringify(c)}::jsonb,
      experiences = ${JSON.stringify(experiences)}::jsonb, competences = ${tableau(competences)},
      formation = ${situation === 'etudiant' ? sql`${JSON.stringify(formationSaisie(donnees))}::jsonb` : sql`formation`}
      ${cvSql}, maj_le = now()
    WHERE user_id = ${compte.id}::uuid
  `)
  redirect(chemin(`${PROFIL}?fait=profil`))
}

/** CAND-VISI : visible, anonymisé ou discret. */
export async function enregistrerVisibilite(donnees: FormData): Promise<never> {
  const compte = await compteOuConnexion('/espace-candidat/visibilite/')
  const v = String(donnees.get('visibilite') ?? '')
  if (v === 'visible' || v === 'anonyme' || v === 'discret') {
    await db.execute(sql`UPDATE candidats SET visibilite = ${v}, maj_le = now() WHERE user_id = ${compte.id}::uuid`)
  }
  redirect(chemin('/espace-candidat/visibilite/?fait=visibilite'))
}

/** OUV-C-MASQUER : masquer une structure, ou la retirer de la liste. */
export async function masquerStructure(donnees: FormData): Promise<never> {
  const compte = await compteOuConnexion('/espace-candidat/visibilite/')
  const slug = String(donnees.get('structure') ?? '')
  const retirer = donnees.get('geste') === 'retirer'
  if (/^[a-z0-9-]{3,200}$/.test(slug)) {
    await db.execute(
      retirer
        ? sql`UPDATE candidats SET structures_masquees = array_remove(structures_masquees, ${slug}), maj_le = now() WHERE user_id = ${compte.id}::uuid`
        : sql`UPDATE candidats SET structures_masquees = array_append(array_remove(structures_masquees, ${slug}), ${slug}), maj_le = now()
              WHERE user_id = ${compte.id}::uuid AND EXISTS (SELECT 1 FROM praticiens WHERE slug = ${slug})`,
    )
  }
  redirect(chemin(`/espace-candidat/visibilite/?fait=${retirer ? 'retiree' : 'masquee'}`))
}
