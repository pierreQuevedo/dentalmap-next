/**
 * MAQUETTE, à supprimer après arbitrage. Contenu et briques de « Devenir
 * partenaire » (variante B retenue).
 *
 * Établi dans le dépôt :
 * - formulaire public sans compte, six champs, réponse sous sept jours,
 *   accusé de réception par email, convention écrite pour conclure
 *   (`src/app/(public)/partenaires/actions.ts`, `src/lib/email.ts`) ;
 * - ce qu'une école obtient : sa page d'établissement, formations, admission,
 *   galerie, événements, alternance (`docs/handoff/06`), revendiquée depuis
 *   `/espace-pro/organisme/` (écran O1 puis O2a).
 *
 * Les avantages des cinq profils ont été retenus par le client le
 * 13 octobre 2026 ; ils restent à construire. `proposition` reste disponible
 * pour marquer une idée non encore validée.
 */
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const ANCRE_FORMULAIRE = '#formulaire'
export const ROUTE_ETABLISSEMENT = '/espace-pro/organisme/'

export type Benefice = { texte: string; proposition?: boolean }
export type Offre = { cle: string; titre: string; pour: string; image: string; benefices: Benefice[]; lien?: { texte: string; href: string } }

export const OFFRES: Offre[] = [
  {
    cle: 'ordres',
    titre: 'Ordres et syndicats',
    pour: 'Ordres départementaux, syndicats, associations',
    image: '/images/demo/pexels-6627447.jpg',
    benefices: [
      { texte: 'Un tableau de bord de votre département : praticiens, fiches revendiquées, communes sans chirurgien-dentiste' },
      { texte: 'Un lien de revendication à votre nom, avec le compte des fiches revendiquées grâce à vous' },
      { texte: 'Vos signalements d’erreur traités sous 48\u00a0h' },
      { texte: 'Les offres d’emploi et de remplacement du département, en bloc à intégrer à votre lettre ou votre site' },
      { texte: 'Vos formations, soirées et assemblées publiées dans DentalMap, source citée' },
    ],
  },
  {
    cle: 'editeurs',
    titre: 'Éditeurs de logiciels',
    pour: 'Logiciels de gestion de cabinet',
    image: '/images/demo/pexels-8413334.jpg',
    benefices: [
      { texte: 'Le badge « Fiche vérifiée » intégrable dans votre logiciel et sur le site du cabinet' },
      { texte: 'La revendication en un clic depuis votre logiciel, vérification ProConnect comprise' },
      { texte: 'Horaires et lien de rendez-vous synchronisés par API, avec l’accord du praticien' },
      { texte: 'Les offres d’emploi du cabinet publiées depuis votre logiciel' },
      { texte: 'Votre page dans la rubrique « Outils du cabinet », comme DentalBridge' },
    ],
  },
  {
    cle: 'ecoles',
    titre: 'Écoles et facultés',
    pour: 'Écoles de prothèse, facultés d’odontologie',
    image: '/images/demo/pexels-19879741.jpg',
    benefices: [
      { texte: 'Une page d’établissement vérifiée : formations, admission, galerie, événements' },
      { texte: 'Une alerte alternance et stages propre à votre école, pour vos étudiants' },
      { texte: 'La carte des cabinets et laboratoires qui accueillent des alternants autour de vous' },
      { texte: 'Vos formations reliées aux fiches métier, et l’inverse' },
      { texte: 'Vos journées portes ouvertes sur votre page et sur les fiches métier' },
    ],
    lien: { texte: 'Revendiquer mon établissement', href: ROUTE_ETABLISSEMENT },
  },
  {
    cle: 'formation',
    titre: 'Organismes de formation',
    pour: 'Formation continue des praticiens et des équipes',
    image: '/images/demo/pexels-3881296.jpg',
    benefices: [
      { texte: 'Vos formations publiées après vérification, avec sessions et inscription' },
      { texte: 'DPC, FIF PL et Qualiopi marqués « vérifié » quand la source le confirme' },
      { texte: 'Les praticiens abonnés prévenus par email à chaque nouvelle formation de leur thème' },
    ],
  },
  {
    cle: 'collectivites',
    titre: 'Collectivités et ARS',
    pour: 'Communes, intercommunalités, agences régionales de santé',
    image: '/images/demo/pexels-7800669.jpg',
    benefices: [
      { texte: 'La carte des communes peu dotées de votre territoire, tirée des registres' },
      { texte: 'Les cessions de cabinet et les offres d’installation sur vos communes' },
      { texte: 'Vos dispositifs d’aide à l’installation présentés aux praticiens qui cherchent' },
    ],
  },
]

