/**
 * DÉMONSTRATION, à supprimer dès qu'un établissement réel a son groupe ACF
 * « Formation, informations détaillées » rempli dans WordPress : les pages
 * école de prothèse et faculté d'odontologie avec tous les blocs que le
 * groupe nourrit, à partir de la saisie d'exemple de `_donnees.ts`.
 * `?fiche=faculte` montre la faculté. Jamais indexée, rien n'est écrit dans
 * WordPress.
 */
import type { Metadata } from 'next'
import { maintenantPage } from '@/lib/formation/page-etablissement'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { FicheEcole } from '@/components/formation/fiche-etablissement'
import { FicheFaculte } from '@/components/formation/fiche-faculte'
import { ECOLE, FACULTE, FORMATION_ECOLE, FORMATION_FACULTE } from './_donnees'

/** Bloquante : la fiche montrée dépend de l'URL. */
export const instant = false

export const metadata: Metadata = { title: 'Démonstration Page établissement', robots: { index: false, follow: false } }

export default async function Page(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { fiche } = await props.searchParams
  if (fiche === 'faculte') {
    const position = FORMATION_FACULTE.details.position
    return (
      <>
        <HeaderTransparent />
        <FicheFaculte
          f={FORMATION_FACULTE}
          fac={FACULTE}
          declaration={null}
          position={position}
          points={position ? [{ cle: 'etablissement', nom: FORMATION_FACULTE.titre, ...position, role: 'etablissement' }] : []}
          autres={[]}
          maintenant={await maintenantPage()}
        />
      </>
    )
  }
  return (
    <>
      <HeaderTransparent />
      <FicheEcole f={FORMATION_ECOLE} ecole={ECOLE} declaration={null} position={FORMATION_ECOLE.details.position} autres={[]} departement={{ slug: 'gironde', nom: 'Gironde' }} maintenant={await maintenantPage()} />
    </>
  )
}
