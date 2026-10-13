/**
 * Annonces de cession de démonstration, pour voir les pages publiques sur une
 * base de développement ou de prévisualisation. Six annonces en Gironde,
 * secteurs, montants et dates inventés ; identifiants préfixés `demo_`.
 *
 *   pnpm tsx scripts/demo-cessions.ts --auteur prenom.nom@exemple.fr [--praticien <id>]
 *   pnpm tsx scripts/demo-cessions.ts --supprimer
 *
 * L'auteur est un compte existant (adresse ou identifiant). Le praticien est
 * celui de sa fiche revendiquée, ou celui passé par `--praticien`. Le centre
 * et le rayon du secteur suivent la règle des pages : centre de la commune,
 * rayon selon sa population (`rayonSecteur`).
 *
 * Refuse de tourner sur la base de production (hôte `ep-polished-band`).
 * `DATABASE_URL` est lue dans l'environnement, sinon dans `.env.local`.
 */
import { existsSync } from 'node:fs'
import { sql } from 'drizzle-orm'
import { rayonSecteur, dateExpiration } from '../src/lib/cessions/format'
import { slugifier } from './sync/lib/slug'

const PRODUCTION = 'ep-polished-band'

type Demo = {
  id: string
  titre: string
  type: 'cabinet' | 'parts' | 'patientele' | 'murs'
  commune: string
  secteur: string
  fauteuils: number
  ca?: [number, number]
  prix?: number
  surface?: number
  disponibilite: string
  photos: string[]
  /** Publiée il y a tant de jours. */
  age: number
  description: string
  equipements?: string[]
  conditions?: string
  locaux?: string
}

