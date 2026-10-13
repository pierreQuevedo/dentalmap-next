/**
 * MAQUETTE, à supprimer après arbitrage. Formations privées d'exemple :
 * organismes, intervenants, dates, lieux et tarifs inventés, affichés comme
 * exemples. Forme proche du CPT `formation` (type « privee », ville,
 * département, site, durée, diplôme : `docs/architecture-v2-nextjs-headless.md`
 * 7.2), complétée des champs que ces pages montrent, à créer côté WordPress.
 *
 * Prise en charge et certification : « déclaré par l’organisme », sauf
 * Qualiopi quand la source est la liste publique des organismes certifiés
 * (source citée dans `docs/handoff/06` pour les établissements).
 */
export type Format = 'Présentiel' | 'Distanciel' | 'Mixte'
export type PriseEnCharge = { nom: 'DPC' | 'FIF PL' | 'Qualiopi'; verifie?: string }

export type Session = { date: string; jour: string; mois: string; lieu: string; places?: string }

export type FormationPrivee = {
  slug: string
  titre: string
  theme: string
  organisme: string
  monogramme: string
  public: string[]
  format: Format
  duree: string
  region: string
  ville: string
  tarif: string
  priseEnCharge: PriseEnCharge[]
  image?: string
  sessions: Session[]
}

/** La liste unique des thèmes, partagée avec la liste d'attente des organismes. */
export { THEMES_FORMATION as THEMES } from '@/lib/formation/themes'

export const FORMATIONS: FormationPrivee[] = [
  {
    slug: 'implantologie-pose-guidee',
    titre: 'Implantologie : de la planification à la pose guidée',
    theme: 'Implantologie',
    organisme: 'Atelier Implanto Formation',
    monogramme: 'AI',
    public: ['Chirurgiens-dentistes'],
    format: 'Mixte',
    duree: '4 jours',
    region: 'Nouvelle-Aquitaine',
    ville: 'Bordeaux',
    tarif: '2 400 €',
    priseEnCharge: [{ nom: 'DPC' }, { nom: 'Qualiopi', verifie: 'liste publique des organismes certifiés' }],
    image: '/images/demo/pexels-6627447.jpg',
    sessions: [
      { date: '14 et 15 novembre 2026', jour: '14', mois: 'nov.', lieu: 'Bordeaux', places: '4 places' },
      { date: '23 et 24 janvier 2027', jour: '23', mois: 'janv.', lieu: 'En ligne' },
      { date: '13 et 14 mars 2027', jour: '13', mois: 'mars', lieu: 'Toulouse' },
    ],
  },
  {
    slug: 'endodontie-mecanisee',
    titre: 'Endodontie mécanisée au quotidien',
    theme: 'Endodontie',
    organisme: 'Cercle Endo Formation',
    monogramme: 'CE',
    public: ['Chirurgiens-dentistes'],
    format: 'Présentiel',
    duree: '2 jours',
    region: 'Occitanie',
    ville: 'Toulouse',
    tarif: '1 150 €',
    priseEnCharge: [{ nom: 'FIF PL' }],
    sessions: [{ date: '28 novembre 2026', jour: '28', mois: 'nov.', lieu: 'Toulouse' }],
  },
  {
    slug: 'parodontologie-non-chirurgicale',
    titre: 'Parodontologie non chirurgicale',
    theme: 'Parodontologie',
    organisme: 'Paro Campus',
    monogramme: 'PC',
    public: ['Chirurgiens-dentistes', 'Assistant(e)s'],
    format: 'Distanciel',
    duree: '6 heures',
    region: 'En ligne',
    ville: 'En ligne',
    tarif: '390 €',
    priseEnCharge: [{ nom: 'DPC' }],
    image: '/images/demo/pexels-6627320.jpg',
    sessions: [{ date: '3 décembre 2026', jour: '3', mois: 'déc.', lieu: 'En ligne' }],
  },
  {
    slug: 'radioprotection-patients',
    titre: 'Radioprotection des patients',
    theme: 'Radioprotection',
    organisme: 'Paro Campus',
    monogramme: 'PC',
    public: ['Chirurgiens-dentistes'],
    format: 'Distanciel',
    duree: '7 heures',
    region: 'En ligne',
    ville: 'En ligne',
    tarif: '290 €',
    priseEnCharge: [{ nom: 'DPC' }, { nom: 'FIF PL' }],
    sessions: [{ date: '9 décembre 2026', jour: '9', mois: 'déc.', lieu: 'En ligne' }],
  },
  {
    slug: 'cfao-zircone',
    titre: 'CFAO et zircone monolithique',
    theme: 'Prothèse et CFAO',
    organisme: 'CFAO Studio',
    monogramme: 'CS',
    public: ['Prothésistes'],
    format: 'Présentiel',
    duree: '3 jours',
    region: 'Auvergne-Rhône-Alpes',
    ville: 'Lyon',
    tarif: '1 680 €',
    priseEnCharge: [],
    image: '/images/demo/pexels-8413334.jpg',
    sessions: [{ date: '18 au 20 janvier 2027', jour: '18', mois: 'janv.', lieu: 'Lyon' }],
  },
  {
    slug: 'gestion-du-cabinet',
    titre: 'Piloter la gestion de son cabinet',
    theme: 'Gestion du cabinet',
    organisme: 'Cabinet et Gestion',
    monogramme: 'CG',
    public: ['Chirurgiens-dentistes', 'Assistant(e)s'],
    format: 'Mixte',
    duree: '2 jours',
    region: 'Île-de-France',
    ville: 'Paris',
    tarif: '890 €',
    priseEnCharge: [{ nom: 'FIF PL' }],
    image: '/images/demo/pexels-3881296.jpg',
    sessions: [{ date: '5 février 2027', jour: '5', mois: 'févr.', lieu: 'Paris' }],
  },
]

/** La fiche d'exemple. */
export const FICHE = {
  f: FORMATIONS[0]!,
  resume: 'Quatre jours pour planifier un cas implantaire sur cone beam, concevoir un guide chirurgical et poser en conditions réelles, sur modèles puis en démonstration.',
  programme: [
    { titre: 'Planification', detail: 'Lecture du cone beam, choix de l’implant, projet prothétique', duree: 'Jour 1' },
    { titre: 'Guide chirurgical', detail: 'Conception numérique, impression, contrôle', duree: 'Jour 2' },
    { titre: 'Pose guidée', detail: 'Travaux pratiques sur modèles, protocole d’asepsie', duree: 'Jour 3' },
    { titre: 'Suivi et cas cliniques', detail: 'Mise en charge, complications, analyse de cas', duree: 'Jour 4, à distance' },
  ],
  prerequis: ['Chirurgien-dentiste inscrit à l’Ordre', 'Pratique de la chirurgie orale de base', 'Ordinateur pour la journée à distance'],
  intervenants: [
    { role: 'Chirurgien-dentiste, exercice exclusif en implantologie', initiales: 'IA' },
    { role: 'Prothésiste dentaire, spécialiste CFAO', initiales: 'IB' },
  ],
  objectifs: ['Planifier un cas simple de bout en bout', 'Concevoir et valider un guide', 'Poser en sécurité, puis suivre'],
  siteExterne: 'atelier-implanto.example',
  declareLe: '6 octobre 2026',
}
