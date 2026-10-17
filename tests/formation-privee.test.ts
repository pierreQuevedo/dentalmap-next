import { describe, expect, it } from 'vitest'
import { EN_LIGNE, Proposition, correspond, libellePriseEnCharge, peutEnvoyer, regionsDe, sessionsAVenir } from '@/lib/formation/privee'

const base = {
  organisme: 'Atelier Implanto Formation',
  siren: '',
  intitule: 'Implantologie : de la planification à la pose guidée',
  theme: 'Implantologie',
  publics: ['Chirurgiens-dentistes'],
  format: 'Mixte',
  duree: '4 jours',
  sessions: [
    { dates: '14 et 15 novembre 2026', debut: '2026-11-14', region: '75', ville: 'Bordeaux', places: 4 },
    { dates: '23 et 24 janvier 2027', debut: '2027-01-23', region: EN_LIGNE, ville: '', places: null },
  ],
  resume: '',
  programme: [{ titre: 'Planification', detail: '', duree: 'Jour 1' }],
  prerequis: [],
  tarif: '2 400 €',
  priseEnCharge: ['DPC', 'Qualiopi'],
  lienInscription: 'https://atelier-implanto.example/inscription',
  siteOrganisme: '',
}

describe('proposition de formation privée', () => {
  it('valide une proposition complète et vide les champs facultatifs', () => {
    const r = Proposition.safeParse(base)
    expect(r.success).toBe(true)
    expect(r.data?.siren).toBeNull()
    expect(r.data?.siteOrganisme).toBeNull()
    expect(r.data?.sessions[1]!.ville).toBeNull()
  })
  it('refuse un lien non sécurisé, un SIREN mal formé, un thème hors liste', () => {
    expect(Proposition.safeParse({ ...base, lienInscription: 'http://x.fr' }).success).toBe(false)
    expect(Proposition.safeParse({ ...base, siren: '1234' }).success).toBe(false)
    expect(Proposition.safeParse({ ...base, theme: 'Prothèse' }).success).toBe(false)
    expect(Proposition.safeParse({ ...base, sessions: [] }).success).toBe(false)
  })
})

describe('alertes', () => {
  const f = Proposition.parse(base)
  it('fait valoir une session en ligne partout', () => {
    expect(regionsDe(f)).toEqual({ partout: true, codes: ['75'] })
    expect(correspond({ themes: ['Implantologie'], regions: ['11'], publics: [] }, f)).toBe(true)
  })
  it('filtre par thème et par public', () => {
    expect(correspond({ themes: ['Endodontie'], regions: [], publics: [] }, f)).toBe(false)
    expect(correspond({ themes: [], regions: [], publics: ['Prothésistes'] }, f)).toBe(false)
    expect(correspond({ themes: [], regions: [], publics: [] }, f)).toBe(true)
  })
  it('filtre par région quand aucune session n’est en ligne', () => {
    const g = { ...f, sessions: [f.sessions[0]!] }
    expect(correspond({ themes: [], regions: ['11'], publics: [] }, g)).toBe(false)
    expect(correspond({ themes: [], regions: ['75'], publics: [] }, g)).toBe(true)
  })
  it('respecte une semaine entre deux envois', () => {
    const m = new Date('2026-10-13T10:00:00Z')
    expect(peutEnvoyer(null, m)).toBe(true)
    expect(peutEnvoyer('2026-10-08T10:00:00Z', m)).toBe(false)
    expect(peutEnvoyer('2026-10-06T10:00:00Z', m)).toBe(true)
  })
  it('dit déclarée ou vérifiée', () => {
    expect(libellePriseEnCharge('DPC', {})).toBe('Déclaré par l’organisme')
    expect(libellePriseEnCharge('Qualiopi', { Qualiopi: 'liste publique des organismes certifiés' })).toBe('Vérifié sur la liste publique des organismes certifiés')
  })
  it('garde les sessions à venir, dans l’ordre', () => {
    expect(sessionsAVenir(f.sessions, new Date('2026-12-01')).map((s) => s.debut)).toEqual(['2027-01-23'])
  })
})

describe('lien de désinscription', () => {
  it('se vérifie et refuse une signature altérée', async () => {
    const { jetonDesinscription, alerteDesinscription } = await import('@/lib/formation/jeton')
    const j = jetonDesinscription('7b1c2d3e-0000-4000-8000-000000000001')
    expect(alerteDesinscription(j)).toBe('7b1c2d3e-0000-4000-8000-000000000001')
    expect(alerteDesinscription(encodeURIComponent(j))).toBe('7b1c2d3e-0000-4000-8000-000000000001')
    expect(alerteDesinscription(j.slice(0, -2) + 'xx')).toBeNull()
    expect(alerteDesinscription('n-importe-quoi')).toBeNull()
  })
})
