/**
 * Redirections depuis l'ancien site WordPress.
 *
 * L'ancien dentalmap.fr était un prototype : 10 fiches de dentistes et 10 de
 * laboratoires, toutes en Gironde, relevées dans l'export WXR de la sauvegarde
 * du 10 septembre 2026. C'est l'intégralité des URL de praticiens à préserver.
 *
 * Règle de rapprochement : le slug d'origine préfixe le nouveau, qui lui ajoute
 * un discriminant. On exige en plus que la cible exerce dans le même
 * département. Sans cette contrainte, « art-dental » de Bordeaux se
 * rapprochait d'un laboratoire homonyme en Savoie : une redirection fausse est
 * pire qu'une page introuvable.
 *
 * Faute de cible fiable, on redirige vers la liste de la commune : l'intention
 * du visiteur est préservée, ce qui vaut mieux qu'une impasse.
 */
import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { redirections } from '@/db/schema'
import { encadrer } from './lib/run'

const ANCIENNES: { base: 'dentistes' | 'prothesistes'; dep: string; com: string; slug: string }[] = [
  { base: 'dentistes', dep: 'gironde', com: 'saint-loubes', slug: 'dr-valentine-charpentier' },
  { base: 'dentistes', dep: 'gironde', com: 'bruges', slug: 'dr-josephine-natiez' },
  { base: 'dentistes', dep: 'gironde', com: 'bruges', slug: 'dr-eva-ilharreguy' },
  { base: 'dentistes', dep: 'gironde', com: 'bordeaux', slug: 'dr-leilanie-firuu' },
  { base: 'dentistes', dep: 'gironde', com: 'begles', slug: 'dr-chloe-maradeix' },
  { base: 'dentistes', dep: 'gironde', com: 'bordeaux', slug: 'dr-marie-helene-biray' },
  { base: 'dentistes', dep: 'gironde', com: 'bordeaux', slug: 'dr-jerome-leclair' },
  { base: 'dentistes', dep: 'gironde', com: 'bordeaux', slug: 'dr-clementine-balloy' },
  { base: 'dentistes', dep: 'gironde', com: 'saint-medard-en-jalles', slug: 'dr-adrien-hottiaux' },
  { base: 'dentistes', dep: 'gironde', com: 'fargues-saint-hilaire', slug: 'dr-mohamed-ilyas-bekaddour' },
  { base: 'prothesistes', dep: 'gironde', com: 'bouliac', slug: 'corus-ortho-ios' },
  { base: 'prothesistes', dep: 'gironde', com: 'bordeaux', slug: 'andre-thierry' },
  { base: 'prothesistes', dep: 'gironde', com: 'bouliac', slug: 'corus-lso-bertin' },
  { base: 'prothesistes', dep: 'gironde', com: 'eysines', slug: 'aquitaine-adjointe-wojeik-frederic' },
  { base: 'prothesistes', dep: 'gironde', com: 'bordeaux', slug: 'art-dental' },
  { base: 'prothesistes', dep: 'gironde', com: 'bordeaux', slug: 'artdent' },
  { base: 'prothesistes', dep: 'gironde', com: 'bordeaux', slug: 'biesse' },
  { base: 'prothesistes', dep: 'gironde', com: 'bordeaux', slug: 'bodinaud' },
  { base: 'prothesistes', dep: 'gironde', com: 'pessac', slug: 'bourdy-marc' },
  { base: 'prothesistes', dep: 'gironde', com: 'bordeaux', slug: 'bouyssou' },
]

async function principal() {
  await encadrer('import', async (run) => {
    run.compteurs.lignesLues = ANCIENNES.length
    let versFiche = 0
    let versCommune = 0

    for (const a of ANCIENNES) {
      const profession = a.base === 'dentistes' ? 'dentiste' : 'prothesiste'
      const { rows } = await db.execute<{ chemin: string }>(sql`
        SELECT '/' || ${a.base} || '/' || d.slug || '/' || c.slug || '/' || p.slug || '/' AS chemin
        FROM praticiens p
        JOIN lieux_exercice l ON l.praticien_id = p.id
        JOIN communes c ON c.code_insee = l.code_insee
        JOIN departements d ON d.code = c.departement_code
        WHERE p.slug LIKE ${a.slug + '-%'}
          AND p.profession = ${profession}
          AND p.deleted_at IS NULL
          AND EXISTS (
            SELECT 1 FROM lieux_exercice l2
            JOIN communes c2 ON c2.code_insee = l2.code_insee
            JOIN departements d2 ON d2.code = c2.departement_code
            WHERE l2.praticien_id = p.id AND d2.slug = ${a.dep}
          )
        ORDER BY l.principal DESC
        LIMIT 1
      `)

      const ancien = `/${a.base}/${a.dep}/${a.com}/${a.slug}/`
      const nouveau = rows[0]?.chemin ?? `/${a.base}/${a.dep}/${a.com}/`
      if (rows[0]) versFiche += 1
      else versCommune += 1

      await db
        .insert(redirections)
        .values({ id: randomUUID(), ancienChemin: ancien, nouveauChemin: nouveau })
        .onConflictDoUpdate({
          target: redirections.ancienChemin,
          set: { nouveauChemin: sql`excluded.nouveau_chemin` },
        })
      run.compteurs.inserees += 1
      console.log(`[redirections] ${ancien} -> ${nouveau}`)
    }

    console.log(`[redirections] ${versFiche} vers une fiche, ${versCommune} vers une liste de commune`)
    return { versFiche, versCommune }
  })
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
