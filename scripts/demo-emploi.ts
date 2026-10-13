/**
 * Offres d'emploi de démonstration, pour voir les pages publiques sur une
 * base de développement ou de prévisualisation. Les offres des maquettes :
 * Bordeaux et la Gironde surtout, quelques grandes villes pour les pages
 * nationales. Identifiants préfixés `demo_`.
 *
 *   pnpm tsx scripts/demo-emploi.ts --auteur prenom.nom@exemple.fr
 *   pnpm tsx scripts/demo-emploi.ts --supprimer
 *
 * Les recruteurs sont de vrais praticiens de la base, choisis dans la commune
 * de chaque offre (un dentiste, ou un laboratoire pour la prothèse), en
 * variant d'une offre à l'autre ; la position, la commune et le département
 * sont recopiés de leur lieu d'exercice, comme le fera la publication depuis
 * l'espace pro. L'auteur (colonne obligatoire) est un compte existant, passé
 * par adresse ou identifiant.
 *
 * Refuse de tourner sur la base de production (hôte `ep-polished-band`).
 * `DATABASE_URL` est lue dans l'environnement, sinon dans `.env.local`.
 */
import { existsSync } from 'node:fs'
import { sql } from 'drizzle-orm'
import { slugifier } from './sync/lib/slug'

const PRODUCTION = 'ep-polished-band'

type Demo = {
  id: string
  titre: string
  metier: 'assistant_dentaire' | 'secretaire' | 'prothesiste' | 'aide_dentaire' | 'chirurgien_dentiste' | 'assistant_specialise'
  contrat: 'cdi' | 'cdd' | 'alternance' | 'stage' | 'remplacement' | 'collaboration'
  tempsPlein: boolean
  heures?: number
  debut?: string
  fin?: string
  mode: 'salaire' | 'retrocession' | 'redevance' | 'gratification'
  min: number
  max: number
  /** Nom de la commune et code du département : la commune est résolue en base. */
  commune: string
  departement: string
  /** Publiée il y a tant de jours. */
  age: number
  description?: string
  profil?: string
  avantages?: string[]
}

const NOTE = 'Offre de démonstration : recruteur réel choisi au hasard dans la commune, poste, dates et montants inventés.'

const DESCRIPTION_AD = `Le cabinet recherche un(e) assistant(e) dentaire qualifié(e) pour rejoindre une équipe de cinq personnes, en soins courants, prothèse et implantologie.

Assistance au fauteuil en soins courants, prothèse et implantologie
Accueil des patients, gestion du planning et des appels
Stérilisation, traçabilité et préparation des salles de soins
Prise de radiographies et suivi des dossiers patients
Gestion des stocks et des commandes auprès des fournisseurs`

const PROFIL_AD = `Titre d’assistant(e) dentaire, ou formation en cours de validation
Une première expérience en cabinet est appréciée
Sens de l’accueil et goût du travail en équipe`

const AVANTAGES = ['Mutuelle d’entreprise prise en charge à 60 %', 'Titres-restaurant', 'Abonnement de transport remboursé à 50 %', 'Formation continue financée']

const DESCRIPTION_REMP = `Remplacement d’un chirurgien-dentiste pendant son absence. Patientèle d’omnipratique installée, une assistante au fauteuil pendant toute la durée.

Omnipratique : soins conservateurs, endodontie, prothèse fixe
Une vingtaine de patients par jour, urgences du jour en fin de matinée`

