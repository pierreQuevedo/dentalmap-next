/**
 * MAQUETTE : la progression d'une fiche (points, paliers, gains), à valider
 * avant de la brancher. Jamais indexée.
 */
import type { Metadata } from 'next'
import { Progression } from './_progression'

export const metadata: Metadata = { title: 'Maquette progression', robots: { index: false, follow: false } }

export default function Page() {
  return <Progression />
}
