import { describe, expect, it } from 'vitest'
import { adresseTestable, blocsARappeler, ficheDuJetonRappels, jetonRappels, lienRepond } from '../src/lib/espace-pro/rappels'
import { ECHECS_MASQUE, lienPublic } from '../src/lib/espace-pro/fiche-completee'
import type { Fraicheur } from '../src/lib/espace-pro/force'

const bloc = (etat: Fraicheur['etat']): Fraicheur => ({ cle: 'horaires', libelle: 'Horaires', confirmeLe: null, jours: 80, validite: 90, part: 0.9, etat, regle: '' })

describe('rappels de fraîcheur', () => {
  it('ne rappelle que les blocs qui ne sont plus à jour', () => {
    expect(blocsARappeler([bloc('a_jour'), bloc('rappel'), bloc('a_reconfirmer'), bloc('expire')]).map((b) => b.etat)).toEqual(['rappel', 'a_reconfirmer', 'expire'])
  })
  it('signe le lien de coupure et refuse un jeton modifié', () => {
    const j = jetonRappels('abc-123')
    expect(ficheDuJetonRappels(j)).toBe('abc-123')
    expect(ficheDuJetonRappels(encodeURIComponent(j))).toBe('abc-123')
    expect(ficheDuJetonRappels(j.replace('abc', 'abd'))).toBeNull()
    expect(ficheDuJetonRappels('nimporte')).toBeNull()
  })
})

describe('test des liens du cabinet', () => {
  it('compte comme vivant un lien qui répond, même s’il refuse les robots', () => {
    for (const s of [200, 204, 301, 401, 403, 429]) expect(lienRepond(s)).toBe(true)
    for (const s of [null, 404, 410, 500, 503]) expect(lienRepond(s)).toBe(false)
  })
  it('n’appelle que des noms de domaine publics', () => {
    expect(adresseTestable('https://cabinet-dupont.fr/rdv')).toBe(true)
    expect(adresseTestable('http://www.doctolib.fr/dentiste/bordeaux/x')).toBe(true)
    for (const u of ['https://127.0.0.1/', 'http://10.0.0.5', 'https://[::1]/', 'http://localhost:3000', 'https://nas.local', 'ftp://cabinet.fr', 'https://cabinet.fr:8443/', 'https://a:b@cabinet.fr', 'pas une adresse'])
      expect(adresseTestable(u)).toBe(false)
  })
  it('masque un lien à partir de deux échecs consécutifs', () => {
    const f = { siteWeb: 'https://a.fr', rdvEnLigne: 'https://b.fr', liensEchecs: { site: ECHECS_MASQUE - 1, rdv: ECHECS_MASQUE } }
    expect(lienPublic(f, 'site')).toBe('https://a.fr')
    expect(lienPublic(f, 'rdv')).toBeNull()
  })
})
