import { cacheLife, cacheTag } from 'next/cache'
import { graphql } from './generated'
import { wp } from './client'
import { FORMATION_TYPES, type ExploreLink, type FormationType } from '@/lib/navigation'

const FormationsPanneauDocument = graphql(`
  query FormationsPanneau($first: Int = 100) {
    formations(first: $first) {
      nodes {
        id
        formationFields { typeFormation }
      }
    }
  }
`)

const LIBELLE: Record<FormationType, string> = {
  'ecoles-de-prothese': 'Écoles de prothèse dentaire',
  'facultes-odontologie': "Facultés d'odontologie",
  'formations-privees': 'Formations privées',
}

/**
 * Le champ ACF `typeFormation` porte les valeurs du CMS, en souligné ; les
 * segments d'URL sont les nôtres. La table de correspondance vit ici, au plus
 * près de la requête, et non dans `navigation.ts` qui ne doit rien savoir de
 * WordPress.
 */
const SEGMENT_PAR_VALEUR_ACF: Record<string, FormationType> = {
  ecole_prothese: 'ecoles-de-prothese',
  faculte_odontologie: 'facultes-odontologie',
  formation_privee: 'formations-privees',
}

/**
 * Panneau « Formation » du pied de page : les trois types, avec le nombre de
 * fiches publiées.
 *
 * Le CMS peut être injoignable sans que le pied de page casse : dans ce cas
 * les trois liens s'affichent sans compte, ce qui vaut mieux qu'un panneau
 * absent sur toutes les pages du site.
 */
export async function getFormationPanel(): Promise<ExploreLink[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:formation')

  const comptes = new Map<FormationType, number>()
  try {
    const data = await wp(FormationsPanneauDocument, { first: 100 })
    for (const node of data.formations?.nodes ?? []) {
      for (const valeur of node.formationFields?.typeFormation ?? []) {
        const segment = valeur ? SEGMENT_PAR_VALEUR_ACF[valeur] : undefined
        if (segment) comptes.set(segment, (comptes.get(segment) ?? 0) + 1)
      }
    }
  } catch {
    // Panneau dégradé, pas de page en erreur.
  }

  return FORMATION_TYPES.map((type) => {
    const total = comptes.get(type) ?? 0
    return {
      title: LIBELLE[type],
      sub: total > 0 ? `${total} ${total > 1 ? 'établissements' : 'établissement'}` : 'Bientôt disponible',
      href: `/formation/${type}`,
    }
  })
}