/** Ce qu'aucun partenariat n'achète. */
export const JAMAIS = ['Un meilleur rang dans les résultats', 'Un logo sur les fiches des praticiens', 'Des données personnelles']

export const ETAPES = [
  { titre: 'Votre demande', texte: 'Six champs, sans compte, depuis cette page.', image: '/images/demo/pexels-3881296.jpg' },
  { titre: 'Un échange', texte: 'Une personne de l’équipe vous répond sous sept jours.', image: '/images/demo/pexels-6627325.jpg' },
  { titre: 'Une convention', texte: 'Le partenariat est encadré par une convention écrite.', image: '/images/demo/pexels-7800669.jpg' },
]

export const FAQ = [
  { q: 'Faut-il un compte pour proposer un partenariat ?', r: 'Non. Le formulaire de cette page suffit, et la demande ne crée aucun compte.' },
  { q: 'Quand aurai-je une réponse ?', r: 'Une personne de l’équipe lit votre demande sous sept jours et vous répond par email.' },
  { q: 'Un partenariat change-t-il le classement des fiches ?', r: 'Non. Les résultats restent classés par distance, puis par ordre alphabétique.' },
]

/** Monogrammes fictifs de la maquette : aucun organisme réel. */
export const MONOGRAMMES = ['OD', 'SY', 'ED', 'EP', 'FO', 'AS']

export function Photo({ src, className = '', sizes = '(min-width: 1024px) 33vw, 100vw' }: { src: string; className?: string; sizes?: string }) {
  return (
    <div className={`${/\babsolute\b/.test(className) ? '' : 'relative'} overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
    </div>
  )
}

export function LienFleche({ href, children, sombre, petit }: { href: string; children: React.ReactNode; sombre?: boolean; petit?: boolean }) {
  return (
    <a href={href} className={`group inline-flex items-center font-medium transition-colors hover:text-teal ${petit ? 'text-sm' : 'text-base'} ${sombre ? 'text-white' : 'text-fg'}`}>
      <span className={`border-b-2 pb-0.5 ${sombre ? 'border-white/25' : 'border-line'}`}>{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </a>
  )
}

export function Bouton({ href, children, ton = 'action' }: { href: string; children: React.ReactNode; ton?: 'action' | 'secondaire' }) {
  const c = ton === 'action' ? 'bg-action text-action-foreground hover:bg-action-hover' : 'border border-line bg-bg text-fg hover:bg-bg-soft'
  return (
    <a href={href} className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold ${c}`}>
      {children}
    </a>
  )
}

export function Surtitre({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm font-medium text-fg-2">
      <span className="size-1.5 rounded-full bg-teal" /> {children}
    </p>
  )
}

/** Étiquette de maquette : ce bénéfice n'existe pas encore dans le code. */
export function EtiquetteProposition() {
  return <span className="ml-1.5 inline-flex rounded bg-amber-200/70 px-1.5 py-px align-[1px] text-[11px] font-semibold text-amber-950">Proposition</span>
}

export function FaqCourte() {
  return (
    <Accordion defaultValue={['q-0']}>
      {FAQ.map((f, i) => (
        <AccordionItem key={f.q} value={`q-${i}`} className="border-b border-line last:border-b-0">
          <AccordionTrigger className="py-5 text-base font-semibold text-fg hover:no-underline md:text-lg">
            <span className="pr-4">{f.q.replace(/ \?$/, ' ?')}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 leading-relaxed text-fg-2">{f.r}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
