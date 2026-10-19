import { describe, expect, it } from 'vitest'
import { POINTS_MAX, bonusPalier, pointsDe, progressionDe } from '../src/lib/espace-pro/progression'

describe('progressionDe', () => {
  it('avant le premier palier', () => {
    const p = progressionDe(12)
    expect(p.actuel).toBeNull()
    expect(p.suivant?.niveau).toBe(1)
    expect(p.reste).toBe(18)
  })
  it('entre deux paliers', () => {
    const p = progressionDe(85)
    expect(p.actuel?.nom).toBe('Fiche complète')
    expect(p.suivant?.nom).toBe('Fiche exemplaire')
    expect(p.part).toBeCloseTo(0.5)
  })
  it('au sommet', () => {
    const p = progressionDe(POINTS_MAX)
    expect(p.actuel?.niveau).toBe(5)
    expect(p.suivant).toBeNull()
    expect(p.part).toBe(1)
  })
})

describe('pointsDe et bonusPalier', () => {
  it('additionne le barème, parrainages plafonnés à trois', () => {
    const p = pointsDe({ force: 100, google: true, badge: true, partage: true, parrainages: 5, aJour: true })
    expect(p.total).toBe(230)
    expect(p.detail.parrainage).toBe(75)
  })
  it('donne le bonus du palier tenu', () => {
    expect(bonusPalier(159)).toBe(0)
    expect(bonusPalier(160)).toBe(5)
    expect(bonusPalier(230)).toBe(10)
  })
})
