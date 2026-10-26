import sanitizeHtml from 'sanitize-html'

/**
 * Le HTML venu de WordPress (articles, formations, modules texte), nettoyé
 * avant d'être injecté dans les pages : une liste blanche de balises de mise
 * en forme, des liens en http(s), mailto ou tel, et rien d'exécutable. Un
 * compte WordPress compromis ne peut donc plus glisser de script sur
 * dentalmap.fr (audit du 2026-10-26).
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'ul', 'ol', 'li', 'blockquote', 'cite', 'code', 'pre', 'a', 'span', 'div', 'figure', 'figcaption', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'dl', 'dt', 'dd',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'width', 'height', 'srcset', 'sizes', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  // Un lien qui ouvre un nouvel onglet ne laisse pas la main à la page ouverte.
  transformTags: {
    a: (balise, attributs) =>
      attributs.target === '_blank' ? { tagName: balise, attribs: { ...attributs, rel: 'noopener noreferrer' } } : { tagName: balise, attribs: attributs },
  },
}

export function nettoyerHtml(html: string): string
export function nettoyerHtml(html: string | null | undefined): string | null
export function nettoyerHtml(html: string | null | undefined): string | null {
  return html ? sanitizeHtml(html, OPTIONS) : null
}
