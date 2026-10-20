/**
 * Filtres de la page commune, lus dans l'URL (`?contrat=cdi&contrat=cdd&temps=plein&min=2000&vue=carte`).
 * Ils s'appliquent sur la liste déjà triée, sans en changer l'ordre :
 * distance, puis ordre alphabétique.
 */
import { CODES_CONTRAT, type CodeContrat } from './metiers'
import type { OffreResume } from './types'

export type FiltresEmploi = {
  contrats: CodeContrat[]
  temps: 'tous' | 'plein' | 'partiel'
  /** Rémunération brute mensuelle minimale ; ne retient que les offres salariées dont le haut de fourchette l'atteint. */
  min: number | null
  vue: 'liste' | 'carte'
}

export type RechercheEmploi = { contrat?: string | string[]; temps?: string; min?: string; vue?: string; page?: string }

export function lireFiltres(sp: RechercheEmploi): FiltresEmploi {
  const brut = Array.isArray(sp.contrat) ? sp.contrat : sp.contrat ? [sp.contrat] : []
  const contrats = CODES_CONTRAT.filter((c) => brut.includes(c))
  const min = Number(sp.min)
  return {
    contrats,
    temps: sp.temps === 'plein' || sp.temps === 'partiel' ? sp.temps : 'tous',
    min: Number.isFinite(min) && min > 0 ? Math.round(min) : null,
    vue: sp.vue === 'carte' ? 'carte' : 'liste',
  }
}

/** Vrai quand un filtre restreint la liste (la vue n'en est pas un). */
export function estFiltree(f: FiltresEmploi): boolean {
  return f.contrats.length > 0 || f.temps !== 'tous' || f.min !== null
}

export function filtrerOffres(offres: OffreResume[], f: FiltresEmploi): OffreResume[] {
  return offres.filter(
    (o) =>
      (!f.contrats.length || f.contrats.includes(o.contrat)) &&
      (f.temps === 'tous' || (f.temps === 'plein') === o.tempsPlein) &&
      (f.min === null || (o.mode === 'salaire' && Math.max(o.min, o.max) >= f.min)),
  )
}

/** L'URL d'une page avec ses filtres, la vue choisie en plus. */
export function urlFiltres(base: string, f: FiltresEmploi, vue: 'liste' | 'carte' = f.vue): string {
  const p = new URLSearchParams()
  for (const c of f.contrats) p.append('contrat', c)
  if (f.temps !== 'tous') p.set('temps', f.temps)
  if (f.min !== null) p.set('min', String(f.min))
  if (vue === 'carte') p.set('vue', 'carte')
  const q = p.toString()
  return q ? `${base}${base.includes('?') ? '&' : '?'}${q}` : base
}
