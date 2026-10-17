import { describe, expect, it } from 'vitest'
import { formaterSiret, sirenValide, siretValide } from '../src/lib/espace-pro/labo'

describe('SIREN et SIRET', () => {
  it('contrôle la clé de Luhn', () => {
    expect(sirenValide('732 829 320')).toBe(true)
    expect(sirenValide('732829321')).toBe(false)
    expect(siretValide('73282932000074')).toBe(true)
    expect(siretValide('73282932000075')).toBe(false)
    expect(siretValide('123')).toBe(false)
  })
  it('admet l’exception de La Poste', () => {
    expect(siretValide('35600000000010')).toBe(true)
  })
  it('formate pour l’affichage', () => {
    expect(formaterSiret('81234567800021')).toBe('812 345 678 00021')
    expect(formaterSiret('812345678')).toBe('812 345 678')
  })
})

import { FICHE_VIDE } from '../src/lib/espace-pro/fiche-completee'
import { calculerForceLabo, missionsLabo } from '../src/lib/espace-pro/force-labo'

describe('force laboratoire', () => {
  const ctx = { identiteVerifiee: true, viaPsc: false, nombreDeLieux: 1, lieuxGeres: 0 }
  const maintenant = new Date('2026-10-12T10:00:00Z')
  const onboarde = {
    ...FICHE_VIDE,
    techniques: ['ceramo_metallique', 'cfao', 'implantaire'],
    materiaux: ['zircone'],
    delais: { couronne_unitaire: 5 },
    rayonKm: 40,
    delaisConfirmesLe: '2026-10-11T10:00:00Z',
    majLe: '2026-10-11T10:00:00Z',
  }
  it('vaut 75 % après l’onboarding court', () => {
    expect(calculerForceLabo(onboarde, ctx, maintenant).total).toBe(75)
  })
  it('recommande les réalisations ensuite', () => {
    const restantes = missionsLabo(onboarde).filter((m) => !m.faite)
    expect(restantes.map((m) => m.cle)).toEqual(['realisations', 'ansm', 'presentation'])
  })
  it('baisse les délais à six mois', () => {
    expect(calculerForceLabo({ ...onboarde, delaisConfirmesLe: '2026-03-01T10:00:00Z' }, ctx, maintenant).total).toBe(70)
  })
})
