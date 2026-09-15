'use client'

import { Verification } from '@/components/annuaire/primitives'
import { NavIconSvg, SearchIcon } from '@/components/site/nav-icon'
import { useThemeSombre } from './jetons'

/**
 * Palettes candidates, comparées sur une même vitrine.
 *
 * Les valeurs sont appliquées en variables CSS sur le conteneur : les
 * composants dessous sont les vrais, écrits en `bg-brand` et `text-fg`, et
 * changent d'habit sans être modifiés. C'est aussi la démonstration que la
 * couche sémantique tient : une charte se change en une quinzaine de lignes.
 *
 * Chaque proposition fait varier le fond autant que l'accent. Une charte ne se
 * juge pas sur la couleur des boutons : le papier, l'écart entre le texte
 * principal et le secondaire, et la discrétion des filets pèsent davantage
 * dans l'impression de soin.
 */
type Teintes = {
  bg: string
  bgSoft: string
  fg: string
  fg2: string
  line: string
  lineStrong: string
  brand: string
  brandHover: string
  brandFg: string
  /** Ornement rare : soulignement d'onglet, liseré de pagination. */
  ornement?: string
}

type Palette = {
  id: string
  nom: string
  tenue: string
  argument: string
  clair: Teintes
  sombre: Teintes
}

export const PALETTES: Palette[] = [
  {
    id: 'classique',
    nom: 'Ardoise classique',
    tenue: 'Le cahier des charges initial',
    argument:
      'Ardoise bleutée sur blanc franc. Sobre et sans risque, mais c’est aussi le réglage par défaut de la moitié des annuaires professionnels : rien dans la page ne dit que quelqu’un s’en est occupé.',
    clair: {
      bg: '#ffffff', bgSoft: '#f4f6f7', fg: '#222629', fg2: '#6b7378',
      line: '#dfe3e6', lineStrong: '#c9cfd3',
      brand: '#2c3e48', brandHover: '#1f2d35', brandFg: '#ffffff',
    },
    sombre: {
      bg: '#15191c', bgSoft: '#1d2226', fg: '#eceff1', fg2: '#9aa5ac',
      line: '#2c3338', lineStrong: '#3a434a',
      brand: '#d5dde2', brandHover: '#ffffff', brandFg: '#15191c',
    },
  },
  {
    id: 'ivoire',
    nom: 'Ardoise sur ivoire',
    tenue: 'Recommandée',
    argument:
      'Même encre, autre papier. Le blanc franc est la couleur par défaut de tout ce qui n’a pas été décidé ; un ivoire chaud se remarque avant l’accent et pose le ton. Les filets s’adoucissent, les photos de cabinet s’y posent mieux, et rien ne brille.',
    clair: {
      bg: '#faf8f5', bgSoft: '#f2eee7', fg: '#1f2428', fg2: '#6f6a62',
      line: '#e6e0d6', lineStrong: '#d2cabd',
      brand: '#2b3a42', brandHover: '#1b262c', brandFg: '#faf8f5',
    },
    sombre: {
      bg: '#14120f', bgSoft: '#1c1915', fg: '#f5f0e8', fg2: '#a79e90',
      line: '#2a251e', lineStrong: '#3a332a',
      brand: '#e8dfd2', brandHover: '#ffffff', brandFg: '#14120f',
    },
  },
  {
    id: 'profonde',
    nom: 'Ardoise profonde',
    tenue: 'La plus contrastée',
    argument:
      'Encre presque noire, filets à peine visibles, aucun gris moyen. Le luxe y est celui de l’écart : le texte tape fort, tout le reste se tait. Exigeant, parce que la moindre approximation de composition se voit.',
    clair: {
      bg: '#ffffff', bgSoft: '#f3f5f6', fg: '#101418', fg2: '#5d666d',
      line: '#e3e7ea', lineStrong: '#c4ccd1',
      brand: '#16222b', brandHover: '#0a1116', brandFg: '#ffffff',
    },
    sombre: {
      bg: '#0e1317', bgSoft: '#161c21', fg: '#f2f5f7', fg2: '#93a0a8',
      line: '#232b31', lineStrong: '#36414a',
      brand: '#cbd6de', brandHover: '#ffffff', brandFg: '#0e1317',
    },
  },
  {
    id: 'taupe',
    nom: 'Ardoise chaude',
    tenue: 'La plus éditoriale',
    argument:
      'L’ardoise glisse vers le taupe, le gris perd son côté acier. Chaleureux sans être mou, c’est le registre des maisons qui vendent du soin plutôt que de la technique. À surveiller : le vert de vérification y ressort davantage, ce qui est ici une qualité.',
    clair: {
      bg: '#fbfaf8', bgSoft: '#f3f0ec', fg: '#221f1c', fg2: '#726c64',
      line: '#e6e2db', lineStrong: '#d0cac0',
      brand: '#3a3733', brandHover: '#26241f', brandFg: '#fbfaf8',
    },
    sombre: {
      bg: '#141311', bgSoft: '#1c1a17', fg: '#f3f1ed', fg2: '#a8a29a',
      line: '#2a2723', lineStrong: '#3a352f',
      brand: '#e3ded6', brandHover: '#ffffff', brandFg: '#141311',
    },
  },
  {
    id: 'laiton',
    nom: 'Ardoise et laiton',
    tenue: 'La plus signée',
    argument:
      'Ardoise partout, et un laiton pour les seuls ornements : soulignement de l’onglet actif, liseré de la page courante. Jamais sur un bouton, jamais sur un badge. Une couleur qui n’apparaît que trois fois par page se remarque plus qu’un aplat.',
    clair: {
      bg: '#ffffff', bgSoft: '#f5f6f7', fg: '#1a2026', fg2: '#646d74',
      line: '#e2e6e9', lineStrong: '#c8cfd4',
      brand: '#23323c', brandHover: '#141f27', brandFg: '#ffffff',
      ornement: '#a8812f',
    },
    sombre: {
      bg: '#101418', bgSoft: '#171c21', fg: '#edf1f4', fg2: '#97a2ab',
      line: '#242b31', lineStrong: '#343e46',
      brand: '#c9d4dc', brandHover: '#ffffff', brandFg: '#101418',
      ornement: '#d9b25c',
    },
  },
  {
    id: 'teal',
    nom: 'Teal vega, l’actuelle',
    tenue: 'Pour mémoire',
    argument:
      'Le bouton et le badge de vérification partagent la même famille de couleur : le lecteur ne sait plus laquelle porte une information. C’est aussi la couleur des blouses sur toutes les photos de cabinet.',
    clair: {
      bg: '#ffffff', bgSoft: '#f5f5f5', fg: '#0a0a0a', fg2: '#737373',
      line: '#e5e5e5', lineStrong: '#cecece',
      brand: '#00786f', brandHover: '#005f5a', brandFg: '#f0fdfa',
    },
    sombre: {
      bg: '#0a0a0a', bgSoft: '#1c1c1c', fg: '#fafafa', fg2: '#a1a1a1',
      line: '#2a2a2a', lineStrong: '#3a3a3a',
      brand: '#00bba7', brandHover: '#46edd5', brandFg: '#10312e',
    },
  },
]

