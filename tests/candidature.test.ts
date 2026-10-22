import { describe, expect, it } from 'vitest'
import { dansFiltre, initiales, lireFiltre, nomCandidat, telephoneValide } from '../src/lib/emploi/candidature'

describe('candidatures', () => {
  it('nom masqué d’un profil disponible, entier pour une candidature', () => {
    expect(nomCandidat('Julie Renard', false)).toBe('Julie R.')
    expect(nomCandidat('Julie Marie Renard', false)).toBe('Julie R.')
    expect(nomCandidat('Julie Renard', true)).toBe('Julie Renard')
    expect(nomCandidat('Julie', false)).toBe('Julie')
    expect(initiales('julie renard')).toBe('JR')
  })
  it('filtre par statut', () => {
    expect(dansFiltre('nouvelle', 'nouvelles')).toBe(true)
    expect(dansFiltre('retenue', 'retenues')).toBe(true)
    expect(dansFiltre('non_retenue', 'non_retenues')).toBe(true)
    expect(dansFiltre('vue', 'retenues')).toBe(false)
    expect(lireFiltre('bidon')).toBe('toutes')
  })
  it('téléphone', () => {
    expect(telephoneValide('06 12 34 56 78')).toBe(true)
    expect(telephoneValide('+33 6 12 34 56 78')).toBe(true)
    expect(telephoneValide('12')).toBe(false)
  })
})
