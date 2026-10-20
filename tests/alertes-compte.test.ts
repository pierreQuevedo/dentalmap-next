import { describe, expect, it } from 'vitest'
import { lireFrequence, peutEnvoyer, pucesAlerte, titreAlerte } from '../src/lib/emploi/alertes-compte'

const maintenant = new Date('2026-10-21T07:15:00Z')
const il = (h: number) => new Date(maintenant.getTime() - h * 3_600_000)

describe('alertes du compte', () => {
  it('rythme d’envoi', () => {
    expect(peutEnvoyer('quotidienne', null, maintenant)).toBe(true)
    expect(peutEnvoyer('quotidienne', il(24), maintenant)).toBe(true)
    expect(peutEnvoyer('quotidienne', il(23.5), maintenant)).toBe(true)
    expect(peutEnvoyer('quotidienne', il(12), maintenant)).toBe(false)
    expect(peutEnvoyer('hebdomadaire', il(24 * 3), maintenant)).toBe(false)
    expect(peutEnvoyer('hebdomadaire', il(24 * 7), maintenant)).toBe(true)
    expect(lireFrequence('bidon')).toBe('hebdomadaire')
  })
  it('titre et puces', () => {
    expect(titreAlerte({ metiers: ['assistant_dentaire'], contrats: ['cdi'] })).toBe('Assistant(e) dentaire, CDI')
    expect(titreAlerte({ metiers: [], contrats: [] })).toBe('Tous les métiers')
    expect(pucesAlerte({ metiers: ['assistant_dentaire'], contrats: [], rayonKm: 15 }, 'Bordeaux')).toEqual(['Assistant(e) dentaire', 'Tous les contrats', '15 km autour de Bordeaux'])
  })
})
