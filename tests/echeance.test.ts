import { describe, expect, it } from 'vitest'
import { echeanceOuvree } from '../src/lib/espace-pro/chemins'

describe('echeanceOuvree', () => {
  it('saute le week-end', () => {
    // Jeudi 8 octobre 2026 + 2 jours ouvrés = lundi 12.
    expect(echeanceOuvree(new Date(2026, 9, 8, 14), 2).getDate()).toBe(12)
    // Mardi + 2 = jeudi.
    expect(echeanceOuvree(new Date(2026, 9, 6, 14), 2).getDate()).toBe(8)
    // Samedi + 2 = mardi.
    expect(echeanceOuvree(new Date(2026, 9, 10, 9), 2).getDate()).toBe(13)
  })
})
