'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { chemin, mainNav, mainNavIcons, type NavColumn, type NavEntry } from '@/lib/navigation'
import { lienConseil, Rubrique } from '@/components/conseils/primitives'
import type { ConseilResume } from '@/lib/wp/queries'
import { Deroulant } from './deroulant'
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
  conseils = [],
}: {
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

            <Deroulant ouvert={estOuvert} className="absolute left-1/2 top-[calc(100%+12px)] z-[55] -translate-x-1/2">
              {mega ? (
                <MegaMenu entry={entry} />
              ) : entry.label === 'Ressources' && conseils.length > 0 ? (
                <MenuConseils entry={entry} conseils={conseils} />
              ) : (
                <MenuSimple entry={entry} />
              )}
            </Deroulant>
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
      className="min-w-[260px] rounded-[20px] border border-line bg-bg p-2 shadow-pop"
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
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-[15px] hover:bg-bg-soft"
        >
          <span className={`whitespace-nowrap ${l.badge ? 'text-fg-2' : ''}`}>{l.label}</span>
          {l.badge && <Etiquette>{l.badge}</Etiquette>}
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
        'max-w-[calc(100vw-5rem)] overflow-hidden rounded-[20px] border border-line bg-bg shadow-pop',
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

function MegaMenu({ entry }: { entry: NavEntry }) {
  return (
    <div
      role="menu"
      onClick={stopper}
      // Quatre colonnes sur une seule rangée : les trois familles de
      // praticiens, les principales recherches, puis la méthode en encart. Le
      // panneau reste contenu dans l'écran sur les portables.
      className="grid w-[980px] max-w-[calc(100vw-4rem)] grid-cols-4 gap-5 rounded-[20px] border border-line bg-bg p-6 shadow-pop"
    >
      {entry.columns?.map((col) => {
        if (col.promo) return <Encart key={col.title} promo={col.promo} />
        const liens = col.links
        return (
          <div key={col.title} className={col.highlight ? 'self-start rounded-2xl bg-bg-soft px-1 py-3' : ''}>
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

/**
 * L'encart d'un produit de la maison, en carte sombre à la place d'une
 * colonne de liens : un seul lien, externe, qui ouvre dans un nouvel onglet.
 */
function Encart({ promo }: { promo: NonNullable<NavColumn['promo']> }) {
  return (
    <a
      role="menuitem"
      href={promo.href}
      target="_blank"
      rel="noopener"
      className="group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl bg-fg p-5 text-bg"
    >
      {/* Une lueur sarcelle dans l'angle : l'encart se distingue des colonnes sans crier. */}
      <span aria-hidden className="absolute -right-12 -top-12 -z-10 size-44 rounded-full bg-teal/50 blur-3xl transition-transform duration-slow ease-lift group-hover:scale-125" />
      <span aria-hidden className="absolute -bottom-16 -left-10 -z-10 size-40 rounded-full bg-teal/25 blur-3xl" />
      <div>
        <span className="inline-flex rounded-full bg-bg/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[.06em] text-bg/80 ring-1 ring-inset ring-bg/20">
          {promo.surtitre}
        </span>
        <p className="mt-3 text-xl font-semibold tracking-tight">{promo.titre}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-bg/70">{promo.texte}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
        {promo.cta}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4 transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden>
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </span>
    </a>
  )
}

/** Étiquette discrète d'un lien de menu : une rubrique annoncée, pas encore remplie. */
function Etiquette({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 rounded-full bg-bg-soft text-fg-2 ring-1 ring-inset ring-line px-2 py-0.5 text-[11px] font-medium">{children}</span>
}
