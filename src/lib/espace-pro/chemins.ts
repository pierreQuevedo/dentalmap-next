/**
 * Les adresses du parcours de revendication, en un seul endroit.
 *
 * Fonctions pures : importées par les pages, les actions et les routes de
 * Pro Santé Connect.
 */
export const REVENDIQUER = '/espace-pro/revendiquer'

/** Trente jours pour annuler un retrait. */
export const DELAI_ANNULATION_RETRAIT_JOURS = 30

/** Après l'accord : choisir ses lieux s'il y en a plusieurs (M1), sinon l'espace pro. */
export function apresAccord(slug: string, nombreDeLieux: number): string {
  return nombreDeLieux > 1 ? `/espace-pro/lieux/?fiche=${encodeURIComponent(slug)}` : '/espace-pro/'
}

/** Une page de la revendication d'une fiche : `revendiquer/[slug]/methode/`… */
export function cheminFiche(slug: string, suite = ''): string {
  return `${REVENDIQUER}/${encodeURIComponent(slug)}/${suite ? `${suite}/` : ''}`
}

/** Les motifs de refus d'un justificatif : une liste fermée, que le praticien lit sur L. */
export const MOTIFS_REFUS = ['Nom illisible', 'Document incomplet', 'Nom différent de la fiche', 'Document non reconnu', 'Document expiré'] as const

/** Une échéance en jours ouvrés : samedis et dimanches ne comptent pas. */
export function echeanceOuvree(depart: Date, jours: number): Date {
  const d = new Date(depart)
  let restants = jours
  while (restants > 0) {
    d.setDate(d.getDate() + 1)
    const j = d.getDay()
    if (j !== 0 && j !== 6) restants--
  }
  return d
}

/** « mardi 8 octobre, 14 h 12 », à l'heure de Paris. */
export function dateLongue(d: Date | string): string {
  const date = new Date(d)
  const jour = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
  const [h, m] = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).split(':')
  return `${jour}, ${Number(h)} h${m === '00' ? '' : ` ${m}`}`
}

/** La dernière fiche visée par le parcours de revendication, posée par le proxy, relue par S0. */
export const COOKIE_FICHE = 'dm_fiche_revendiquee'
