import { describe, expect, it } from 'vitest'
import { nettoyerHtml } from '../src/lib/wp/html'

describe('HTML de WordPress', () => {
  it('garde la mise en forme et les liens', () => {
    const html = '<h2>Titre</h2><p>Un <strong>texte</strong> et <a href="https://dentalmap.fr/faq/" rel="noopener">un lien</a>.</p><ul><li>un</li></ul>'
    expect(nettoyerHtml(html)).toBe(html)
  })
  it('retire tout ce qui s’exécute', () => {
    const sale = '<p onclick="x()">a</p><img src="x" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">b</a><iframe src="https://exemple.com"></iframe><svg onload="alert(4)"></svg>'
    const propre = nettoyerHtml(sale)!
    for (const motif of ['onclick', 'onerror', '<script', 'javascript:', '<iframe', '<svg', 'onload']) expect(propre).not.toContain(motif)
  })
  it('protège un lien vers un nouvel onglet', () => {
    expect(nettoyerHtml('<a href="https://exemple.com" target="_blank">x</a>')).toContain('rel="noopener noreferrer"')
  })
})
