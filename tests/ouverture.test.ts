import { describe, expect, it } from 'vitest'
import { heureCourte, heureEnMots, momentParis, ouverture } from '@/lib/annuaire/ouverture'
import type { Horaires } from '@/db/schema'

const H: Horaires = {
  lundi: [
    { debut: '08:30', fin: '12:30' },
    { debut: '14:00', fin: '19:00' },
  ],
  jeudi: [{ debut: '09:00', fin: '12:00' }],
}

// Le 12 octobre 2026 est un lundi ; Paris est alors en UTC+2.
const a = (iso: string) => new Date(iso)

describe('ouverture', () => {
  it('lit le jour et l’heure à Paris', () => {
    expect(momentParis(a('2026-10-12T08:15:00Z'))).toEqual({ jour: 'lundi', heure: '10:15' })
  })
  it('ouvert, avec l’heure de fermeture de la plage en cours', () => {
    expect(ouverture(H, a('2026-10-12T08:15:00Z'))).toEqual({ ouvert: true, texte: 'Ouvert', detail: 'ferme à 12 h 30' })
  })
  it('fermé entre deux plages', () => {
    expect(ouverture(H, a('2026-10-12T11:00:00Z'))?.detail).toBe('ouvre à 14 h')
  })
  it('fermé le soir : prochaine ouverture un autre jour', () => {
    expect(ouverture(H, a('2026-10-12T19:00:00Z'))?.detail).toBe('ouvre jeudi à 9 h')
    expect(ouverture(H, a('2026-10-14T19:00:00Z'))?.detail).toBe('ouvre demain à 9 h')
  })
  it('rien sans horaires', () => {
    expect(ouverture(null, a('2026-10-12T08:15:00Z'))).toBeNull()
    expect(ouverture({}, a('2026-10-12T08:15:00Z'))).toBeNull()
  })
  it('écritures des heures', () => {
    expect(heureCourte('08:30')).toBe('8h30')
    expect(heureEnMots('19:00')).toBe('19 h')
  })
})
