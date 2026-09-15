import { chromium } from 'playwright'

/** Ouvre l'aperçu de fiche et vérifie que le dialogue porte bien la donnée. */
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1180, height: 900 } })
const erreurs = []
p.on('pageerror', (e) => erreurs.push(String(e)))

await p.goto(`${BASE}/style-guide/#widgets`, { waitUntil: 'load' })
await p.waitForTimeout(900)

const declencheur = p.getByRole('button', { name: /Aperçu de la fiche de Dr Adrien Abballe/ })
await declencheur.click()
await p.waitForTimeout(700)
await p.screenshot({ path: `${SP}/captures/apercu-fiche.png` })

const dialogue = {
  adresse: await p.getByText('128 Rue Fondaudege').isVisible(),
  telephone: await p.getByRole('link', { name: '05 56 81 11 11' }).isVisible(),
  lien: await p.getByRole('link', { name: 'Voir la fiche' }).getAttribute('href'),
}

await p.keyboard.press('Escape')
await p.waitForTimeout(600)
const referme = await p.getByText('Données issues des registres publics').isHidden()

console.log(JSON.stringify({ ...dialogue, referme }))
console.log('erreurs :', erreurs.length ? erreurs : 'aucune')
await b.close()
