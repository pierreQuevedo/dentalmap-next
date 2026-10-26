/**
 * Héros de la page « Le projet DentalMap » : titre géant en deux tons à
 * gauche, mosaïque de photos décalées à droite. Sombre, il passe sous
 * l'en-tête transparent (`-mt-20 pt-20`, comme l'accueil).
 */
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Bouton, Surtitre } from './blocs'
import { LIENS } from './contenu'
import { Pastille } from './visuels'

/** Les deux boutons du héros : la méthode, plus bas sur la page, et la revendication. */
function BoutonsHero() {
  return (
    <div className="flex flex-wrap gap-2">
      <Bouton href="#methode" ton="brand">
        Notre méthode de vérification <ArrowRight className="size-4" aria-hidden />
      </Bouton>
      <Bouton href={LIENS.revendiquer} ton="secondaire" sombre>
        Revendiquer ma fiche
      </Bouton>
    </div>
  )
}

function Tuile({ src, className = '', sizes = '25vw', children }: { src: string; className?: string; sizes?: string; children?: React.ReactNode }) {
  return (
    <div className={`squircle-3xl relative overflow-hidden border border-white/10 ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      {children}
    </div>
  )
}

/** Titre géant en deux tons à gauche, mosaïque de photos décalées à droite. */
export function HeroMosaique() {
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div className="container grid items-center gap-12 py-14 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16 lg:py-16">
        <div>
          <Surtitre sombre as="h1">Le projet DentalMap, annuaire dentaire vérifié</Surtitre>
          <p className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl xl:text-8xl">
            Pas de fiche
            <span className="block text-white/50">sans registre officiel.</span>
          </p>
          <p className="mt-6 max-w-md text-lg text-white/70">L’annuaire dentaire vérifié par les registres officiels.</p>
          <div className="mt-8">
            <BoutonsHero />
          </div>
        </div>
        <div aria-hidden className="grid grid-cols-2 gap-3 md:gap-4">
          <Tuile src="/images/demo/pexels-6627447.jpg" className="row-span-2 min-h-[16rem] lg:translate-y-6" />
          <Tuile src="/images/demo/pexels-3881296.jpg" className="aspect-[4/3] lg:-translate-y-3" />
          <Tuile src="/images/demo/pexels-6627320.jpg" className="aspect-[4/3] lg:-translate-y-3" />
          <Tuile src="/images/demo/pexels-8413334.jpg" className="col-span-2 aspect-[21/9] lg:ml-16 lg:mt-6" sizes="50vw">
            <Pastille className="absolute bottom-3 left-3 whitespace-nowrap md:bottom-5 md:left-5">Vérifié auprès des registres officiels</Pastille>
          </Tuile>
        </div>
      </div>
    </section>
  )
}
