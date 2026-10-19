import { describe, expect, it } from 'vitest'
import { bonusParrainage, lireAdresses } from '../src/lib/espace-pro/parrainage'

const JOUR = 86_400_000
const maintenant = new Date('2026-10-19T12:00:00Z')
const ilYa = (j: number) => new Date(maintenant.getTime() - j * JOUR)

describe('bonusParrainage', () => {
  it('rien sans parrainage réussi', () => {
    expect(bonusParrainage([], maintenant)).toEqual({ points: 0, actifs: 0, jusquau: null })
  })
  it('5 points pendant 90 jours', () => {
    const b = bonusParrainage([ilYa(10)], maintenant)
    expect(b.points).toBe(5)
    expect(b.jusquau?.getTime()).toBe(ilYa(10).getTime() + 90 * JOUR)
  })
  it('expire après 90 jours', () => {
    expect(bonusParrainage([ilYa(91)], maintenant).points).toBe(0)
  })
  it('se cumule jusqu’au plafond de 15', () => {
    expect(bonusParrainage([ilYa(1), ilYa(2)], maintenant).points).toBe(10)
    const b = bonusParrainage([ilYa(1), ilYa(2), ilYa(3), ilYa(4)], maintenant)
    expect(b.points).toBe(15)
    expect(b.actifs).toBe(4)
    expect(b.jusquau?.getTime()).toBe(ilYa(1).getTime() + 90 * JOUR)
  })
})

describe('lireAdresses', () => {
  it('sépare, met en minuscules, dédoublonne', () => {
    expect(lireAdresses('Dr.Martin@Cabinet.fr, dr.martin@cabinet.fr;\n<b@orange.fr>  pas-une-adresse')).toEqual({
      valides: ['dr.martin@cabinet.fr', 'b@orange.fr'],
      invalides: ['pas-une-adresse'],
    })
  })
  it('ignore une saisie vide', () => {
    expect(lireAdresses('  \n , ')).toEqual({ valides: [], invalides: [] })
  })
})
