#!/usr/bin/env node
/**
 * Crée en brouillon, dans WordPress, les fiches métier de
 * `docs/acf/contenu-metiers.json` (type Conseil, groupe ACF « Fiche métier »).
 *
 * Prérequis : groupe `docs/acf/fiche-metier.json` importé, choix « metiers »
 * ajouté à la catégorie des conseils, mot de passe d'application dans
 * `.env.local` (`WP_GRAPHQL_URL`, `WP_APP_USER`, `WP_APP_PASSWORD`).
 *
 * Sans argument, le script affiche ce qu'il ferait. Avec `--envoyer`, il crée
 * les brouillons ; une fiche dont le slug existe déjà est laissée telle quelle.
 * La catégorie et l'image à la une se règlent ensuite dans WordPress, avant
 * relecture et publication.
 *
 *   node --env-file=.env.local scripts/wp-fiches-metier.mjs [--envoyer]
 */
import { readFile } from 'node:fs/promises'

const envoyer = process.argv.includes('--envoyer')
const fiches = JSON.parse(await readFile(new URL('../docs/acf/contenu-metiers.json', import.meta.url), 'utf8'))

const graphql = process.env.WP_GRAPHQL_URL
const utilisateur = process.env.WP_APP_USER
const motDePasse = process.env.WP_APP_PASSWORD
if (!graphql) throw new Error('WP_GRAPHQL_URL manquant')
const base = `${new URL(graphql).origin}/wp-json/wp/v2/conseil`
const auth = utilisateur && motDePasse ? 'Basic ' + Buffer.from(`${utilisateur}:${motDePasse}`).toString('base64') : null

for (const f of fiches) {
  const existe = await fetch(`${base}?slug=${f.slug}&status=any&_fields=id`, { headers: auth ? { Authorization: auth } : {} }).then((r) => (r.ok ? r.json() : []))
  if (existe.length) {
    console.log(`= ${f.slug} existe déjà (id ${existe[0].id}), inchangée`)
    continue
  }
  if (!envoyer) {
    console.log(`+ ${f.slug} : « ${f.titre} », ${Object.keys(f.acf).length} champs`)
    continue
  }
  if (!auth) throw new Error('WP_APP_USER et WP_APP_PASSWORD sont nécessaires avec --envoyer')
  const res = await fetch(base, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: f.slug, title: f.titre, excerpt: f.extrait, status: 'draft', acf: f.acf }),
  })
  const corps = await res.json().catch(() => ({}))
  console.log(res.ok ? `+ ${f.slug} créée en brouillon (id ${corps.id})` : `! ${f.slug} : ${res.status} ${corps.message ?? ''}`)
}
if (!envoyer) console.log('\nRien n’a été envoyé. Relancer avec --envoyer pour créer les brouillons.')
