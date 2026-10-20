import { describe, expect, it } from 'vitest'
import { enPourcentage, etatOffre, modeDuContrat, slugOffre } from '../src/lib/emploi/offre-pro'

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
  it('échéance passée : expirée', () => {
    expect(etatOffre({ statut: 'en_ligne', publieeLe: il(31), confirmeeLe: il(1), expireLe: il(1), clotureeLe: null }, maintenant).etat).toBe('expiree')
  })
  it('slug lisible', () => {
    expect(slugOffre('assistant-dentaire', 'bordeaux', 'x7k2')).toBe('assistant-dentaire-bordeaux-x7k2')
  })
})
