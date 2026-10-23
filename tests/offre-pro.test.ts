import { describe, expect, it } from 'vitest'
import { enPourcentage, etapePrecedente, etapeSuivante, etatOffre, manquesOffre, modeDuContrat, slugOffre } from '../src/lib/emploi/offre-pro'

const JOUR = 86_400_000
const maintenant = new Date('2026-10-20T12:00:00Z')
const il = (j: number) => new Date(maintenant.getTime() - j * JOUR)
const dans = (j: number) => new Date(maintenant.getTime() + j * JOUR)

describe('offres côté recruteur', () => {
  it('rémunération selon le contrat', () => {
    expect(modeDuContrat('cdi')).toBe('salaire')
    expect(modeDuContrat('stage')).toBe('gratification')
    expect(modeDuContrat('remplacement')).toBe('retrocession')
    expect(enPourcentage('collaboration')).toBe(true)
    expect(enPourcentage('cdd')).toBe(false)
  })
  it('en ligne, à confirmer en fin de quinzaine', () => {
    const recente = etatOffre({ statut: 'en_ligne', publieeLe: il(6), confirmeeLe: il(6), expireLe: dans(24), clotureeLe: null }, maintenant)
    expect(recente).toMatchObject({ etat: 'en_ligne', depuisJours: 6, resteJours: 24, aConfirmer: false })
    const vieille = etatOffre({ statut: 'en_ligne', publieeLe: il(13), confirmeeLe: il(13), expireLe: dans(17), clotureeLe: null }, maintenant)
    expect(vieille).toMatchObject({ etat: 'en_ligne', aConfirmer: true })
  })
  it('pas confirmée depuis 15 jours : non confirmée, avant l’échéance', () => {
    const e = etatOffre({ statut: 'en_ligne', publieeLe: il(20), confirmeeLe: il(16), expireLe: dans(10), clotureeLe: null }, maintenant)
    expect(e.etat).toBe('non_confirmee')
  })
  it('échéance passée : expirée', () => {
    expect(etatOffre({ statut: 'en_ligne', publieeLe: il(31), confirmeeLe: il(1), expireLe: il(1), clotureeLe: null }, maintenant).etat).toBe('expiree')
  })
  it('slug lisible', () => {
    expect(slugOffre('assistant-dentaire', 'bordeaux', 'x7k2')).toBe('assistant-dentaire-bordeaux-x7k2')
  })
})

describe('créer un poste', () => {
  it('enchaîne les étapes, du cabinet à la publication', () => {
    expect(etapeSuivante('cabinet')).toBe('poste')
    expect(etapeSuivante('publication')).toBeNull()
    expect(etapePrecedente('cabinet')).toBeNull()
    expect(etapePrecedente('annonce')).toBe('remuneration')
  })
  const complete = { contrat: 'cdi' as const, min: 2000, max: 2300, titre: 'Assistant(e) dentaire', presentation: 'x'.repeat(80) }
  it('une offre complète ne manque de rien', () => {
    expect(manquesOffre(complete)).toEqual([])
  })
  it('rémunération obligatoire, sauf gratification', () => {
    expect(manquesOffre({ ...complete, min: 0, max: 0 }).map((m) => m.etape)).toEqual(['remuneration'])
    expect(manquesOffre({ ...complete, contrat: 'stage', min: 0, max: 0 })).toEqual([])
  })
  it('pourcentage plafonné à 100, salaire en euros mensuels', () => {
    expect(manquesOffre({ ...complete, contrat: 'remplacement', min: 60, max: 120 })).toHaveLength(1)
    expect(manquesOffre({ ...complete, min: 15, max: 20 })).toHaveLength(1)
  })
  it('présentation du poste de 80 caractères', () => {
    expect(manquesOffre({ ...complete, presentation: 'court' }).map((m) => m.etape)).toEqual(['annonce'])
  })
})
