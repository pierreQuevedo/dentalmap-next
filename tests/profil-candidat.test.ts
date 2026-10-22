import { describe, expect, it } from 'vitest'
import { etapesBienvenue, libelleQualification, lireCriteres, lireExperiences, lireVisibilite, mobilite, pucesCriteres } from '../src/lib/emploi/profil-candidat'

describe('profil candidat', () => {
  it('la formation remplace la qualification pour un étudiant', () => {
    expect(etapesBienvenue('assistant')[2]).toBe('qualification')
    expect(etapesBienvenue('etudiant')[2]).toBe('formation')
  })
  it('qualification lue par le recruteur', () => {
    expect(libelleQualification({ situation: 'assistant', qualification: 'titre' })).toBe('Assistant(e) dentaire qualifié(e)')
    expect(libelleQualification({ situation: 'assistant', qualification: 'formation' })).toBe('Assistant(e) dentaire, en formation')
    expect(libelleQualification({ situation: 'etudiant', qualification: null, formation: { cursus: 'BTS prothésiste dentaire', annee: '1re année', recherche: [] } })).toBe('Étudiant(e), BTS prothésiste dentaire, 1re année')
  })
  it('critères par défaut et mobilité', () => {
    const c = lireCriteres({ contrats: ['cdi'], communeNom: 'Bordeaux', commune: '33063', disponibilite: 'Dès maintenant' })
    expect(c.rayonKm).toBe(15)
    expect(mobilite(c)).toBe('Bordeaux et 15 km autour')
    expect(pucesCriteres(c)).toEqual(['CDI', 'Dès maintenant'])
    expect(lireCriteres('n’importe quoi').contrats).toEqual([])
  })
  it('expériences et visibilité tolérantes', () => {
    expect(lireExperiences([{ poste: 'Assistante', structure: 'Cabinet', periode: '2021' }, { poste: '' }])).toEqual([])
    expect(lireExperiences([{ poste: 'Assistante' }])).toEqual([{ poste: 'Assistante', structure: '', periode: '' }])
    expect(lireVisibilite('bidon')).toBe('visible')
  })
})

import { completudeProfil, etapeFrise } from '../src/lib/emploi/profil-candidat'

describe('vue d’ensemble candidat', () => {
  const vide = { situation: 'assistant' as const, qualification: null, criteres: lireCriteres({}), formation: null, experiences: [], competences: [], cv: null }
  it('complétude et prochaine étape', () => {
    expect(completudeProfil(vide)).toEqual({ pct: 15, prochaine: { titre: 'Indiquer votre ville et les contrats recherchés', gain: 25, ancre: '#recherche' } })
    const plein = { ...vide, qualification: 'titre', criteres: lireCriteres({ contrats: ['cdi'], commune: '33063', disponibilite: 'Dès maintenant' }), experiences: [{ poste: 'A', structure: '', periode: '' }], competences: ['x'], cv: { nom: 'cv.pdf' } }
    expect(completudeProfil(plein)).toEqual({ pct: 100, prochaine: null })
  })
  it('frise', () => {
    expect(etapeFrise('nouvelle')).toEqual({ etape: 0, issue: null })
    expect(etapeFrise('vue')).toEqual({ etape: 1, issue: null })
    expect(etapeFrise('retenue')).toEqual({ etape: 2, issue: 'retenue' })
    expect(etapeFrise('non_retenue').issue).toBe('non')
  })
})
