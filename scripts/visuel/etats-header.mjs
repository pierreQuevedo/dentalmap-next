import { chromium } from 'playwright'
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
for (const [nom, w, y, theme] of [
  ['etat-repos', 1440, 0, 'light'],
  ['etat-defile', 1440, 300, 'light'],
  ['etat-390-repos', 390, 0, 'light'],
  ['etat-390-defile', 390, 300, 'light'],
  ['etat-sombre-repos', 1440, 0, 'dark'],
]) {
  const p = await b.newPage({ viewport: { width: w, height: 620 } })
  await p.goto(`${BASE}/dentistes/`)
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.evaluate((v) => window.scrollTo(0, v), y)
  await p.waitForTimeout(500)
  await p.screenshot({ path: `${SP}/captures/${nom}.png` })
  await p.close()
}
await b.close()
console.log('ok')
