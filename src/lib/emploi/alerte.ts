/**
 * Les critères d'une alerte emploi sans compte. Pur : lu par l'action
 * d'inscription, par le futur job `alertes-emploi` et par les tests.
 */
import { z } from 'zod'
import { CODES_CONTRAT, CODES_METIER } from './metiers'

export const CriteresAlerte = z.object({
  metiers: z.array(z.enum(CODES_METIER)).max(CODES_METIER.length),
  contrats: z.array(z.enum(CODES_CONTRAT)).max(CODES_CONTRAT.length),
  /** Code du département, ou absent : toute la France. */
  departement: z.string().regex(/^(\d{2,3}|2A|2B)$/).optional(),
  /** Code INSEE de la commune, avec un rayon en kilomètres. */
  commune: z.string().regex(/^[0-9AB]{5}$/).optional(),
  rayonKm: z.number().int().min(0).max(100).optional(),
})
export type CriteresAlerte = z.infer<typeof CriteresAlerte>

export const InscriptionAlerte = z.object({
  email: z.string().trim().toLowerCase().email('Adresse électronique invalide.'),
  criteres: CriteresAlerte,
})

/**
 * Les critères portés par le formulaire, en champs cachés : la page qui
 * affiche l'alerte les fixe (métier de la page, commune et rayon…). Les
 * listes sont triées pour qu'une même alerte s'écrive toujours de la même
 * façon et soit reconnue à la réinscription.
 */
export function lireCriteres(donnees: FormData): unknown {
  const nombre = donnees.get('rayonKm')
  const texte = (k: string) => {
    const v = donnees.get(k)
    return typeof v === 'string' && v ? v : undefined
  }
  return {
    metiers: [...new Set(donnees.getAll('metiers').map(String).filter(Boolean))].sort(),
    contrats: [...new Set(donnees.getAll('contrats').map(String).filter(Boolean))].sort(),
    departement: texte('departement'),
    commune: texte('commune'),
    rayonKm: typeof nombre === 'string' && nombre ? Number(nombre) : undefined,
  }
}

