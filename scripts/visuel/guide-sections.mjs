import { chromium } from 'playwright'
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
for (const theme of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1180, height: 900 } })
  await p.goto(`${BASE}/style-guide/`, { waitUntil: 'load' })
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.waitForTimeout(800)
  for (const id of ['couleurs', 'composants']) {
    await p.locator(`#${id}`).screenshot({ path: `${SP}/captures/guide-${id}-${theme}.png` })
  }
  await p.close()
}
await b.close()
console.log('ok')
