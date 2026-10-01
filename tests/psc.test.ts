import { describe, expect, it } from 'vitest'
import { estChirurgienDentiste, lireIdentitePsc, rppsDepuisIdentifiantNational } from '../src/lib/psc/identite'
import { desceller, nouvelEtat, sceller } from '../src/lib/psc/etat'

/** Jeton UserInfo tel que documenté par l'ANS, réduit à ce qui nous sert. */
const userinfoDentiste = {
  sub: 'f:550dc1c8-d97b-4b1e-ac8c-8eb4471cf9dd:899700218896',
  preferred_username: '899700218896',
  given_name: 'ROBERT',
  family_name: 'SPECIALISTE0021889',
  SubjectNameID: '899700218896',
  SubjectRole: ['40^1.2.250.1.71.1.2.7'],
  SubjectRefPro: {
    codeCivilite: 'M',
    exercices: [{ codeProfession: '40', nomDexercice: 'SPECIALISTE0021889', prenomDexercice: 'ROBERT', activities: [] }],
  },
}

describe('rppsDepuisIdentifiantNational', () => {
  it('retire le préfixe 8 d’un identifiant RPPS national', () => {
    expect(rppsDepuisIdentifiantNational('899700218896')).toBe('99700218896')
  })
  it('accepte un RPPS nu de onze chiffres', () => {
    expect(rppsDepuisIdentifiantNational('99700218896')).toBe('99700218896')
  })
  it('refuse un identifiant ADELI ou une chaîne quelconque', () => {
    expect(rppsDepuisIdentifiantNational('012345678')).toBeNull()
    expect(rppsDepuisIdentifiantNational('abc')).toBeNull()
  })
})

describe('lireIdentitePsc', () => {
  it('lit l’identifiant, le RPPS et la profession', () => {
    const id = lireIdentitePsc(userinfoDentiste)
    expect(id).not.toBeNull()
    expect(id!.identifiantNational).toBe('899700218896')
    expect(id!.rpps).toBe('99700218896')
    expect(id!.professions).toEqual(['40'])
    expect(id!.nom).toBe('SPECIALISTE0021889')
    expect(estChirurgienDentiste(id!)).toBe(true)
  })

  it('reconnaît la profession par SubjectRole quand les exercices manquent', () => {
    const id = lireIdentitePsc({ SubjectNameID: '810000000001', SubjectRole: ['40^1.2.250.1.71.1.2.7'] })
    expect(estChirurgienDentiste(id!)).toBe(true)
  })

  it('accepte un médecin, chirurgien maxillo-facial, stomatologue ou ORL', () => {
    const id = lireIdentitePsc({
      ...userinfoDentiste,
      SubjectRole: ['10^1.2.250.1.71.1.2.7'],
      SubjectRefPro: { exercices: [{ codeProfession: '10' }] },
    })
    expect(estChirurgienDentiste(id!)).toBe(true)
  })

  it('refuse un pharmacien', () => {
    const id = lireIdentitePsc({
      ...userinfoDentiste,
      SubjectRole: ['21^1.2.250.1.71.1.2.7'],
      SubjectRefPro: { exercices: [{ codeProfession: '21' }] },
    })
    expect(estChirurgienDentiste(id!)).toBe(false)
  })

  it('rend null sans identifiant national', () => {
    expect(lireIdentitePsc({ given_name: 'X' })).toBeNull()
    expect(lireIdentitePsc(null)).toBeNull()
  })
})

describe('état signé', () => {
  process.env.BETTER_AUTH_SECRET ??= 'secret-de-test'

  it('se descelle intact', () => {
    const etat = nouvelEtat('dr-jean-martin-1234', '11111111-1111-1111-1111-111111111111')
    expect(desceller(sceller(etat))).toEqual(etat)
  })

  it('refuse une signature altérée', () => {
    const scelle = sceller(nouvelEtat('x', 'y'))
    const [corps, sig] = scelle.split('.')
    const autre = sig.startsWith('A') ? 'B' + sig.slice(1) : 'A' + sig.slice(1)
    expect(desceller(`${corps}.${autre}`)).toBeNull()
  })

  it('refuse un état expiré', () => {
    const etat = { ...nouvelEtat('x', 'y'), exp: Math.floor(Date.now() / 1000) - 1 }
    expect(desceller(sceller(etat))).toBeNull()
  })

  it('refuse le vide', () => {
    expect(desceller(undefined)).toBeNull()
    expect(desceller('')).toBeNull()
  })
})
