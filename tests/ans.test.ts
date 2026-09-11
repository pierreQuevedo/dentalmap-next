import { describe, expect, it } from 'vitest'
import { composerAdresse, COL } from '../scripts/sync/lib/ans'

/**
 * La recomposition d'adresse pèse directement sur le taux de géocodage :
 * utiliser le type de voie et l'indice de répétition plutôt qu'une simple
 * concaténation fait gagner plus d'un point sur 59 000 lieux.
 */
function ligne(champs: Partial<Record<keyof typeof COL, string>>): string[] {
  const out = new Array(55).fill('')
  for (const [cle, valeur] of Object.entries(champs)) {
    out[COL[cle as keyof typeof COL]] = valeur
  }
  return out
}

describe('composerAdresse', () => {
  it('assemble numéro, type de voie et libellé', () => {
    expect(
      composerAdresse(ligne({ numeroVoie: '17', libelleTypeVoie: 'RUE', libelleVoie: 'DE LA REPUBLIQUE' })),
    ).toBe('17 RUE DE LA REPUBLIQUE')
  })

  it("conserve l'indice de répétition", () => {
    expect(
      composerAdresse(
        ligne({ numeroVoie: '1', indiceRepetition: 'BIS', libelleTypeVoie: 'RUE', libelleVoie: 'DES COLIBRIS' }),
      ),
    ).toBe('1 BIS RUE DES COLIBRIS')
  })

  it('tolère un numéro absent', () => {
    expect(composerAdresse(ligne({ libelleTypeVoie: 'PLACE', libelleVoie: 'BELLECOUR' }))).toBe('PLACE BELLECOUR')
  })

  it('rend une chaîne vide quand il n’y a pas d’adresse', () => {
    expect(composerAdresse(ligne({}))).toBe('')
  })

  it('ne laisse pas d’espaces multiples', () => {
    expect(composerAdresse(ligne({ numeroVoie: '5', libelleVoie: 'RUE   SANTERRE' }))).toBe('5 RUE SANTERRE')
  })
})
