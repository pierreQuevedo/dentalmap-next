import { describe, expect, it } from 'vitest'
import { nettoyerRpps, ressembleRpps, rppsMasque, rppsValide } from '../src/lib/espace-pro/rpps'

describe('RPPS', () => {
  it('accepte un numéro dont la clé de Luhn est juste', () => {
    expect(rppsValide('10003456789')).toBe(false)
    expect(rppsValide('10101234567')).toBe(false)
    // 1000345678 + clé calculée
    const base = '1000345678'
    const cle = [...Array(10).keys()].find((k) => rppsValide(base + k))
    expect(cle).toBeDefined()
    expect(rppsValide(`${base}${cle}`)).toBe(true)
    expect(rppsValide(`1 000 345 678 ${cle}`)).toBe(true)
  })

  it('refuse ce qui n’a pas onze chiffres', () => {
    expect(rppsValide('1000345678')).toBe(false)
    expect(rppsValide('abcdefghijk')).toBe(false)
    expect(ressembleRpps('Martin Dupont')).toBe(false)
    expect(ressembleRpps('100 034 567 89')).toBe(true)
  })

  it('nettoie et masque', () => {
    expect(nettoyerRpps('100-034.567 89')).toBe('10003456789')
    expect(rppsMasque('10003456789')).toBe('•••••••6789')
    expect(rppsMasque(null)).toBeNull()
  })
})
