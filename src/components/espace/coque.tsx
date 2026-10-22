import { Suspense } from 'react'
import { twMerge } from 'tailwind-merge'
import Link from 'next/link'
import Image from 'next/image'
import { EnVerification } from './en-verification'
import {
  GraduationCap,
  HeartPulse,
  Map as Plan,
  Ticket,
  BarChart3,
  Bell,
  Briefcase,
  Clock,
  ExternalLink,
  FileCheck2,
  Images,
  PanelsTopLeft,
  Route,
  Users,
  Wrench,
  FileText,
  Gavel,
  LayoutGrid,
  Menu,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { Enregistre } from './enregistre'
import { MenuMobile } from './menu-mobile'
import { Deconnexion } from './deconnexion'
import { CarteProgression, SuiviProgression, type CarteAMontrer } from './progression'
import { CarteProgressionEtab, SuiviProgressionEtab, type InfosProgressionEtab } from './progression-etablissement'
import type { Points } from '@/lib/espace-pro/progression'
import { Logo } from '@/components/site/logo'

/**
 * La coque du tableau de bord d'un soignant : barre latérale, en-tête, tiroir
 * sur mobile. Reprise de la maquette « coque commune » (Figma, page
 * « Parcours · step by step »), branchée : chaque entrée est un lien, les
 * badges sont calculés. Emploi et notifications n'ont pas encore
 * de données derrière : ils sont annoncés, pas simulés.
 */
export type CleNav =
  | 'vue'
  | 'fiche'
  | 'missions'
  | 'fraicheur'
  | 'partager'
  | 'statistiques'
  | 'progression'
  | 'emploi'
  | 'registre'
  | 'distinctions'
  | 'compte'
  | 'moderation'
  | 'delais'
  | 'savoir-faire'
  | 'zone'
  | 'realisations'
  | 'conformite'
  | 'equipe'
  | 'ma-page'
  | 'formations'
  | 'galerie'
  | 'acces'
  | 'cursus'
  | 'soins'

type Entree = { cle: CleNav | 'emploi' | 'stats' | 'notifications' | 'admission' | 'evenements'; libelle: string; i: LucideIcon; href?: string; badge?: number; bientot?: boolean; vert?: boolean }

export type InfosCoque = {
  /** Initiales, nom affiché, ligne secondaire (commune). */
  mono: string
  /** Photo de profil : elle remplace les initiales quand elle existe. */
  photo?: string | null
  nom: string
  ligne2: string
  /** Page publique de la fiche, si elle est en ligne. */
  pagePublique: string | null
  enLigne: boolean
  missionsRestantes: number
  aReconfirmer: number
  moderateur: boolean
  /** Fiche courante, gardée dans les liens quand le compte en a plusieurs. */
  slug: string
  plusieursFiches: boolean
  /** Un laboratoire : navigation et vocabulaire propres. */
  labo: boolean
  /** Délais à reconfirmer (laboratoire). */
  delaisAReconfirmer: boolean
  /** Un établissement de formation : sa navigation, sa page plutôt qu'une fiche. */
  etablissement?: 'ecole_prothese' | 'faculte'
  /** Identité pas encore vérifiée : bandeau « brouillon » en tête de chaque page. */
  enVerification?: boolean
  /** Un compte sans fiche (salarié, étudiant, patient) : l'espace se réduit à l'Emploi, côté candidat. */
  candidat?: boolean
  /** Points et palier de la fiche (dentiste, laboratoire) : la carte du menu, l'encart de gain, le passage de palier. */
  progression?: { points: Points; lon: number | null; lat: number | null; carte: CarteAMontrer }
  /** Taux de page complète et palier d'un établissement : la carte du menu, l'encart de gain, le passage de palier. */
  progressionEtab?: InfosProgressionEtab
  /** Avis publiés sans réponse de l'établissement : la pastille de « Partage et avis ». */
  avisSansReponse?: number
}

function navigation(c: InfosCoque): { groupe: string | null; items: Entree[] }[] {
  if (c.candidat) return [{ groupe: null, items: [{ cle: 'emploi', libelle: 'Emploi', i: Briefcase, href: '/espace-pro/emploi/candidat/' }] }]
  const q = c.plusieursFiches ? `?fiche=${encodeURIComponent(c.slug)}` : ''
  const h = (p: string) => `/espace-pro/${p}${p ? '/' : ''}${q}`
  const compte: Entree[] = [
    ...(c.labo ? [] : [{ cle: 'fraicheur' as const, libelle: 'Mises à jour', i: RefreshCw, href: h('fraicheur'), badge: c.aReconfirmer }]),
    ...(c.labo ? [{ cle: 'equipe' as const, libelle: 'Équipe', i: Users, href: h('equipe') }] : []),
    { cle: 'compte', libelle: 'Compte et sécurité', i: Settings, href: h('compte') },
    ...(c.moderateur ? [{ cle: 'moderation' as const, libelle: 'Modération', i: Gavel, href: '/espace-pro/moderation/' }] : []),
  ]
  if (c.etablissement) {
    const e = (p: string) => `/espace-pro/etablissement/${p}${p ? '/' : ''}${q}`
    const fac = c.etablissement === 'faculte'
    return [
      {
        groupe: null,
        items: [
          { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid, href: e('') },
          { cle: 'ma-page', libelle: 'Ma page', i: PanelsTopLeft, href: e('ma-page'), badge: c.missionsRestantes },
          { cle: 'progression', libelle: 'Progression', i: Sparkles, href: e('progression') },
          ...(fac
            ? [
                { cle: 'acces' as const, libelle: 'Accès aux études', i: GraduationCap, href: e('acces') },
                { cle: 'cursus' as const, libelle: 'Cursus et internat', i: Plan, href: e('cursus') },
                { cle: 'soins' as const, libelle: 'Centres de soins', i: HeartPulse, href: e('soins') },
              ]
            : [
                { cle: 'formations' as const, libelle: 'Formations', i: GraduationCap, href: e('formations') },
                { cle: 'admission' as const, libelle: 'Admission et calendrier', i: Clock, bientot: true },
              ]),
          { cle: 'galerie', libelle: 'Galerie', i: Images, href: e('galerie') },
          { cle: 'evenements', libelle: 'Événements', i: Ticket, bientot: true },
        ],
      },
      {
        groupe: 'Visibilité',
        items: [
          { cle: 'partager', libelle: 'Partage et avis', i: Star, href: e('partager'), badge: c.avisSansReponse },
          { cle: 'stats', libelle: 'Statistiques', i: BarChart3, bientot: true },
        ],
      },
      {
        groupe: 'Confiance',
        items: [
          { cle: 'registre', libelle: 'Registres', i: ShieldCheck, href: e('registres') },
          { cle: 'notifications', libelle: 'Notifications', i: Bell, bientot: true },
        ],
      },
      {
        groupe: 'Compte',
        items: [
          { cle: 'compte', libelle: 'Compte et sécurité', i: Settings, href: e('compte') },
          ...(c.moderateur ? [{ cle: 'moderation' as const, libelle: 'Modération', i: Gavel, href: '/espace-pro/moderation/' }] : []),
        ],
      },
    ]
  }
  if (c.labo) {
    return [
      {
        groupe: null,
        items: [
          { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid, href: h('') },
          { cle: 'fiche', libelle: 'Ma fiche', i: PanelsTopLeft, href: h('fiche'), badge: c.missionsRestantes },
          { cle: 'progression', libelle: 'Progression', i: Sparkles, href: h('progression') },
          { cle: 'delais', libelle: 'Délais de fabrication', i: Clock, href: h('delais'), badge: c.delaisAReconfirmer ? 1 : 0 },
          { cle: 'savoir-faire', libelle: 'Savoir-faire', i: Wrench, href: h('savoir-faire') },
          { cle: 'zone', libelle: 'Zone et logistique', i: Route, href: h('zone') },
          { cle: 'realisations', libelle: 'Réalisations', i: Images, href: h('realisations') },
          { cle: 'conformite', libelle: 'Conformité', i: FileCheck2, href: h('conformite') },
          { cle: 'emploi', libelle: 'Emploi', i: Briefcase, href: h('emploi') },
        ],
      },
      {
        groupe: 'Visibilité',
        items: [
          { cle: 'partager', libelle: 'Partager', i: Send, href: h('partager') },
          { cle: 'statistiques', libelle: 'Statistiques', i: BarChart3, href: h('statistiques') },
        ],
      },
      {
        groupe: 'Confiance',
        items: [
          { cle: 'registre', libelle: 'Registre', i: ShieldCheck, href: h('registre') },
          { cle: 'notifications', libelle: 'Notifications', i: Bell, bientot: true },
        ],
      },
      { groupe: 'Compte', items: compte },
    ]
  }
  return [
    {
      groupe: null,
      items: [
        { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid, href: h('') },
        { cle: 'fiche', libelle: 'Ma fiche', i: FileText, href: h('fiche') },
        { cle: 'progression', libelle: 'Progression', i: Sparkles, href: h('progression'), badge: c.missionsRestantes },
        { cle: 'emploi', libelle: 'Emploi', i: Briefcase, href: h('emploi') },
      ],
    },
    {
      groupe: 'Visibilité',
      items: [
        { cle: 'partager', libelle: 'Partager et parrainer', i: Send, href: h('partager') },
        { cle: 'statistiques', libelle: 'Statistiques', i: BarChart3, href: h('statistiques') },
      ],
    },
    {
      groupe: 'Confiance',
      items: [
        { cle: 'registre', libelle: 'Registre', i: ShieldCheck, href: h('registre') },
        { cle: 'notifications', libelle: 'Notifications', i: Bell, bientot: true },
      ],
    },
    { groupe: 'Compte', items: compte },
  ]
}

/** La pastille d'identité du menu : la photo de profil, ou les initiales à défaut. */
function Pastille({ c, taille }: { c: InfosCoque; taille: string }) {
  return (
    <span className={`squircle-lg relative grid shrink-0 place-items-center overflow-hidden bg-white font-bold text-[#0e1317] ring-1 ring-line ${taille}`}>
      {c.photo ? <Image src={c.photo} alt="" fill sizes="40px" className="object-cover object-[center_26%]" /> : c.mono}
    </span>
  )
}

function Nav({ c, actif }: { c: InfosCoque; actif: CleNav }) {
  return (
    <nav aria-label="Espace pro" className="space-y-5">
      {navigation(c).map((g) => (
        <div key={g.groupe ?? 'principal'}>
          {g.groupe && <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-fg-2">{g.groupe}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const contenu = (
                <>
                  <it.i className="size-4" aria-hidden />
                  <span className="flex-1">{it.libelle}</span>
                  {it.bientot ? (
                    <span className="rounded-full bg-bg px-1.5 text-[10px] font-medium text-fg-2 ring-1 ring-inset ring-line">Bientôt</span>
                  ) : (
                    !!it.badge && <span className="squircle-full bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">{it.badge}</span>
                  )}
                </>
              )
              const classe = `squircle-lg flex items-center gap-3 px-3 py-2 text-sm ${
                it.cle === actif ? 'border border-line bg-bg font-semibold text-fg shadow-sm' : 'text-fg-2'
              }`
              return (
                <li key={it.cle}>
                  {it.href ? (
                    <Link href={chemin(it.href)} aria-current={it.cle === actif ? 'page' : undefined} className={`${classe} hover:bg-bg hover:text-fg`}>
                      {contenu}
                    </Link>
                  ) : (
                    <span aria-disabled className={`${classe} cursor-default opacity-70`}>
                      {contenu}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function CoqueEspace({
  c,
  actif,
  titre,
  sousTitre,
  sansLienFlottant = false,
  children,
}: {
  c: InfosCoque
  actif: CleNav
  titre: string
  sousTitre: string
  /** Un formulaire à boutons en bas (Créer un poste) : pas de « Voir ma fiche » flottant par-dessus. */
  sansLienFlottant?: boolean
  children: React.ReactNode
}) {
  // L'état de la fiche, en une ligne : pastille, statut, fin d'adresse ; la carte entière mène à la page publique.
  const statut = c.enLigne ? (c.etablissement ? 'Page en ligne' : 'Fiche en ligne') : c.etablissement ? 'Page en préparation' : 'Fiche en préparation'
  const fin = c.pagePublique ? c.pagePublique.split('/').filter(Boolean).pop() : null
  const contenuCarte = (
    <>
      <span className="relative grid size-2.5 shrink-0 place-items-center" aria-hidden>
        {c.enLigne && <span className="absolute inset-0 animate-ping rounded-full bg-teal/40 motion-reduce:hidden" />}
        <span className={`size-2 rounded-full ${c.enLigne ? 'bg-teal' : 'bg-amber-400'}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-fg">{statut}</span>
        <span className="block truncate font-mono text-[10.5px] text-fg-2">
          {fin ? `…/${fin}/` : c.etablissement ? 'Publiée après vérification' : 'Publiée après validation'}
        </span>
      </span>
      {c.pagePublique && <ExternalLink className="size-3.5 shrink-0 text-fg-2 transition-colors group-hover:text-fg" aria-hidden />}
    </>
  )
  const classeCarte = 'squircle-xl group flex items-center gap-2.5 border border-line bg-bg px-3 py-2.5 transition-colors'
  const carteEnLigne = c.pagePublique ? (
    <Link href={chemin(c.pagePublique)} title={`dentalmap.fr${c.pagePublique}`} className={`${classeCarte} hover:border-line-strong hover:bg-bg-soft`}>
      {contenuCarte}
    </Link>
  ) : (
    <div className={classeCarte}>{contenuCarte}</div>
  )
  // Dentiste et laboratoire : la progression remplace l'état de la fiche (la mise en ligne est annoncée par email).
  const q = c.plusieursFiches ? `?fiche=${encodeURIComponent(c.slug)}` : ''
  const carteMenu = c.candidat ? null : c.progression ? (
    <CarteProgression points={c.progression.points} distinctions={`/espace-pro/progression/${q}`} q={q} />
  ) : c.progressionEtab ? (
    <CarteProgressionEtab p={c.progressionEtab} q={q} pagePublique={c.enLigne ? c.pagePublique : null} />
  ) : (
    carteEnLigne
  )
  const marque = (
    <Link href="/" className="flex items-center gap-2 px-2">
      <Logo hauteur={28} />
      <span className="squircle-full bg-fg px-2 py-0.5 text-[10px] font-semibold text-bg">Pro</span>
    </Link>
  )
  const identite = (
    <div className="squircle-xl flex items-center gap-3 border border-line bg-bg p-3">
      <Pastille c={c} taille="size-9 text-xs" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fg">{c.nom}</p>
        <p className="truncate text-xs text-fg-2">{c.ligne2}</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* La barre latérale tient dans l'écran : marque et identité en haut, la carte en bas, seul le menu défile entre les deux. */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-line bg-bg-soft py-5 lg:flex">
        <div className="shrink-0 px-4">
          {marque}
          <div className="mt-6">{identite}</div>
        </div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
          <Nav c={c} actif={actif} />
          <div className="mt-0.5">
            <Deconnexion />
          </div>
        </div>
        {carteMenu && <div className="shrink-0 border-t border-line px-4 pt-4">{carteMenu}</div>}
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-24 pt-3 sm:px-8 sm:pb-10">
        {/* Sur téléphone et tablette, la barre du menu reste en haut à chaque page ; le titre défile avec le contenu. */}
        <MenuMobile className="group sticky top-0 z-50 -mx-4 -mt-3 mb-3 border-b border-line bg-bg-soft sm:-mx-8 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-8">
            <Pastille c={c} taille="size-8 text-[10px]" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{c.nom}</span>
            <span className="grid size-9 place-items-center rounded-full border border-line bg-bg">
              <Menu className="size-4" aria-hidden />
              <span className="sr-only">Menu de l’espace pro</span>
            </span>
          </summary>
          {/* Ouvert, le menu tient dans l'écran : la liste défile, la carte reste en bas. */}
          <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-8">
              <Nav c={c} actif={actif} />
              <Deconnexion />
            </div>
            {carteMenu && <div className="shrink-0 border-t border-line px-4 py-3 sm:px-8">{carteMenu}</div>}
          </div>
        </MenuMobile>
        {/* Sur ordinateur, l'en-tête reste visible au défilement : où l'on est, et la fiche publique à un clic. En dessous, c'est la barre du menu qui reste. */}
        <header className="z-30 -mx-4 flex lg:sticky lg:top-0 flex-wrap items-center justify-between gap-4 border-b border-transparent bg-bg/85 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75 sm:-mx-8 sm:px-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">{titre}</h1>
            <p className="truncate text-sm text-fg-2">{sousTitre}</p>
          </div>
          {c.pagePublique && (
            <Link href={chemin(c.pagePublique)} className="hidden h-10 items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium text-fg shadow-sm hover:border-line-strong sm:inline-flex">
              <ExternalLink className="size-4" aria-hidden /> {c.etablissement ? 'Voir ma page' : 'Voir ma fiche'}
            </Link>
          )}
        </header>
        {/* Sur mobile, le lien vers la fiche publique flotte en bas, centré, sous le pouce. */}
        {c.pagePublique && !sansLienFlottant && (
          <Link
            href={chemin(c.pagePublique)}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-bg shadow-pop sm:hidden"
          >
            <ExternalLink className="size-4" aria-hidden /> {c.etablissement ? 'Voir ma page' : 'Voir ma fiche'}
          </Link>
        )}
        <div className="mt-3">
          {c.enVerification && <EnVerification labo={c.labo} className="mb-6" />}
          {/* L'espace établissement a son propre retour, bloc par bloc. */}
          {!c.etablissement && (
            <Suspense fallback={null}>
              <Enregistre enLigne={c.enLigne} />
            </Suspense>
          )}
          {children}
        </div>
      </main>
      {c.progression && <SuiviProgression slug={c.slug} points={c.progression.points} lon={c.progression.lon} lat={c.progression.lat} partager={`/espace-pro/partager/${q}`} distinctions={`/espace-pro/progression/${q}`} carte={c.progression.carte} />}
      {c.progressionEtab && <SuiviProgressionEtab slug={c.slug} p={c.progressionEtab} q={q} pagePublique={c.enLigne ? c.pagePublique : null} />}
    </div>
  )
}

export function Tuile({ className = '', id, children }: { className?: string; id?: string; children: React.ReactNode }) {
  return (
    // twMerge : un `p-0` ou un `px-6` passé en classe remplace bien le `p-5` par défaut.
    <section id={id} className={twMerge('squircle-2xl min-w-0 border border-line bg-bg p-5', className)}>
      {children}
    </section>
  )
}

export function TitreTuile({ i: I, children, droite }: { i: LucideIcon; children: React.ReactNode; droite?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <I className="size-4 text-fg-2" aria-hidden /> {children}
      </h2>
      {droite}
    </div>
  )
}

/** Statut d'un bloc de la fiche publique ; `libelle` remplace le texte quand la teinte sert à autre chose (une proposition, une demande). */
export function Statut({ s, libelle }: { s: 'publiee' | 'incomplete' | 'vide' | 'auto' | 'attente'; libelle?: string }) {
  const m = {
    publiee: ['Publiée', 'bg-teal/10 text-teal ring-teal/25'],
    incomplete: ['À compléter', 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30'],
    vide: ['Masquée, vide', 'bg-bg-soft text-fg-2 ring-line'],
    auto: ['Automatique', 'bg-bg text-fg ring-line'],
    attente: ['Prête, en attente', 'bg-bg-soft text-fg ring-line'],
  }[s]
  return <span className={`squircle-full inline-flex px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${m[1]}`}>{libelle ?? m[0]}</span>
}
