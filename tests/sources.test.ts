import { describe, expect, it } from 'vitest'
import { estRobot, lienDeSource, sourceDuCode } from '../src/lib/espace-pro/sources'

describe('sources des liens de partage', () => {
  it('lit le code de l’adresse', () => {
    expect(sourceDuCode('g')).toBe('google')
    expect(sourceDuCode('st')).toBe('story')
    expect(sourceDuCode('inconnu')).toBe('direct')
    expect(sourceDuCode('')).toBe('direct')
  })
  it('construit le lien marqué', () => {
    expect(lienDeSource('https://dentalmap.fr/', 'dr-x', 'qr')).toBe('https://dentalmap.fr/p/dr-x/q/')
    expect(lienDeSource('https://dentalmap.fr', 'dr-x', 'direct')).toBe('https://dentalmap.fr/p/dr-x/')
  })
  it('écarte robots et aperçus de liens', () => {
    expect(estRobot('facebookexternalhit/1.1')).toBe(true)
    expect(estRobot('WhatsApp/2.23')).toBe(true)
    expect(estRobot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true)
    expect(estRobot(null)).toBe(true)
    expect(estRobot('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 350.0')).toBe(false)
  })
})