function variables(t: Teintes): React.CSSProperties {
  return {
    '--bg': t.bg,
    '--bg-soft': t.bgSoft,
    '--fg': t.fg,
    '--fg-2': t.fg2,
    '--line': t.line,
    '--line-strong': t.lineStrong,
    '--brand': t.brand,
    '--brand-hover': t.brandHover,
    '--brand-foreground': t.brandFg,
  } as React.CSSProperties
}

/**
 * Vitrine : barre, fiche, actions, pied. Assez d'éléments pour juger une
 * charte, pas assez pour que la page du guide devienne illisible.
 */
function Vitrine({ ornement }: { ornement?: string }) {
  const trait = ornement ?? 'var(--fg)'
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-bg">
      <div className="flex items-center gap-4 border-b border-line px-4 py-3">
        <span className="inline-flex items-center gap-2 font-bold tracking-tight text-brand">
          <span aria-hidden className="size-4 rounded bg-brand" />
          DentalMap
        </span>
        <span className="relative inline-flex items-center gap-1.5 text-sm font-medium text-fg">
          <NavIconSvg name="map" className="size-4" />
          Annuaire
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-1 h-0.5 rounded"
            style={{ backgroundColor: trait }}
          />
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-fg-2">
          <NavIconSvg name="article" className="size-4" />
          Conseils
        </span>
        <span className="ml-auto text-fg-2">
          <SearchIcon className="size-4" />
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-fg">Dr Adrien Abballe</p>
            <p className="text-sm text-fg-2">128 rue Fondaudège, 33000 Bordeaux</p>
          </div>
          <Verification statut="verifie" />
        </div>

        <div className="flex items-baseline justify-between gap-4 border-b border-line py-2">
          <span className="text-fg">Dr Lina Abdeddaim</span>
          <span className="text-sm tabular-nums text-fg-2">784 m</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
            Voir la fiche
          </span>
          <span className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">
            Appeler
          </span>
          <span
            aria-current="page"
            className="rounded border px-3 py-1.5 text-sm text-fg"
            style={{ borderColor: trait }}
          >
            2
          </span>
          <span className="rounded border border-line-strong px-3 py-1.5 text-sm text-fg-2">3</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-bg-soft px-4 py-3 text-xs text-fg-2">
        <span>Classement par distance puis par ordre alphabétique.</span>
        <span className="inline-flex gap-1.5">
          <span className="rounded-full border border-line-strong px-2 py-0.5">ANS · RPPS</span>
          <span className="rounded-full border border-line-strong px-2 py-0.5">INSEE · Sirene</span>
        </span>
      </div>
    </div>
  )
}

