/**
 * Une faute de frappe dans le domaine d'une adresse courante, et sa correction.
 *
 * « marie@gmial.com » propose « marie@gmail.com ». Seuls les domaines les
 * plus répandus en France sont connus, et seule une faute légère (deux
 * lettres au plus) est corrigée : au-delà, c'est sans doute un autre domaine.
 */
const DOMAINES = [
  'gmail.com',
  'hotmail.com',
  'hotmail.fr',
  'outlook.com',
  'outlook.fr',
  'live.fr',
  'yahoo.com',
  'yahoo.fr',
  'icloud.com',
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
  'sfr.fr',
  'laposte.net',
  'bbox.fr',
]

function distance(a: string, b: string): number {
  const ligne = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let diagonale = ligne[0]
    ligne[0] = i
    for (let j = 1; j <= b.length; j++) {
      const haut = ligne[j]
      ligne[j] = Math.min(ligne[j] + 1, ligne[j - 1] + 1, diagonale + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonale = haut
    }
  }
  return ligne[b.length]
}

export function suggererAdresse(email: string): string | null {
  const adresse = email.trim().toLowerCase()
  const at = adresse.lastIndexOf('@')
  if (at < 1) return null
  const domaine = adresse.slice(at + 1)
  if (!domaine || DOMAINES.includes(domaine)) return null
  let meilleur: { domaine: string; d: number } | null = null
  for (const d of DOMAINES) {
    const ecart = distance(domaine, d)
    if (ecart <= 2 && (!meilleur || ecart < meilleur.d)) meilleur = { domaine: d, d: ecart }
  }
  return meilleur ? `${adresse.slice(0, at)}@${meilleur.domaine}` : null
}
