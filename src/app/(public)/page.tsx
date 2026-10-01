import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Balisage, organisation, siteWeb } from '@/lib/seo/jsonld'
import { SITE_DESCRIPTION } from '@/lib/seo/site'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeStats } from '@/components/home/HomeStats'
import { HomeExplore } from '@/components/home/HomeExplore'
import { HomeProcess } from '@/components/home/HomeProcess'
import { HomeDentalBridge } from '@/components/home/HomeDentalBridge'
import { HomeConseils } from '@/components/home/HomeConseils'
import { HomeFormation } from '@/components/home/HomeFormation'
import { HomePro } from '@/components/home/HomePro'
import { HomeFaq } from '@/components/home/HomeFaq'
import { HomePartenaire } from '@/components/home/HomePartenaire'

export const metadata: Metadata = {
  title: 'DentalMap, annuaire dentaire vérifié',
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

/**
 * Squelette d'attente d'une section qui lit des données.
 *
 * Aucun chiffre n'est écrit en dur : tant que la donnée n'est pas là, la
 * section montre un aplat de la géométrie d'un block, rien d'autre.
 */
function Attente({ hauteur = 'h-72' }: { hauteur?: string }) {
  return (
    <div className="container py-20 md:py-24" aria-hidden>
      <div className={`${hauteur} animate-pulse rounded-3xl bg-muted`} />
    </div>
  )
}

/**
 * Page d'accueil, composée de blocks shadcnblocks et de trois sections
 * maison. Ordre : hero, stats, explorer, comment ça marche, DentalBridge,
 * conseils, formation, praticiens, FAQ, partenaires.
 *
 * Z6 est l'encart du logiciel de gestion édité par la même équipe, qui a pris
 * la place de l'appel à revendiquer sa fiche : voir `HomeDentalBridge`.
 */
export default function Accueil() {
  return (
    <main>
      <Balisage donnees={organisation()} />
      <Balisage donnees={siteWeb()} />

      <HomeHero />
      <Suspense fallback={<Attente hauteur="h-[28rem]" />}>
        <HomeStats />
      </Suspense>
      <Suspense fallback={<Attente />}>
        <HomeExplore />
      </Suspense>
      <HomeProcess />
      <HomeDentalBridge />
      <Suspense fallback={<Attente />}>
        <HomeConseils />
      </Suspense>
      <HomeFormation />
      <HomePro />
      <Suspense fallback={<Attente />}>
        <HomeFaq />
      </Suspense>
      <HomePartenaire />
    </main>
  )
}
