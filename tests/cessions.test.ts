import { describe, expect, it } from 'vitest'
import {
  RAYON_PERIURBAIN_M,
  RAYON_RURAL_M,
  RAYON_VILLE_M,
  chiffreAffaires,
  classerDisponibilite,
  correspondAlerte,
  dateExpiration,
  dateRappel,
  filtrerAnnonces,
  formaterDisponibilite,
  lignes,
  lireFiltres,
  chaineFiltres,
  peutEnvoyerAlerte,
  prixCourt,
  prixLong,
  rayonSecteur,
  referenceAnnonce,
  validerMessage,
} from '../src/lib/cessions/format'

// `toLocaleString('fr-FR')` sépare les milliers par une espace fine insécable :
// on la ramène à une espace ordinaire pour lire les attentes.
const n = (s: string) => s.replace(/[  ]/g, ' ')

describe('rayonSecteur', () => {
  it('2 km en ville, à partir de 50 000 habitants', () => {
    expect(rayonSecteur(50_000)).toBe(RAYON_VILLE_M)
    expect(rayonSecteur(2_100_000)).toBe(2_000)
  })
  it('5 km en périurbain, de 5 000 à 49 999 habitants', () => {
    expect(rayonSecteur(49_999)).toBe(RAYON_PERIURBAIN_M)
    expect(rayonSecteur(5_000)).toBe(5_000)
  })
  it('10 km en zone rurale, sous 5 000 habitants', () => {
    expect(rayonSecteur(4_999)).toBe(RAYON_RURAL_M)
    expect(rayonSecteur(0)).toBe(10_000)
  })
  it('population inconnue : le rayon le plus large, qui protège le mieux', () => {
    expect(rayonSecteur(null)).toBe(RAYON_RURAL_M)
    expect(rayonSecteur(undefined)).toBe(RAYON_RURAL_M)
    expect(rayonSecteur(Number.NaN)).toBe(RAYON_RURAL_M)
  })
})

describe('montants', () => {
  it('prix long en euros, ou sur demande', () => {
    expect(n(prixLong(210))).toBe('210 000 €')
    expect(n(prixLong(1250))).toBe('1 250 000 €')
    expect(prixLong(null)).toBe('Sur demande')
    expect(prixLong(0)).toBe('Sur demande')
  })
  it('prix court en k€', () => {
    expect(prixCourt(210)).toBe('210 k€')
    expect(n(prixCourt(1250))).toBe('1 250 k€')
    expect(prixCourt(undefined)).toBe('Sur demande')
  })
  it('chiffre d’affaires en fourchette', () => {
    expect(chiffreAffaires(380, 450)).toBe('380 à 450 k€')
    expect(chiffreAffaires(450, 380)).toBe('380 à 450 k€')
    expect(n(chiffreAffaires(900, 1100))).toBe('900 à 1 100 k€')
    expect(chiffreAffaires(450, 450)).toBe('450 k€')
    expect(chiffreAffaires(null, 300)).toBe('300 k€')
    expect(chiffreAffaires(null, null)).toBe('non communiqué')
  })
})

describe('dates de publication', () => {
  it('expire 90 jours après la publication', () => {
    const publiee = new Date('2026-10-02T08:00:00Z')
    expect(dateExpiration(publiee).toISOString()).toBe('2026-12-31T08:00:00.000Z')
  })
  it('le rappel part 7 jours avant l’échéance', () => {
    expect(dateRappel(new Date('2026-12-31T08:00:00Z')).toISOString()).toBe('2026-12-24T08:00:00.000Z')
  })
  it('la référence est stable', () => {
    expect(referenceAnnonce('demo_c1', '2026-10-02T08:00:00Z')).toBe('CES-2026-C1')
    expect(referenceAnnonce('3f9a1c2e-0000', '2027-01-01T00:00:00Z')).toBe('CES-2027-3F9A1C')
  })
})

describe('disponibilité', () => {
  const maintenant = new Date('2026-10-13T12:00:00Z')
  it('reconnaît immédiate et les mois', () => {
    expect(classerDisponibilite('immediate', maintenant)).toBe('immediate')
    expect(classerDisponibilite('Immédiate', maintenant)).toBe('immediate')
    expect(classerDisponibilite('2026-09', maintenant)).toBe('immediate')
    expect(classerDisponibilite('2027-01', maintenant)).toBe('six_mois')
    expect(classerDisponibilite('2027-04-15', maintenant)).toBe('six_mois')
    expect(classerDisponibilite('2027-06', maintenant)).toBe('plus_tard')
    expect(classerDisponibilite('D’ici six mois', maintenant)).toBe('six_mois')
    expect(classerDisponibilite('Mi-2027', maintenant)).toBeNull()
    expect(classerDisponibilite(null, maintenant)).toBeNull()
  })
  it('se lit en clair', () => {
    expect(formaterDisponibilite('immediate')).toBe('Immédiate')
    expect(formaterDisponibilite('2027-01')).toBe('Janvier 2027')
    expect(formaterDisponibilite('Mi-2027')).toBe('Mi-2027')
  })
})

