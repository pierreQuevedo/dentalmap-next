import { headers } from 'next/headers'
import { Redis } from '@upstash/redis'

/**
 * Limitation de débit, partagée entre toutes les instances de Vercel grâce à
 * Upstash Redis (audit du 2026-10-26, M4) : codes de connexion, formulaires
 * publics, alertes, numéros de téléphone.
 *
 * Fenêtre fixe : un compteur par clé, qui expire à la fin de la fenêtre.
 * Sans base Upstash (développement), tout passe : la limite ne bloque jamais
 * un site mal configuré. Une panne d'Upstash laisse passer aussi, plutôt que
 * de couper la connexion de tout le monde.
 */
const URL_REDIS = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const JETON_REDIS = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
const redis = URL_REDIS && JETON_REDIS ? new Redis({ url: URL_REDIS, token: JETON_REDIS }) : null

/** Une base Upstash est branchée : le compteur est partagé. */
export const limitePartagee = !!redis

export type Consommation = { allowed: boolean; retryAfter: number | null }

/** Compte un essai pour `cle` : au-delà de `max` dans la fenêtre (secondes), refusé jusqu'à son expiration. */
export async function consommer(cle: string, regle: { window: number; max: number }): Promise<Consommation> {
  if (!redis) return { allowed: true, retryAfter: null }
  try {
    const k = `limite:${cle}`
    const [compte, ttl] = await redis.pipeline().incr(k).ttl(k).exec<[number, number]>()
    if (compte === 1 || ttl < 0) await redis.expire(k, regle.window)
    if (compte <= regle.max) return { allowed: true, retryAfter: null }
    return { allowed: false, retryAfter: ttl > 0 ? ttl : regle.window }
  } catch (e) {
    console.error('[limite] Upstash injoignable, essai laissé passer', e)
    return { allowed: true, retryAfter: null }
  }
}

/** L'adresse IP du visiteur, telle que Vercel la transmet. */
export async function ipVisiteur(): Promise<string> {
  const h = await headers()
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue'
}

/** Les limites des formulaires publics et des données sensibles, par IP, adresse ou compte. */
export const LIMITES = {
  contact: { window: 3600, max: 5 },
  partenariat: { window: 3600, max: 3 },
  alerte: { window: 3600, max: 5 },
  /** Emails de confirmation vers une même adresse, tous formulaires confondus. */
  adresse: { window: 86_400, max: 3 },
  etatCompte: { window: 60, max: 20 },
  telephone: { window: 86_400, max: 60 },
} as const

/** Raccourci des actions : l'essai est-il permis pour ce visiteur, et cette adresse s'il y en a une ? */
export async function permis(action: Exclude<keyof typeof LIMITES, 'adresse'>, email?: string | null): Promise<boolean> {
  const ip = await ipVisiteur()
  const parIp = await consommer(`${action}:ip:${ip}`, LIMITES[action])
  if (!parIp.allowed) return false
  if (email) {
    const parAdresse = await consommer(`adresse:${email.trim().toLowerCase()}`, LIMITES.adresse)
    if (!parAdresse.allowed) return false
  }
  return true
}

export const MESSAGE_LIMITE = 'Trop de demandes en peu de temps. Réessayez dans une heure.'
