import { describe, expect, it } from 'vitest'
import { formaterAdresse, formaterNom, formaterRaisonSociale } from '../src/lib/annuaire/nom'

describe('formaterNom', () => {
  it('recasse les capitales de la source', () => {
    expect(formaterNom('LEILANIE')).toBe('Leilanie')
    expect(formaterNom('MARIE HELENE')).toBe('Marie Helene')
  })

  it('respecte les noms composés', () => {
    expect(formaterNom('MARIE-HELENE')).toBe('Marie-Helene')
    expect(formaterNom('EL JABRI AMRANE')).toBe('El Jabri Amrane')
  })

  it("garde les particules en minuscules sauf en tête", () => {
    expect(formaterNom('DE LA TOUR')).toBe('De la Tour')
    expect(formaterNom('VAN DER BERG')).toBe('Van der Berg')
  })

  it("gère l'apostrophe", () => {
    expect(formaterNom("D'ARGENT")).toBe("D'Argent")
  })

  it('rend une chaîne vide sur une valeur absente', () => {
    expect(formaterNom(null)).toBe('')
    expect(formaterNom('')).toBe('')
  })
})

describe('formaterRaisonSociale', () => {
  it('conserve les formes juridiques en capitales', () => {
    expect(formaterRaisonSociale('SARL BANCE')).toBe('SARL Bance')
    expect(formaterRaisonSociale('SELARL DU CENTRE')).toBe('SELARL Du Centre')
  })

  it('recasse le reste', () => {
    expect(formaterRaisonSociale('LABORATOIRE DENTAIRE GIRONDIN')).toBe('Laboratoire Dentaire Girondin')
  })
})

describe('enseigne redondante', () => {
  it("retire la parenthèse quand elle répète la raison sociale", () => {
    expect(formaterRaisonSociale('BURDIGALA LABORATOIRE DENTAIRE (BURDIGALA LABORATOIRE DENTAIRE)')).toBe(
      'Burdigala Laboratoire Dentaire',
    )
  })

  it("conserve une enseigne qui apporte une information", () => {
    expect(formaterRaisonSociale('ORTHESE DENTAIRE FARGEOT (ODF)')).toBe('Orthese Dentaire Fargeot (ODF)')
  })
})

describe('formaterAdresse', () => {
  it('recasse les voies en capitales', () => {
    expect(formaterAdresse('38 RUE VITAL CARLES')).toBe('38 Rue Vital Carles')
    expect(formaterAdresse('PLACE BELLECOUR')).toBe('Place Bellecour')
  })

  it('garde les particules en minuscules', () => {
    expect(formaterAdresse('12 COURS DE L INTENDANCE')).toBe('12 Cours de l Intendance')
    expect(formaterAdresse('255 CHEMIN DE LA TRAVERSE')).toBe('255 Chemin de la Traverse')
  })

  it('conserve les abréviations', () => {
    expect(formaterAdresse('BP 8023')).toBe('BP 8023')
    expect(formaterAdresse('ZI DES PALUDS')).toBe('ZI des Paluds')
  })

  it('ne touche pas aux numéros composés', () => {
    expect(formaterAdresse('186-188 RUE MARCADET')).toBe('186-188 Rue Marcadet')
    expect(formaterAdresse('1 BIS RUE DES COLIBRIS')).toBe('1 Bis Rue des Colibris')
  })
})
