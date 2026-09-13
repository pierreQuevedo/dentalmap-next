import Link from 'next/link'
import { cacheLife } from 'next/cache'
import { getAccesRapide } from '@/lib/annuaire/acces-rapide'
import { getDerniereSync, getLabosPanel, getRegionsPanel } from '@/lib/annuaire/footer'
import { getFormationPanel } from '@/lib/wp/footer'
import { chemin, exploreStatic, footerCols, legalNav, type ExplorePanel } from '@/lib/navigation'
import { FooterExplore } from './footer-explore'

const dateLongue = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

/**
 * Année du copyright.
 *
 * `new Date()` en plein rendu est refusé par Cache Components : la valeur
 * changerait entre deux rendus d'une page prérendue. Isolée dans une fonction
 * cachée, elle est figée dans le prérendu et se rafraîchit avec le profil.
 */
async function anneeCourante() {
  'use cache'
  cacheLife('days')
  return new Date().getFullYear()
}

export async function Footer() {
  const [annee, villes, regions, labos, formation, derniereSync] = await Promise.all([
    anneeCourante(),
    getAccesRapide(18),
    getRegionsPanel(),
    getLabosPanel(12),
    getFormationPanel(),
    getDerniereSync(),
  ])

  const panels: ExplorePanel[] = [
    {
      id: 'villes',
      label: 'Grandes villes',
      links: villes.map((v) => ({ title: v.label, sub: 'Chirurgiens-dentistes', href: v.href })),
    },
    { id: 'regions', label: 'Par région', links: regions.map((r) => ({ title: r.label, sub: r.sub, href: r.href })) },
    {
      id: 'labos',
      label: 'Prothésistes dentaires',
      links: labos.map((l) => ({ title: l.label, sub: 'Laboratoires de prothèse', href: l.href })),
    },
    { id: 'formation', label: 'Formation', links: formation },
    exploreStatic,
  ]

  const px = 'px-5 md:px-10 xl:px-20'
  const maj = derniereSync ? dateLongue.format(new Date(derniereSync)) : null

  return (
    <footer className="border-t border-line bg-bg-soft text-sm text-fg">
      <section className={`${px} border-b border-line pt-12`}>
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight">Trouver un professionnel près de chez vous</h2>
        <FooterExplore panels={panels} />
      </section>

      <section className={`${px} grid gap-8 py-12 md:grid-cols-3 md:gap-6`}>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-semibold">{col.title}</h3>
            <ul className="grid gap-3.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a href={l.href} rel="noopener" className="hover:underline">
                      {l.label} <span aria-hidden className="text-fg-2">↗</span>
                      <span className="ml-1.5 rounded-full bg-line px-2 py-px text-[11px] font-medium text-fg-2">
                        {l.description}
                      </span>
                    </a>
                  ) : (
                    <Link href={chemin(l.href)} className="hover:underline">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section
        className={`${px} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line py-6`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span>© {annee} DentalMap</span>
          {legalNav.map((l) => (
            <span key={l.href} className="contents">
              <span aria-hidden className="text-fg-2">·</span>
              <Link href={chemin(l.href)} className="hover:underline">
                {l.label}
              </Link>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 font-semibold">
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
            </svg>
            Français (FR)
          </span>
          {/* Les badges disent d'où viennent les données ; la date n'apparaît
              que si une synchronisation a réellement abouti. */}
          <span className="inline-flex gap-1.5" title={maj ? `Données mises à jour le ${maj}` : undefined}>
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs font-normal">ANS · RPPS</span>
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs font-normal">
              INSEE · Sirene
            </span>
          </span>
        </div>
      </section>
    </footer>
  )
}
