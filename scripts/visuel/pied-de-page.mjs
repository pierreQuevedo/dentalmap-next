import { chromium } from 'playwright'
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
for (const [nom, theme] of [['pied-clair', 'light'], ['pied-sombre', 'dark']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(`${BASE}/dentistes/`, { waitUntil: 'load' })
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.waitForTimeout(700)
  await p.screenshot({ path: `${SP}/captures/${nom}.png` })
  await p.close()
}
await b.close()
console.log('ok')
