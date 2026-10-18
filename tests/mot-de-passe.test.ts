import { describe, expect, it } from 'vitest'
import { CRITERES_MOT_DE_PASSE, motDePasseValide } from '../src/lib/tunnel/mot-de-passe'

const manquants = (m: string) => CRITERES_MOT_DE_PASSE.filter((c) => !c.test(m)).map((c) => c.cle)

describe('règle du mot de passe', () => {
  it('accepte un mot de passe des quatre familles, douze caractères au moins', () => {
    expect(motDePasseValide('Cabinet-Bordeaux33')).toBe(true)
    expect(motDePasseValide('Éléphant rose 7 !')).toBe(true)
  })
  it('dit précisément ce qui manque', () => {
    expect(manquants('court1!A')).toEqual(['longueur'])
    expect(manquants('cabinetbordeaux33!')).toEqual(['majuscule'])
    expect(manquants('CABINETBORDEAUX33!')).toEqual(['minuscule'])
    expect(manquants('Cabinet-Bordeaux!')).toEqual(['chiffre'])
    expect(manquants('CabinetBordeaux33')).toEqual(['special'])
  })
  it('ne compte pas une espace comme caractère spécial', () => {
    expect(manquants('Cabinet Bordeaux 33')).toEqual(['special'])
  })
})
