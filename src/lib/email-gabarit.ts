/**
 * Le gabarit des emails DentalMap (Figma, couloir « Emails », EMAIL-GABARIT).
 *
 * Une fonction pure : un email décrit en blocs devient un HTML pour les
 * clients mail (tables, styles en ligne, 600 de large, aucune image
 * indispensable à la lecture) et sa version texte brut, toujours jointe.
 * Les couleurs sont écrites en dur : les clients mail ignorent les variables.
 */

export type BlocEmail =
  | { type: 'texte'; texte: string }
  | { type: 'code'; code: string }
  | { type: 'encart'; texte: string }
  | { type: 'bouton'; libelle: string; url: string }
  | { type: 'lien'; libelle: string; url: string }
  /** Le lien écrit en clair sous un bouton, pour un lien personnel. */
  | { type: 'lienBrut'; url: string }
  | { type: 'champs'; lignes: [string, string][] }

export type Email = {
  /** Titre dans la carte ; l'objet reste à part. */
  titre: string
  /** « Bonjour, », « Bonjour Martin Dupont, » ; null pour les emails internes. */
  salutation?: string | null
  blocs: BlocEmail[]
  /** « Vous recevez cet email parce que… ». */
  raison: string
  /** Pied des emails internes : « DentalMap · Email interne à l'équipe ». */
  interne?: boolean
}

const C = {
  fond: '#f5f6f7',
  carte: '#ffffff',
  ligne: '#e3e7ea',
  texte: '#16222b',
  secondaire: '#5d666d',
  action: '#0b8484',
  surAction: '#ffffff',
}
const POLICE = "Figtree, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'Geist Mono', Menlo, Consolas, monospace"

const echapper = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function blocHtml(b: BlocEmail): string {
  switch (b.type) {
    case 'texte':
      return `<p style="margin:0 0 16px;font:400 16px/24px ${POLICE};color:${C.texte};">${echapper(b.texte)}</p>`
    case 'code':
      return `<div style="margin:0 0 16px;padding:18px 0;background:${C.fond};border-radius:14px;text-align:center;font:500 32px/40px ${MONO};letter-spacing:8px;color:${C.texte};">${echapper(b.code)}</div>`
    case 'encart':
      return `<div style="margin:0 0 16px;padding:12px 16px;background:${C.fond};border-radius:14px;font:400 14px/20px ${POLICE};color:${C.secondaire};">${echapper(b.texte)}</div>`
    case 'bouton':
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr><td style="background:${C.action};border-radius:999px;"><a href="${echapper(b.url)}" style="display:inline-block;padding:12px 22px;font:600 16px/20px ${POLICE};color:${C.surAction};text-decoration:none;">${echapper(b.libelle)}</a></td></tr></table>`
    case 'lien':
      return `<p style="margin:0 0 16px;font:500 15px/22px ${POLICE};"><a href="${echapper(b.url)}" style="color:${C.action};text-decoration:underline;">${echapper(b.libelle)}</a></p>`
    case 'lienBrut':
      return `<p style="margin:-8px 0 16px;font:400 13px/18px ${POLICE};color:${C.secondaire};">Si le bouton ne s’ouvre pas, copiez ce lien : <a href="${echapper(b.url)}" style="color:${C.action};word-break:break-all;">${echapper(b.url)}</a></p>`
    case 'champs':
      return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;border-collapse:collapse;">${b.lignes
        .map(([l, v]) => `<tr><td style="padding:6px 12px 6px 0;font:400 13px/18px ${POLICE};color:${C.secondaire};vertical-align:top;white-space:nowrap;">${echapper(l)}</td><td style="padding:6px 0;font:400 14px/20px ${POLICE};color:${C.texte};">${echapper(v)}</td></tr>`)
        .join('')}</table>`
  }
}

function blocTexte(b: BlocEmail): string {
  switch (b.type) {
    case 'texte':
    case 'encart':
      return b.texte
    case 'code':
      return b.code
    case 'bouton':
    case 'lien':
      return `${b.libelle} : ${b.url}`
    case 'lienBrut':
      return ''
    case 'champs':
      return b.lignes.map(([l, v]) => `${l} : ${v}`).join('\n')
  }
}

export function composer(e: Email, site: string): { html: string; text: string } {
  const salutation = e.salutation === undefined ? 'Bonjour,' : e.salutation
  const logo = `${site}/images/marque/logo-dentalmap.png`
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${echapper(e.titre)}</title></head>
<body style="margin:0;padding:0;background:${C.fond};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fond};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="background:${C.carte};border:1px solid ${C.ligne};border-radius:20px;padding:32px 28px;">
<img src="${logo}" width="129" height="28" alt="DentalMap" style="display:block;margin:0 0 24px;border:0;font:700 18px/28px ${POLICE};color:${C.texte};">
<h1 style="margin:0 0 20px;font:600 24px/30px ${POLICE};color:${C.texte};">${echapper(e.titre)}</h1>
${salutation ? `<p style="margin:0 0 16px;font:400 16px/24px ${POLICE};color:${C.texte};">${echapper(salutation)}</p>` : ''}
${e.blocs.map(blocHtml).join('\n')}
</td></tr>
<tr><td style="padding:16px 8px 0;font:400 12px/18px ${POLICE};color:${C.secondaire};">
<strong style="font-weight:600;color:${C.texte};">DentalMap</strong> · ${e.interne ? 'Email interne à l’équipe' : 'Annuaire dentaire vérifié par les registres officiels'}<br>
<a href="${site}/" style="color:${C.action};">${echapper(site.replace(/^https?:\/\//, ''))}</a><br>
${echapper(e.raison)}
</td></tr>
</table></td></tr></table>
</body></html>`
  const corps = e.blocs.map(blocTexte).filter(Boolean).join('\n\n')
  const text = `${salutation ? `${salutation}\n\n` : ''}${corps}\n\n${e.raison}\n\nDentalMap · ${site.replace(/^https?:\/\//, '')}`
  return { html, text }
}
