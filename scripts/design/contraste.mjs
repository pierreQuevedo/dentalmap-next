/**
 * Rapports de contraste WCAG 2.1 des paires de la charte.
 *
 * Écrit parce qu'une couleur « qui passe » se vérifie au calcul, pas à l'œil :
 * sur un annuaire lu par des patients âgés, un texte à 3,8:1 est un texte
 * perdu. Seuils : 4,5 pour du texte courant, 3 pour du gros texte ou un
 * élément d'interface.
 */
const canal = (v) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, v, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.2126 * canal(r) + 0.7152 * canal(v) + 0.0722 * canal(b)
}

export function contraste(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const verdict = (r, seuil) => (r >= seuil ? 'ok ' : 'NON')

export function table(paires) {
  const lignes = paires.map(([nom, fg, bg, seuil = 4.5]) => {
    const r = contraste(fg, bg)
    return `${verdict(r, seuil)} ${r.toFixed(2).padStart(5)}:1  seuil ${seuil}  ${nom}  ${fg} sur ${bg}`
  })
  return lignes.join('\n')
}

// Le chemin du projet contient des espaces : la comparaison d'URL échoue,
// on se contente du nom du fichier appelé.
if (process.argv[1]?.endsWith('contraste.mjs')) {
  const candidats = [
    ['bleu apple.com sur blanc, texte', '#0071e3', '#ffffff'],
    ['blanc sur bleu apple.com, bouton', '#ffffff', '#0071e3'],
    ['blanc sur #0b63c5', '#ffffff', '#0b63c5'],
    ['blanc sur #0a5fbf', '#ffffff', '#0a5fbf'],
    ['#0a5fbf sur blanc, lien', '#0a5fbf', '#ffffff'],
    ['#0b63c5 sur blanc, lien', '#0b63c5', '#ffffff'],
    ['bleu sombre #2997ff sur #0e1317', '#2997ff', '#0e1317'],
    ['#0e1317 sur #2997ff, bouton sombre', '#0e1317', '#2997ff'],
    ['ardoise profonde sur blanc', '#16222b', '#ffffff'],
    ['gris secondaire sur blanc', '#5d666d', '#ffffff'],
    ['gris secondaire sur #f5f6f7', '#5d666d', '#f5f6f7'],
    ['texte sombre sur #0e1317', '#f2f5f7', '#0e1317'],
    ['gris sombre sur #0e1317', '#93a0a8', '#0e1317'],
  ]
  console.log(table(candidats))
}
