/**
 * Formations privées de démonstration, pour voir les pages publiques sur une
 * base de développement : organismes, dates, lieux et tarifs inventés.
 *
 *   pnpm tsx scripts/demo-formations-privees.ts --auteur prenom.nom@exemple.fr
 *   pnpm tsx scripts/demo-formations-privees.ts --supprimer
 *
 * Écrit seulement dans Neon (`demandes_formation`, statut `publiee`,
 * identifiants `demo_…`, adresses `demo-…`), jamais dans WordPress. Sans
 * article WordPress, ces formations ne paraissent pas sur les pages publiques :
 * elles se voient sur la démonstration `/maquettes/formation-privee-demo/`,
 * qui les passe par les mêmes fonctions.
 *
 * Publiées il y a 90 jours : l'alerte des praticiens ne regarde que les 60
 * derniers jours, aucun email ne part pour elles.
 *
 * L'auteur (colonne obligatoire) est un compte existant, passé par adresse ou
 * identifiant. Refuse de tourner sur la base de production (hôte
 * `ep-polished-band`). `DATABASE_URL` est lue dans l'environnement, sinon dans
 * `.env.local`.
 */
import { existsSync } from 'node:fs'
import { sql } from 'drizzle-orm'
import { Proposition, type Verifications } from '../src/lib/formation/privee'

const PRODUCTION = 'ep-polished-band'

type Demo = { id: string; slug: string; verifications?: Verifications; donnees: Record<string, unknown> }

const base = { siren: '', resume: '', programme: [], prerequis: [], tarif: '', siteOrganisme: '' }

