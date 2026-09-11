import { describe, expect, it } from 'vitest'
import { doitBloquer, SEUIL_SUPPRESSION } from '../scripts/sync/lib/garde-fou'

/**
 * Ces tests portent sur la fonction réellement appelée par `sync-ans`, et non
 * sur une copie de sa logique : une garantie testée en double exemplaire ne
 * garantit rien.
 */
describe('garde-fou des suppressions', () => {
  it('est réglé à 5 %', () => {
    expect(SEUIL_SUPPRESSION).toBe(0.05)
  })

  it('laisse passer une première importation sur base vide', () => {
    expect(doitBloquer(0, 0)).toBe(false)
  })

  it('laisse passer les radiations normales', () => {
    expect(doitBloquer(64398, 120)).toBe(false)
  })

  it('laisse passer pile le seuil', () => {
    expect(doitBloquer(64398, Math.floor(64398 * 0.05))).toBe(false)
  })

  it('bloque juste au-dessus du seuil', () => {
    expect(doitBloquer(64398, Math.ceil(64398 * 0.05) + 1)).toBe(true)
  })

  it('bloque un fichier tronqué de moitié', () => {
    expect(doitBloquer(64398, 32199)).toBe(true)
  })

  it('bloque un fichier vide', () => {
    expect(doitBloquer(64398, 64398)).toBe(true)
  })
})
