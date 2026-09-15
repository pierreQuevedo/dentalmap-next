import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FilAriane, Verification } from '@/components/annuaire/primitives'
import { ThemeToggle } from '@/components/site/theme-toggle'
import { NavIconSvg, SearchIcon } from '@/components/site/nav-icon'
import { Jeton, Mesure } from './jetons'

export function Section({
  id,
  titre,
  intro,
  children,
}: {
  id: string
  titre: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight text-fg">{titre}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm text-fg-2">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Grille({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function Exemple({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">{titre}</h3>
      {children}
    </div>
  )
}

export function Couleurs() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-fg">Couche DentalMap</h3>
        <p className="mb-4 max-w-2xl text-sm text-fg-2">
          Les noms écrits dans les composants. Ce sont des alias de la palette ci-dessous : changer
          de charte se fait ici, sans reprendre les fichiers un par un.
        </p>
        <Grille>
          <Jeton nom="bg" classe="bg-bg" bordure note="bg-bg, fond des pages" />
          <Jeton nom="bg-soft" classe="bg-bg-soft" bordure note="bg-bg-soft, fond adouci" />
          <Jeton nom="fg" classe="bg-fg" note="text-fg, texte principal" />
          <Jeton nom="fg-2" classe="bg-fg-2" note="text-fg-2, texte secondaire" />
          <Jeton nom="line" classe="bg-line" bordure note="border-line, filets" />
          <Jeton nom="line-strong" classe="bg-line-strong" note="border-line-strong, filets appuyés" />
          <Jeton nom="brand" classe="bg-brand" note="bg-brand, accent" />
          <Jeton nom="brand-hover" classe="bg-brand-hover" note="hover:bg-brand-hover" />
          <Jeton nom="brand-foreground" classe="bg-brand-foreground" bordure note="text-brand-foreground, sur l'accent" />
        </Grille>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-fg">Palette vega</h3>
        <p className="mb-4 max-w-2xl text-sm text-fg-2">
          Les rôles attendus par les composants shadcn. Le site n’y touche pas directement, sauf
          pour les graphiques et les états d’erreur.
        </p>
        <Grille>
          <Jeton nom="background" classe="bg-background" bordure />
          <Jeton nom="foreground" classe="bg-foreground" />
          <Jeton nom="primary" classe="bg-primary" />
          <Jeton nom="primary-foreground" classe="bg-primary-foreground" bordure />
          <Jeton nom="secondary" classe="bg-secondary" bordure />
          <Jeton nom="muted" classe="bg-muted" bordure />
          <Jeton nom="muted-foreground" classe="bg-muted-foreground" />
          <Jeton nom="accent" classe="bg-accent" bordure />
          <Jeton nom="destructive" classe="bg-destructive" note="erreurs uniquement" />
          <Jeton nom="border" classe="bg-border" bordure />
          <Jeton nom="ring" classe="bg-ring" note="anneau de focus" />
          <Jeton nom="card" classe="bg-card" bordure />
        </Grille>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-fg">Graphiques</h3>
        <p className="mb-4 max-w-2xl text-sm text-fg-2">
          Rampe de cinq teintes, du plus clair au plus foncé. Elle sert aux visualisations, et c’est
          elle qui fournit l’accent inversé du mode sombre.
        </p>
        <Grille>
          <Jeton nom="chart-1" classe="bg-chart-1" />
          <Jeton nom="chart-2" classe="bg-chart-2" />
          <Jeton nom="chart-3" classe="bg-chart-3" />
          <Jeton nom="chart-4" classe="bg-chart-4" />
          <Jeton nom="chart-5" classe="bg-chart-5" />
        </Grille>
      </div>
    </div>
  )
}

export function Typographie() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line p-6">
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">Figtree, une seule famille</p>
        <p className="mt-3 text-fg">
          Le style vega prévoit trois polices. Le site n’en charge qu’une : titres, corps et
          monospace pointent sur Figtree, chargée par next/font.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-line p-6">
        <h1 className="text-fg">Titre 1, 2,25 rem</h1>
        <h2 className="text-fg">Titre 2, 1,875 rem</h2>
        <h3 className="text-fg">Titre 3, 1,5 rem</h3>
        <h4 className="text-fg">Titre 4, 1,25 rem</h4>
        <h5 className="text-fg">Titre 5, 1,125 rem</h5>
        <h6 className="text-fg">Titre 6, 1 rem</h6>
        <hr className="border-line" />
        <p className="text-fg">
          Corps de texte, interligne 1,6. Les fiches sont construites à partir des registres
          publics, pas de déclarations : c’est ce que le lecteur doit comprendre d’un coup d’œil.
        </p>
        <p className="text-sm text-fg-2">
          Texte secondaire, 0,875 rem. Sert aux mentions de source et aux compléments.
        </p>
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">
          Intertitre de colonne, 0,75 rem, capitales espacées
        </p>
        <p className="tabular-nums text-fg">
          Chiffres tabulaires : 64 440 praticiens, 3 061 laboratoires, 1 659 en Rhône
        </p>
      </div>
    </div>
  )
}

