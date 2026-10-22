import { describe, expect, it } from 'vitest'
import { Avis, classerEtablissements, refusTexte, resumerAvis, scoreAvis, scoreClassement } from '@/lib/formation/avis'

describe('scoreAvis', () => {
  it('sans avis, zéro', () => {
    expect(scoreAvis(0, null)).toBe(0)
  })
  it('le nombre pèse plus que la note : 10 avis à 4,5 devant 3 avis à 5', () => {
    expect(scoreAvis(10, 4.5)).toBeGreaterThan(scoreAvis(3, 5))
  })
  it('à nombre égal, la meilleure note passe devant', () => {
    expect(scoreAvis(20, 4.8)).toBeGreaterThan(scoreAvis(20, 3.2))
  })
  it('un seul 5/5 ne vaut pas cinq avis moyens', () => {
    expect(scoreAvis(1, 5)).toBeLessThan(scoreAvis(5, 3.5))
  })
  it('plafonné à 1', () => {
    expect(scoreAvis(500, 5)).toBeLessThanOrEqual(1)
  })
})

describe('scoreClassement', () => {
  it('80 % avis, 20 % remplissage', () => {
    expect(scoreClassement({ nombre: 0, moyenne: null }, 100)).toBeCloseTo(0.2)
    expect(scoreClassement({ nombre: 500, moyenne: 5 }, 0)).toBeCloseTo(0.8)
  })
  it('quelques avis passent devant une page pleine sans avis', () => {
    expect(scoreClassement({ nombre: 5, moyenne: 4 }, 30)).toBeGreaterThan(scoreClassement({ nombre: 0, moyenne: null }, 100))
  })
})

describe('Avis et texte', () => {
  it('valide un avis, refuse une note absente ou un texte court', () => {
    expect(Avis.safeParse({ lien: 'ancien', note: '5', texte: 'x'.repeat(50) }).success).toBe(true)
    expect(Avis.safeParse({ lien: 'ancien', note: '0', texte: 'x'.repeat(50) }).success).toBe(false)
    expect(Avis.safeParse({ lien: 'ancien', note: '4', texte: 'trop court' }).success).toBe(false)
  })
  it('refuse les coordonnées', () => {
    expect(refusTexte('Écrivez-moi à jean@exemple.fr')).not.toBeNull()
    expect(refusTexte('Appelez le 06 12 34 56 78')).not.toBeNull()
    expect(refusTexte('Une formation exigeante et bien encadrée.')).toBeNull()
  })
  it('accepte la promotion et « la meilleure », refuse les injures', () => {
    expect(refusTexte('Promotion 2019 : la meilleure formation de la région, prix raisonnable.')).toBeNull()
    expect(refusTexte('Le directeur est un connard.')).not.toBeNull()
    expect(refusTexte('Une conférence de rentrée très utile.')).toBeNull()
  })
  it('résume les notes', () => {
    expect(resumerAvis([5, 4, 4, 3])).toEqual({ nombre: 4, moyenne: 4, repartition: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 1 } })
  })
})

describe('classerEtablissements', () => {
  it('avis d’abord, remplissage ensuite, ordre reçu pour les égalités', () => {
    const liste = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }, { slug: 'd' }]
    const chiffres = new Map([
      ['b', { nombre: 0, moyenne: null, remplissage: 100 }],
      ['c', { nombre: 8, moyenne: 4.4, remplissage: 40 }],
    ])
    expect(classerEtablissements(liste, chiffres).map((x) => x.slug)).toEqual(['c', 'b', 'a', 'd'])
  })
})
