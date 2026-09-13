import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 900, height: 640 }, reducedMotion: 'reduce' })
await p.goto('http://localhost:3000/demo-theme/')
await p.evaluate(() => localStorage.setItem('theme', 'light'))
await p.reload({ waitUntil: 'networkidle' })
const bouton = p.locator('button[aria-label="Changer de thème"]').first()
await bouton.click()
await p.waitForTimeout(400)
const apres = await p.evaluate(() => ({
  sombre: document.documentElement.className.includes('dark'),
  stocke: localStorage.getItem('theme'),
}))
console.log('animation reduite, apres clic :', JSON.stringify(apres))
await b.close()
