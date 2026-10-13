import { describe, expect, it } from 'vitest'
import {
  capacitesParAnnee,
  citationRelevee,
  dureeInternat,
  formationsAffichees,
  lignesFrais,
  monogramme,
  niveauMax,
  prochainesPortesOuvertes,
  siglesDiplomes,
} from '../src/lib/formation/page-etablissement'
import { DONNEES_VIDES } from '../src/lib/espace-pro/etablissement'

const DIPLOMES = [
  { intitule: 'Bac pro Technicien en prothèse dentaire', niveau: 'Bac', duree: '2 ans', modalite: 'Initiale ou apprentissage' },
  { intitule: 'BTS Prothésiste dentaire', niveau: 'Bac+2', duree: '2 ans', modalite: 'Formation initiale' },
]

describe('page établissement', () => {
  it('prend les diplômes relevés sans déclaratif, et les formations actives sinon', () => {
    const relevees = formationsAffichees(null, DIPLOMES)
    expect(relevees.declarees).toBe(false)
    expect(relevees.formations.map((f) => f.apprentissage)).toEqual([true, false])
    const d = { ...DONNEES_VIDES, formations: [{ id: 'bts', intitule: 'BTS', niveau: 'Bac + 2', duree: '2 ans', voies: ['apprentissage' as const], acces: 'Après le bac', places: 16, active: true }] }
    const declarees = formationsAffichees(d, DIPLOMES)
    expect(declarees.declarees).toBe(true)
    expect(declarees.formations[0]).toMatchObject({ voies: ['Apprentissage'], places: 16, apprentissage: true })
  })

  it('retient le niveau le plus élevé et les sigles', () => {
    expect(niveauMax(DIPLOMES)).toBe('Bac + 2')
    expect(siglesDiplomes(DIPLOMES)).toBe('Bac pro, BTS')
  })

  it('lit les places des années précédentes dans le détail', () => {
    const r = capacitesParAnnee({ nombre: 82, annee: '2026-2027', detail: 'PASS 35, L.AS 4. En 2025-2026 : 80.' })
    expect(r.annees).toEqual([
      { annee: '2025-2026', n: 80 },
      { annee: '2026-2027', n: 82 },
    ])
    expect(r.detail).toBe('PASS 35, L.AS 4.')
  })

  it('découpe les frais par diplôme et met le montant en avant', () => {
    expect(lignesFrais('Bac pro : 6 990 euros par an (2026) ; gratuit en apprentissage')).toEqual([
      { libelle: 'Bac pro', montant: '6 990 euros par an', detail: '(2026)' },
      { libelle: 'Frais de scolarité', montant: 'Gratuit en apprentissage', detail: null },
    ])
    expect(lignesFrais(null)).toEqual([])
  })

  it('ne met en avant qu’une première phrase courte', () => {
    expect(citationRelevee('Une école. Le reste du texte.')).toEqual({ avant: 'Une école.', suite: null, texte: 'Le reste du texte.' })
    const long = `${'Très long '.repeat(20)}fin. Suite.`
    expect(citationRelevee(long).avant).toBeNull()
  })

  it('ne garde que des portes ouvertes à venir', () => {
    const d = { ...DONNEES_VIDES, portesOuvertes: '2027-02-06' }
    expect(prochainesPortesOuvertes(d, new Date('2026-10-13'))).toBe('2027-02-06')
    expect(prochainesPortesOuvertes(d, new Date('2027-03-01'))).toBeNull()
    expect(prochainesPortesOuvertes(null)).toBeNull()
  })

  it('donne les initiales et la durée de l’internat', () => {
    expect(monogramme('Lycée professionnel Charles Péguy')).toBe('LCP')
    expect(dureeInternat('Médecine bucco-dentaire')).toBe('3 ans')
    expect(dureeInternat('Orthopédie dento-faciale')).toBe('4 ans')
  })
})
