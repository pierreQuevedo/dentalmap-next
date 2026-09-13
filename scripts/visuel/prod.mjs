import { chromium } from 'playwright'
const SP = process.env.SP
const BASE = 'https://dentalmap-next.vercel.app'
const BYPASS = 'RgRhfoweCfsKy1jlDzsd5u4WNProbMRR'
const b = await chromium.launch()
for (const [nom, theme, url] of [
  ['prod-liste-clair', 'light', '/dentistes/gironde/begles/'],
  ['prod-liste-sombre', 'dark', '/dentistes/gironde/begles/'],
  ['prod-fiche-sombre', 'dark', '/dentistes/gironde/bordeaux/dr-leilanie-firuu-4240/'],
]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS } })
  await p.goto(BASE + url)
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  await p.screenshot({ path: `${SP}/captures/${nom}.png` })
  await p.close()
}
await b.close()
console.log('captures prises')
