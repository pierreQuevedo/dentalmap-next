'use client'

import { CarteFiche } from '@/components/recherche/carte-fiche'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'
import { BASE_URL } from '@/lib/annuaire/types'

/** La carte de résultat, posée telle quelle : sans survol à remonter, utilisable depuis une page serveur. */
export function CarteFixe({ praticien, profession, photo, palier, pastillesEmpilees }: { praticien: PraticienProche; profession: Profession; photo?: string | null; palier?: number; pastillesEmpilees?: boolean }) {
  return <CarteFiche praticien={praticien} base={BASE_URL[profession]} profession={profession} photo={photo ?? undefined} actif={false} onSurvol={() => {}} palier={palier} pastillesEmpilees={pastillesEmpilees} />
}
