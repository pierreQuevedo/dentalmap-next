import { describe, expect, it } from 'vitest'
import { EN_LIGNE, Proposition } from '@/lib/formation/privee'
import {
  assembler,
  autresFormationsPrivees,
  filtrerEtTrier,
  lireFiltres,
  mentions,
  monogramme,
  pave,
  phraseMentions,
  requeteFiltres,
  trancheDuree,
  type DetailFormation,
} from '@/lib/formation/privee-liste'

const maintenant = new Date('2026-10-13T10:00:00Z')

function detail(p: Partial<Record<string, unknown>>): DetailFormation {
  const d = Proposition.parse({
    organisme: 'Organisme',
    siren: '',
    intitule: 'Une formation d’exemple',
    theme: 'Implantologie',
    publics: ['Chirurgiens-dentistes'],
    format: 'Présentiel',
    duree: '2 jours',
    sessions: [{ dates: '14 novembre 2026', debut: '2026-11-14', region: '75', ville: 'Bordeaux', places: null }],
    resume: '',
    tarif: '',
    lienInscription: 'https://exemple.fr/inscription',
    siteOrganisme: '',
    ...p,
  })
  return { d, verifications: {}, publieeLe: '2026-10-01T10:00:00Z' }
}

const article = (slug: string, titre: string) => ({ slug, titre, image: null })

const vues = assembler(
  [article('a', 'Bordeaux tardive'), article('b', 'En ligne'), article('c', 'Lyon'), article('d', 'Passée'), article('e', 'Sans détail')],
  new Map([
    ['a', detail({ sessions: [{ dates: 'déc.', debut: '2026-12-01', region: '75', ville: 'Bordeaux', places: null }], priseEnCharge: ['DPC'] })],
    ['b', detail({ theme: 'Parodontologie', format: 'Distanciel', duree: '6 heures', sessions: [{ dates: 'nov.', debut: '2026-11-20', region: EN_LIGNE, ville: '', places: null }] })],
    ['c', detail({ format: 'Mixte', duree: '4 jours', sessions: [{ dates: 'nov.', debut: '2026-11-02', region: '84', ville: 'Lyon', places: 4 }] })],
    ['d', detail({ sessions: [{ dates: 'sept.', debut: '2026-09-01', region: '75', ville: 'Bordeaux', places: null }] })],
  ]),
  maintenant,
)
const aucun = lireFiltres({})

describe('assembler', () => {
  it('ne garde que les articles qui ont un détail publié', () => {
    expect(vues.map((v) => v.slug)).toEqual(['a', 'b', 'c', 'd'])
    expect(vues.find((v) => v.slug === 'd')!.session).toBeNull()
  })
})

describe('filtrerEtTrier', () => {
  it('sans lieu : prochaine session, puis ordre alphabétique ; les formations sans session à venir sortent', () => {
    expect(filtrerEtTrier(vues, aucun).map((v) => v.slug)).toEqual(['c', 'b', 'a'])
  })
  it('avec un lieu : même ville, même région, en ligne, puis ordre alphabétique', () => {
    const r = filtrerEtTrier(vues, aucun, { ville: 'Bordeaux', region: '75' })
    expect(r.map((v) => v.slug)).toEqual(['a', 'b'])
  })
  it('filtre par thème, format, région, durée et prise en charge', () => {
    expect(filtrerEtTrier(vues, lireFiltres({ theme: 'Parodontologie' })).map((v) => v.slug)).toEqual(['b'])
    expect(filtrerEtTrier(vues, lireFiltres({ format: 'mixte' })).map((v) => v.slug)).toEqual(['c'])
    expect(filtrerEtTrier(vues, lireFiltres({ zone: '84' })).map((v) => v.slug)).toEqual(['c', 'b'])
    expect(filtrerEtTrier(vues, lireFiltres({ duree: 'long' })).map((v) => v.slug)).toEqual(['c'])
    expect(filtrerEtTrier(vues, lireFiltres({ prise: 'DPC' })).map((v) => v.slug)).toEqual(['a'])
  })
  it('les autres formations d’une fiche excluent la formation elle-même', () => {
    expect(autresFormationsPrivees(vues, { slug: 'c' }).map((v) => v.slug)).toEqual(['b', 'a'])
  })
})

describe('lireFiltres et requeteFiltres', () => {
  it('ignore les valeurs inconnues et garde un ordre stable', () => {
    const f = lireFiltres({ theme: ['Implantologie', 'Inconnu'], format: 'nulle-part', zone: '99', prise: 'Qualiopi' })
    expect(f).toMatchObject({ themes: ['Implantologie'], format: null, zone: null, prises: ['Qualiopi'] })
    expect(requeteFiltres(f, { lieu: 'Lyon' })).toBe('?lieu=Lyon&theme=Implantologie&prise=Qualiopi')
  })
})

describe('affichage', () => {
  it('lit les durées écrites par l’organisme', () => {
    expect(trancheDuree('6 heures')).toBe('journee')
    expect(trancheDuree('une journée')).toBe('journee')
    expect(trancheDuree('3 jours')).toBe('jours')
    expect(trancheDuree('2 semaines')).toBe('long')
    expect(trancheDuree('à la carte')).toBeNull()
  })
  it('monogramme, pavé de date, mentions', () => {
    expect(monogramme('Atelier Implanto Formation')).toBe('AI')
    expect(monogramme('Cabinet et Gestion')).toBe('CG')
    expect(pave({ dates: '', debut: '2026-11-04', region: '75', ville: null, places: null })).toEqual({ jour: '4', mois: 'nov.' })
    const m = mentions({ priseEnCharge: ['Qualiopi', 'DPC'] }, { Qualiopi: 'liste publique des organismes certifiés' })
    expect(m.map((x) => x.nom)).toEqual(['DPC', 'Qualiopi'])
    expect(phraseMentions(m)).toBe('Qualiopi vérifié sur la liste publique des organismes certifiés ; DPC déclaré par l’organisme.')
  })
})

describe('relecture', () => {
  it('une proposition stockée (champs vides devenus null) se relit avec le même schéma', () => {
    const stockee = JSON.parse(JSON.stringify(detail({ siren: '', sessions: [{ dates: 'déc.', debut: '2026-12-01', region: EN_LIGNE, ville: '', places: null }] }).d))
    expect(stockee.sessions[0].ville).toBeNull()
    expect(Proposition.safeParse(stockee).success).toBe(true)
  })
})
