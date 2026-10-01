import { Fragment, Suspense } from 'react'
import { getTotalProfession } from '@/lib/annuaire/queries'
import { CarteDecor, Marqueur } from './carte-decor'
import { CartesApercu } from './cartes-apercu'
import { HeroScene } from './hero-scene'
import { RechercheUniverselle } from './recherche-universelle'

/**
 * Hero de l'accueil.
 *
 * Une seule action : le champ. Tout le reste de la section sert à répondre aux
 * deux questions qu'un visiteur se pose en arrivant, « est-ce que ma recherche
 * est possible ici » et « à quoi ressemble un résultat », auxquelles la forme
 * répond plus vite qu'un paragraphe.
 *
 * Composition en couches : le fond de carte et les marqueurs au-dessous, le
 * voile de lisibilité au milieu, le contenu au-dessus. Le voile n'est pas une
 * coquetterie, c'est ce qui garantit le contraste du titre quel que soit
 * l'endroit de la trame qui tombe derrière lui.
 *
 * Tout le balisage est rendu par le serveur. Deux îlots clients seulement : le
 * champ de recherche, et `HeroScene`, qui n'émet rien et se contente d'animer.
 */
const TITRE = ['Trouvez', 'un', 'dentiste,', 'un', 'laboratoire,', 'une', 'école', 'ou', 'une', 'formation.']

/*
 * Marqueurs du fond de carte, en pourcentage de la section.
 *
 * Ils ne correspondent à aucune carte d'exemple : la correspondance serait
 * invisible et obligerait à poser des marqueurs sous la pile de cartes, où
 * personne ne les verrait. Ils sont donc placés dans les deux couloirs que la
 * mise en page laisse libres, entre la colonne de texte et les cartes, et à
 * droite de celles-ci.
 */
const MARQUEURS = [
  { x: 57, y: 27 },
  { x: 94, y: 45 },
  { x: 58, y: 83 },
  { x: 91, y: 90 },
]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <HeroScene>
        <div data-hero="decor" className="pointer-events-none absolute inset-0 -z-10">
          {/* Le plan déborde du cadre : la dérive lente ne doit jamais découvrir un bord. */}
          <div data-hero="decor-plan" className="absolute -inset-[7%]">
            <CarteDecor />
          </div>

          {/*
            Deux voiles. Le premier tient le contraste du texte à gauche, le
            second raccorde le bas de la section au fond de la page pour que la
            trame ne s'arrête pas sur une ligne nette.
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/88 to-bg/20 lg:via-bg/65 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

          {MARQUEURS.map((m, i) => (
            <span
              key={i}
              data-hero="marqueur"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              className="absolute hidden -translate-x-1/2 -translate-y-full lg:block"
            >
              <Marqueur actif={i === 0} />
            </span>
          ))}
        </div>

        <div className="mx-auto flex max-w-[1128px] flex-col gap-12 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:py-24">
          <div className="max-w-xl lg:flex-1">
            <p
              data-hero="eyebrow"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.08em] text-fg-2"
            >
              <span aria-hidden className="size-1.5 rounded-full bg-geo" />
              Annuaire vérifié par les registres officiels
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-fg sm:text-5xl lg:text-[3.35rem]">
              {/*
                Chaque mot est enfermé dans son propre masque, d'où il monte.
                Le retrait bas compensé par une marge négative laisse la place
                aux jambages sans décaler la ligne de base.
              */}
              {TITRE.map((mot, i) => (
                <Fragment key={i}>
                  <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                    <span data-hero="mot" className="inline-block">
                      {mot}
                    </span>
                  </span>
                  {i < TITRE.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </h1>

            <p data-hero="sous" className="mt-5 text-lg leading-relaxed text-fg-2">
              Les fiches sont construites depuis l’Annuaire Santé et le répertoire Sirene, jamais depuis une
              inscription.
            </p>

            <div data-hero="recherche" className="mt-8">
              <RechercheUniverselle />
            </div>

            {/*
              La cible de l'animation est ce conteneur, pas la ligne de
              chiffres : celle-ci arrive en flux et s'hydrate après le reste.
              GSAP, qui pose des styles en ligne au montage, aurait écrit sur un
              sous-arbre que React s'apprêtait encore à réconcilier.
            */}
            <div data-hero="preuve">
              <Suspense fallback={<SqueletteChiffres />}>
                <ChiffresHero />
              </Suspense>
            </div>
          </div>

          <CartesApercu />
        </div>
      </HeroScene>
    </section>
  )
}

/**
 * La ligne de preuve, avec les totaux réels.
 *
 * Elle est sous `Suspense` et non dans le corps du hero : le titre et le champ
 * doivent s'afficher sans attendre Postgres. La requête est déjà cachée avec
 * le profil `listing`, donc en pratique elle ne coûte rien, mais la page ne
 * doit pas en dépendre pour peindre.
 */
async function ChiffresHero() {
  const [dentistes, prothesistes] = await Promise.all([
    getTotalProfession('dentiste'),
    getTotalProfession('prothesiste'),
  ])
  const nombre = (n: number) => n.toLocaleString('fr-FR')

  return (
    <p className="mt-7 flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2 sm:min-h-6">
      <span className="font-semibold tabular-nums text-fg">{nombre(dentistes.total)}</span>
      chirurgiens-dentistes
      <span aria-hidden className="text-line-strong">
        ·
      </span>
      <span className="font-semibold tabular-nums text-fg">{nombre(prothesistes.total)}</span>
      laboratoires
      <span aria-hidden className="text-line-strong">
        ·
      </span>
      <span className="font-semibold tabular-nums text-fg">{nombre(dentistes.communes)}</span>
      communes
    </p>
  )
}

/** Même hauteur exacte que la ligne finale : la section ne bouge pas en arrivant. */
function SqueletteChiffres() {
  return (
    <p className="mt-7 flex min-h-12 items-center sm:min-h-6" aria-hidden>
      <span className="h-3.5 w-72 max-w-full animate-pulse rounded-full bg-line" />
    </p>
  )
}
