import { Suspense } from 'react'
import Link from 'next/link'
import {
  Award,
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
  type LucideIcon,
} from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { Enregistre } from './enregistre'
import { Logo } from '@/components/site/logo'

/**
 * La coque du tableau de bord d'un soignant : barre latérale, en-tête, tiroir
 * sur mobile. Reprise de la maquette « coque commune » (Figma, page
 * « Parcours · step by step »), branchée : chaque entrée est un lien, les
 * badges sont calculés. Emploi, statistiques et notifications n'ont pas encore
 * de données derrière : ils sont annoncés, pas simulés.
 */
export type CleNav =
  | 'vue'
  | 'fiche'
  | 'missions'
  | 'fraicheur'
  | 'partager'
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
}

function navigation(c: InfosCoque): { groupe: string | null; items: Entree[] }[] {
  const q = c.plusieursFiches ? `?fiche=${encodeURIComponent(c.slug)}` : ''
  const h = (p: string) => `/espace-pro/${p}${p ? '/' : ''}${q}`
  const compte: Entree[] = [
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
        items: [{ cle: 'stats', libelle: 'Statistiques', i: BarChart3, bientot: true }],
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
          { cle: 'delais', libelle: 'Délais de fabrication', i: Clock, href: h('delais'), badge: c.delaisAReconfirmer ? 1 : 0 },
          { cle: 'savoir-faire', libelle: 'Savoir-faire', i: Wrench, href: h('savoir-faire') },
          { cle: 'zone', libelle: 'Zone et logistique', i: Route, href: h('zone') },
          { cle: 'realisations', libelle: 'Réalisations', i: Images, href: h('realisations') },
          { cle: 'conformite', libelle: 'Conformité', i: FileCheck2, href: h('conformite') },
          { cle: 'emploi', libelle: 'Emploi', i: Briefcase, bientot: true },
        ],
      },
      {
        groupe: 'Visibilité',
        items: [
          { cle: 'partager', libelle: 'Partager', i: Send, href: h('partager') },
          { cle: 'stats', libelle: 'Statistiques', i: BarChart3, bientot: true },
        ],
      },
      {
        groupe: 'Confiance',
        items: [
          { cle: 'registre', libelle: 'Registre', i: ShieldCheck, href: h('registre') },
          { cle: 'distinctions', libelle: 'Distinctions', i: Award, href: h('distinctions') },
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
        { cle: 'missions', libelle: 'Missions', i: Sparkles, href: h('missions'), badge: c.missionsRestantes },
        { cle: 'fraicheur', libelle: 'Fraîcheur', i: RefreshCw, href: h('fraicheur'), badge: c.aReconfirmer },
        { cle: 'emploi', libelle: 'Emploi', i: Briefcase, bientot: true },
      ],
    },
    {
      groupe: 'Visibilité',
      items: [
        { cle: 'partager', libelle: 'Partager et parrainer', i: Send, href: h('partager') },
        { cle: 'stats', libelle: 'Statistiques', i: BarChart3, bientot: true },
      ],
    },
    {
      groupe: 'Confiance',
      items: [
        { cle: 'registre', libelle: 'Registre', i: ShieldCheck, href: h('registre') },
        { cle: 'distinctions', libelle: 'Distinctions', i: Award, href: h('distinctions') },
        { cle: 'notifications', libelle: 'Notifications', i: Bell, bientot: true },
      ],
    },
    { groupe: 'Compte', items: compte },
  ]
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
  children,
}: {
  c: InfosCoque
  actif: CleNav
  titre: string
  sousTitre: string
  children: React.ReactNode
}) {
  const carteEnLigne = (
    <div className="squircle-xl border border-line bg-bg p-3 text-xs">
      <p className="flex items-center gap-1.5 font-semibold text-fg">
        <span className={`size-2 rounded-full ${c.enLigne ? 'bg-teal' : 'bg-amber-400'}`} /> {c.enLigne ? (c.etablissement ? 'Page en ligne' : 'Fiche en ligne') : c.etablissement ? 'Page en préparation' : 'Fiche en préparation'}
        {c.pagePublique && <ExternalLink className="ml-auto size-3.5 text-fg-2" aria-hidden />}
      </p>
      {c.pagePublique ? (
        <Link href={chemin(c.pagePublique)} className="mt-1 block break-all font-mono text-[11px] text-fg-2 hover:text-fg">
          dentalmap.fr{c.pagePublique}
        </Link>
      ) : (
        <p className="mt-1 text-[11px] text-fg-2">{c.etablissement ? 'Publiée dès la vérification et la publication de vos formations.' : 'Publiée dès la vérification de votre identité.'}</p>
      )}
    </div>
  )
  const marque = (
    <Link href="/" className="flex items-center gap-2 px-2">
      <Logo hauteur={28} />
      <span className="squircle-full bg-fg px-2 py-0.5 text-[10px] font-semibold text-bg">Pro</span>
    </Link>
  )
  const identite = (
    <div className="squircle-xl flex items-center gap-3 border border-line bg-bg p-3">
      <span className="squircle-lg grid size-9 shrink-0 place-items-center bg-white text-xs font-bold text-[#0e1317] ring-1 ring-line">{c.mono}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fg">{c.nom}</p>
        <p className="truncate text-xs text-fg-2">{c.ligne2}</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-dvh bg-bg">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-bg-soft px-4 py-5 lg:flex">
        {marque}
        <div className="mt-6">{identite}</div>
        <div className="mt-5 flex-1">
          <Nav c={c} actif={actif} />
        </div>
        <div className="mt-6">{carteEnLigne}</div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-10 pt-6 sm:px-8">
        <details className="group -mx-4 -mt-6 mb-6 border-b border-line bg-bg-soft lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
            <span className="squircle-lg grid size-8 place-items-center bg-white text-[10px] font-bold text-[#0e1317] ring-1 ring-line">{c.mono}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{c.nom}</span>
            <span className="grid size-9 place-items-center rounded-full border border-line bg-bg">
              <Menu className="size-4" aria-hidden />
              <span className="sr-only">Menu de l’espace pro</span>
            </span>
          </summary>
          <div className="space-y-4 px-4 pb-5">
            <Nav c={c} actif={actif} />
            {carteEnLigne}
          </div>
        </details>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg">{titre}</h1>
            <p className="text-sm text-fg-2">{sousTitre}</p>
          </div>
          {c.pagePublique && (
            <Link href={chemin(c.pagePublique)} className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium text-fg shadow-sm hover:border-line-strong">
              <ExternalLink className="size-4" aria-hidden /> {c.etablissement ? 'Voir ma page' : 'Voir ma fiche'}
            </Link>
          )}
        </header>
        <div className="mt-6">
          {/* L'espace établissement a son propre retour, bloc par bloc. */}
          {!c.etablissement && (
            <Suspense fallback={null}>
              <Enregistre enLigne={c.enLigne} />
            </Suspense>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export function Tuile({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <section className={`squircle-2xl border border-line bg-bg p-5 ${className}`}>{children}</section>
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
