import { ThemeActif } from '@/components/site/style-guide/jetons'
import {
  ATrancher,
  Composants,
  Couleurs,
  Formes,
  Mouvement,
  Section,
  Typographie,
} from '@/components/site/style-guide/sections'

/**
 * Guide de style, page de travail.
 *
 * Elle est rendue avec les vraies variables et les vrais composants du site :
 * une maquette séparée dériverait au premier changement de token. Hors index,
 * elle n'a rien à faire dans les résultats de recherche.
 */
export const metadata = {
  title: 'Guide de style',
  description: 'Couleurs, typographie, formes et composants de DentalMap.',
  robots: { index: false, follow: false },
}

const SOMMAIRE = [
  { id: 'couleurs', label: 'Couleurs' },
  { id: 'typographie', label: 'Typographie' },
  { id: 'formes', label: 'Formes' },
  { id: 'mouvement', label: 'Mouvement' },
  { id: 'composants', label: 'Composants' },
  { id: 'a-trancher', label: 'À trancher' },
]

export default function GuideDeStyle() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">DentalMap</p>
        <h1 className="mt-2 text-fg">Guide de style</h1>
        <p className="mt-3 max-w-2xl text-fg-2">
          Palette teal du style vega, posée sur la couche sémantique du site. Les valeurs affichées
          sont lues dans le navigateur au moment du rendu : elles suivent la bascule clair et sombre,
          et ne peuvent pas diverger du site.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ThemeActif />
          <span className="text-xs text-fg-2">
            Basculez avec le bouton du header pour valider les deux thèmes.
          </span>
        </div>
        <nav aria-label="Sommaire" className="mt-6 flex flex-wrap gap-2">
          {SOMMAIRE.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-line px-3 py-1.5 text-sm text-fg hover:bg-bg-soft"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mt-12 space-y-12">
        <Section
          id="couleurs"
          titre="Couleurs"
          intro="Deux couches : les noms métier utilisés partout dans le code, et la palette shadcn sur laquelle ils pointent."
        >
          <Couleurs />
        </Section>

        <Section
          id="typographie"
          titre="Typographie"
          intro="Une seule famille, une échelle de titres, deux niveaux de gris pour le texte."
        >
          <Typographie />
        </Section>

        <Section id="formes" titre="Formes" intro="Rayons et ombres, avec leur valeur courante.">
          <Formes />
        </Section>

        <Section
          id="mouvement"
          titre="Mouvement"
          intro="Trois durées et deux courbes, partagées entre le CSS et les animations React."
        >
          <Mouvement />
        </Section>

        <Section
          id="composants"
          titre="Composants"
          intro="Les éléments réels du site, pas des reproductions : ce sont les mêmes fichiers que les pages publiques."
        >
          <Composants />
        </Section>

        <Section
          id="a-trancher"
          titre="À trancher"
          intro="Les trois points sur lesquels la charte n'est pas encore arrêtée."
        >
          <ATrancher />
        </Section>
      </div>
    </main>
  )
}
