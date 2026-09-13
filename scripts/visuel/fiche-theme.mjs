import { chromium } from 'playwright'
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
for (const [nom, theme] of [['fiche-clair', 'light'], ['fiche-sombre', 'dark']]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } })
  await p.goto(`${BASE}/dentistes/gironde/bordeaux/`, { waitUntil: 'load' })
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${SP}/captures/${nom}.png` })
  await p.close()
}
await b.close()
console.log('ok')
