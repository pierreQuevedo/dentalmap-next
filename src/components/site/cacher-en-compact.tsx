'use client'

import { useHeaderCompact } from './use-header-compact'

/**
 * Masque son contenu dès que la barre passe en mode compact.
 *
 * La mini-pill occupe alors le centre de la barre : sans cela, le lien
 * « Vous êtes praticien ? » s'étend vers le centre, la colonne du milieu étant
 * vide, et passe sous la pill.
 */
export function CacherEnCompact({ children }: { children: React.ReactNode }) {
  return useHeaderCompact() ? null : <>{children}</>
}
