import { contraste, niveau } from './contraste'

/**
 * Candidats pour la couleur d'action.
 *
 * Tous tiennent AA sur un libellé blanc ; les trois derniers tiennent AAA. Le
 * seuil qui commande est celui-là, le mode sombre ne contraint presque rien :
 * un teal clair sur fond presque noir dépasse 9 sans effort.
 *
 * Le survol est toujours plus foncé que la base. Un survol plus clair ferait
 * baisser le contraste au moment précis où le curseur est sur le bouton.
 */
export type Teal = {
  id: string
  nom: string
  tenue: string
  clair: string
  clairSurvol: string
  sombre: string
  sombreSurvol: string
}

export const TEALS: Teal[] = [
  {
    id: 'vif',
    nom: 'Teal vif',
    tenue: 'Le plus lumineux qui tienne AA',
    clair: '#0b8484',
    clairSurvol: '#097070',
    sombre: '#2fd1d1',
    sombreSurvol: '#5ee0e0',
  },
  {
    id: 'franc',
    nom: 'Teal franc',
    tenue: 'En place aujourd’hui',
    clair: '#0a8074',
    clairSurvol: '#066b60',
    sombre: '#2fd1c0',
    sombreSurvol: '#5ee0d2',
  },
  {
    id: 'sapin',
    nom: 'Teal sapin',
    tenue: 'AA large, à un cheveu de AAA',
    clair: '#12685f',
    clairSurvol: '#0d544d',
    sombre: '#43cbb9',
    sombreSurvol: '#6bdbcc',
  },
  {
    id: 'encre',
    nom: 'Teal encre',
    tenue: 'Le plus lumineux qui tienne AAA',
    clair: '#005c5c',
    clairSurvol: '#004a4a',
    sombre: '#3ad6d6',
    sombreSurvol: '#66e3e3',
  },
  {
    id: 'foret',
    nom: 'Teal forêt',
    tenue: 'AAA, tirant vers le vert',
    clair: '#0f5748',
    clairSurvol: '#0b463a',
    sombre: '#40cfa9',
    sombreSurvol: '#6bdcc0',
  },
  {
    id: 'ardoise',
    nom: 'Teal ardoise',
    tenue: 'AAA, tirant vers le bleu',
    clair: '#11505f',
    clairSurvol: '#0c404c',
    sombre: '#4cc7e0',
    sombreSurvol: '#76d7ea',
  },
]

export type MesureTeal = {
  rapport: number
  niveau: 'AAA' | 'AA' | null
}

export function mesurer(teal: Teal, sombre: boolean): { bouton: MesureTeal; survol: MesureTeal } {
  const fond = sombre ? '#0e1317' : '#ffffff'
  const texte = sombre ? '#0e1317' : '#ffffff'
  const base = contraste(texte, sombre ? teal.sombre : teal.clair)
  const surv = contraste(texte, sombre ? teal.sombreSurvol : teal.clairSurvol)
  void fond
  return {
    bouton: { rapport: base, niveau: niveau(base) },
    survol: { rapport: surv, niveau: niveau(surv) },
  }
}
