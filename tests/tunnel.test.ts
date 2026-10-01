import { describe, expect, it } from 'vitest'
import { etapeAutorisee, etapeDe, prochaineEtape, retourSur, type EtatCompte } from '../src/lib/tunnel/etapes'

const vide: EtatCompte = { role: null, revendications: [], demandeCreationEnAttente: false }
const patient: EtatCompte = { ...vide, role: 'patient' }
const dentiste: EtatCompte = { ...vide, role: 'dentiste' }

describe('etapeDe', () => {
  it('commence par le profil tant que le rôle manque', () => {
    expect(etapeDe(vide)).toBe('profil')
  })
  it('laisse un patient tranquille', () => {
    expect(etapeDe(patient)).toBe('tableau-de-bord')
  })
  it('envoie un professionnel sans fiche la chercher', () => {
    expect(etapeDe(dentiste)).toBe('fiche')
  })
  it('ouvre le parcours d’accueil dès la demande, même en attente', () => {
    expect(etapeDe({ ...dentiste, revendications: [{ statut: 'en_attente', onboardingTermine: false }] })).toBe('onboarding')
    expect(etapeDe({ ...dentiste, revendications: [{ statut: 'acceptee', onboardingTermine: false }] })).toBe('onboarding')
  })
  it('renvoie au tableau de bord une fois le parcours fini', () => {
    expect(etapeDe({ ...dentiste, revendications: [{ statut: 'acceptee', onboardingTermine: true }] })).toBe('tableau-de-bord')
  })
  it('ignore une revendication refusée', () => {
    expect(etapeDe({ ...dentiste, revendications: [{ statut: 'refusee', onboardingTermine: false }] })).toBe('fiche')
  })
  it('n’insiste pas quand une création de fiche est demandée', () => {
    expect(etapeDe({ ...dentiste, demandeCreationEnAttente: true })).toBe('tableau-de-bord')
  })
})

describe('prochaineEtape', () => {
  it('ramène le patient là où il était', () => {
    expect(prochaineEtape(patient, '/dentistes/paris/paris/dr-x/')).toBe('/dentistes/paris/paris/dr-x/')
    expect(prochaineEtape(patient)).toBe('/')
  })
  it('fait passer la fiche avant le retour pour un professionnel', () => {
    expect(prochaineEtape(dentiste, '/annonces/')).toBe('/espace-pro/fiche/choisir/')
  })
  it('refuse un retour vers un autre site', () => {
    expect(retourSur('https://evil.example')).toBe('/')
    expect(retourSur('//evil.example')).toBe('/')
    expect(retourSur('/faq/')).toBe('/faq/')
  })
})

describe('etapeAutorisee', () => {
  it('ferme le volet professionnel aux patients', () => {
    expect(etapeAutorisee(patient, 'fiche')).toBe(false)
    expect(etapeAutorisee(patient, 'tableau-de-bord')).toBe(true)
  })
  it('n’ouvre le parcours d’accueil qu’avec une revendication vivante', () => {
    expect(etapeAutorisee(dentiste, 'onboarding')).toBe(false)
    expect(etapeAutorisee({ ...dentiste, revendications: [{ statut: 'en_attente', onboardingTermine: false }] }, 'onboarding')).toBe(true)
  })
  it('laisse toujours corriger le profil', () => {
    expect(etapeAutorisee(vide, 'profil')).toBe(true)
    expect(etapeAutorisee(vide, 'fiche')).toBe(false)
  })
})
