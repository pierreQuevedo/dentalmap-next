import { notFound } from 'next/navigation'
import { estBaseUrl, PROFESSION_PAR_BASE, PROFESSIONS, BASE_URL, type Profession } from '@/lib/annuaire/types'

/**
 * Le premier segment d'URL de l'annuaire : `dentistes`, `prothesistes`,
 * `maxillo-faciaux`, `stomatologues`, `orl`.
 *
 * Une seule arborescence de pages sert les cinq professions ; ce module
 * traduit le segment en profession et renvoie 404 pour tout autre segment,
 * puisque cette route dynamique est à la racine du site.
 */
export function professionDuSegment(base: string): Profession {
  if (!estBaseUrl(base)) notFound()
  return PROFESSION_PAR_BASE[base]
}

/** Les segments à prégénérer : un par profession. */
export function generateStaticParams() {
  return PROFESSIONS.map((p) => ({ base: BASE_URL[p] }))
}