const ANNONCES: Demo[] = [
  {
    id: 'demo_c1',
    titre: 'Cabinet deux fauteuils, clientèle fidèle',
    type: 'cabinet',
    commune: '33063',
    secteur: 'Bordeaux rive droite',
    fauteuils: 2,
    ca: [380, 450],
    prix: 210,
    surface: 95,
    disponibilite: '2027-01',
    photos: ['/images/demo/pexels-6627320.jpg'],
    age: 11,
    description:
      'Cabinet de deux fauteuils en rez-de-chaussée, à proximité du tram. Patientèle familiale fidèle, agenda complet à trois semaines.\n\nAnnonce de démonstration : secteur, montants et dates inventés.',
    equipements: ['Deux fauteuils récents', 'Radiographie panoramique', 'Caméra intra-orale', 'Autoclave et salle de stérilisation', 'Logiciel de gestion et dossiers numérisés'],
    conditions: 'Accompagnement du repreneur pendant trois mois\nPrésentation à la patientèle\nReprise possible de l’assistante dentaire\nBail commercial transférable',
    locaux: '95 m², rez-de-chaussée\nAccessible aux personnes à mobilité réduite\nSalle d’attente, deux salles de soins, bureau',
  },
  {
    id: 'demo_c2',
    titre: 'Parts de SELARL, cabinet de groupe trois praticiens',
    type: 'parts',
    commune: '33281',
    secteur: 'Mérignac',
    fauteuils: 4,
    ca: [900, 1100],
    disponibilite: 'D’ici six mois',
    photos: ['/images/demo/pexels-6627447.jpg'],
    age: 15,
    description: 'Cession de parts dans une SELARL de trois praticiens, quatre fauteuils, plateau technique partagé.\n\nAnnonce de démonstration : secteur, montants et dates inventés.',
    equipements: ['Quatre fauteuils', 'Cone beam partagé', 'Stérilisation centralisée'],
    conditions: 'Période de collaboration préalable possible\nPacte d’associés communiqué après premier échange',
  },
  {
    id: 'demo_c3',
    titre: 'Patientèle à reprendre, départ en retraite',
    type: 'patientele',
    commune: '33318',
    secteur: 'Pessac',
    fauteuils: 1,
    ca: [220, 260],
    prix: 65,
    disponibilite: 'immediate',
    photos: [],
    age: 6,
    description: 'Départ en retraite : patientèle de quartier à reprendre, présentation assurée.\n\nAnnonce de démonstration : secteur, montants et dates inventés.',
    conditions: 'Présentation personnalisée à la patientèle\nTransmission des dossiers dans les règles',
  },
  {
    id: 'demo_c4',
    titre: 'Locaux de cabinet dentaire équipés, rez-de-chaussée',
    type: 'murs',
    commune: '33522',
    secteur: 'Talence',
    fauteuils: 2,
    prix: 290,
    surface: 120,
    disponibilite: 'immediate',
    photos: ['/images/demo/pexels-7800669.jpg'],
    age: 24,
    description: 'Murs d’un cabinet dentaire de 120 m², équipés, en rez-de-chaussée sur rue passante.\n\nAnnonce de démonstration : secteur, montants et dates inventés.',
    locaux: '120 m², rez-de-chaussée\nDeux salles de soins plombées\nStationnement à proximité',
  },
  {
    id: 'demo_c5',
    titre: 'Cabinet trois fauteuils avec cone beam',
    type: 'cabinet',
    commune: '33243',
    secteur: 'Libourne',
    fauteuils: 3,
    ca: [520, 600],
    disponibilite: 'Mi-2027',
    photos: [],
    age: 2,
    description: 'Cabinet de trois fauteuils, cone beam et bloc de chirurgie, équipe en place.\n\nAnnonce de démonstration : secteur, montants et dates inventés.',
    equipements: ['Trois fauteuils', 'Cone beam', 'Bloc de chirurgie'],
  },
  {
    id: 'demo_c6',
    titre: 'Cabinet un fauteuil en centre-bourg',
    type: 'cabinet',
    commune: '33009',
    secteur: 'Bassin d’Arcachon',
    fauteuils: 1,
    ca: [260, 300],
    prix: 120,
    surface: 70,
    disponibilite: 'D’ici six mois',
    photos: ['/images/demo/pexels-3881296.jpg'],
    age: 18,
    description: 'Cabinet d’un fauteuil en centre-bourg, patientèle locale et saisonnière.\n\nAnnonce de démonstration : secteur, montants et dates inventés.',
    locaux: '70 m²\nSalle d’attente et salle de soins',
  },
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
    const { rows } = await db.execute<{ id: string }>(sql`DELETE FROM annonces_cession WHERE starts_with(id, 'demo_') RETURNING id`)
    console.log(`${rows.length} annonce(s) de démonstration supprimée(s) sur ${hote}.`)
    return
  }

  const auteur = argument('--auteur')
  if (!auteur) throw new Error('Indiquez le compte auteur : --auteur <adresse ou identifiant>.')
  const { rows: comptes } = await db.execute<{ id: string }>(sql`SELECT id FROM "user" WHERE email = ${auteur.toLowerCase()} OR id::text = ${auteur} LIMIT 1`)
  const userId = comptes[0]?.id
  if (!userId) throw new Error(`Aucun compte pour « ${auteur} ».`)

  let praticienId = argument('--praticien')
  if (!praticienId) {
    const { rows } = await db.execute<{ praticien_id: string }>(sql`
      SELECT praticien_id FROM revendications WHERE user_id = ${userId}::uuid AND statut = 'acceptee' AND praticien_id IS NOT NULL LIMIT 1
    `)
    praticienId = rows[0]?.praticien_id
  }
  if (!praticienId) throw new Error('Ce compte ne gère aucune fiche : passez --praticien <id>.')

  for (const a of ANNONCES) {
    const { rows: communes } = await db.execute<{ nom: string; departement_code: string; population: number | null }>(sql`
      SELECT nom, departement_code, population FROM communes WHERE code_insee = ${a.commune} AND centre IS NOT NULL
    `)
    const c = communes[0]
    if (!c) {
      console.warn(`Commune ${a.commune} absente ou sans centre : ${a.id} ignorée.`)
      continue
    }
    const publiee = new Date(Date.now() - a.age * 86_400_000)
    const expire = dateExpiration(publiee)
    const slug = `${slugifier(a.titre)}-${slugifier(c.nom)}-${a.id.replace('demo_', '')}`
    await db.execute(sql`
      INSERT INTO annonces_cession (
        id, auteur_user_id, praticien_id, slug, statut, type, titre, description, commune_code, departement_code,
        secteur, centre, rayon_m, fauteuils, ca_min, ca_max, prix, surface, disponibilite, equipements, conditions, locaux,
        photos, soumise_le, publiee_le, expire_le
      ) VALUES (
        ${a.id}, ${userId}::uuid, ${praticienId}, ${slug}, 'publiee', ${a.type}, ${a.titre}, ${a.description}, ${a.commune}, ${c.departement_code},
        ${a.secteur}, (SELECT centre FROM communes WHERE code_insee = ${a.commune}), ${rayonSecteur(c.population)},
        ${a.fauteuils}, ${a.ca?.[0] ?? null}, ${a.ca?.[1] ?? null}, ${a.prix ?? null}, ${a.surface ?? null}, ${a.disponibilite},
        ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(a.equipements ?? [])}::jsonb))::text[],
        ${a.conditions ?? null}, ${a.locaux ?? null},
        ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(a.photos)}::jsonb))::text[],
        ${publiee.toISOString()}, ${publiee.toISOString()}, ${expire.toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        auteur_user_id = EXCLUDED.auteur_user_id, praticien_id = EXCLUDED.praticien_id, slug = EXCLUDED.slug, statut = 'publiee',
        type = EXCLUDED.type, titre = EXCLUDED.titre, description = EXCLUDED.description, commune_code = EXCLUDED.commune_code,
        departement_code = EXCLUDED.departement_code, secteur = EXCLUDED.secteur, centre = EXCLUDED.centre, rayon_m = EXCLUDED.rayon_m,
        fauteuils = EXCLUDED.fauteuils, ca_min = EXCLUDED.ca_min, ca_max = EXCLUDED.ca_max, prix = EXCLUDED.prix, surface = EXCLUDED.surface,
        disponibilite = EXCLUDED.disponibilite, equipements = EXCLUDED.equipements, conditions = EXCLUDED.conditions, locaux = EXCLUDED.locaux,
        photos = EXCLUDED.photos, soumise_le = EXCLUDED.soumise_le, publiee_le = EXCLUDED.publiee_le, expire_le = EXCLUDED.expire_le, maj_le = now()
    `)
    console.log(`${a.id} : /annonces/cession/…/${slug}/ (rayon ${rayonSecteur(c.population) / 1000} km)`)
  }
  console.log(`Fait sur ${hote}. Les pages se rafraîchissent à la revalidation du tag « cessions » (ou au redémarrage de \`next dev\`).`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
