'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { chemin, mainNav, mainNavIcons, type NavLink } from '@/lib/navigation'
import { NavIconSvg, SearchIcon } from './nav-icon'

/**
 * Tiroir plein écran, en dessous de 950 px.
 *
 * Le méga-menu de l'annuaire s'y dégrade en accordéons : ses colonnes
 * deviennent des sections, et la colonne « Notre méthode », qui ne porte qu'un
 * texte, est repliée dans l'accordéon « À propos » pour ne pas ouvrir une
 * section vide.
 */
export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  // Voir `main-nav.tsx` : la route d'ouverture fait partie de l'état, ce qui
  // referme le tiroir à la navigation sans passer par un effet.
  const [etat, setEtat] = useState<{ visible: boolean; chemin: string }>({ visible: false, chemin: pathname })
  const ouvert = etat.chemin === pathname && etat.visible
  const setOuvert = (visible: boolean) => setEtat({ visible, chemin: pathname })
  const [section, setSection] = useState<string | null>(null)
  const [ou, setOu] = useState('')

  // Le tiroir couvre la page : laisser le corps défiler derrière donnerait
  // deux barres de défilement imbriquées.
  useEffect(() => {
    if (!ouvert) return
    const precedent = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEtat((etat) => ({ ...etat, visible: false }))
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      document.body.style.overflow = precedent
      document.removeEventListener('keydown', surTouche)
    }
  }, [ouvert])

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({ profession: 'dentistes' })
    if (ou.trim()) q.set('q', ou.trim())
    setOuvert(false)
    router.push(`/recherche?${q.toString()}`)
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={ouvert}
        onClick={() => setOuvert(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm font-medium text-fg md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-4" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        Menu
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-bg md:hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="text-lg font-bold tracking-tight text-brand">DentalMap</span>
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setOuvert(false)}
              className="grid size-9 place-items-center rounded-full border border-line text-fg"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-4" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <form role="search" onSubmit={envoyer} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 shadow-pill">
              <SearchIcon className="size-4 shrink-0 text-fg-2" />
              <input
                value={ou}
                onChange={(e) => setOu(e.target.value)}
                placeholder="Où ? Ville ou code postal"
                aria-label="Où ?"
                autoComplete="off"
                className="w-full bg-transparent py-1.5 text-sm text-fg outline-none placeholder:text-fg-2"
              />
            </form>

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

          <div className="grid gap-3 border-t border-line px-5 py-4">
            <Link href="/favoris" className="block rounded-full border border-line px-5 py-3 text-center text-[15px] font-medium text-fg">
              Mes favoris
            </Link>
            <Link
              href="/espace-pro"
              className="block rounded-full bg-action px-5 py-3 text-center text-[15px] font-semibold text-action-foreground"
            >
              Espace pro
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
