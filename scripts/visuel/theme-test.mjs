import { chromium } from 'playwright'
const SP = process.env.SP
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 900, height: 700 } })
await p.goto('http://localhost:3000/demo-theme/', { waitUntil: 'networkidle' })

const theme = () => p.evaluate(() => ({
  classe: document.documentElement.className.includes('dark') ? 'dark' : 'light',
  stocke: localStorage.getItem('theme'),
  fond: getComputedStyle(document.body).backgroundColor,
}))

console.log('etat initial      :', JSON.stringify(await theme()))
await p.screenshot({ path: `${SP}/captures/theme-clair.png` })

const bouton = p.locator('button[aria-label="Changer de thème"]').first()
await bouton.click(); await p.waitForTimeout(900)
console.log('apres 1er clic    :', JSON.stringify(await theme()))
await p.screenshot({ path: `${SP}/captures/theme-sombre.png` })

await bouton.click(); await p.waitForTimeout(900)
console.log('apres 2e clic     :', JSON.stringify(await theme()))

await p.reload({ waitUntil: 'networkidle' })
console.log('apres rechargement:', JSON.stringify(await theme()))

// mode systeme : on force la preference OS en sombre
const p2 = await b.newPage({ viewport: { width: 900, height: 700 }, colorScheme: 'dark' })
await p2.goto('http://localhost:3000/demo-theme/', { waitUntil: 'networkidle' })
await p2.evaluate(() => localStorage.setItem('theme', 'system'))
await p2.reload({ waitUntil: 'networkidle' })
console.log('systeme + OS sombre:', JSON.stringify(await p2.evaluate(() => ({
  classe: document.documentElement.className.includes('dark') ? 'dark' : 'light',
  stocke: localStorage.getItem('theme'),
}))))

await b.close()
