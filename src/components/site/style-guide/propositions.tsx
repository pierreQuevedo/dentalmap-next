'use client'

import { Verification } from '@/components/annuaire/primitives'
import { useThemeSombre } from './jetons'

/**
 * Palettes candidates, comparées sur une même composition.
 *
 * Les valeurs sont appliquées en variables CSS sur le conteneur : les
 * composants dessous sont les vrais, écrits en `bg-brand` et `text-fg`, et
 * changent de couleur sans être modifiés. C'est aussi la démonstration que la
 * couche sémantique tient : une charte se change en neuf lignes.
 */
type Teintes = { brand: string; hover: string; foreground: string }

type Palette = {
  id: string
  nom: string
  argument: string
  clair: Teintes
  sombre: Teintes
}

export const PALETTES: Palette[] = [
  {
    id: 'ardoise',
    nom: 'Ardoise',
    argument:
      'L’accent ne cherche pas à être vu. Le vert de vérification devient la seule couleur saturée de la page, donc la seule information portée par la couleur.',
    clair: { brand: '#2c3e48', hover: '#1f2d35', foreground: '#ffffff' },
    sombre: { brand: '#d5dde2', hover: '#ffffff', foreground: '#15191c' },
  },
  {
    id: 'encre',
    nom: 'Bleu encre',
    argument:
      'Le bleu des administrations, plus sombre et plus saturé que le bleu santé écarté au départ. Il rappelle d’où viennent les données, sans entrer en concurrence avec le vert.',
    clair: { brand: '#14304a', hover: '#0d2035', foreground: '#ffffff' },
    sombre: { brand: '#a8c4e0', hover: '#d6e4f2', foreground: '#0d2035' },
  },
  {
    id: 'teal',
    nom: 'Teal vega, l’actuelle',
    argument:
      'Le bouton et le badge de vérification partagent la même famille de couleur : le lecteur ne sait plus laquelle porte une information. C’est aussi la couleur des blouses sur toutes les photos de cabinet.',
    clair: { brand: '#00786f', hover: '#005f5a', foreground: '#f0fdfa' },
    sombre: { brand: '#00bba7', hover: '#46edd5', foreground: '#10312e' },
  },
]

function Composition() {
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-fg">Dr Adrien Abballe</p>
          <p className="text-sm text-fg-2">33000 Bordeaux</p>
        </div>
        <Verification statut="verifie" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
          Voir la fiche
        </span>
        <span className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">
          Appeler
        </span>
        <span aria-current="page" className="rounded bg-brand px-3 py-1.5 text-sm text-brand-foreground">
          2
        </span>
        <span className="rounded border border-line-strong px-3 py-1.5 text-sm text-fg">3</span>
      </div>
      <p className="text-sm text-fg-2">
        Classement par distance puis par ordre alphabétique.{' '}
        <span className="font-medium text-brand">La place ne s’achète pas.</span>
      </p>
    </div>
  )
}

function Pastille({ couleur, titre }: { couleur: string; titre: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="size-5 rounded-full border border-line-strong"
        style={{ backgroundColor: couleur }}
      />
      <span className="font-mono text-xs text-fg-2" title={titre}>
        {couleur}
      </span>
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
            // Les variables sont posées ici : tout ce qui est dessous s'y plie,
            // sans qu'aucun composant ne sache qu'il est dans un comparateur.
            style={
              {
                '--brand': t.brand,
                '--brand-hover': t.hover,
                '--brand-foreground': t.foreground,
              } as React.CSSProperties
            }
            className="grid gap-5 rounded-2xl border border-line p-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8"
          >
            <div>
              <h3 className="font-semibold text-fg">{p.nom}</h3>
              <div className="mt-2 flex flex-wrap gap-3">
                <Pastille couleur={t.brand} titre="accent" />
                <Pastille couleur={t.hover} titre="accent au survol" />
                <Pastille couleur={t.foreground} titre="texte sur l’accent" />
              </div>
              <p className="mt-3 text-sm text-fg-2">{p.argument}</p>
            </div>
            <Composition />
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
      <p className="mt-2 font-semibold text-fg">L’ardoise, et le vert réservé à la vérification.</p>
      <div className="mt-3 space-y-3 text-sm text-fg-2">
        <p>
          DentalMap ne vend rien et ne met personne en avant. Sa seule promesse est que chaque fiche
          a été confrontée à un registre. Cette promesse se lit dans un badge vert. Si l’accent du
          site est lui aussi vert-bleu, la page compte deux verts qui ne disent pas la même chose :
          l’un informe, l’autre décore. Un lecteur pressé ne fait pas le tri.
        </p>
        <p>
          L’ardoise règle la question en ne prétendant à rien. Les boutons restent visibles, les
          titres portent, et la seule tache de couleur de la page est celle qui veut dire quelque
          chose. C’est aussi la couleur du cahier des charges initial, écartée par le style vega
          plutôt que par une décision.
        </p>
        <p>
          Le bleu encre est le second choix défendable : il évoque les registres publics et laisse
          le vert tranquille. Il engage davantage, car il colore l’identité au lieu de s’effacer.
        </p>
        <p className="text-fg">
          Si vous tenez au teal, alors il faut retirer la couleur des badges de vérification et les
          passer en gris avec une icône. Ce que je ne recommande pas : garder les deux.
        </p>
      </div>
    </div>
  )
}
