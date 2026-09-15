'use client'

import { Verification } from '@/components/annuaire/primitives'
import { mesurer, TEALS, type Teal } from '@/lib/teals'
import { useThemeSombre } from './jetons'

/**
 * Comparateur des candidats à la couleur d'action.
 *
 * Chaque carte applique son teal en variables CSS : les éléments dessous sont
 * les vrais, et ne savent pas qu'ils servent d'échantillon. Les rapports sont
 * calculés avec la même formule que le script de design, pas recopiés.
 */
function Etiquette({ niveau }: { niveau: 'AAA' | 'AA' | null }) {
  if (!niveau) {
    return (
      <span className="rounded-full bg-partiel-bg px-2 py-0.5 text-xs font-semibold text-partiel ring-1 ring-inset ring-partiel-line">
        échec
      </span>
    )
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        niveau === 'AAA' ? 'bg-action text-action-foreground ring-transparent' : 'bg-bg-soft text-fg ring-line'
      }`}
    >
      {niveau}
    </span>
  )
}

function Carte({ teal, sombre }: { teal: Teal; sombre: boolean }) {
  const mesures = mesurer(teal, sombre)
  const base = sombre ? teal.sombre : teal.clair
  const survol = sombre ? teal.sombreSurvol : teal.clairSurvol
  const texte = sombre ? '#0e1317' : '#ffffff'

  return (
    <div className="grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-fg">{teal.nom}</h3>
          <Etiquette niveau={mesures.bouton.niveau} />
        </div>
        <p className="mt-1 text-sm text-fg-2">{teal.tenue}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-2">
          <span>{base}</span>
          <span>survol {survol}</span>
        </div>

        <dl className="mt-3 space-y-1 text-xs text-fg-2">
          <div className="flex gap-2">
            <dt>Libellé sur le bouton</dt>
            <dd className="font-semibold tabular-nums text-fg">
              {mesures.bouton.rapport.toFixed(2)}:1
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>Au survol</dt>
            <dd className="font-semibold tabular-nums text-fg">
              {mesures.survol.rapport.toFixed(2)}:1
            </dd>
          </div>
        </dl>
      </div>

      <div
        style={
          {
            '--action': base,
            '--action-hover': survol,
            '--action-foreground': texte,
          } as React.CSSProperties
        }
        className="w-full space-y-3 rounded-xl border border-line p-4 sm:w-72"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-fg">Dr Adrien Abballe</span>
          <Verification statut="verifie" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-action px-4 py-2 text-sm font-semibold text-action-foreground">
            Voir la fiche
          </span>
          <span className="rounded-full bg-action-hover px-4 py-2 text-sm font-semibold text-action-foreground">
            Au survol
          </span>
        </div>
        <p className="text-xs text-fg-2">
          Classement par distance. <span className="font-medium text-action">En savoir plus</span>
        </p>
      </div>
    </div>
  )
}

export function ComparateurTeals() {
  const sombre = useThemeSombre()
  const aa = TEALS.filter((t) => mesurer(t, false).bouton.niveau === 'AA')
  const aaa = TEALS.filter((t) => mesurer(t, false).bouton.niveau === 'AAA')

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[.06em] text-fg-2">
          Tiennent AA, de 4,5 à 7
        </h3>
        <p className="mt-1 mb-4 max-w-2xl text-sm text-fg-2">
          Le teal reste lumineux et se distingue nettement de l’encre. C’est le registre d’Apple, qui
          accepte 4,70 sur son propre bouton.
        </p>
        <div className="space-y-4">
          {aa.map((t) => (
            <Carte key={t.id} teal={t} sombre={sombre} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[.06em] text-fg-2">
          Tiennent AAA, au-delà de 7
        </h3>
        <p className="mt-1 mb-4 max-w-2xl text-sm text-fg-2">
          Lisibles dans toutes les conditions, y compris à l’écran d’un cabinet en plein jour. Le
          prix à payer est la vivacité : plus le rapport monte, plus le teal se rapproche de l’encre,
          et moins le bouton se détache du reste de la page.
        </p>
        <div className="space-y-4">
          {aaa.map((t) => (
            <Carte key={t.id} teal={t} sombre={sombre} />
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-line bg-bg-soft p-5">
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">Ce que je recommande</p>
        <p className="mt-2 font-semibold text-fg">Le teal sapin, 6,62:1.</p>
        <div className="mt-3 space-y-3 text-sm text-fg-2">
          <p>
            Il passe AA très largement, il est à un cheveu de AAA, et il reste assez vif pour qu’un
            bouton se voie du premier coup d’œil. Les trois AAA sont irréprochables sur le papier,
            mais à 8 ou 9 de rapport le teal vire à l’encre foncée : le bouton cesse d’attirer l’œil,
            et une couleur d’action qui ne se remarque pas ne remplit plus son office.
          </p>
          <p>
            Si l’accessibilité prime sur tout, alors le teal encre est le bon choix : c’est le plus
            lumineux des AAA, et l’écart avec le sapin se voit à peine. Les deux autres AAA
            s’éloignent de la famille, l’un vers le vert, l’autre vers le bleu déjà réservé à la
            carte.
          </p>
          <p className="text-fg">
            À noter : le texte courant du site est à 16,18:1 et dépasse AAA partout. Le seul endroit
            où le seuil se joue, c’est le libellé blanc sur le bouton.
          </p>
        </div>
      </div>
    </div>
  )
}
