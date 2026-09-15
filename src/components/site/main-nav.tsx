'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { chemin, mainNav, mainNavIcons, type NavEntry, type NavLink } from '@/lib/navigation'
import { lienConseil, Rubrique } from '@/components/conseils/primitives'
import type { ConseilResume } from '@/lib/wp/queries'
import { NavIconSvg } from './nav-icon'

/**
 * L'annuaire vit sous trois préfixes. L'onglet doit rester souligné sur une
 * fiche de laboratoire comme sur une page de recherche, alors que son `href`
 * ne pointe que vers `/dentistes`.
 */
const PREFIXES_ANNUAIRE = ['/dentistes', '/prothesistes', '/recherche']

const DELAI_FERMETURE = 180

function estActif(entry: NavEntry, pathname: string) {
  if (entry.label === 'Annuaire') return PREFIXES_ANNUAIRE.some((p) => pathname.startsWith(p))
  return pathname === entry.href || pathname.startsWith(`${entry.href}/`)
}

export function MainNav({
  accesRapide = [],
  conseils = [],
}: {
  accesRapide?: NavLink[]
  /** Deux articles au plus : au-delà, le menu devient une page d'accueil. */
  conseils?: ConseilResume[]
}) {
  const pathname = usePathname()
  // L'état retient la route sur laquelle le menu a été ouvert. Un changement
  // de route le referme donc par simple dérivation, sans effet qui remettrait
  // l'état à zéro après coup et provoquerait un rendu en cascade.
  const [etat, setEtat] = useState<{ label: string | null; chemin: string }>({ label: null, chemin: pathname })
  const ouvert = etat.chemin === pathname ? etat.label : null
  const setOuvert = (label: string | null) => setEtat({ label, chemin: pathname })
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Forme fonctionnelle : la fermeture ne dépend pas de la route courante,
    // l'écouteur reste donc posé une seule fois.
    const fermer = () => setEtat((e) => ({ ...e, label: null }))
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    const surClic = () => fermer()
    document.addEventListener('keydown', surTouche)
    document.addEventListener('click', surClic)
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.removeEventListener('click', surClic)
    }
  }, [])

  useEffect(() => () => { if (minuterie.current) clearTimeout(minuterie.current) }, [])

  // Le délai laisse traverser l'espace vide entre l'onglet et le popover sans
  // que le menu se referme sous le curseur.
  const entrer = (label: string) => {
    if (minuterie.current) clearTimeout(minuterie.current)
    setOuvert(label)
  }
  const sortir = () => {
    minuterie.current = setTimeout(() => setOuvert(null), DELAI_FERMETURE)
  }

  return (
    <nav aria-label="Navigation principale" className="relative hidden justify-self-center gap-1 md:flex">
      {mainNav.map((entry) => {
        const actif = estActif(entry, pathname)
        const estOuvert = ouvert === entry.label
        const mega = Boolean(entry.columns)
        return (
          <div
            key={entry.label}
            // Le méga-menu est centré sous la barre entière : son onglet reste
            // `static` pour que l'ancrage absolu se fasse sur le `nav`.
            className={mega ? 'static' : 'relative'}
            onMouseEnter={() => entrer(entry.label)}
            onMouseLeave={sortir}
          >
            <button
              type="button"
              aria-expanded={estOuvert}
              aria-haspopup="true"
              onClick={(e) => {
                e.stopPropagation()
                setOuvert(estOuvert ? null : entry.label)
              }}
              className={[
                'relative inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[15px] font-medium transition-colors',
                actif || estOuvert ? 'text-fg' : 'text-fg-2 hover:text-fg',
                estOuvert ? 'bg-bg-soft' : 'hover:bg-bg-soft',
                actif ? 'after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-fg' : '',
              ].join(' ')}
            >
              <NavIconSvg name={mainNavIcons[entry.label]} className="size-5" />
              {entry.label}
            </button>

            {estOuvert &&
              (mega ? (
                <MegaMenu entry={entry} accesRapide={accesRapide} />
              ) : entry.label === 'Conseils' && conseils.length > 0 ? (
                <MenuConseils entry={entry} conseils={conseils} />
              ) : (
                <MenuSimple entry={entry} />
              ))}
          </div>
        )
      })}
    </nav>
  )
}

/** Le popover ne doit pas se refermer quand on clique dedans avant de naviguer. */
const stopper = (e: React.MouseEvent) => e.stopPropagation()

