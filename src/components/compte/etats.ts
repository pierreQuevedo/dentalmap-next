/**
 * Les états de l'écran de connexion, partagés par le composant client et la
 * page serveur qui en ouvre un à la demande hors production.
 */
export type Etat = 'email' | 'motdepasse' | 'code' | 'oubli' | 'nouveau' | 'verifier'

export const ETATS: { cle: Etat; libelle: string }[] = [
  { cle: 'email', libelle: 'Adresse' },
  { cle: 'motdepasse', libelle: 'Mot de passe' },
  { cle: 'code', libelle: 'Code de connexion' },
  { cle: 'oubli', libelle: 'Mot de passe oublié' },
  { cle: 'nouveau', libelle: 'Nouveau compte' },
  { cle: 'verifier', libelle: 'Confirmer l’adresse' },
]
