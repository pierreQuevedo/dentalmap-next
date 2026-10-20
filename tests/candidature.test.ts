import { describe, expect, it } from 'vitest'
import { creneauxValides, dansFiltre, initiales, libelleCreneau, lireFiltre, nomCandidat, telephoneValide } from '../src/lib/emploi/candidature'

describe('candidatures', () => {
  it('masque le nom avant l’échange', () => {
    expect(nomCandidat('Julie Renard', false)).toBe('Julie R.')
    expect(nomCandidat('Julie Marie Renard', false)).toBe('Julie R.')
    expect(nomCandidat('Julie Renard', true)).toBe('Julie Renard')
    expect(nomCandidat('Julie', false)).toBe('Julie')
    expect(initiales('julie renard')).toBe('JR')
  })
  it('filtre par statut', () => {
    expect(dansFiltre('nouvelle', 'nouvelles')).toBe(true)
    expect(dansFiltre('echange_accepte', 'echange')).toBe(true)
    expect(dansFiltre('vue', 'retenues')).toBe(false)
    expect(lireFiltre('bidon')).toBe('toutes')
  })
  it('deux ou trois créneaux distincts', () => {
    expect(creneauxValides(['a', ' ', 'a']).ok).toBe(false)
    expect(creneauxValides(['a', 'b'])).toEqual({ ok: true, creneaux: ['a', 'b'] })
    expect(creneauxValides(['a', 'b', 'c', 'd']).ok).toBe(false)
  })
  it('libellé de créneau', () => {
    expect(libelleCreneau('2026-10-27T18:00')).toBe('mardi 27 octobre, 18h00')
    expect(libelleCreneau('Autre')).toBe('Autre')
  })
  it('téléphone', () => {
    expect(telephoneValide('06 12 34 56 78')).toBe(true)
    expect(telephoneValide('+33 6 12 34 56 78')).toBe(true)
    expect(telephoneValide('12')).toBe(false)
  })
})