function MenuSimple({ entry }: { entry: NavEntry }) {
  const [premier, ...suite] = entry.links ?? []
  if (!premier) return null
  return (
    <div
      role="menu"
      onClick={stopper}
      className="absolute left-1/2 top-[calc(100%+12px)] z-[55] min-w-[260px] -translate-x-1/2 rounded-[20px] border border-line bg-bg p-2 shadow-pop"
    >
      <Link
        role="menuitem"
        href={chemin(premier.href)}
        className="block rounded-xl px-4 py-3 text-[15px] font-semibold hover:bg-bg-soft"
      >
        {premier.label}
      </Link>
      <hr className="mx-2 my-1.5 border-line" />
      {suite.map((l) => (
        <Link
          key={l.href}
          role="menuitem"
          href={chemin(l.href)}
          className="block rounded-xl px-4 py-3 text-[15px] hover:bg-bg-soft"
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}

/**
 * Menu des conseils : rubriques à gauche, articles à droite.
 *
 * Le panneau montre ce qui vient d'être publié plutôt que la seule liste des
 * rubriques : sur un site dont le blog est jeune, une rubrique vide donne
 * l'impression d'un chantier, un article récent donne celle d'un site vivant.
 *
 * Les articles arrivent du serveur, déjà cachés avec le tag `wp:conseil` : le
 * menu ne déclenche aucune requête à l'ouverture.
 */
function MenuConseils({ entry, conseils }: { entry: NavEntry; conseils: ConseilResume[] }) {
  const [premier, ...rubriques] = entry.links ?? []
  const aLire = conseils.slice(0, 2)
  // Le panneau se dimensionne sur ce qu'il a à montrer : à un seul article, une
  // largeur de deux colonnes laisserait une moitié vide, qui se lit comme un
  // chargement raté plutôt que comme un blog jeune.
  const large = aLire.length > 1
  return (
    <div
      role="menu"
      onClick={stopper}
      className={[
        'absolute left-1/2 top-[calc(100%+12px)] z-[55] max-w-[calc(100vw-5rem)] -translate-x-1/2 overflow-hidden rounded-[20px] border border-line bg-bg shadow-pop',
        large ? 'w-[720px]' : 'w-[540px]',
      ].join(' ')}
    >
      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div>
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">
            Rubriques
          </h4>
          {rubriques.map((l) => (
            <Link
              key={l.href}
              role="menuitem"
              href={chemin(l.href)}
              className="block rounded-xl px-3 py-2.5 text-[15px] text-fg hover:bg-bg-soft"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">À lire</h4>
          <div className={`grid gap-3 ${large ? 'sm:grid-cols-2' : ''}`}>
            {aLire.map((c) => (
              <Link
                key={c.slug}
                role="menuitem"
                href={chemin(lienConseil(c))}
                className="group block rounded-xl border border-line p-4 hover:bg-bg-soft"
              >
                <Rubrique categorie={c.categorie} />
                <span className="mt-2 block text-sm font-semibold leading-snug text-fg group-hover:underline">
                  {c.titre}
                </span>
                {c.extrait && (
                  <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-fg-2">
                    {c.extrait}
                  </span>
                )}
                {c.tempsLecture && (
                  <span className="mt-2 block text-xs text-fg-2">{c.tempsLecture} min de lecture</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {premier && (
        <div className="border-t border-line bg-bg-soft px-6 py-3">
          <Link
            role="menuitem"
            href={chemin(premier.href)}
            className="text-sm font-semibold text-action hover:underline"
          >
            {premier.label}
          </Link>
        </div>
      )}
    </div>
  )
}

function MegaMenu({ entry, accesRapide }: { entry: NavEntry; accesRapide: NavLink[] }) {
  return (
    <div
      role="menu"
      onClick={stopper}
      className="absolute left-1/2 top-[calc(100%+12px)] z-[55] grid w-[920px] max-w-[calc(100vw-5rem)] -translate-x-1/2 grid-cols-4 gap-6 rounded-[20px] border border-line bg-bg p-6 shadow-pop"
    >
      {entry.columns?.map((col) => {
        const liens = col.dynamic === 'acces-rapide' ? accesRapide.slice(0, 5) : col.links
        return (
          <div key={col.title} className={col.highlight ? 'rounded-2xl bg-bg-soft px-1 py-3' : ''}>
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">{col.title}</h4>
            {col.note && <p className="mx-3 mb-2 text-[13px] leading-relaxed text-fg-2">{col.note}</p>}
            {liens.map((l) => (
              <Link
                key={l.href}
                role="menuitem"
                href={chemin(l.href)}
                className={[
                  'block rounded-xl px-3 py-2.5 text-[15px] hover:bg-bg-soft',
                  col.highlight ? 'font-semibold' : '',
                ].join(' ')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}
