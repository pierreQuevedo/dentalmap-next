import { NextResponse, type NextRequest } from 'next/server'
import { simulateurActif } from '@/lib/psc/config'
import { emettreCode } from '@/lib/psc/simulateur'

/**
 * Écran d'authentification du simulateur.
 *
 * Là où l'ANS demanderait la carte, on demande un numéro RPPS et une
 * profession. Le formulaire renvoie ensuite vers l'application exactement
 * comme Pro Santé Connect le ferait : `code` et `state` en cas de succès,
 * `error=access_denied` si l'on annule.
 */
export async function GET(request: NextRequest) {
  if (!simulateurActif()) return new Response('Introuvable', { status: 404 })
  const q = request.nextUrl.searchParams
  const champs = ['redirect_uri', 'state', 'nonce', 'code_challenge']
  const manquant = champs.find((c) => !q.get(c))
  if (manquant) return new Response(`Paramètre manquant : ${manquant}`, { status: 400 })
  if (q.get('code_challenge_method') !== 'S256') return new Response('PKCE S256 attendu', { status: 400 })

  const rpps = (q.get('login_hint') ?? '').replace(/\D/g, '').slice(-11)
  const caches = champs.map((c) => `<input type="hidden" name="${c}" value="${echapper(q.get(c)!)}">`).join('')

  return new Response(page(rpps, caches), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  if (!simulateurActif()) return new Response('Introuvable', { status: 404 })
  const f = await request.formData()
  const lire = (n: string) => String(f.get(n) ?? '')
  const redirectUri = lire('redirect_uri')
  const url = new URL(redirectUri)
  url.searchParams.set('state', lire('state'))

  if (lire('action') === 'annuler') {
    url.searchParams.set('error', 'access_denied')
    return NextResponse.redirect(url)
  }

  const rpps = lire('rpps').replace(/\D/g, '')
  if (!/^\d{11}$/.test(rpps)) return new Response('Le RPPS doit compter onze chiffres', { status: 400 })

  const code = emettreCode({
    identite: {
      rpps,
      codeProfession: lire('profession') || '40',
      nom: lire('nom') || 'SIMULE',
      prenom: lire('prenom') || 'Test',
    },
    nonce: lire('nonce'),
    challenge: lire('code_challenge'),
    redirectUri,
  })
  url.searchParams.set('code', code)
  return NextResponse.redirect(url)
}

function echapper(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function page(rpps: string, caches: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Simulateur Pro Santé Connect</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f5f7;font:15px/1.5 system-ui,sans-serif;color:#16222b}
  main{width:min(440px,calc(100% - 2rem));background:#fff;border:1px solid #e3e7ea;border-radius:20px;padding:28px}
  .bandeau{background:#fdf4e3;color:#8a5a00;border:1px solid #ecd9ad;border-radius:10px;padding:8px 12px;font-size:13px;margin-bottom:18px}
  h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:#5d666d;font-size:14px}
  label{display:block;font-weight:600;font-size:13px;margin:14px 0 4px}
  input,select{width:100%;box-sizing:border-box;border:1px solid #c4ccd1;border-radius:10px;padding:9px 11px;font:inherit}
  .actions{display:flex;gap:10px;margin-top:22px}
  button{flex:1;border:0;border-radius:999px;padding:11px;font:inherit;font-weight:600;cursor:pointer}
  .ok{background:#0b8484;color:#fff}.non{background:#eef1f3;color:#16222b}
</style></head><body><main>
  <div class="bandeau">Simulateur local. Rien n’est envoyé à l’Agence du Numérique en Santé.</div>
  <h1>Pro Santé Connect</h1>
  <p>À la place de la carte CPS, indiquez l’identité à simuler. Pour que la fiche soit attribuée, le RPPS doit être celui de la fiche revendiquée.</p>
  <form method="post">
    ${caches}
    <label for="rpps">Numéro RPPS (11 chiffres)</label>
    <input id="rpps" name="rpps" inputmode="numeric" pattern="[0-9]{11}" required value="${echapper(rpps)}">
    <label for="profession">Profession</label>
    <select id="profession" name="profession">
      <option value="40">40, chirurgien-dentiste</option>
      <option value="10">10, médecin</option>
      <option value="21">21, pharmacien</option>
    </select>
    <label for="prenom">Prénom</label><input id="prenom" name="prenom" value="Test">
    <label for="nom">Nom</label><input id="nom" name="nom" value="SIMULE">
    <div class="actions">
      <button class="non" name="action" value="annuler" formnovalidate>Annuler</button>
      <button class="ok" name="action" value="ok">S’authentifier</button>
    </div>
  </form>
</main></body></html>`
}
