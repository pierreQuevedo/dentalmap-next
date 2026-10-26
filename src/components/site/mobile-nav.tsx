'use client'

/* eslint-disable @next/next/no-html-link-for-pages -- espace pro et favoris en vrais liens : leurs pages redirigent côté serveur et le routeur client restait figé */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { chemin, mainNav, mainNavIcons, type NavLink } from '@/lib/navigation'
import { NavIconSvg } from './nav-icon'
import { RechercheUniverselle } from '@/components/accueil/recherche-universelle'
import { verrouillerDefilement } from '@/lib/verrou-defilement'
import { FAVORIS_VISIBLE } from '@/lib/visibilite'

/**
 * Tiroir plein écran, en dessous de `xl`.
 *
 * Il s'ouvre sous la barre, qui reste en place : logo, loupe, thème et
 * bouton ne bougent pas d'un pixel, seul le bouton passe de l'icône menu à
 * la croix. La recherche en tête est celle de l'accueil.
 *
 * Le méga-menu de l'annuaire s'y dégrade en accordéons : ses colonnes
 * deviennent des sections, et la colonne « Notre méthode », qui ne porte qu'un
 * texte, est repliée dans l'accordéon « À propos » pour ne pas ouvrir une
 * section vide.
 */
export function MobileNav() {
  const pathname = usePathname()
  // Voir `main-nav.tsx` : la route d'ouverture fait partie de l'état, ce qui
  // referme le tiroir à la navigation sans passer par un effet.
  const [etat, setEtat] = useState<{ visible: boolean; chemin: string }>({ visible: false, chemin: pathname })
  const ouvert = etat.chemin === pathname && etat.visible
  const setOuvert = (visible: boolean) => setEtat({ visible, chemin: pathname })
  const [section, setSection] = useState<string | null>(null)

  // Le tiroir couvre la page : laisser le corps défiler derrière donnerait
  // deux barres de défilement imbriquées. La barre du site redevient opaque.
  useEffect(() => {
    if (!ouvert) return
    const deverrouiller = verrouillerDefilement()
    document.documentElement.setAttribute('data-menu', 'ouvert')
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEtat((etat) => ({ ...etat, visible: false }))
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      deverrouiller()
      document.documentElement.removeAttribute('data-menu')
      document.removeEventListener('keydown', surTouche)
    }
  }, [ouvert])

  return (
    <>
      <button
        type="button"
        aria-expanded={ouvert}
        aria-label={ouvert ? 'Fermer le menu' : undefined}
        onClick={() => setOuvert(!ouvert)}
        className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm font-medium text-fg xl:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-4" aria-hidden>
          {ouvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        Menu
      </button>

      {ouvert && (
        <div className="fixed inset-x-0 bottom-0 top-20 z-[60] flex flex-col border-t border-line bg-bg xl:hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 md:px-10">
            <div className="flex justify-center">
              <RechercheUniverselle />
            </div>

            <nav aria-label="Navigation principale" className="mt-5">
              {mainNav.map((entry) => {
                const sections: { titre: string; liens: NavLink[]; note?: string }[] = entry.columns
                  ? entry.columns
                      .map((c) => ({
                        titre: c.title,
                        liens: c.links,
                      }))
                      .filter((c) => c.liens.length > 0)
                  : [{ titre: entry.label, liens: entry.links ?? [] }]
                const promo = entry.columns?.find((c) => c.promo)?.promo
                const deplie = section === entry.label
                return (
                  <div key={entry.label} className="border-b border-line">
                    <button
                      type="button"
                      aria-expanded={deplie}
                      onClick={() => setSection(deplie ? null : entry.label)}
                      className="flex w-full items-center gap-3 py-4 text-left text-[17px] font-medium text-fg"
                    >
                      <NavIconSvg name={mainNavIcons[entry.label]} className="size-5 text-fg-2" />
                      {entry.label}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={`ml-auto size-4 text-fg-2 transition-transform ${deplie ? 'rotate-180' : ''}`}
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {deplie && (
                      <div className="pb-3">
                        {sections.map((s) => (
                          <div key={s.titre} className="mb-2">
                            <h3 className="px-1 py-1 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">
                              {s.titre}
                            </h3>
                            {s.note && <p className="px-1 pb-1 text-[13px] leading-relaxed text-fg-2">{s.note}</p>}
                            {s.liens.map((l) => (
                              <Link key={l.href} href={chemin(l.href)} className={`flex items-center gap-2 rounded-xl px-1 py-2.5 text-[15px] ${l.badge ? 'text-fg-2' : 'text-fg'}`}>
                                {l.label}
                                {l.badge && (
                                  <span className="rounded-full bg-bg-soft text-fg-2 ring-1 ring-inset ring-line px-2 py-0.5 text-[11px] font-medium">{l.badge}</span>
                                )}
                              </Link>
                            ))}
                          </div>
                        ))}
                        {promo && (
                          <a
                            href={promo.href}
                            target="_blank"
                            rel="noopener"
                            className="relative isolate mt-1 block overflow-hidden rounded-2xl bg-fg p-4 text-bg"
                          >
                            <span aria-hidden className="absolute -right-10 -top-10 -z-10 size-36 rounded-full bg-teal/50 blur-3xl" />
                            <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-bg/70">{promo.surtitre}</span>
                            <p className="mt-1 text-lg font-semibold">{promo.titre}</p>
                            <p className="mt-1 text-[13px] leading-relaxed text-bg/70">{promo.texte}</p>
                            <span className="mt-3 inline-block text-sm font-semibold">{promo.cta} ↗</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          <div className="grid gap-3 border-t border-line px-5 py-4 md:px-10">
            {FAVORIS_VISIBLE && (
              <a href="/favoris/" className="block rounded-full border border-line px-5 py-3 text-center text-[15px] font-medium text-fg">
                Mes favoris
              </a>
            )}
            <a
              href="/espace-pro/"
              className="block rounded-full bg-action px-5 py-3 text-center text-[15px] font-semibold text-action-foreground"
            >
              Espace pro
            </a>
          </div>
        </div>
      )}
    </>
  )
}
