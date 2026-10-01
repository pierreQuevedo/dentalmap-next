import { describe, expect, it } from 'vitest'
import {
  aDuContenu,
  schemaAccessibilite,
  schemaHoraires,
  schemaLangues,
  schemaPaiement,
} from '../src/lib/espace-pro/fiche-completee'

describe('schemaHoraires', () => {
  it('accepte une semaine ordinaire', () => {
    const r = schemaHoraires.safeParse({
      lundi: [{ debut: '09:00', fin: '12:30' }, { debut: '14:00', fin: '19:00' }],
      samedi: [{ debut: '09:00', fin: '12:00' }],
    })
    expect(r.success).toBe(true)
  })
  it('refuse une fin avant le début', () => {
    expect(schemaHoraires.safeParse({ lundi: [{ debut: '14:00', fin: '09:00' }] }).success).toBe(false)
  })
  it('refuse deux plages qui se chevauchent', () => {
    expect(
      schemaHoraires.safeParse({ lundi: [{ debut: '09:00', fin: '14:30' }, { debut: '14:00', fin: '19:00' }] }).success,
    ).toBe(false)
  })
  it('refuse une troisième plage et une heure mal formée', () => {
    expect(
      schemaHoraires.safeParse({
        lundi: [{ debut: '08:00', fin: '09:00' }, { debut: '10:00', fin: '11:00' }, { debut: '12:00', fin: '13:00' }],
      }).success,
    ).toBe(false)
    expect(schemaHoraires.safeParse({ lundi: [{ debut: '9h', fin: '12:00' }] }).success).toBe(false)
  })
  it('refuse un jour inconnu', () => {
    expect(schemaHoraires.safeParse({ funday: [] }).success).toBe(false)
  })
})

describe('listes de codes', () => {
  it('n’accepte que les codes connus', () => {
    expect(schemaLangues.safeParse({ langues: ['fr', 'en'] }).success).toBe(true)
    expect(schemaLangues.safeParse({ langues: ['klingon'] }).success).toBe(false)
    expect(schemaAccessibilite.safeParse({ accessibilite: ['pmr'], commentaire: 'Interphone' }).success).toBe(true)
    expect(schemaAccessibilite.safeParse({ accessibilite: ['piscine'] }).success).toBe(false)
    expect(schemaPaiement.safeParse({ paiements: ['carte'], tiersPayant: 'aucun' }).success).toBe(true)
    expect(schemaPaiement.safeParse({ paiements: ['carte'], tiersPayant: null }).success).toBe(true)
    expect(schemaPaiement.safeParse({ paiements: ['bitcoin'], tiersPayant: null }).success).toBe(false)
  })
  it('borne le commentaire d’accessibilité', () => {
    expect(schemaAccessibilite.safeParse({ accessibilite: [], commentaire: 'x'.repeat(301) }).success).toBe(false)
  })
})

describe('aDuContenu', () => {
  const vide = {
    horaires: null,
    langues: [],
    accessibilite: [],
    accessibiliteCommentaire: null,
    paiements: [],
    tiersPayant: null,
    etape: 0,
    termineLe: null,
    majLe: '2026-09-18',
  }
  it('est faux pour une fiche vide ou absente', () => {
    expect(aDuContenu(null)).toBe(false)
    expect(aDuContenu(vide)).toBe(false)
    expect(aDuContenu({ ...vide, horaires: { lundi: [] } })).toBe(false)
  })
  it('est vrai dès qu’un champ est renseigné', () => {
    expect(aDuContenu({ ...vide, langues: ['fr'] })).toBe(true)
    expect(aDuContenu({ ...vide, horaires: { lundi: [{ debut: '09:00', fin: '12:00' }] } })).toBe(true)
  })
})
