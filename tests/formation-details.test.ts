import { describe, expect, it } from 'vitest'
import {
  DETAILS_VIDES,
  evenementsAVenir,
  lireDate,
  lireDetails,
  lireEtapes,
  lireEvenements,
  lireLignes,
  prochainePorteOuverteSaisie,
} from '../src/lib/formation/details'
import { lignesFrais } from '../src/lib/formation/page-etablissement'

describe('groupe ACF Formation, informations détaillées', () => {
  it('rend un groupe vide ou absent comme des détails vides', () => {
    expect(lireDetails(null)).toEqual(DETAILS_VIDES)
    expect(lireDetails(undefined)).toEqual(DETAILS_VIDES)
    expect(lireDetails({})).toEqual(DETAILS_VIDES)
    expect(lireDetails({ telephone: '  ', frais: '', portesOuvertes: null })).toEqual(DETAILS_VIDES)
  })

  it('lit les lignes sans puce ni ligne vide', () => {
    expect(lireLignes('- Goût du travail manuel\n\n• Bonne vision des couleurs\r\n1. Stage conseillé')).toEqual([
      'Goût du travail manuel',
      'Bonne vision des couleurs',
      'Stage conseillé',
    ])
    expect(lireLignes(null)).toEqual([])
  })

  it('lit les étapes « titre | explication | période » et ignore les lignes sans titre', () => {
    expect(lireEtapes('Vous candidatez | Sur Parcoursup pour le BTS. | Janvier à mars\nEntretien\n | sans titre')).toEqual([
      { titre: 'Vous candidatez', detail: 'Sur Parcoursup pour le BTS.', quand: 'Janvier à mars' },
      { titre: 'Entretien', detail: null, quand: null },
    ])
    expect(lireEtapes('1\n2\n3\n4\n5\n6\n7\n8\n9\n10'.replace(/\d+/g, (n) => `Étape ${n}`))).toHaveLength(8)
  })

  it('lit les dates ISO, françaises et en toutes lettres', () => {
    expect(lireDate('2027-02-06')).toBe('2027-02-06')
    expect(lireDate('6/2/2027')).toBe('2027-02-06')
    expect(lireDate('samedi 6 février 2027')).toBe('2027-02-06')
    expect(lireDate('1er août 2027')).toBe('2027-08-01')
    expect(lireDate('31/02/2027')).toBeNull()
    expect(lireDate('début février')).toBeNull()
  })

  it('lit les rendez-vous, les trie et écarte ceux sans date lisible', () => {
    const e = lireEvenements('14/03/2027 | Mini-stage d’une journée | Sur inscription ; 06/02/2027 | Journée portes ouvertes | 9h00 à 16h00 ; bientôt | Forum\n22/05/2027')
    expect(e).toEqual([
      { date: '2027-02-06', titre: 'Journée portes ouvertes', detail: '9h00 à 16h00' },
      { date: '2027-03-14', titre: 'Mini-stage d’une journée', detail: 'Sur inscription' },
      { date: '2027-05-22', titre: 'Journée portes ouvertes', detail: null },
    ])
  })

  it('ne garde que les rendez-vous à venir, celui du jour compris, à l’heure de Paris', () => {
    const e = lireEvenements('2026-10-13 | Passé ; 2026-10-14 | Aujourd’hui ; 2026-11-02 | Journée portes ouvertes')
    // 23 h 30 UTC le 13 : déjà le 14 à Paris.
    const maintenant = new Date('2026-10-13T23:30:00Z')
    expect(evenementsAVenir(e, maintenant).map((x) => x.titre)).toEqual(['Aujourd’hui', 'Journée portes ouvertes'])
    expect(prochainePorteOuverteSaisie(e, maintenant)?.date).toBe('2026-11-02')
    expect(prochainePorteOuverteSaisie(e, new Date('2026-12-01'))).toBeNull()
  })

  it('normalise les champs simples', () => {
    const d = lireDetails({
      adresse: '12 cours de la Libération',
      codePostal: '33400',
      capaciteAccueil: 48,
      latitude: 44.8,
      longitude: -0.59,
      sources: 'https://exemple.fr/admission\npas une adresse\nhttp://onisep.fr/x',
      dateReleve: '2026-10-04T00:00:00+00:00',
      prerequis: 'Goût du travail manuel\nBonne vision des couleurs',
      frais: ' Frais | 0 €\nAides | Bourses ',
    }, 'Talence')
    expect(d.adresse).toBe('12 cours de la Libération, 33400 Talence')
    expect(d.frais).toBe('Frais | 0 €\nAides | Bourses')
    expect(d.capacite).toBe(48)
    expect(d.position).toEqual({ lon: -0.59, lat: 44.8 })
    expect(d.sources).toEqual(['https://exemple.fr/admission', 'http://onisep.fr/x'])
    expect(d.dateReleve).toBe('2026-10-04')
    expect(d.prerequis).toHaveLength(2)
    expect(lireDetails({ latitude: 0, longitude: 0 }).position).toBeNull()
    expect(lireDetails({ capaciteAccueil: 0 }).capacite).toBeNull()
  })

  it('lit les frais en colonnes, et garde la forme relevée « libellé : montant »', () => {
    expect(lignesFrais('Frais de scolarité | Aucun | Établissement sous contrat ; Équipement de l’élève | Environ 450 €\nAides | Bourses | Bourses de lycée')).toEqual([
      { libelle: 'Frais de scolarité', montant: 'Aucun', detail: 'Établissement sous contrat' },
      { libelle: 'Équipement de l’élève', montant: 'Environ 450 €', detail: null },
      { libelle: 'Aides', montant: 'Bourses', detail: 'Bourses de lycée' },
    ])
    expect(lignesFrais('Sans montant | ')).toEqual([])
    expect(lignesFrais('Bac pro : 6 990 euros par an (2026)')).toEqual([{ libelle: 'Bac pro', montant: '6 990 euros par an', detail: '(2026)' }])
  })
})
