import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 900, height: 640 } })
const msgs = []
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) msgs.push(`${m.type()}: ${m.text()}`) })
p.on('pageerror', (e) => msgs.push(`pageerror: ${e.message}`))
await p.goto('http://localhost:3000/demo-theme/')
await p.evaluate(() => localStorage.setItem('theme', 'dark'))
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
console.log(msgs.length ? msgs.join('\n---\n').slice(0, 2000) : 'aucun message console')
await b.close()
