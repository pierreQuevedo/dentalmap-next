import type { Metadata } from 'next'
import { RESSOURCES_VISIBLE } from '@/lib/visibilite'

/** Ressources masquées (`RESSOURCES_VISIBLE`) : les pages répondent encore, mais hors de l'index. */
export const metadata: Metadata = RESSOURCES_VISIBLE ? {} : { robots: { index: false, follow: false } }

export default function LayoutRessources({ children }: { children: React.ReactNode }) {
  return children
}
