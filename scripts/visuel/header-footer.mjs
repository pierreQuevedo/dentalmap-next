import { chromium } from 'playwright'

const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()

async function page(width, height, theme = 'light') {
  const p = await b.newPage({ viewport: { width, height } })
  await p.goto(`${BASE}/dentistes/`)
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.waitForTimeout(400)
  return p
}

// 1. Méga-menu ouvert à 1440 px
let p = await page(1440, 1000)
await p.getByRole('button', { name: 'Annuaire' }).hover()
await p.waitForTimeout(300)
await p.screenshot({ path: `${SP}/captures/hf-1440-megamenu.png` })
await p.close()

// 2. Barre compacte après 200 px de défilement
p = await page(1440, 1000)
await p.evaluate(() => window.scrollTo(0, 200))
await p.waitForTimeout(500)
await p.screenshot({ path: `${SP}/captures/hf-1440-compact.png` })
await p.close()

// 3. Mobile 390 px, tiroir ouvert puis pied de page
p = await page(390, 844)
await p.screenshot({ path: `${SP}/captures/hf-390-header.png` })
await p.getByRole('button', { name: 'Menu' }).click()
await p.waitForTimeout(300)
await p.getByRole('button', { name: 'Annuaire' }).click()
await p.waitForTimeout(300)
await p.screenshot({ path: `${SP}/captures/hf-390-tiroir.png` })
await p.close()

// 4. Thème sombre, page entière
p = await page(1440, 1000, 'dark')
await p.screenshot({ path: `${SP}/captures/hf-1440-sombre.png`, fullPage: true })
await p.close()

await b.close()
console.log('captures prises')
