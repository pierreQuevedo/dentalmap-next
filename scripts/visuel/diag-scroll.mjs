import { chromium } from 'playwright'
const BASE = process.env.BASE_URL ?? 'https://dentalmap-next.vercel.app'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(`${BASE}/dentistes/`, { waitUntil: 'networkidle' })

const mesure = () => p.evaluate(() => ({
  scrollY: Math.round(window.scrollY),
  doc: document.documentElement.scrollHeight,
  header: Math.round(document.getElementById('site-header').getBoundingClientRect().height),
}))

console.log('repos    ', JSON.stringify(await mesure()))
for (const y of [20, 39, 41, 60, 200]) {
  await p.evaluate((v) => window.scrollTo(0, v), y)
  await p.waitForTimeout(250)
  console.log(`scrollTo ${String(y).padStart(3)}`, JSON.stringify(await mesure()))
}

// Molette près du seuil : c'est là qu'une oscillation se verrait.
await p.evaluate(() => window.scrollTo(0, 0))
await p.waitForTimeout(200)
for (let i = 0; i < 6; i++) {
  await p.mouse.wheel(0, 15)
  await p.waitForTimeout(150)
  console.log('molette +15', JSON.stringify(await mesure()))
}

// Bas de page : la réduction du header peut y renvoyer le scroll en arrière.
await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await p.waitForTimeout(400)
console.log('bas      ', JSON.stringify(await mesure()))
await b.close()
