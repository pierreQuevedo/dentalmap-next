import { chromium } from 'playwright'
const SP = process.env.SP
if (!SP) {
  console.error('SP manquant : indiquez le dossier de sortie des captures.')
  process.exit(1)
}
const b = await chromium.launch()

for (const [nom, theme] of [['clair', 'light'], ['sombre', 'dark']]) {
  const p = await b.newPage({ viewport: { width: 900, height: 640 } })
  await p.goto('http://localhost:3000/demo-theme/')
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${SP}/captures/theme-${nom}.png` })
  await p.close()
}
await b.close()
console.log('captures prises')
