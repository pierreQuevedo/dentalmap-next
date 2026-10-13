import { formaterSiret } from '@/lib/espace-pro/labo'

/** Les adresses du parcours laboratoire. */
export const LABO = '/espace-pro/laboratoire/revendiquer'

export function versLabo(slug: string, suite = '', lieux?: string[]): string {
  const q = lieux?.length ? `?lieux=${lieux.join(',')}` : ''
  return `${LABO}/${encodeURIComponent(slug)}/${suite ? `${suite}/` : ''}${q}`
}

/** « SIREN 812 345 678 », ou rien. */
export function libelleSiren(siren: string | null): string | null {
  return siren ? (formaterSiret(siren) ?? siren) : null
}

/** Les lieux choisis en LE1, gardés d'écran en écran par l'adresse. */
export function lieuxDe(param: string | string[] | undefined): string[] {
  const brut = Array.isArray(param) ? param.join(',') : (param ?? '')
  return brut.split(',').filter(Boolean)
}
