import { chromium } from 'playwright'

/** Ouvre le menu Conseils et vérifie qu'il porte de vrais articles. */
const SP = process.env.SP
const BASE = process.env.BASE_URL ?? 'http://localhost:3100'
const b = await chromium.launch()
for (const theme of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 620 } })
  await p.goto(`${BASE}/dentistes/`, { waitUntil: 'load' })
  await p.evaluate((t) => localStorage.setItem('theme', t), theme)
  await p.reload({ waitUntil: 'load' })
  await p.waitForTimeout(500)
  await p.getByRole('button', { name: 'Conseils' }).hover()
  await p.waitForTimeout(400)
  await p.screenshot({ path: `${SP}/captures/menu-conseils-${theme}.png` })
  if (theme === 'light') {
    const lien = await p.getByRole('menuitem', { name: /Comment vérifier/ }).getAttribute('href')
    const pied = await p.getByRole('menuitem', { name: 'Tous les conseils' }).isVisible()
    console.log(JSON.stringify({ lienArticle: lien, piedDeMenu: pied }))
  }
  await p.close()
}
await b.close()
