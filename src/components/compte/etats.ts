/**
 * Les états de l'écran de connexion, partagés par le composant client et la
 * page serveur qui en ouvre un à la demande hors production.
 */
export type Etat = 'connexion' | 'inscription' | 'oubli' | 'verifier'

export const ETATS: { cle: Etat; libelle: string }[] = [
  { cle: 'connexion', libelle: 'Connexion' },
  { cle: 'inscription', libelle: 'Inscription' },
  { cle: 'oubli', libelle: 'Mot de passe oublié' },
  { cle: 'verifier', libelle: 'Confirmer l’adresse' },
]
