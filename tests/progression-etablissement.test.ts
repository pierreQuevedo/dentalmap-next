import { describe, expect, it } from 'vitest'
import { blocGagne, historiqueEtab, progressionEtab, sourcesEtab } from '@/lib/espace-pro/progression-etablissement'
import type { Force } from '@/lib/espace-pro/force'
import type { MissionEtab } from '@/lib/espace-pro/etablissement'

const force: Force = {
  total: 65,
  items: [
    { cle: 'identite', libelle: 'Identité vérifiée', points: 30, max: 30 },
    { cle: 'formations', libelle: 'Formations', points: 25, max: 25 },
    { cle: 'acces', libelle: 'Conditions d’accès', points: 0, max: 15 },
    { cle: 'alternance', libelle: 'Alternance', points: 0, max: 10 },
    { cle: 'portes_ouvertes', libelle: 'Portes ouvertes', points: 0, max: 10 },
    { cle: 'photo', libelle: 'Photo', points: 10, max: 10 },
  ],
}

describe('progressionEtab', () => {
  it('sans vérification, aucun palier', () => {
    const p = progressionEtab(35, false)
    expect(p.actuel).toBeNull()
    expect(p.suivant?.niveau).toBe(1)
  })
  it('vérifiée à 65 % : palier 1, 5 % avant Page complète', () => {
    const p = progressionEtab(65, true)
    expect(p.actuel?.nom).toBe('Page publiée')
    expect(p.suivant?.nom).toBe('Page complète')
    expect(p.reste).toBe(5)
  })
  it('100 % : sommet', () => {
    const p = progressionEtab(100, true)
    expect(p.actuel?.niveau).toBe(3)
    expect(p.suivant).toBeNull()
    expect(p.part).toBe(1)
  })
})

describe('sourcesEtab', () => {
  it('suit l’ordre des missions, l’identité en dernier, sans lien', () => {
    const missions: MissionEtab[] = [
      { cle: 'acces', titre: '', duree: '3 min', gain: 15, href: 'formations', faite: false },
      { cle: 'photo', titre: '', duree: '2 min', gain: 0, href: 'galerie', faite: true },
    ]
    const s = sourcesEtab(force, missions)
    expect(s.map((x) => x.cle)).toEqual(['acces', 'photo', 'identite'])
    expect(s[2].href).toBeNull()
    expect(s[1].acquis).toBe(10)
  })
})

describe('blocGagne', () => {
  it('le bloc qui a le plus monté', () => {
    expect(blocGagne({ photo: 0, acces: 0 }, { photo: 10, acces: 15 })).toBe('acces')
    expect(blocGagne({ photo: 10 }, { photo: 10 })).toBeNull()
  })
})

describe('historiqueEtab', () => {
  it('blocs datés, publication, demande, le plus récent d’abord', () => {
    const h = historiqueEtab({ confirmeLe: { formations: '2026-10-02', galerie: '2026-10-10' }, demandeLe: '2026-10-01', publieeLe: '2026-10-05', type: 'ecole_prothese' }, force)
    expect(h.map((x) => x.cle)).toEqual(['galerie', 'publication', 'formations', 'demande'])
    expect(h.find((x) => x.cle === 'formations')?.points).toBe(25)
    expect(h.find((x) => x.cle === 'publication')?.points).toBe(30)
  })
})