export function Formes() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Exemple titre="Rayons">
        <div className="space-y-4">
          <Mesure nom="radius-sm" apercu={<span className="size-11 shrink-0 rounded-sm bg-bg-soft ring-1 ring-line-strong" />} />
          <Mesure nom="radius-md" apercu={<span className="size-11 shrink-0 rounded-md bg-bg-soft ring-1 ring-line-strong" />} />
          <Mesure nom="radius-lg" apercu={<span className="size-11 shrink-0 rounded-lg bg-bg-soft ring-1 ring-line-strong" />} />
          <Mesure nom="radius-xl" apercu={<span className="size-11 shrink-0 rounded-xl bg-bg-soft ring-1 ring-line-strong" />} />
          <Mesure nom="radius-2xl" apercu={<span className="size-11 shrink-0 rounded-2xl bg-bg-soft ring-1 ring-line-strong" />} />
          <Mesure nom="radius-pop" apercu={<span className="size-11 shrink-0 rounded-[20px] bg-bg-soft ring-1 ring-line-strong" />} />
        </div>
      </Exemple>

      <Exemple titre="Ombres">
        <div className="space-y-5">
          <Mesure nom="shadow-xs" apercu={<span className="size-11 shrink-0 rounded-lg bg-bg shadow-xs" />} />
          <Mesure nom="shadow-sm" apercu={<span className="size-11 shrink-0 rounded-lg bg-bg shadow-sm" />} />
          <Mesure nom="shadow-md" apercu={<span className="size-11 shrink-0 rounded-lg bg-bg shadow-md" />} />
          <Mesure nom="shadow-lg" apercu={<span className="size-11 shrink-0 rounded-lg bg-bg shadow-lg" />} />
          <Mesure nom="shadow-pill" apercu={<span className="size-11 shrink-0 rounded-full bg-bg shadow-pill" />} />
          <Mesure nom="shadow-pop" apercu={<span className="size-11 shrink-0 rounded-[20px] bg-bg shadow-pop" />} />
        </div>
      </Exemple>
    </div>
  )
}

