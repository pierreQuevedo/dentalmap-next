import { chromium } from 'playwright'

/**
 * Suit la bascule de thème image par image : le fondu circulaire ne se voit
 * que pendant les 650 ms de la View Transition, une capture après coup ne
 * montrerait que le thème d'arrivée.
 */
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const INSTANTS = [90, 180, 320, 900]

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
const erreurs = []
p.on('pageerror', (e) => erreurs.push(String(e)))
p.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()))

await p.goto(`${BASE}/dentistes/`, { waitUntil: 'load' })
await p.evaluate(() => localStorage.setItem('theme', 'light'))
await p.reload({ waitUntil: 'load' })
await p.waitForTimeout(400)

await p.getByRole('button', { name: 'Changer de thème' }).click()
let ecoule = 0
for (const instant of INSTANTS) {
  await p.waitForTimeout(instant - ecoule)
  ecoule = instant
  await p.screenshot({ path: `${SP}/captures/bascule-${instant}ms.png` })
}

const etat = await p.evaluate(() => ({
  classe: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  stocke: localStorage.getItem('theme'),
  viewTransitions: typeof document.startViewTransition === 'function',
}))
console.log(JSON.stringify(etat), 'erreurs :', erreurs.length ? erreurs : 'aucune')
await b.close()