const FORMATIONS: Demo[] = [
  {
    id: 'demo_fp1',
    slug: 'demo-implantologie-pose-guidee',
    verifications: { Qualiopi: 'liste publique des organismes certifiés' },
    donnees: {
      ...base,
      organisme: 'Atelier Implanto Formation',
      intitule: 'Implantologie : de la planification à la pose guidée',
      theme: 'Implantologie',
      publics: ['Chirurgiens-dentistes'],
      format: 'Mixte',
      duree: '4 jours',
      sessions: [
        { dates: '14 et 15 novembre 2026', debut: '2026-11-14', region: '75', ville: 'Bordeaux', places: 4 },
        { dates: '23 et 24 janvier 2027', debut: '2027-01-23', region: 'en-ligne', ville: '', places: null },
        { dates: '13 et 14 mars 2027', debut: '2027-03-13', region: '76', ville: 'Toulouse', places: null },
      ],
      resume: 'Quatre jours pour planifier un cas implantaire sur cone beam, concevoir un guide chirurgical et poser en conditions réelles, sur modèles puis en démonstration.',
      programme: [
        { titre: 'Planification', detail: 'Lecture du cone beam, choix de l’implant, projet prothétique', duree: 'Jour 1' },
        { titre: 'Guide chirurgical', detail: 'Conception numérique, impression, contrôle', duree: 'Jour 2' },
        { titre: 'Pose guidée', detail: 'Travaux pratiques sur modèles, protocole d’asepsie', duree: 'Jour 3' },
        { titre: 'Suivi et cas cliniques', detail: 'Mise en charge, complications, analyse de cas', duree: 'Jour 4, à distance' },
      ],
      prerequis: ['Chirurgien-dentiste inscrit à l’Ordre', 'Pratique de la chirurgie orale de base', 'Ordinateur pour la journée à distance'],
      tarif: '2 400 €',
      priseEnCharge: ['DPC', 'Qualiopi'],
      lienInscription: 'https://atelier-implanto.example/inscription',
      siteOrganisme: 'https://atelier-implanto.example',
    },
  },
  {
    id: 'demo_fp2',
    slug: 'demo-endodontie-mecanisee',
    donnees: {
      ...base,
      organisme: 'Cercle Endo Formation',
      intitule: 'Endodontie mécanisée au quotidien',
      theme: 'Endodontie',
      publics: ['Chirurgiens-dentistes'],
      format: 'Présentiel',
      duree: '2 jours',
      sessions: [{ dates: '28 et 29 novembre 2026', debut: '2026-11-28', region: '76', ville: 'Toulouse', places: 12 }],
      programme: [
        { titre: 'Mise en forme canalaire', detail: 'Instruments en rotation continue et en réciprocité', duree: 'Jour 1' },
        { titre: 'Obturation', detail: 'Techniques à chaud, contrôle radiographique', duree: 'Jour 2' },
      ],
      tarif: '1 150 €',
      priseEnCharge: ['FIF PL'],
      lienInscription: 'https://cercle-endo.example/sessions',
    },
  },
  {
    id: 'demo_fp3',
    slug: 'demo-parodontologie-non-chirurgicale',
    donnees: {
      ...base,
      organisme: 'Paro Campus',
      intitule: 'Parodontologie non chirurgicale',
      theme: 'Parodontologie',
      publics: ['Chirurgiens-dentistes', 'Assistant(e)s'],
      format: 'Distanciel',
      duree: '6 heures',
      sessions: [{ dates: '3 décembre 2026', debut: '2026-12-03', region: 'en-ligne', ville: '', places: null }],
      resume: 'Diagnostic, assainissement et maintenance parodontale, en classe virtuelle.',
      tarif: '390 €',
      priseEnCharge: ['DPC'],
      lienInscription: 'https://paro-campus.example/paro',
      siteOrganisme: 'https://paro-campus.example',
    },
  },
  {
    id: 'demo_fp4',
    slug: 'demo-radioprotection-patients',
    verifications: { DPC: 'liste des actions de l’ANDPC' },
    donnees: {
      ...base,
      organisme: 'Paro Campus',
      intitule: 'Radioprotection des patients',
      theme: 'Radioprotection',
      publics: ['Chirurgiens-dentistes'],
      format: 'Distanciel',
      duree: '7 heures',
      sessions: [{ dates: '9 décembre 2026', debut: '2026-12-09', region: 'en-ligne', ville: '', places: null }],
      tarif: '290 €',
      priseEnCharge: ['DPC', 'FIF PL'],
      lienInscription: 'https://paro-campus.example/radioprotection',
      siteOrganisme: 'https://paro-campus.example',
    },
  },
  {
    id: 'demo_fp5',
    slug: 'demo-cfao-zircone',
    donnees: {
      ...base,
      organisme: 'CFAO Studio',
      intitule: 'CFAO et zircone monolithique',
      theme: 'Prothèse et CFAO',
      publics: ['Prothésistes'],
      format: 'Présentiel',
      duree: '3 jours',
      sessions: [{ dates: '18 au 20 janvier 2027', debut: '2027-01-18', region: '84', ville: 'Lyon', places: 8 }],
      prerequis: ['Prothésiste dentaire en exercice'],
      priseEnCharge: [],
      lienInscription: 'https://cfao-studio.example/zircone',
    },
  },
  {
    id: 'demo_fp6',
    slug: 'demo-gestion-du-cabinet',
    donnees: {
      ...base,
      organisme: 'Cabinet et Gestion',
      intitule: 'Piloter la gestion de son cabinet',
      theme: 'Gestion du cabinet',
      publics: ['Chirurgiens-dentistes', 'Assistant(e)s'],
      format: 'Mixte',
      duree: '2 jours',
      sessions: [{ dates: '5 février 2027', debut: '2027-02-05', region: '11', ville: 'Paris', places: null }],
      tarif: '890 €',
      priseEnCharge: ['FIF PL'],
      lienInscription: 'https://cabinet-gestion.example/formation',
    },
  },
  {
    // Sessions passées : absente de la liste, sa fiche montre l'état « aucune session à venir ».
    id: 'demo_fp7',
    slug: 'demo-hygiene-sterilisation',
    donnees: {
      ...base,
      organisme: 'Hygiène Dentaire Formation',
      intitule: 'Hygiène et stérilisation au cabinet',
      theme: 'Hygiène',
      publics: ['Assistant(e)s'],
      format: 'Présentiel',
      duree: '1 jour',
      sessions: [{ dates: '12 septembre 2026', debut: '2026-09-12', region: '53', ville: 'Rennes', places: null }],
      priseEnCharge: [],
      lienInscription: 'https://hygiene-dentaire.example/sterilisation',
    },
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
    const { rows } = await db.execute<{ id: string }>(sql`DELETE FROM demandes_formation WHERE starts_with(id, 'demo_') RETURNING id`)
    console.log(`${rows.length} formation(s) de démonstration supprimée(s) sur ${hote}.`)
    return
  }

  const auteur = argument('--auteur')
  if (!auteur) throw new Error('Indiquez le compte auteur : --auteur <adresse ou identifiant>.')
  const { rows: comptes } = await db.execute<{ id: string }>(sql`SELECT id FROM "user" WHERE email = ${auteur.toLowerCase()} OR id::text = ${auteur} LIMIT 1`)
  const userId = comptes[0]?.id
  if (!userId) throw new Error(`Aucun compte pour « ${auteur} ».`)

  for (const f of FORMATIONS) {
    // Le même contrôle que la demande depuis l'espace pro.
    const donnees = Proposition.parse(f.donnees)
    await db.execute(sql`
      INSERT INTO demandes_formation (id, user_id, statut, donnees, verifications, wp_slug, demande_le, traite_le, publiee_le)
      VALUES (
        ${f.id}, ${userId}::uuid, 'publiee', ${JSON.stringify(donnees)}::jsonb, ${JSON.stringify(f.verifications ?? {})}::jsonb, ${f.slug},
        now() - interval '95 days', now() - interval '90 days', now() - interval '90 days'
      )
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id, statut = 'publiee', motif = NULL, donnees = EXCLUDED.donnees, verifications = EXCLUDED.verifications,
        wp_slug = EXCLUDED.wp_slug, traite_le = EXCLUDED.traite_le, publiee_le = EXCLUDED.publiee_le
    `)
    console.log(`${f.id} : /maquettes/formation-privee-demo/${f.slug}/`)
  }
  console.log(`Fait sur ${hote}. Les pages se rafraîchissent à la revalidation du tag « wp:formation » (ou au redémarrage de \`next dev\`).`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
