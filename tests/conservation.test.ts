import { describe, expect, it } from 'vitest'
import { etapeInactivite } from '../src/lib/conservation-regles'

const maintenant = new Date('2026-10-25T03:00:00Z')
const ilYa = (jours: number) => new Date(maintenant.getTime() - jours * 86_400_000)

describe('Comptes inactifs : deux ans, après un email', () => {
  it('laisse un compte actif', () => {
    expect(etapeInactivite({ derniereActivite: ilYa(300), avertiLe: null }, maintenant)).toBe('actif')
  })
  it('avertit un mois avant les deux ans', () => {
    expect(etapeInactivite({ derniereActivite: ilYa(690), avertiLe: null }, maintenant)).toBe('actif')
    expect(etapeInactivite({ derniereActivite: ilYa(705), avertiLe: null }, maintenant)).toBe('avertir')
  })
  it('ne supprime jamais sans avertissement', () => {
    expect(etapeInactivite({ derniereActivite: ilYa(900), avertiLe: null }, maintenant)).toBe('avertir')
  })
  it('supprime un mois après l’avertissement, les deux ans passés', () => {
    expect(etapeInactivite({ derniereActivite: ilYa(740), avertiLe: ilYa(20) }, maintenant)).toBe('actif')
    expect(etapeInactivite({ derniereActivite: ilYa(740), avertiLe: ilYa(30) }, maintenant)).toBe('supprimer')
  })
})
