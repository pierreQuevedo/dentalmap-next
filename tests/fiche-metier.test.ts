import { describe, expect, it } from 'vitest'
import { caseSalaire, lignes, lireFicheMetier } from '@/lib/conseils/metier'

const base = { metier_chiffres: '18 mois | de formation\nNiveau 4 | titre reconnu\n2 113 € | salaire minimum conventionnel en cabinet' }

describe('fiche métier : salaires minimums par secteur', () => {
  it('nouveau format « Secteur | montant | montant haut | précision »', () => {
    const f = lireFicheMetier({
      ...base,
      metier_salaires:
        'Cabinet libéral | 1963 | 3065 | CAP à BTS\nCentre de santé | \nLaboratoire de prothèse | 1935 | 2293 | bac pro à BTS\nHôpital ou centre universitaire | ',
    })
    expect(f?.salaires).toEqual([
      { montant: 1963, haut: 3065, precision: 'CAP à BTS' },
      null,
      { montant: 1935, haut: 2293, precision: 'bac pro à BTS' },
      null,
    ])
  })
  it('ancien format « Secteur | montant » toujours lu', () => {
    const f = lireFicheMetier({ ...base, metier_salaires: 'Cabinet libéral | 2113\nCentre de santé | ' })
    expect(f?.salaires).toEqual([{ montant: 2113, haut: null, precision: null }, null, null, null])
  })
  it('un montant non numérique est un texte affiché tel quel', () => {
    const f = lireFicheMetier({
      ...base,
      metier_salaires: 'Cabinet libéral | Honoraires\nHôpital ou centre universitaire | 4634 | | Début de grille des praticiens hospitaliers',
    })
    expect(f?.salaires).toEqual([{ texte: 'Honoraires', precision: null }, null, null, { montant: 4634, haut: null, precision: 'Début de grille des praticiens hospitaliers' }])
  })
  it('montants avec espaces ou euro, haut ignoré s’il n’est pas au-dessus du minimum', () => {
    expect(caseSalaire(['Cabinet libéral', '2 113 €'])).toEqual({ montant: 2113, haut: null, precision: null })
    expect(caseSalaire(['Cabinet libéral', '2113', '2000'])).toEqual({ montant: 2113, haut: null, precision: null })
    expect(caseSalaire(['Cabinet libéral', ''])).toBeNull()
    expect(caseSalaire(['Cabinet libéral'])).toBeNull()
  })
  it('secteur inconnu ignoré, casse indifférente', () => {
    const f = lireFicheMetier({ ...base, metier_salaires: 'cabinet LIBÉRAL | 1905\nAilleurs | 9999' })
    expect(f?.salaires).toEqual([{ montant: 1905, haut: null, precision: null }, null, null, null])
  })
  it('chiffres clés : trois lignes restent trois', () => {
    expect(lireFicheMetier(base)?.chiffres).toHaveLength(3)
    expect(lignes('a | b\n\n c | d ')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })
})
