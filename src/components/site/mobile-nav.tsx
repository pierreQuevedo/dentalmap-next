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
export function MobileNav({ accesRapide = [] }: { accesRapide?: NavLink[] }) {
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

  const methode = mainNav
    .find((e) => e.label === 'Annuaire')
    ?.columns?.find((c) => c.highlight)?.note

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
                        liens: c.dynamic === 'acces-rapide' ? accesRapide : c.links,
                      }))
                      .filter((c) => c.liens.length > 0)
                  : [{ titre: entry.label, liens: entry.links ?? [] }]
                if (entry.label === 'À propos' && methode) {
                  sections.push({ titre: 'Notre méthode', liens: [], note: methode })
                }
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
                              <Link key={l.href} href={chemin(l.href)} className="block rounded-xl px-1 py-2.5 text-[15px] text-fg">
                                {l.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-line px-5 py-4">
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
