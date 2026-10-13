'use client'

/** MAQUETTE. Bande défilante des registres et des métiers, avec le Marquee de kibo-ui déjà installé (héros de l'accueil). */
import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from '@/components/kibo-ui/marquee'
import { DEFILE } from './_contenu'

export function Defile({ sombre }: { sombre?: boolean }) {
  return (
    <div className={`${sombre ? 'dark bg-background' : 'bg-bg'} border-y border-line py-6 md:py-8`}>
      <Marquee>
        <MarqueeFade side="left" className="from-bg" />
        <MarqueeFade side="right" className="from-bg" />
        <MarqueeContent speed={30}>
          {DEFILE.map((d, i) => (
            <MarqueeItem key={d} className="mx-0 flex items-center">
              <span className={`px-6 text-2xl font-semibold tracking-tight md:px-8 md:text-4xl ${i % 2 ? 'text-fg-2' : 'text-fg'}`}>{d}</span>
              <span className="size-2 rounded-full bg-teal" aria-hidden />
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>
    </div>
  )
}
