import { describe, expect, it } from 'vitest'
import { VALIDITE_LIEN_GOOGLE_JOURS, etatLienGoogle, vientDeGoogle } from '../src/lib/espace-pro/lien-google'

const maintenant = new Date('2026-10-19T10:00:00Z')
const ilYa = (j: number) => new Date(maintenant.getTime() - j * 86_400_000).toISOString()

describe('lien de la fiche Google', () => {
  it('attend le premier clic, puis reste actif tant que les clics arrivent', () => {
    expect(etatLienGoogle(null, maintenant).etat).toBe('attente')
    expect(etatLienGoogle({ lienGoogleDernierLe: null, lienGoogleClics: 0 }, maintenant).etat).toBe('attente')
    expect(etatLienGoogle({ lienGoogleDernierLe: ilYa(VALIDITE_LIEN_GOOGLE_JOURS - 1), lienGoogleClics: 4 }, maintenant)).toMatchObject({ etat: 'actif', clics: 4 })
  })
  it('expire sans clic venu de Google pendant la durée de validité', () => {
    expect(etatLienGoogle({ lienGoogleDernierLe: ilYa(VALIDITE_LIEN_GOOGLE_JOURS + 1), lienGoogleClics: 4 }, maintenant).etat).toBe('expire')
  })
  it('reconnaît les provenances Google, et elles seules', () => {
    for (const p of ['https://www.google.com/', 'https://www.google.fr/', 'https://maps.google.com/', 'android-app://com.google.android.apps.maps', 'android-app://com.google.android.googlequicksearchbox/'])
      expect(vientDeGoogle(p)).toBe(true)
    for (const p of [null, '', 'https://www.bing.com/', 'https://google.evil.com/', 'https://www.doctolib.fr/', 'https://notgoogle.com/'])
      expect(vientDeGoogle(p)).toBe(false)
  })
})