const OFFRES: Demo[] = [
  { id: 'demo_o1', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2026-11-03', mode: 'salaire', min: 2100, max: 2400, commune: 'Bordeaux', departement: '33', age: 6, description: DESCRIPTION_AD, profil: PROFIL_AD, avantages: AVANTAGES },
  { id: 'demo_o7', titre: 'Assistant(e) dentaire', metier: 'assistant_dentaire', contrat: 'cdd', tempsPlein: true, heures: 35, mode: 'salaire', min: 2000, max: 2200, commune: 'Bordeaux', departement: '33', age: 3 },
  { id: 'demo_o11', titre: 'Assistant(e) dentaire, chirurgie implantaire', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2026-12-01', mode: 'salaire', min: 2200, max: 2600, commune: 'Bordeaux', departement: '33', age: 4 },
  { id: 'demo_o13', titre: 'Assistant(e) dentaire, pédodontie', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2027-01-05', mode: 'salaire', min: 2100, max: 2350, commune: 'Bordeaux', departement: '33', age: 7 },
  { id: 'demo_o10', titre: 'Assistant(e) dentaire', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: true, heures: 35, mode: 'salaire', min: 2050, max: 2300, commune: 'Bordeaux', departement: '33', age: 11 },
  { id: 'demo_o12', titre: 'Assistant(e) dentaire, débutant(e) accepté(e)', metier: 'assistant_dentaire', contrat: 'cdd', tempsPlein: false, heures: 30, debut: '2026-11-17', mode: 'salaire', min: 1700, max: 1850, commune: 'Bordeaux', departement: '33', age: 12 },
  { id: 'demo_o8', titre: 'Assistant(e) dentaire en orthodontie', metier: 'assistant_specialise', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2027-01-05', mode: 'salaire', min: 2150, max: 2450, commune: 'Le Bouscat', departement: '33', age: 7 },
  { id: 'demo_o9', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: false, heures: 32, debut: '2026-12-01', mode: 'salaire', min: 1950, max: 2250, commune: 'Mérignac', departement: '33', age: 10 },
  { id: 'demo_o3', titre: 'Secrétaire et assistant(e) de gestion', metier: 'secretaire', contrat: 'cdi', tempsPlein: false, heures: 24, debut: '2026-12-01', mode: 'salaire', min: 1350, max: 1500, commune: 'Bordeaux', departement: '33', age: 4 },
  { id: 'demo_o6', titre: 'Aide dentaire', metier: 'aide_dentaire', contrat: 'cdi', tempsPlein: false, heures: 28, debut: '2026-11-17', mode: 'salaire', min: 1450, max: 1600, commune: 'Bègles', departement: '33', age: 5 },
  { id: 'demo_o2', titre: 'Prothésiste dentaire céramiste', metier: 'prothesiste', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2027-01-05', mode: 'salaire', min: 2300, max: 2800, commune: 'Mérignac', departement: '33', age: 2 },
  { id: 'demo_r1', titre: 'Remplacement de chirurgien-dentiste', metier: 'chirurgien_dentiste', contrat: 'remplacement', tempsPlein: false, debut: '2026-12-01', fin: '2026-12-19', mode: 'retrocession', min: 40, max: 40, commune: 'Pessac', departement: '33', age: 3, description: DESCRIPTION_REMP },
  { id: 'demo_r2', titre: 'Collaboration libérale', metier: 'chirurgien_dentiste', contrat: 'collaboration', tempsPlein: false, debut: '2027-01-05', mode: 'redevance', min: 35, max: 35, commune: 'Bègles', departement: '33', age: 6 },
  { id: 'demo_r3', titre: 'Remplacement pendant un congé maternité', metier: 'chirurgien_dentiste', contrat: 'remplacement', tempsPlein: true, debut: '2027-02-01', fin: '2027-05-31', mode: 'retrocession', min: 45, max: 45, commune: 'Bordeaux', departement: '33', age: 9 },
  { id: 'demo_r4', titre: 'Chirurgien-dentiste salarié(e)', metier: 'chirurgien_dentiste', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2026-12-01', mode: 'salaire', min: 5500, max: 6500, commune: 'Mérignac', departement: '33', age: 10 },
  { id: 'demo_r5', titre: 'Remplacement ponctuel', metier: 'chirurgien_dentiste', contrat: 'remplacement', tempsPlein: true, debut: '2027-02-15', fin: '2027-02-26', mode: 'retrocession', min: 40, max: 40, commune: 'Mérignac', departement: '33', age: 14 },
  { id: 'demo_a1', titre: 'Assistant(e) dentaire en alternance', metier: 'assistant_dentaire', contrat: 'alternance', tempsPlein: true, debut: '2027-01-05', mode: 'salaire', min: 1100, max: 1350, commune: 'Bordeaux', departement: '33', age: 4 },
  { id: 'demo_a2', titre: 'Prothésiste dentaire en alternance, BTMS', metier: 'prothesiste', contrat: 'alternance', tempsPlein: true, debut: '2027-09-01', mode: 'salaire', min: 1200, max: 1450, commune: 'Mérignac', departement: '33', age: 2 },
  { id: 'demo_a3', titre: 'Assistant(e) de gestion en alternance', metier: 'secretaire', contrat: 'alternance', tempsPlein: true, debut: '2027-01-05', mode: 'salaire', min: 1050, max: 1250, commune: 'Talence', departement: '33', age: 7 },
  { id: 'demo_s1', titre: 'Stage d’assistant(e) dentaire', metier: 'assistant_dentaire', contrat: 'stage', tempsPlein: true, debut: '2027-03-02', fin: '2027-04-10', mode: 'gratification', min: 0, max: 0, commune: 'Bordeaux', departement: '33', age: 5 },
  { id: 'demo_v1', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2026-12-01', mode: 'salaire', min: 2000, max: 2300, commune: 'Libourne', departement: '33', age: 5 },
  { id: 'demo_v2', titre: 'Assistant(e) dentaire', metier: 'assistant_dentaire', contrat: 'cdd', tempsPlein: true, heures: 35, mode: 'salaire', min: 1950, max: 2150, commune: 'Libourne', departement: '33', age: 9 },
  { id: 'demo_v3', titre: 'Assistant(e) dentaire en alternance', metier: 'assistant_dentaire', contrat: 'alternance', tempsPlein: true, debut: '2027-01-05', mode: 'salaire', min: 1100, max: 1350, commune: 'Castillon-la-Bataille', departement: '33', age: 11 },
  { id: 'demo_n1', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'assistant_dentaire', contrat: 'cdi', tempsPlein: true, heures: 35, mode: 'salaire', min: 2150, max: 2450, commune: 'Lyon', departement: '69', age: 2 },
  { id: 'demo_n2', titre: 'Secrétaire de centre de santé dentaire', metier: 'secretaire', contrat: 'cdi', tempsPlein: true, heures: 35, debut: '2026-12-01', mode: 'salaire', min: 1950, max: 2150, commune: 'Nantes', departement: '44', age: 3 },
  { id: 'demo_n3', titre: 'Aide dentaire', metier: 'aide_dentaire', contrat: 'cdd', tempsPlein: false, heures: 28, debut: '2026-11-17', mode: 'salaire', min: 1450, max: 1550, commune: 'Lille', departement: '59', age: 4 },
]

function argument(nom: string): string | undefined {
  const i = process.argv.indexOf(nom)
  return i > -1 ? process.argv[i + 1] : undefined
}

async function main() {
  if (!process.env.DATABASE_URL && existsSync('.env.local')) process.loadEnvFile('.env.local')
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL manquante.')
  const hote = new URL(url).hostname
  if (hote.includes(PRODUCTION)) {
    console.error(`Refusé : ${hote} est la base de production. Pointez DATABASE_URL vers une branche de développement.`)
    process.exit(1)
  }

  // Import après la vérification : `@/db` ouvre la connexion dès son chargement.
  const { db } = await import('../src/db')

  if (process.argv.includes('--supprimer')) {
    const { rows } = await db.execute<{ id: string }>(sql`DELETE FROM offres WHERE starts_with(id, 'demo_') RETURNING id`)
    console.log(`${rows.length} offre(s) de démonstration supprimée(s) sur ${hote}.`)
    return
  }

  const auteur = argument('--auteur')
  if (!auteur) throw new Error('Indiquez le compte auteur : --auteur <adresse ou identifiant>.')
  const { rows: comptes } = await db.execute<{ id: string }>(sql`SELECT id FROM "user" WHERE email = ${auteur.toLowerCase()} OR id::text = ${auteur} LIMIT 1`)
  const userId = comptes[0]?.id
  if (!userId) throw new Error(`Aucun compte pour « ${auteur} ».`)

  /** Rang du praticien dans sa commune : deux offres de la même commune n'ont pas le même recruteur, sauf faute de choix. */
  const rangs = new Map<string, number>()

  for (const o of OFFRES) {
    const profession = o.metier === 'prothesiste' ? 'prothesiste' : 'dentiste'
    const cle = `${o.commune}:${profession}`
    const rang = rangs.get(cle) ?? 0
    rangs.set(cle, rang + 1)

    // Un praticien vivant avec un lieu situé dans la commune (ou l'un de ses arrondissements).
    const { rows: candidats } = await db.execute<{ praticien_id: string; lieu_id: string; code_insee: string; departement_code: string; commune_nom: string }>(sql`
      SELECT DISTINCT ON (p.id) p.id AS praticien_id, l.id AS lieu_id, c.code_insee, c.departement_code, c.nom AS commune_nom
      FROM communes m
      JOIN communes c ON c.code_insee = m.code_insee OR c.commune_parente_code = m.code_insee
      JOIN lieux_exercice l ON l.code_insee = c.code_insee AND l.position IS NOT NULL AND NOT l.position_approximative
      JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
      WHERE m.nom = ${o.commune} AND m.departement_code = ${o.departement} AND m.type = 'commune'
      ORDER BY p.id, l.principal DESC, l.id
      LIMIT 1 OFFSET ${rang}
    `)
    const r = candidats[0]
    if (!r) {
      console.warn(`Aucun ${profession} situé à ${o.commune} (rang ${rang}) : ${o.id} ignorée.`)
      continue
    }

    const publiee = new Date(Date.now() - o.age * 86_400_000)
    const confirmee = new Date(Math.max(publiee.getTime(), Date.now() - (o.age % 15) * 86_400_000))
    const expire = new Date(publiee.getTime() + 30 * 86_400_000)
    const slug = `${slugifier(o.titre)}-${slugifier(r.commune_nom)}-${o.id.replace('demo_', '')}`
    const description = `${o.description ?? `${o.titre}, à ${r.commune_nom}.`}\n\n${NOTE}`

    await db.execute(sql`
      INSERT INTO offres (
        id, auteur_user_id, praticien_id, lieu_id, slug, metier, contrat, temps_plein, heures_hebdo, debut, fin,
        mode_remuneration, remuneration_min, remuneration_max, titre, description, profil, avantages,
        commune_code, departement_code, position, statut, publiee_le, confirmee_le, expire_le
      ) VALUES (
        ${o.id}, ${userId}::uuid, ${r.praticien_id}, ${r.lieu_id}, ${slug}, ${o.metier}, ${o.contrat}, ${o.tempsPlein}, ${o.heures ?? null},
        ${o.debut ?? null}, ${o.fin ?? null}, ${o.mode}, ${o.min}, ${o.max}, ${o.titre}, ${description}, ${o.profil ?? null},
        ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(o.avantages ?? [])}::jsonb))::text[],
        ${r.code_insee}, ${r.departement_code}, (SELECT position FROM lieux_exercice WHERE id = ${r.lieu_id}),
        'en_ligne', ${publiee.toISOString()}, ${confirmee.toISOString()}, ${expire.toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        auteur_user_id = EXCLUDED.auteur_user_id, praticien_id = EXCLUDED.praticien_id, lieu_id = EXCLUDED.lieu_id, slug = EXCLUDED.slug,
        metier = EXCLUDED.metier, contrat = EXCLUDED.contrat, temps_plein = EXCLUDED.temps_plein, heures_hebdo = EXCLUDED.heures_hebdo,
        debut = EXCLUDED.debut, fin = EXCLUDED.fin, mode_remuneration = EXCLUDED.mode_remuneration,
        remuneration_min = EXCLUDED.remuneration_min, remuneration_max = EXCLUDED.remuneration_max, titre = EXCLUDED.titre,
        description = EXCLUDED.description, profil = EXCLUDED.profil, avantages = EXCLUDED.avantages,
        commune_code = EXCLUDED.commune_code, departement_code = EXCLUDED.departement_code, position = EXCLUDED.position,
        statut = 'en_ligne', publiee_le = EXCLUDED.publiee_le, confirmee_le = EXCLUDED.confirmee_le, expire_le = EXCLUDED.expire_le,
        cloturee_le = NULL, maj_le = now()
    `)
    console.log(`${o.id} : /emploi/offre/${slug}/`)
  }
  console.log(`Fait sur ${hote}. Les pages se rafraîchissent à la revalidation du tag « emploi » (ou au redémarrage de \`next dev\`).`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
