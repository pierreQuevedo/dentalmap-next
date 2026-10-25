'use client'

import { useEffect, useState } from 'react'
import { CarteFiche } from '@/components/recherche/carte-fiche'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'
import { BASE_URL } from '@/lib/annuaire/types'

/** La saisie de la photo annonce la nouvelle image (son adresse une fois téléversée, `null` si retirée) : la carte de l'aperçu la montre aussitôt. */
export const EVENEMENT_PHOTO = 'dm-photo'

/**
 * La carte de résultat, posée telle quelle : sans survol à remonter,
 * utilisable depuis une page serveur. Avec `enDirect`, elle suit la photo
 * choisie dans la page avant l'enregistrement.
 */
export function CarteFixe({ praticien, profession, photo, palier, pastillesEmpilees, enDirect = false }: { praticien: PraticienProche; profession: Profession; photo?: string | null; palier?: number; pastillesEmpilees?: boolean; enDirect?: boolean }) {
  const [annoncee, setAnnoncee] = useState<{ url: string | null } | null>(null)
  useEffect(() => {
    if (!enDirect) return
    const ecouter = (e: Event) => setAnnoncee({ url: (e as CustomEvent<string | null>).detail })
    window.addEventListener(EVENEMENT_PHOTO, ecouter)
    return () => window.removeEventListener(EVENEMENT_PHOTO, ecouter)
  }, [enDirect])
  const image = annoncee ? annoncee.url : photo
  return <CarteFiche praticien={praticien} base={BASE_URL[profession]} profession={profession} photo={image ?? undefined} actif={false} onSurvol={() => {}} palier={palier} pastillesEmpilees={pastillesEmpilees} />
}
