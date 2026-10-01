import { FORMATION_TYPES, type FormationType } from '@/lib/navigation'
import type { FormationResume } from '@/lib/wp/queries'

/**
 * Les trois familles de formation, de la valeur ACF au segment d'URL et à
 * ses libellés. Une seule table, lue par les pages de liste, la fiche, la
 * carte et la section de l'accueil.
 */
export const PAGE_PAR_TYPE: Record<string, FormationType> = {
  // Valeurs du champ ACF « typeFormation » : ecole_prothese, faculte, privee.
  ecole_prothese: 'ecoles-de-prothese',
  faculte: 'facultes-odontologie',
  privee: 'formations-privees',
}

export const FAMILLES: Record<FormationType, { titre: string; singulier: string; intro: string; pastille: string; aVenir?: boolean }> = {
  'ecoles-de-prothese': {
    titre: 'Écoles de prothèse dentaire',
    singulier: 'École de prothèse dentaire',
    intro: 'Bac professionnel, BTM, BTMS et BTS de prothésiste dentaire, en formation initiale comme en alternance, par établissement.',
    pastille: 'École de prothèse',
  },
  'facultes-odontologie': {
    titre: 'Facultés d’odontologie',
    singulier: 'Faculté d’odontologie',
    intro: 'Les unités de formation et de recherche en odontologie, leurs voies d’accès et leurs internats par spécialité.',
    pastille: 'Faculté',
  },
  'formations-privees': {
    titre: 'Formations privées',
    singulier: 'Formation privée',
    intro: 'Formation continue des praticiens et des prothésistes : implantologie, parodontologie, esthétique, gestion, par organisme.',
    pastille: 'Formation continue',
    // Annoncée dans le menu, pas encore recensée : la page le dit plutôt que d'afficher une liste vide.
    aVenir: true,
  },
}

export function estFormationType(v: string | undefined): v is FormationType {
  return !!v && (FORMATION_TYPES as readonly string[]).includes(v)
}

/** Segment de page d'une formation, d'après son type ACF ; les formations sans type vont aux formations privées. */
export function typeDe(f: Pick<FormationResume, 'type'>): FormationType {
  return (f.type && PAGE_PAR_TYPE[f.type]) || 'formations-privees'
}

export function lienFormation(f: Pick<FormationResume, 'type' | 'slug'>): string {
  return `/formation/${typeDe(f)}/${f.slug}/`
}

/** Comparaison de villes tolérante à la casse et aux accents. */
export function memeVille(a: string | null, b: string | null): boolean {
  if (!a || !b) return false
  const n = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  return n(a) === n(b) || n(a).includes(n(b)) || n(b).includes(n(a))
}
