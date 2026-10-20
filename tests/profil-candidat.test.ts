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
