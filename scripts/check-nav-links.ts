/**
 * Vérifie que chaque lien interne de `navigation.ts` correspond à une route
 * réelle de l'App Router.
 *
 * `typedRoutes` couvre déjà les `href` typés `Route`, mais pas ceux qui
 * passent par `chemin()`, ni ceux qui portent une chaîne de requête ou une
 * ancre. Ce script ferme cette brèche : un lien de menu qui pointe dans le
 * vide est une erreur de construction, pas un détail de contenu.
 */
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  exploreStatic,
  footerCols,
  legalNav,
  mainNav,
  type NavLink,
} from '../src/lib/navigation'

const RACINE = join(process.cwd(), 'src', 'app')

/** Segments de route, `null` pour un segment dynamique. */
type Motif = (string | null)[]

function collecterMotifs(dossier: string, motifs: Motif[] = []): Motif[] {
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree)
    if (!statSync(chemin).isDirectory()) {
      if (entree === 'page.tsx') {
        const segments = relative(RACINE, dossier)
          .split('/')
          .filter((s) => s && !s.startsWith('(')) // groupes de routes
          .map((s) => (s.startsWith('[') ? null : s))
        motifs.push(segments)
      }
      continue
    }
    collecterMotifs(chemin, motifs)
  }
  return motifs
}

function correspond(motif: Motif, segments: string[]): boolean {
  if (motif.length !== segments.length) return false
  return motif.every((m, i) => m === null || m === segments[i])
}

function liensInternes(): NavLink[] {
  const liens: NavLink[] = []
  for (const entree of mainNav) {
    liens.push(...(entree.links ?? []))
    for (const col of entree.columns ?? []) liens.push(...col.links)
  }
  for (const col of footerCols) liens.push(...col.links)
  liens.push(...legalNav)
  liens.push(...exploreStatic.links.map((l) => ({ label: l.title, href: l.href })))
  return liens.filter((l) => !l.external && l.href.startsWith('/'))
}

const motifs = collecterMotifs(RACINE)
const manquants: string[] = []

for (const lien of liensInternes()) {
  const chemin = lien.href.split(/[?#]/)[0]
  const segments = chemin.split('/').filter(Boolean)
  if (!motifs.some((m) => correspond(m, segments))) manquants.push(`${lien.label} → ${lien.href}`)
}

if (manquants.length > 0) {
  console.error(`${manquants.length} lien(s) de navigation sans route :`)
  for (const m of manquants) console.error(`  ${m}`)
  process.exit(1)
}

console.log(`${liensInternes().length} liens internes vérifiés, toutes les routes existent.`)
