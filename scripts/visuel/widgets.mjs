import { chromium } from 'playwright'

/** Passe sur chaque banc : survol, dépliage, défilement, visite guidée. */
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1180, height: 900 } })
const erreurs = []
p.on('pageerror', (e) => erreurs.push(String(e)))
p.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()))
p.on('response', (r) => r.status() >= 400 && r.url().includes('/images/') && erreurs.push(`${r.status()} ${r.url()}`))

await p.goto(`${BASE}/style-guide/`, { waitUntil: 'load' })
await p.waitForTimeout(1200)

// Dépliage de la fiche
await p.getByRole('button', { name: 'Voir le détail' }).click()
await p.waitForTimeout(700)
const detailVisible = await p.getByText('Identifiant RPPS').isVisible()

// Curseur : survol de la photo du banc dédié, et non de la première venue.
await p.locator('[data-banc="cursor"] img').hover()
await p.waitForTimeout(600)
const curseurVisible = await p.getByText('Voir la fiche').isVisible()
await p.locator('#widgets').screenshot({ path: `${SP}/captures/widgets.png` })

// Progression de lecture
const article = p.locator('#widgets div.h-64.overflow-y-auto')
await article.evaluate((e) => e.scrollTo(0, e.scrollHeight))
await p.waitForTimeout(600)

// Filtre
const bascule = p.getByRole('switch').first()
const avant = await p.getByText('chirurgiens-dentistes à Bordeaux').textContent()
await bascule.click()
await p.waitForTimeout(400)
const apres = await p.getByText('chirurgiens-dentistes à Bordeaux').textContent()

// Visite guidée
await p.getByRole('button', { name: 'Lancer la visite' }).click()
await p.waitForTimeout(900)
await p.screenshot({ path: `${SP}/captures/widgets-visite.png` })
const etape = await p.getByText('Votre fiche').first().isVisible()

console.log(JSON.stringify({ detailVisible, curseurVisible, avant: avant?.trim(), apres: apres?.trim(), etape }))
console.log('erreurs :', erreurs.length ? erreurs : 'aucune')
await b.close()
