/**
 * Vérification hors ligne des paires de la charte et des candidats d'action.
 *
 * La formule vient de `src/lib/contraste.ts`, la même que le guide de style :
 * un rapport affiché dans la page et un rapport vérifié en console ne peuvent
 * pas diverger.
 *
 *   pnpm design:contraste
 */
import { contraste, niveau } from '../../src/lib/contraste'
import { mesurer, TEALS } from '../../src/lib/teals'

const CHARTE: [string, string, string, boolean?][] = [
  ['Texte principal sur le fond', '#16222b', '#ffffff'],
  ['Texte secondaire sur le fond', '#5d666d', '#ffffff'],
  ['Texte secondaire sur fond adouci', '#5d666d', '#f5f6f7'],
  ['Badge vérifié, encre sur fond adouci', '#16222b', '#f5f6f7'],
  ['Badge en cours', '#8a5a00', '#fdf4e3'],
  ['Marqueur de carte sur le fond', '#0071e3', '#ffffff', true],
  ['Pastille patients', '#4f46e5', '#ffffff', true],
  ['Pastille praticiens', '#7c3aed', '#ffffff', true],
  ['Pastille prothésistes', '#47617a', '#ffffff', true],
  ['Texte principal sur le fond, sombre', '#f2f5f7', '#0e1317'],
  ['Texte secondaire, sombre', '#93a0a8', '#0e1317'],
  ['Badge en cours, sombre', '#f3c165', '#2a1f0a'],
  ['Marqueur de carte, sombre', '#2997ff', '#0e1317', true],
]

const etiquette = (r: number, grand = false) => {
  const n = niveau(r, grand)
  return `${r.toFixed(2).padStart(5)}:1  ${(n ?? 'ÉCHEC').padEnd(5)}`
}

console.log('--- Charte ---')
for (const [nom, fg, bg, grand] of CHARTE) {
  console.log(`${etiquette(contraste(fg, bg), grand)} ${nom}`)
}

console.log('\n--- Candidats pour la couleur d’action ---')
console.log('nom             clair    bouton        survol        sombre    bouton sombre')
for (const t of TEALS) {
  const c = mesurer(t, false)
  const s = mesurer(t, true)
  console.log(
    `${t.nom.padEnd(14)} ${t.clair}  ${etiquette(c.bouton.rapport)} ${etiquette(c.survol.rapport)} ${t.sombre}  ${etiquette(s.bouton.rapport)}`,
  )
}
