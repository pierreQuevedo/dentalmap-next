import { describe, expect, it } from 'vitest'
import {
  adresseReconnue,
  calculerForceEtablissement,
  controlerUai,
  domaineAttendu,
  domainesDe,
  formationsDepuisDiplomes,
  lireDonnees,
  missionsEtablissement,
  portesOuvertesAJour,
  sectionsPage,
} from '@/lib/espace-pro/etablissement'
import { lireUai } from '@/lib/formation/faculte'

describe('numéro UAI', () => {
  it('accepte sept chiffres et la bonne clé', () => {
    expect(controlerUai('0340042l')).toEqual({ ok: true, uai: '0340042L' })
    expect(controlerUai(' 0650035 K ')).toEqual({ ok: true, uai: '0650035K' })
  })
  it('refuse un mauvais format ou une mauvaise clé', () => {
    expect(controlerUai('034004L').ok).toBe(false)
    expect(controlerUai('0340042K').ok).toBe(false)
  })
  it('se lit dans une adresse académique', () => {
    expect(lireUai('<p>Contact : ce.0340042l@ac-montpellier.fr</p>')).toBe('0340042L')
    expect(lireUai('<p>contact@ecole.fr</p>')).toBeNull()
  })
})

describe('domaine de l’établissement', () => {
  const fac = domainesDe({ emails: ['scolarite.odontologie@u-bordeaux.fr'], siteWeb: 'https://sante.u-bordeaux.fr/college-sante/' })
  it('reconnaît une adresse du domaine ou d’un sous-domaine', () => {
    expect(adresseReconnue('marie.dupont@u-bordeaux.fr', fac)).toBe(true)
    // Un sous-domaine (étudiants) ne suffit plus : attestation relue par l'équipe.
    expect(adresseReconnue('m.dupont@etu.u-bordeaux.fr', fac)).toBe(false)
    expect(adresseReconnue('marie.dupont@gmail.com', fac)).toBe(false)
    expect(adresseReconnue('x@bordeaux.fr', fac)).toBe(false)
    expect(domaineAttendu(fac)).toBe('u-bordeaux.fr')
  })
  it('ne prend un domaine académique que pour l’adresse exacte', () => {
    const lycee = domainesDe({ emails: ['ce.0340042l@ac-montpellier.fr'], siteWeb: 'https://jean-mermoz-montpellier.mon-ent-occitanie.fr/' })
    expect(lycee.domaines).toEqual([])
    expect(adresseReconnue('ce.0340042l@ac-montpellier.fr', lycee)).toBe(true)
    expect(adresseReconnue('prof@ac-montpellier.fr', lycee)).toBe(false)
  })
})

describe('formations et force', () => {
  const formations = formationsDepuisDiplomes([
    { intitule: 'BTS Prothésiste dentaire', niveau: 'Bac+2', duree: '2 ans (24 mois en apprentissage)', modalite: 'Initiale ou apprentissage' },
    { intitule: 'Bac pro Technicien en prothèse dentaire', niveau: null, duree: '3 ans', modalite: null },
  ])
  it('préremplit niveau et voies', () => {
    expect(formations[0]).toMatchObject({ id: 'bts-prothesiste-dentaire', niveau: 'Bac + 2', duree: '2 ans', voies: ['initiale', 'apprentissage'], acces: 'Après le bac', active: true })
    expect(formations[1]).toMatchObject({ niveau: 'Bac', voies: [] })
  })
  it('compte les points de l’annexe', () => {
    const maintenant = new Date('2026-10-11T10:00:00Z')
    const vide = lireDonnees({})
    expect(calculerForceEtablissement(vide, 'ecole_prothese', true, maintenant).total).toBe(30)
    const d = lireDonnees({ formations: formations.map((f) => ({ ...f, acces: 'Après le bac', voies: ['initiale'] })), portesOuvertes: '2027-02-06', galerie: [{ url: '/uploads/cabinets/a.jpg', legende: '' }] })
    expect(calculerForceEtablissement(d, 'ecole_prothese', true, maintenant).total).toBe(100)
    expect(calculerForceEtablissement(d, 'ecole_prothese', false, maintenant).total).toBe(70)
  })
  it('fait expirer une date de portes ouvertes passée', () => {
    const d = lireDonnees({ portesOuvertes: '2026-02-06' })
    expect(portesOuvertesAJour(d, new Date('2026-10-11'))).toBe(false)
    expect(portesOuvertesAJour(lireDonnees({ aucunePorteOuverte: true }))).toBe(true)
  })
  it('remplace l’alternance par les centres de soins pour une faculté', () => {
    const f = calculerForceEtablissement(lireDonnees({}), 'faculte', true)
    expect(f.items.map((i) => i.cle)).toContain('centres')
    expect(f.items.map((i) => i.cle)).not.toContain('alternance')
    expect(missionsEtablissement(f, 'faculte')[0]!.faite).toBe(false)
  })
  it('lit un document abîmé comme vide', () => {
    expect(lireDonnees({ formations: 'nope' }).formations).toEqual([])
    expect(lireDonnees({ galerie: [{ url: 'https://ailleurs.fr/a.jpg' }] }).galerie).toEqual([])
  })
  it('liste les sections, vides masquées', () => {
    const s = sectionsPage(lireDonnees({}), 'ecole_prothese', { registres: true, resultats: false })
    expect(s.find((x) => x.cle === 'formations')!.statut).toBe('vide')
    expect(s.find((x) => x.cle === 'registres')!.statut).toBe('auto')
  })
})

describe('préremplissage d’une faculté', () => {
  it('découpe les voies et reprend les centres', async () => {
    const { donneesFaculte, decouper } = await import('@/lib/espace-pro/etablissement')
    expect(decouper('PASS ; L.AS ; passerelles.')).toEqual(['PASS', 'L.AS', 'passerelles'])
    const d = donneesFaculte(
      { diplome: null, duree: null, voiesAcces: 'PASS ; L.AS', autresDiplomes: null, centresDeSoins: ['Centre de soins du CHU, 1 rue X, 33000 Bordeaux, 05 56 79 56 79'] },
      (s) => s.split(',')[0]!,
      (s) => s,
    )
    expect(d.voiesAcces?.map((v) => v.titre)).toEqual(['PASS', 'L.AS'])
    expect(d.centres?.[0]).toMatchObject({ nom: 'Centre de soins du CHU', telephone: '05 56 79 56 79' })
    expect(d.cycles).toHaveLength(3)
  })
})
