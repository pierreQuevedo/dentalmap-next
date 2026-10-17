import type { Donnees } from '@/lib/espace-pro/etablissement'
import { actives } from '@/lib/espace-pro/etablissement'

/**
 * L'écriture d'un établissement dans WordPress (O3a), par l'API REST et le
 * mot de passe d'application (`WP_APP_USER`, `WP_APP_PASSWORD`).
 *
 * Coupée tant que `WP_ECRITURE` ne vaut pas `1` : la fiche déclarée vit dans
 * Neon et s'affiche sur la page publique sans elle. Une fois ouverte, seul le
 * champ ACF `diplome` est mis à jour, pour que les filtres et les cartes de
 * la liste suivent les formations actives ; le contenu éditorial n'est jamais
 * réécrit. Un échec n'empêche pas la publication : il est journalisé.
 */
export async function synchroniserFormation(slug: string, donnees: Donnees): Promise<'coupee' | 'ok' | 'echec'> {
  if (process.env.WP_ECRITURE !== '1') return 'coupee'
  const graphql = process.env.WP_GRAPHQL_URL
  const utilisateur = process.env.WP_APP_USER
  const motDePasse = process.env.WP_APP_PASSWORD
  if (!graphql || !utilisateur || !motDePasse) return 'echec'
  const base = `${new URL(graphql).origin}/wp-json/wp/v2/${process.env.WP_REST_FORMATION ?? 'formation'}`
  const entetes = { Authorization: `Basic ${Buffer.from(`${utilisateur}:${motDePasse}`).toString('base64')}`, 'Content-Type': 'application/json' }
  try {
    const trouve = await fetch(`${base}?slug=${encodeURIComponent(slug)}&_fields=id`, { headers: entetes, cache: 'no-store' })
    const [post] = (await trouve.json()) as { id: number }[]
    if (!post) return 'echec'
    const r = await fetch(`${base}/${post.id}`, {
      method: 'POST',
      headers: entetes,
      body: JSON.stringify({ acf: { diplome: actives(donnees).map((f) => f.intitule).join(', ') } }),
    })
    return r.ok ? 'ok' : 'echec'
  } catch (e) {
    console.error('[wp] écriture de la formation impossible', slug, e)
    return 'echec'
  }
}

/**
 * Formation privée acceptée (B) : crée l'article minimal du CPT `formation`
 * (titre, type ACF `privee`, ville, durée, site) et rend son slug. Le détail
 * déclaré reste dans Neon (`demandes_formation`) et se lit sur la page
 * publique. Coupée tant que `WP_ECRITURE` ne vaut pas `1` : la demande reste
 * alors « acceptée, à publier » et l'équipe crée l'article à la main.
 */
export async function creerFormationPrivee(f: { intitule: string; ville: string | null; duree: string; siteWeb: string | null; resume: string | null }): Promise<{ etat: 'coupee' | 'echec' } | { etat: 'ok'; slug: string }> {
  if (process.env.WP_ECRITURE !== '1') return { etat: 'coupee' }
  const graphql = process.env.WP_GRAPHQL_URL
  const utilisateur = process.env.WP_APP_USER
  const motDePasse = process.env.WP_APP_PASSWORD
  if (!graphql || !utilisateur || !motDePasse) return { etat: 'echec' }
  const base = `${new URL(graphql).origin}/wp-json/wp/v2/${process.env.WP_REST_FORMATION ?? 'formation'}`
  try {
    const r = await fetch(base, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${utilisateur}:${motDePasse}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: f.intitule,
        status: 'publish',
        excerpt: f.resume ?? '',
        acf: { typeFormation: ['privee'], ville: f.ville ?? 'En ligne', duree: f.duree, siteWeb: f.siteWeb ?? '' },
      }),
    })
    if (!r.ok) {
      console.error('[wp] création de la formation privée refusée', r.status, await r.text().catch(() => ''))
      return { etat: 'echec' }
    }
    const post = (await r.json()) as { slug?: string }
    return post.slug ? { etat: 'ok', slug: post.slug } : { etat: 'echec' }
  } catch (e) {
    console.error('[wp] création de la formation privée impossible', e)
    return { etat: 'echec' }
  }
}