function Pastille({ couleur, titre }: { couleur: string; titre: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={titre}>
      <span
        aria-hidden
        className="size-4 rounded-full border border-line-strong"
        style={{ backgroundColor: couleur }}
      />
      <span className="font-mono text-[11px] text-fg-2">{couleur}</span>
    </span>
  )
}

export function Propositions() {
  const sombre = useThemeSombre()
  return (
    <div className="space-y-5">
      {PALETTES.map((p) => {
        const t = sombre ? p.sombre : p.clair
        return (
          <div
            key={p.id}
            className="grid gap-5 rounded-2xl border border-line p-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8"
          >
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-base font-semibold text-fg">{p.nom}</h3>
                <span className="text-xs uppercase tracking-[.06em] text-fg-2">{p.tenue}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <Pastille couleur={t.bg} titre="fond" />
                <Pastille couleur={t.fg} titre="texte" />
                <Pastille couleur={t.line} titre="filets" />
                <Pastille couleur={t.brand} titre="accent" />
                {t.ornement && <Pastille couleur={t.ornement} titre="ornement" />}
              </div>
              <p className="mt-3 text-sm text-fg-2">{p.argument}</p>
            </div>

            {/* Les variables sont posées ici : tout ce qui est dessous s'y plie,
                sans qu'aucun composant ne sache qu'il est dans un comparateur. */}
            <div style={variables(t)}>
              <Vitrine ornement={t.ornement} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Recommandation() {
  return (
    <div className="rounded-2xl border border-line bg-bg-soft p-5">
      <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">Ce que je recommande</p>
      <p className="mt-2 font-semibold text-fg">
        L’ardoise sur ivoire, et le vert réservé à la vérification.
      </p>
      <div className="mt-3 space-y-3 text-sm text-fg-2">
        <p>
          DentalMap ne vend rien et ne met personne en avant. Sa seule promesse est que chaque fiche
          a été confrontée à un registre, et cette promesse se lit dans un badge vert. Si l’accent
          du site est lui aussi vert-bleu, la page compte deux verts qui ne disent pas la même
          chose : l’un informe, l’autre décore. C’est ce qui condamne le teal, quelle que soit sa
          beauté.
        </p>
        <p className="text-fg">
          Reste à choisir l’ardoise. Le soin ne se lit pas dans l’accent, qui n’occupe jamais plus
          de deux pour cent d’une page d’annuaire : il se lit dans le fond, dans l’écart entre le
          texte principal et le secondaire, et dans la discrétion des filets. C’est pourquoi je
          ferais porter la décision sur le papier plutôt que sur l’encre.
        </p>
        <p>
          L’ivoire tient cette promesse au meilleur prix. Le blanc franc est la couleur de ce qu’on
          n’a pas décidé ; un fond légèrement chaud se remarque avant tout le reste, adoucit les
          filets, et accueille mieux les photos de cabinet, toutes prises sous néon. La profonde
          vise le même effet par l’écart de contraste, mais elle ne pardonne aucune approximation de
          composition. La chaude est la même idée poussée vers le taupe, plus tendre, moins
          institutionnelle. Le laiton est la seule qui signe vraiment, et c’est aussi la seule qui
          se démode.
        </p>
        <p>
          Aucune ne demande de travail : la couche sémantique fait que changer de proposition tient
          en une quinzaine de lignes, sans toucher un composant.
        </p>
      </div>
    </div>
  )
}
