/**
 * Les objets d'un message de contact.
 *
 * Ce sont les mêmes entrées que les cartes de la page : chaque service y mène
 * avec son objet présélectionné, et le courriel part avec l'objet en sujet
 * pour être trié à l'arrivée.
 */
export const OBJETS = [
  ['erreur-fiche', 'Une erreur sur une fiche'],
  ['praticien', 'Ma fiche ou mon espace pro'],
  ['laboratoire', 'Mon laboratoire'],
  ['partenariat', 'Un partenariat'],
  ['presse', 'Une demande presse'],
  ['donnees', 'Mes données personnelles'],
  ['autre', 'Autre'],
] as const

export type Objet = (typeof OBJETS)[number][0]

export const CLES_OBJETS = OBJETS.map(([cle]) => cle) as [Objet, ...Objet[]]

export function estObjet(valeur: unknown): valeur is Objet {
  return typeof valeur === 'string' && (CLES_OBJETS as string[]).includes(valeur)
}

export function libelleObjet(objet: Objet): string {
  return OBJETS.find(([cle]) => cle === objet)?.[1] ?? objet
}
