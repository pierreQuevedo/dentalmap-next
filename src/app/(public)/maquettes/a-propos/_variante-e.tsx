/**
 * MAQUETTE E, contrastée, retenue : héros titre et mosaïque (voir `_heros-e`),
 * bande défilante, bento clair, méthode en
 * tuiles sur fond sombre, revendication en onglets par profil sur fond clair,
 * neutralité sombre, données, FAQ et appel final en image.
 */
import { Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { Bouton, Surtitre } from './_blocs'
import { ETAPES, LIENS } from './_contenu'
import { Defile } from './_defile'
import { OngletsProfils } from './_onglets'
import { BentoChiffres, Donnees, FaqCentree, Fin, Neutralite, VisuelEtape } from './_visuels'

/** Disposition des cinq tuiles de la méthode : deux larges, trois étroites. */
const TUILES = ['lg:col-span-2', '', '', 'lg:col-span-2', 'lg:col-span-3']

function Methode() {
  return (
    <div id="methode" className="scroll-mt-20">
      <section className="dark bg-background text-fg">
        <div className="container py-20 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Surtitre sombre>Notre méthode de vérification</Surtitre>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Du registre
                <span className="block text-white/55">à votre écran.</span>
              </h2>
            </div>
            <p className="max-w-sm text-white/70">Deux sources, jamais mélangées : le registre, et ce que le praticien déclare.</p>
          </div>
          <ol className="mt-12 grid gap-3 lg:grid-cols-3">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className={`squircle-3xl overflow-hidden border border-white/10 bg-white/[0.04] ${TUILES[i]}`}>
                <div className={i === 4 ? 'grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]' : ''}>
                  <VisuelEtape visuel={e.visuel} className={i === 4 ? 'h-72 lg:order-2 lg:h-full lg:min-h-[16rem]' : 'h-72'} />
                  <div className="flex items-start gap-5 p-6 md:p-8">
                    <span className="text-5xl font-light tabular-nums leading-none tracking-tight text-teal">0{i + 1}</span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{e.titre}</h3>
                      <p className="mt-2 text-white/70">{e.texte}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-6xl">
            Revendiquer
            <span className="block text-fg-2">selon votre profil.</span>
          </h2>
        </div>
        <div className="mt-10">
          <OngletsProfils />
        </div>
      </section>
    </div>
  )
}

/** Tout ce qui suit le héros : commun à e et à ses variantes de héros e1 à e4. */
export function CorpsE() {
  return (
    <>
      <Defile />
      <section className="container py-20 md:py-24">
        <h2 className="mb-10 text-4xl font-semibold tracking-tight text-fg md:text-5xl">
          Le projet,
          <span className="block text-fg-2">en chiffres.</span>
        </h2>
        <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-3xl bg-muted" aria-hidden />}>
          <BentoChiffres />
        </Suspense>
      </section>
      <Methode />
      <Neutralite />
      <Donnees />
      <FaqCentree />
      <Fin />
    </>
  )
}

/** Les deux boutons de tous les héros E. */
export function BoutonsHero({ centre }: { centre?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${centre ? 'justify-center' : ''}`}>
      <Bouton href="#methode" ton="brand">
        Notre méthode de vérification <ArrowRight className="size-4" aria-hidden />
      </Bouton>
      <Bouton href={LIENS.revendiquer} ton="secondaire" sombre>
        Revendiquer ma fiche
      </Bouton>
    </div>
  )
}

/** Page E avec son héros. Le héros est sombre : en-tête transparent. */
export function PageE({ hero }: { hero: React.ReactNode }) {
  return (
    <main>
      <HeaderTransparent />
      {hero}
      <CorpsE />
    </main>
  )
}