export function Mouvement() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <Mesure nom="duration-fast" apercu={<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-bg-soft text-xs text-fg-2">0,26</span>} />
      <Mesure nom="duration-moderate" apercu={<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-bg-soft text-xs text-fg-2">0,38</span>} />
      <Mesure nom="duration-slow" apercu={<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-bg-soft text-xs text-fg-2">0,52</span>} />
      <Mesure nom="ease-spring" apercu={<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-bg-soft text-xs text-fg-2">↗</span>} />
      <Mesure nom="ease-lift" apercu={<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-bg-soft text-xs text-fg-2">↑</span>} />
    </div>
  )
}

export function Composants() {
  return (
    <div className="space-y-6">
      <Exemple titre="Boutons du site">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="rounded-md bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand-hover">
            Rechercher
          </button>
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-bg-soft">
            Secondaire
          </button>
          <button type="button" className="rounded-full px-3 py-2 text-sm font-medium text-fg-2 hover:bg-bg-soft hover:text-fg">
            Discret
          </button>
          <button type="button" aria-label="Rechercher" className="grid size-9 place-items-center rounded-full text-fg hover:bg-bg-soft">
            <SearchIcon className="size-[18px]" />
          </button>
          <Link href="/dentistes" className="text-sm text-fg underline underline-offset-4">
            Lien de texte
          </Link>
        </div>
      </Exemple>

      <Exemple titre="Boutons shadcn, style vega">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Par défaut</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="outline">Contour</Button>
            <Button variant="ghost">Fantôme</Button>
            <Button variant="destructive">Destructif</Button>
            <Button variant="link">Lien</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Très petit</Button>
            <Button size="sm">Petit</Button>
            <Button>Normal</Button>
            <Button size="lg">Grand</Button>
          </div>
        </div>
      </Exemple>

      <Exemple titre="Badges de vérification">
        <div className="flex flex-wrap gap-3">
          <Verification statut="verifie" />
          <Verification statut="partiel" />
          <Verification statut="non_verifie" />
        </div>
        <p className="mt-4 text-sm text-fg-2">
          Le vert et l’ambre sont les seules couleurs hors palette du site. Ils portent une
          information de fiabilité, pas une intention graphique.
        </p>
      </Exemple>

      <Exemple titre="Champs">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="sg-ou" className="block text-sm font-medium text-fg">
              Où cherchez-vous ?
            </label>
            <input
              id="sg-ou"
              placeholder="Ville, code postal ou adresse"
              className="mt-1 w-72 max-w-full rounded-md border border-line-strong px-3 py-2 text-fg outline-none placeholder:text-fg-2 focus:border-fg"
            />
          </div>
          <div>
            <label htmlFor="sg-profession" className="block text-sm font-medium text-fg">
              Profession
            </label>
            <select
              id="sg-profession"
              className="mt-1 rounded-md border border-line-strong px-3 py-2 text-fg outline-none focus:border-fg"
            >
              <option>Chirurgiens-dentistes</option>
              <option>Laboratoires de prothèse</option>
            </select>
          </div>
        </div>
      </Exemple>

      <Exemple titre="Navigation">
        <div className="space-y-5">
          <FilAriane
            segments={[
              { libelle: 'Accueil', href: '/' },
              { libelle: 'Chirurgiens-dentistes', href: '/dentistes' },
              { libelle: 'Gironde' },
            ]}
          />
          <div className="flex flex-wrap gap-1">
            <span className="relative inline-flex items-center gap-2 rounded-full bg-bg-soft px-3.5 py-2.5 text-[15px] font-medium text-fg after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-fg">
              <NavIconSvg name="map" className="size-5" />
              Onglet actif
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[15px] font-medium text-fg-2">
              <NavIconSvg name="article" className="size-5" />
              Onglet au repos
            </span>
          </div>
          <nav aria-label="Exemple de pagination" className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-line-strong px-3 py-1.5 text-sm text-fg">Précédent</span>
            <span aria-current="page" className="rounded bg-brand px-3 py-1.5 text-sm text-brand-foreground">2</span>
            <span className="rounded border border-line-strong px-3 py-1.5 text-sm text-fg">3</span>
            <span className="text-fg-2">…</span>
            <span className="rounded border border-line-strong px-3 py-1.5 text-sm text-fg">9</span>
          </nav>
        </div>
      </Exemple>

      <Exemple titre="Surfaces">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-line bg-bg p-5 shadow-pop">
            <p className="text-sm font-semibold text-fg">Popover</p>
            <p className="mt-1 text-sm text-fg-2">Méga-menu, menu du compte. Rayon 20 px, ombre pop.</p>
          </div>
          <div className="rounded-2xl bg-bg-soft p-5">
            <p className="text-sm font-semibold text-fg">Encadré</p>
            <p className="mt-1 text-sm text-fg-2">Colonne mise en avant, pied de page. Fond adouci, sans filet.</p>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-line py-2">
            <span className="text-fg">Ligne de liste</span>
            <span className="text-sm tabular-nums text-fg-2">1 381</span>
          </div>
          <div className="rounded-full border border-line px-4 py-2 text-sm shadow-pill">
            <span className="text-fg">Pastille, ombre pill</span>
          </div>
        </div>
      </Exemple>

      <Exemple titre="Bascule de thème">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <ThemeToggle size="icon" aria-label="Changer de thème" tailleReservee="size-9" />
            <span className="text-sm text-fg-2">circle-blur, celle du header</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle
              variant="fade"
              size="sm"
              modes={['light', 'dark', 'system']}
              aria-label="Changer de thème, fondu"
              tailleReservee="size-7"
            />
            <span className="text-sm text-fg-2">fade, trois modes</span>
          </div>
        </div>
      </Exemple>
    </div>
  )
}

/**
 * Ce qui reste à décider.
 *
 * Un guide de style sert à trancher, pas seulement à montrer : les points
 * ouverts sont listés ici plutôt que découverts en production.
 */
export function ATrancher() {
  const points = [
    {
      titre: 'Les rubriques de conseils n’ont pas encore de contenu',
      texte:
        'Les trois teintes éditoriales sont posées mais ne servent nulle part : elles attendent les articles. Tant qu’elles dorment, rien ne garantit qu’elles tiennent sur une grille de vignettes.',
    },
    {
      titre: 'Le bleu d’action sur les liens de texte',
      texte:
        'Il est réservé aux boutons. Reste à trancher le cas des liens à l’intérieur d’un article de conseils, qui ne sont ni des boutons ni des lignes de liste : les laisser en encre soulignée, ou les passer au bleu comme le fait Apple dans ses pages de support.',
    },
    {
      titre: 'Le nuancier de graphiques',
      texte:
        'Les cinq teintes de --chart-* servent aux visualisations, qui n’existent pas encore. Elles reprennent pour l’instant le bleu, l’ardoise et les teintes éditoriales : à revoir le jour où une carte de densité en aura vraiment besoin.',
    },
  ]
  return (
    <ol className="space-y-4">
      {points.map((p, i) => (
        <li key={p.titre} className="flex gap-4 rounded-2xl border border-line p-5">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-bg-soft text-sm font-semibold text-fg">
            {i + 1}
          </span>
          <span>
            <span className="block font-semibold text-fg">{p.titre}</span>
            <span className="mt-1 block text-sm text-fg-2">{p.texte}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
