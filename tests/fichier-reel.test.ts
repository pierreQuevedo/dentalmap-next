import { describe, expect, it } from 'vitest'
import { contenuConforme, typeReel } from '../src/lib/fichier-reel'

const fichier = (octets: number[] | string) => new Blob([typeof octets === 'string' ? octets : new Uint8Array(octets)])

describe('Type réel d’un fichier reçu', () => {
  it('reconnaît un PDF, un JPEG et un PNG par leurs premiers octets', async () => {
    expect(await typeReel(fichier('%PDF-1.7\n…'))).toBe('pdf')
    expect(await typeReel(fichier([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]))).toBe('jpeg')
    expect(await typeReel(fichier([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('png')
  })
  it('refuse un faux PDF, quel que soit le type déclaré', async () => {
    expect(await contenuConforme(fichier('<html><script>alert(1)</script>'), ['pdf'])).toBe(false)
    expect(await contenuConforme(fichier([0xff, 0xd8, 0xff]), ['pdf'])).toBe(false)
    expect(await contenuConforme(fichier(''), ['pdf'])).toBe(false)
  })
})
