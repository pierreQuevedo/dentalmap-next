import { chromium } from 'playwright'
const SP = process.env.SP
const b = await chromium.launch()
for (const [nom, theme, url] of [
  ['local-liste-sombre', 'dark', '/dentistes/gironde/begles/'],
  ['local-liste-clair', 'light', '/dentistes/gironde/begles/'],
  ['local-fiche-sombre', 'dark', '/dentistes/gironde/bordeaux/dr-leilanie-firuu-4240/'],
  ['local-accueil-sombre', 'dark', '/'],
]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
  await p.goto('http://localhost:3000' + url)
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'networkidle' })
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${SP}/captures/${nom}.png` })
  await p.close()
}
await b.close(); console.log('captures prises')
