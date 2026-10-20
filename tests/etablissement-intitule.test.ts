import { describe, expect, it } from 'vitest'
import { intituleDiplome } from '../src/lib/espace-pro/etablissement'

describe('intitulé de diplôme', () => {
  it('écrit Bac + n avec des espaces', () => {
    expect(intituleDiplome('Bac+3 Prothésiste dentaire numérique')).toBe('Bac + 3 Prothésiste dentaire numérique')
    expect(intituleDiplome('BAC +2')).toBe('BAC + 2')
    expect(intituleDiplome('BTS Prothésiste dentaire')).toBe('BTS Prothésiste dentaire')
  })
})
