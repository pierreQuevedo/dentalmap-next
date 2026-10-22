import { describe, expect, it } from 'vitest'
import { intituleDiplome } from '../src/lib/espace-pro/etablissement'

describe('intitulé de diplôme', () => {
  it('écrit Bac + n avec des espaces', () => {
    expect(intituleDiplome('Bac+3 Prothésiste dentaire numérique')).toBe('Bac + 3 Prothésiste dentaire numérique')
    expect(intituleDiplome('BAC +2')).toBe('BAC + 2')
    expect(intituleDiplome('BTS Prothésiste dentaire')).toBe('BTS Prothésiste dentaire')
  })
})

import { manqueFormation } from '../src/lib/espace-pro/etablissement'

describe('ce qui manque à une formation', () => {
  it('liste les champs à préciser', () => {
    expect(manqueFormation({ acces: null, places: null, voies: ['initiale'] })).toBe('Conditions d’accès et places à préciser')
    expect(manqueFormation({ acces: 'Après le bac', places: 12, voies: [] })).toBe('Voies à préciser')
    expect(manqueFormation({ acces: 'Après le bac', places: 12, voies: ['initiale'] })).toBeNull()
  })
})

import { decoderEntites } from '../src/lib/formation/faculte'

describe('entités du contenu WordPress', () => {
  it('décode les apostrophes typographiques, même encodées deux fois', () => {
    expect(decoderEntites('Académie d&rsquo;Art')).toBe('Académie d’Art')
    expect(decoderEntites('Académie d&amp;rsquo;Art')).toBe('Académie d’Art')
  })
})

import { dureeCourte, formationsFaculte } from '../src/lib/espace-pro/etablissement'

describe('faculté', () => {
  it('durée courte pour la carte', () => {
    expect(dureeCourte('6 ans minimum, 8 à 9 ans avec l’internat')).toBe('6 à 9 ans')
    expect(dureeCourte('2 ans')).toBe('2 ans')
    expect(dureeCourte('3 ans (dont 1 en alternance)')).toBe('3 ans')
  })
  it('places préremplies avec la capacité d’accueil', () => {
    expect(formationsFaculte(null, null, 82)[0].places).toBe(82)
    expect(formationsFaculte(null, null)[0].places).toBeNull()
  })
})

describe('diplôme d’État', () => {
  it('prend sa majuscule', () => {
    expect(intituleDiplome('diplôme d’état de docteur en chirurgie dentaire')).toBe('diplôme d’État de docteur en chirurgie dentaire')
    expect(intituleDiplome("Diplôme d'état")).toBe('Diplôme d’État')
  })
})
