import { chromium } from 'playwright'

/** Les pages réelles dans les deux thèmes, pour juger la charte en situation. */
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const PAGES = [
  ['accueil', '/'],
  ['commune', '/dentistes/gironde/bordeaux/'],
  ['index', '/dentistes/'],
]
const b = await chromium.launch()
for (const theme of ['light', 'dark']) {
  for (const [nom, url] of PAGES) {
    const p = await b.newPage({ viewport: { width: 1280, height: 860 } })
    await p.goto(BASE + url, { waitUntil: 'load' })
    await p.evaluate((t) => localStorage.setItem('theme', t), theme)
    await p.reload({ waitUntil: 'load' })
    await p.waitForTimeout(600)
    await p.screenshot({ path: `${SP}/captures/charte-${nom}-${theme}.png` })
    await p.close()
  }
}
await b.close()
console.log('ok')
