import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Fraicheur } from './force'

/**
 * Les règles pures des tâches planifiées de l'espace pro : quels blocs
 * rappeler, quand un lien du cabinet compte comme mort, quelle adresse on
 * accepte de tester, et le lien signé qui coupe les rappels.
 */

/** Un rappel par fiche et par mois au plus. */
export const INTERVALLE_RAPPEL_JOURS = 30
/** Les liens sont testés une fois par semaine. */
export const INTERVALLE_TEST_LIENS_JOURS = 7

/** Les blocs à rappeler : ceux qui approchent de leur échéance ou l'ont passée. */
export function blocsARappeler(fraicheur: Fraicheur[]): Fraicheur[] {
  return fraicheur.filter((b) => b.etat !== 'a_jour')
}

/**
 * Un lien répond s'il rend une page, ou si le serveur refuse poliment un
 * robot (401, 403, 429) : il existe, c'est ce que voit un patient.
 * Introuvable, erreur serveur ou pas de réponse : échec.
 */
export function lienRepond(statut: number | null): boolean {
  if (statut === null) return false
  return statut < 400 || statut === 401 || statut === 403 || statut === 429
}

/**
 * Une adresse que le serveur accepte d'appeler : http ou https, un nom de
 * domaine public. Ni adresse IP, ni nom local : le test ne doit jamais
 * servir à sonder le réseau interne.
 */
export function adresseTestable(url: string): boolean {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return false
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
  if (u.username || u.password) return false
  if (u.port && u.port !== '80' && u.port !== '443') return false
  const h = u.hostname.toLowerCase()
  if (!h.includes('.') || h.startsWith('[') || /^[\d.]+$/.test(h)) return false
  return !/(^|\.)(localhost|local|internal|intranet|lan|home|corp)$/.test(h)
}

/* Lien de coupure des rappels : l'identifiant de la fiche signé, valable dans chaque email. */
const SECRET = process.env.BETTER_AUTH_SECRET ?? 'dentalmap-dev'
const signature = (id: string) => createHmac('sha256', SECRET).update(`rappels-fiche:${id}`).digest('base64url').slice(0, 32)
export const jetonRappels = (praticienId: string) => `${praticienId}~${signature(praticienId)}`
export function ficheDuJetonRappels(jeton: string): string | null {
  const [id, sig] = decodeURIComponent(jeton).split('~')
  if (!id || !sig) return null
  const attendu = Buffer.from(signature(id)), recu = Buffer.from(sig)
  return attendu.length === recu.length && timingSafeEqual(attendu, recu) ? id : null
}
