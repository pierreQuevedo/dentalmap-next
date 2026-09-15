import { chromium } from 'playwright'
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
for (const theme of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } })
  const erreurs = []
  p.on('pageerror', (e) => erreurs.push(String(e)))
  await p.goto(`${BASE}/style-guide/`, { waitUntil: 'load' })
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.waitForTimeout(900)
  await p.screenshot({ path: `${SP}/captures/guide-${theme}.png`, fullPage: true })
  const vides = await p.evaluate(() =>
    [...document.querySelectorAll('span.font-mono')].filter((s) => s.textContent.trim() === '…').length,
  )
  console.log(theme, 'jetons non résolus :', vides, '| erreurs :', erreurs.length ? erreurs : 'aucune')
  await p.close()
}
await b.close()
