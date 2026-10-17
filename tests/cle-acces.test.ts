import { describe, expect, it } from 'vitest'
import { DELAI_RELANCE_JOURS, PROPOSITIONS_MAX, proposerCle } from '../src/lib/tunnel/cle-acces'

const maintenant = new Date('2026-10-17T10:00:00Z')
const ilYa = (jours: number) => new Date(maintenant.getTime() - jours * 86_400_000)

describe('CX4 : proposer une clé d’accès', () => {
  it('attend la deuxième connexion', () => {
    expect(proposerCle({ cles: 0, sessions: 1, fois: 0, derniere: null }, maintenant)).toBe(false)
    expect(proposerCle({ cles: 0, sessions: 2, fois: 0, derniere: null }, maintenant)).toBe(true)
  })
  it('ne propose jamais à un compte qui a déjà une clé', () => {
    expect(proposerCle({ cles: 1, sessions: 5, fois: 0, derniere: null }, maintenant)).toBe(false)
  })
  it('relance une seule fois, une semaine plus tard au plus tôt', () => {
    expect(proposerCle({ cles: 0, sessions: 3, fois: 1, derniere: ilYa(DELAI_RELANCE_JOURS - 1) }, maintenant)).toBe(false)
    expect(proposerCle({ cles: 0, sessions: 3, fois: 1, derniere: ilYa(DELAI_RELANCE_JOURS) }, maintenant)).toBe(true)
    expect(proposerCle({ cles: 0, sessions: 9, fois: PROPOSITIONS_MAX, derniere: ilYa(90) }, maintenant)).toBe(false)
  })
})
