import { describe, expect, it } from 'vitest'
import { FICHE_VIDE, termesRefuses, type FicheCompletee } from '../src/lib/espace-pro/fiche-completee'
import { calculerForce, distinctionsDe, filtresDe, fraicheurDe, missionsDe, palierDe, prochaineMission } from '../src/lib/espace-pro/force'

const MAINTENANT = new Date('2026-10-12T10:00:00Z')
const verifie = { identiteVerifiee: true, viaPsc: true, nombreDeLieux: 1, lieuxGeres: 0 }
const SEMAINE = { lundi: [{ debut: '08:30', fin: '12:30' }], mardi: [{ debut: '08:30', fin: '19:00' }] }

/** La fiche au sortir de l'onboarding court : horaires, conventionnement, accueil. */
const ONBOARDEE: FicheCompletee = {
  ...FICHE_VIDE,
  horaires: SEMAINE,
  secteur: 'secteur_1',
  tiersPayant: 'securite_sociale_et_mutuelle',
  langues: ['fr', 'en'],
  accesPmr: 'oui',
  ageMinimum: 3,
  horairesConfirmesLe: '2026-10-11T10:00:00Z',
  majLe: '2026-10-11T10:00:00Z',
}

describe('calculerForce', () => {
  it('vaut 30 % à la vérification, 70 % après l’onboarding court', () => {
    expect(calculerForce(null, verifie, MAINTENANT).total).toBe(30)
    expect(calculerForce(ONBOARDEE, verifie, MAINTENANT).total).toBe(70)
  })

  it('atteint 100 avec les trois missions', () => {
    const complete = {
      ...ONBOARDEE,
      photoUrl: 'https://exemple.fr/p.jpg',
      presentation: 'Cabinet de deux fauteuils au cœur de la ville, à deux pas du tram. '.repeat(4),
      orientations: ['implantologie', 'parodontologie'],
    }
    expect(calculerForce(complete, verifie, MAINTENANT).total).toBe(100)
  })

  it('réduit les horaires à 90 jours et les annule à 180', () => {
    const vieux = (jours: number) => ({ ...ONBOARDEE, horairesConfirmesLe: new Date(MAINTENANT.getTime() - jours * 86_400_000).toISOString() })
    expect(calculerForce(vieux(91), verifie, MAINTENANT).total).toBe(60)
    expect(calculerForce(vieux(181), verifie, MAINTENANT).total).toBe(50)
  })

  it('ne compte pas une présentation qui contient un terme refusé', () => {
    const texte = 'Nous proposons les meilleurs soins de la ville. '.repeat(6)
    expect(termesRefuses(texte)).toContain('meilleurs')
    expect(calculerForce({ ...ONBOARDEE, presentation: texte }, verifie, MAINTENANT).total).toBe(70)
  })
})

describe('paliers et missions', () => {
  it('range les paliers', () => {
    expect([0, 39, 40, 69, 70, 89, 90].map(palierDe)).toEqual(['debutant', 'debutant', 'intermediaire', 'intermediaire', 'avance', 'avance', 'exemplaire'])
  })

  it('recommande la mission au plus fort gain', () => {
    const missions = missionsDe(ONBOARDEE)
    expect(missions.filter((m) => !m.faite).map((m) => m.cle)).toEqual(['photo', 'presentation', 'soins', 'liens'])
    expect(prochaineMission(missions)?.cle).toBe('photo')
  })

  it('ouvre six filtres sur huit après l’onboarding', () => {
    expect(filtresDe(ONBOARDEE, MAINTENANT).filter((f) => f.actif)).toHaveLength(6)
  })

  it('signale la fraîcheur et les distinctions', () => {
    expect(fraicheurDe(ONBOARDEE, MAINTENANT).map((f) => f.cle)).toEqual(['horaires', 'conventionnement', 'accueil'])
    const force = calculerForce(ONBOARDEE, verifie, MAINTENANT)
    expect(distinctionsDe(ONBOARDEE, verifie, force).filter((d) => d.obtenue).map((d) => d.code)).toEqual([
      'fiche_verifiee',
      'identifie_psc',
      'horaires_complets',
      'cabinet_accessible',
      'bilingue',
    ])
  })
})
