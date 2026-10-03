import { describe, expect, it } from 'vitest'
import { ORIENTATIONS, SPECIALITES, filtresEnParams, lireFiltres, orientationsDe, specialitesDe } from '../src/lib/annuaire/filtres'

describe('spécialités du registre', () => {
  it('distingue les spécialités des dentistes et des maxillo-faciaux, aucune pour les autres', () => {
    expect(specialitesDe('dentiste').map((s) => s.code)).toEqual(['odf', 'chirurgie-orale', 'medecine-bucco-dentaire'])
    expect(specialitesDe('maxillo_facial').map((s) => s.code)).toEqual(['maxillo-faciale', 'maxillo-faciale-stomatologie'])
    expect(specialitesDe('stomatologue')).toEqual([])
    expect(specialitesDe('orl')).toEqual([])
    expect(specialitesDe('prothesiste')).toEqual([])
  })
  it('réunit les deux libellés de la chirurgie maxillo-faciale', () => {
    expect(SPECIALITES.find((s) => s.code === 'maxillo-faciale')?.valeurs).toHaveLength(2)
  })
  it('n’a pas deux codes identiques', () => {
    expect(new Set(SPECIALITES.map((s) => s.code)).size).toBe(SPECIALITES.length)
  })
})

describe('orientations déclarées', () => {
  it('propose une liste à chaque personne et rien aux laboratoires', () => {
    expect(orientationsDe('dentiste').length).toBeGreaterThan(5)
    expect(orientationsDe('maxillo_facial').length).toBeGreaterThan(3)
    expect(orientationsDe('stomatologue').length).toBeGreaterThan(2)
    expect(orientationsDe('orl').length).toBeGreaterThan(5)
    expect(orientationsDe('prothesiste')).toEqual([])
  })
  it('n’a pas deux codes identiques et partage l’implantologie', () => {
    expect(new Set(ORIENTATIONS.map((o) => o.code)).size).toBe(ORIENTATIONS.length)
    expect(orientationsDe('stomatologue').some((o) => o.code === 'implantologie')).toBe(true)
  })
})

describe('filtres en paramètres', () => {
  it('fait l’aller-retour', () => {
    const params = filtresEnParams({ specialite: 'maxillo-faciale', orientation: 'implantologie', exercice: 'liberal', pmr: true })
    expect(params.get('specialite')).toBe('maxillo-faciale')
    expect(params.get('orientation')).toBe('implantologie')
    expect(lireFiltres(params)).toEqual({ specialite: 'maxillo-faciale', orientation: 'implantologie', exercice: 'liberal', pmr: true })
  })
  it('ignore les valeurs inconnues', () => {
    expect(lireFiltres(new URLSearchParams('specialite=magie&orientation=voyance&exercice=x'))).toEqual({})
  })
})
