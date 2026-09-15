import { ThemeActif } from '@/components/site/style-guide/jetons'
import { Propositions, Recommandation } from '@/components/site/style-guide/propositions'
import {
  ApercuDeFiche,
  Banc,
  CarteHalo,
  CurseurSurvol,
  FicheDepliante,
  FiltreVerifie,
  PhotoLegendee,
  ProgressionLecture,
  VisiteGuidee,
} from '@/components/site/style-guide/widgets'
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
  { id: 'widgets', label: 'Widgets animés' },
  { id: 'propositions', label: 'Propositions' },
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
          id="widgets"
          titre="Widgets animés"
          intro="Sept composants à l'essai, montrés sur des cas réels de l'annuaire. Les photos viennent de Pexels, licence libre, et ne servent qu'ici."
        >
          <div className="space-y-6">
            <Banc
              titre="Fiche dépliante"
              source="motion-primitives / disclosure"
              usage="Une fiche montre l'essentiel, et garde ses détails administratifs repliés. La hauteur s'anime, rien ne saute."
            >
              <FicheDepliante />
            </Banc>

            <Banc
              titre="Curseur de survol"
              source="motion-primitives / cursor"
              usage="Sur une vignette de cabinet ou un marqueur de carte. Le curseur n'est remplacé que dans la zone, jamais sur toute la page."
            >
              <CurseurSurvol />
            </Banc>

            <Banc
              titre="Progression de lecture"
              source="motion-primitives / scroll-progress"
              usage="Pour les articles de conseils. Le dégradé reprend la rampe des graphiques. Ici la barre suit le défilement du bloc, pas celui de la page."
            >
              <ProgressionLecture />
            </Banc>

            <Banc
              titre="Carte à halo"
              source="motion-primitives / spotlight"
              usage="Pour l'appel à revendiquer une fiche. Le halo suit le curseur et s'éteint à la sortie."
            >
              <CarteHalo />
            </Banc>

            <Banc
              titre="Photo légendée"
              source="motion-primitives / progressive-blur"
              usage="Le flou monte sous la légende pour la rendre lisible, sans voiler l'image entière comme le ferait un aplat sombre."
            >
              <PhotoLegendee />
            </Banc>

            <Banc
              titre="Filtre de liste"
              source="matos-ui / bouncy-toggle"
              usage="Pour n'afficher que les fiches confrontées à un registre. Le rebond signale que le résultat change."
            >
              <FiltreVerifie />
            </Banc>

            <Banc
              titre="Aperçu de fiche"
              source="motion-primitives / morphing-dialog"
              usage="La carte se déplie en place au lieu de renvoyer sur une autre page : comparer trois praticiens d'une commune demandait trois allers et retours. Le composant est celui de l'annuaire, prêt à poser sur les listes et sur les marqueurs de carte."
            >
              <ApercuDeFiche />
            </Banc>

            <Banc
              titre="Visite guidée"
              source="matos-ui / coachmark"
              usage="Premier passage dans l'espace professionnel. Trois étapes, libellés en français, sortie possible à chaque étape."
            >
              <VisiteGuidee />
            </Banc>
          </div>
        </Section>

        <Section
          id="propositions"
          titre="Propositions"
          intro="Trois palettes appliquées à la même composition. Seules trois variables changent d'une à l'autre : le reste du site ne bouge pas."
        >
          <div className="space-y-6">
            <Propositions />
            <Recommandation />
          </div>
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
