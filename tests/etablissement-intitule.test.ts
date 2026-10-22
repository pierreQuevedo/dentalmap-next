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

import { decouperVoies, placesParVoie } from '../src/lib/espace-pro/etablissement'

describe('voies d’accès d’une faculté', () => {
  it('ne coupe ni dans les parenthèses ni dans une liste de villes', () => {
    expect(
      decouperVoies('PASS (Bordeaux et sites délocalisés Pau, Dax, Agen, Périgueux), L.AS 60 ECTS, L.AS 120 ECTS et licences 2-3 (Bordeaux et Pau), passerelles ; accueil sur conventions d’étudiants de Poitiers, Limoges, La Réunion et du Pacifique Sud'),
    ).toEqual([
      'PASS (Bordeaux et sites délocalisés Pau, Dax, Agen, Périgueux)',
      'L.AS 60 ECTS',
      'L.AS 120 ECTS et licences 2-3 (Bordeaux et Pau)',
      'Passerelles',
      'Accueil sur conventions d’étudiants de Poitiers, Limoges, La Réunion et du Pacifique Sud',
    ])
    expect(decouperVoies('PASS, L.AS 1, L.AS 2-3, passerelles')).toEqual(['PASS', 'L.AS 1', 'L.AS 2-3', 'Passerelles'])
    expect(decouperVoies('L.AS uniquement, licence Sciences pour la santé accès santé, pas de PASS ; passerelles')).toEqual([
      'L.AS uniquement, licence Sciences pour la santé accès santé, pas de PASS',
      'Passerelles',
    ])
  })
  it('places par voie', () => {
    const detail = 'PASS 35, L.AS 60 ECTS 4, L.AS 120 ECTS et L2-L3 32, passerelles 9, candidats internationaux 2 ; hors conventions (Poitiers 36, Limoges 4, La Réunion 4) et Pacifique Sud (5)'
    expect(placesParVoie(detail, 'PASS (Bordeaux et sites délocalisés Pau, Dax, Agen, Périgueux)')).toBe(35)
    expect(placesParVoie(detail, 'L.AS 60 ECTS')).toBe(4)
    expect(placesParVoie(detail, 'L.AS 120 ECTS et licences 2-3 (Bordeaux et Pau)')).toBe(32)
    expect(placesParVoie(detail, 'Passerelles')).toBe(9)
    expect(placesParVoie(detail, 'Accueil sur conventions d’étudiants de Poitiers')).toBeNull()
  })
})

import { decouperDiplomes } from '../src/lib/espace-pro/etablissement'

describe('diplômes après le diplôme d’État', () => {
  it('une ligne par diplôme', () => {
    expect(decouperDiplomes('3 DES (internat), 7 CES, 10 DU et DIU')).toEqual(['3 DES, par l’internat', '7 CES', '10 DU et DIU'])
  })
})

import { manqueCentre } from '../src/lib/espace-pro/etablissement'

describe('centre de soins', () => {
  it('dit ce qui manque', () => {
    expect(manqueCentre({ adresse: 'CSERD, hôpital Pellegrin, Bordeaux', telephone: '', jours: [], horaires: '' })).toBe('Adresse, téléphone et horaires à préciser')
    expect(manqueCentre({ adresse: 'Place Amélie Raba-Léon, 33076 Bordeaux', telephone: '05 56 79 56 79', jours: ['lundi'], horaires: '8 h 30 à 17 h' })).toBeNull()
  })
})
