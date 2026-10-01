'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * Entrée animée du hero.
 *
 * Le composant ne rend rien : il reçoit un sous-arbre rendu par le serveur et
 * se contente d'en animer les éléments marqués `data-hero`. C'est ce qui
 * permet au titre, aux cartes et au fond de carte de rester des composants
 * serveur, sans que rien de leur balisage ne parte dans le bundle client.
 *
 * Les animations sont des `from` : l'état final est celui du HTML livré. Si le
 * script ne s'exécute jamais, le hero est simplement là, complet et immobile.
 * `useGSAP` pose les états initiaux dans un effet de mise en page, donc avant
 * la peinture, ce qui évite de voir la scène finale clignoter avant de partir.
 *
 * Tout est enfermé dans un `matchMedia` : sous `prefers-reduced-motion`, pas
 * une seule propriété n'est touchée, ni l'entrée ni les flottements continus.
 */
export function HeroScene({ children }: { children: React.ReactNode }) {
  const racine = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.from('[data-hero="decor"]', { autoAlpha: 0, scale: 1.08, duration: 1.4, ease: 'power2.out' }, 0)
          .from('[data-hero="eyebrow"]', { y: 14, autoAlpha: 0, duration: 0.5 }, 0.1)
          // Les mots montent depuis leur propre masque : la ligne se dévoile
          // au lieu d'apparaître, ce qui tient le regard sur le titre.
          .from('[data-hero="mot"]', { yPercent: 115, duration: 0.85, stagger: 0.055, ease: 'power4.out' }, 0.15)
          .from('[data-hero="sous"]', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.5)
          .from('[data-hero="recherche"]', { y: 18, autoAlpha: 0, scale: 0.975, duration: 0.75 }, 0.6)
          .from('[data-hero="preuve"]', { y: 10, autoAlpha: 0, duration: 0.5 }, 0.78)
          .from(
            '[data-hero="carte"]',
            { y: 38, autoAlpha: 0, scale: 0.96, duration: 0.9, stagger: 0.09 },
            0.52,
          )
          .from(
            '[data-hero="marqueur"]',
            { scale: 0, autoAlpha: 0, transformOrigin: '50% 100%', duration: 0.6, stagger: 0.11, ease: 'back.out(2.2)' },
            0.7,
          )

        // Dérive très lente du fond : la carte respire, sans jamais attirer
        // l'œil ni relancer une mise en page.
        gsap.to('[data-hero="decor-plan"]', {
          xPercent: -2.2,
          yPercent: -1.4,
          duration: 26,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })

        // Flottement des cartes, décalé pour qu'elles ne battent pas ensemble.
        gsap.to('[data-hero="carte"]', {
          y: '+=7',
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.7,
          stagger: { each: 0.4, from: 'random' },
        })

        return () => {
          tl.kill()
        }
      })
    },
    { scope: racine },
  )

  return (
    <div ref={racine} className="contents">
      {children}
    </div>
  )
}