describe('filtres', () => {
  it('lit l’URL en ignorant les valeurs inconnues', () => {
    expect(lireFiltres({ type: ['cabinet', 'inconnu', 'murs'], fauteuils: '3', dispo: 'six-mois', page: '2' })).toEqual({
      types: ['cabinet', 'murs'],
      fauteuils: 3,
      dispo: 'six-mois',
      page: 2,
    })
    expect(lireFiltres({ fauteuils: '7', dispo: 'demain', page: '-1' })).toEqual({ types: [], fauteuils: null, dispo: null, page: 1 })
  })
  it('recompose la chaîne de requête', () => {
    expect(chaineFiltres({ types: ['parts'], fauteuils: 2, dispo: null, page: 1 }, { vue: 'carte' })).toBe('?type=parts&fauteuils=2&vue=carte')
    expect(chaineFiltres({ types: [], fauteuils: null, dispo: null, page: 1 })).toBe('')
  })
  it('filtre par type, fauteuils et disponibilité', () => {
    const annonces = [
      { id: 'a', type: 'cabinet' as const, fauteuils: 2, classeDisponibilite: 'immediate' as const },
      { id: 'b', type: 'parts' as const, fauteuils: 4, classeDisponibilite: 'six_mois' as const },
      { id: 'c', type: 'cabinet' as const, fauteuils: null, classeDisponibilite: null },
    ]
    const ids = (f: Parameters<typeof filtrerAnnonces>[1]) => filtrerAnnonces(annonces, f).map((a) => a.id)
    expect(ids({ types: ['cabinet'], fauteuils: null, dispo: null, page: 1 })).toEqual(['a', 'c'])
    expect(ids({ types: [], fauteuils: 3, dispo: null, page: 1 })).toEqual(['b'])
    expect(ids({ types: [], fauteuils: 2, dispo: null, page: 1 })).toEqual(['a'])
    expect(ids({ types: [], fauteuils: null, dispo: 'immediate', page: 1 })).toEqual(['a'])
    expect(ids({ types: [], fauteuils: null, dispo: 'six-mois', page: 1 })).toEqual(['a', 'b'])
  })
})

describe('validerMessage', () => {
  it('nettoie les espaces et garde les paragraphes', () => {
    const r = validerMessage('  Bonjour,   je   suis intéressé.\r\n\r\n\r\n\r\nPouvons-nous   en parler ?  ')
    expect(r).toEqual({ ok: true, corps: 'Bonjour, je suis intéressé.\n\nPouvons-nous en parler ?' })
  })
  it('refuse un message vide, trop court ou trop long', () => {
    expect(validerMessage('').ok).toBe(false)
    expect(validerMessage('   \n ').ok).toBe(false)
    expect(validerMessage(undefined).ok).toBe(false)
    expect(validerMessage('Bonjour').ok).toBe(false)
    expect(validerMessage('x'.repeat(2001)).ok).toBe(false)
    expect(validerMessage('x'.repeat(2000)).ok).toBe(true)
  })
})

describe('alerte', () => {
  const maintenant = new Date('2026-10-13T12:00:00Z')
  it('un email par semaine au plus', () => {
    expect(peutEnvoyerAlerte(null, maintenant)).toBe(true)
    expect(peutEnvoyerAlerte('2026-10-07T12:00:00Z', maintenant)).toBe(false)
    expect(peutEnvoyerAlerte('2026-10-06T12:00:00Z', maintenant)).toBe(true)
  })
  it('aucun critère vaut tout', () => {
    const a = { departementCode: '33', type: 'cabinet' as const }
    expect(correspondAlerte({ departements: [], types: [] }, a)).toBe(true)
    expect(correspondAlerte({ departements: ['33'], types: ['cabinet'] }, a)).toBe(true)
    expect(correspondAlerte({ departements: ['24'], types: [] }, a)).toBe(false)
    expect(correspondAlerte({ departements: [], types: ['murs'] }, a)).toBe(false)
  })
})

describe('lignes', () => {
  it('une puce par ligne, sans tiret de saisie', () => {
    expect(lignes('- Bail transférable\n\n• Présentation à la patientèle\n  ')).toEqual(['Bail transférable', 'Présentation à la patientèle'])
    expect(lignes(null)).toEqual([])
  })
})
