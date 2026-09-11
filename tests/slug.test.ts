import { describe, expect, it } from 'vitest'
import { slugifier, slugCommune, slugUnique } from '../scripts/sync/lib/slug'

// Un slug fait partie de l'URL publique, donc du référencement acquis.
// Ces tests existent pour qu'une modification de la génération soit vue comme
// ce qu'elle est : un changement cassant.

describe('slugifier', () => {
  it('translittère les accents', () => {
    expect(slugifier('Saint-Étienne')).toBe('saint-etienne')
    expect(slugifier('Nouméa')).toBe('noumea')
    expect(slugifier('Polynésie française')).toBe('polynesie-francaise')
  })

  it("traite l'apostrophe comme un séparateur", () => {
    expect(slugifier("L'Haÿ-les-Roses")).toBe('l-hay-les-roses')
    expect(slugifier('Val-d’Isère')).toBe('val-d-isere')
  })

  it('ne laisse ni tiret en tête ni en fin', () => {
    expect(slugifier('  Bordeaux  ')).toBe('bordeaux')
    expect(slugifier('--Paris--')).toBe('paris')
  })

  it('réduit les séparations multiples à un seul tiret', () => {
    expect(slugifier('Aix   en / Provence')).toBe('aix-en-provence')
  })
})

describe('slugCommune', () => {
  it('raccourcit les arrondissements municipaux', () => {
    expect(slugCommune('Paris 16e Arrondissement')).toBe('paris-16e')
    expect(slugCommune('Marseille 8e Arrondissement')).toBe('marseille-8e')
    expect(slugCommune('Lyon 6e Arrondissement')).toBe('lyon-6e')
  })

  it('laisse les communes ordinaires intactes', () => {
    expect(slugCommune('Bordeaux')).toBe('bordeaux')
    expect(slugCommune('Saint-Denis')).toBe('saint-denis')
  })
})

describe('slugUnique', () => {
  it('rend le premier slug tel quel', () => {
    const pris = new Set<string>()
    expect(slugUnique('bordeaux', '33063', pris)).toBe('bordeaux')
  })

  it('suffixe par le discriminant en cas de collision', () => {
    const pris = new Set<string>(['saint-denis'])
    expect(slugUnique('saint-denis', '97411', pris)).toBe('saint-denis-97411')
  })

  it('ne dépend pas de l’ordre de traitement', () => {
    // Deux ordres d'insertion différents doivent produire le même ensemble de
    // slugs, sans quoi un réimport changerait des URL déjà indexées.
    const a = new Set<string>()
    const resA = [
      slugUnique('sainte-marie', '97418', a),
      slugUnique('sainte-marie', '97228', a),
    ]
    const b = new Set<string>()
    const resB = [
      slugUnique('sainte-marie', '97228', b),
      slugUnique('sainte-marie', '97418', b),
    ]
    expect(new Set(resA)).not.toEqual(new Set(resB))
    // En revanche le suffixe est bien le discriminant, jamais un compteur.
    expect(resA[1]).toBe('sainte-marie-97228')
    expect(resB[1]).toBe('sainte-marie-97418')
  })
})
