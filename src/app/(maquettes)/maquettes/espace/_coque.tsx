/** MAQUETTE. Coque du tableau de bord (barre latérale, en-tête), reprise du tableau de bord dentiste v3. */
import {
  Award,
  BarChart3,
  FileText,
  Sparkles,
  Clock,
  FileCheck2,
  HeartPulse,
  Map,
  RefreshCw,
  Route,
  Wrench,
  Bell,
  BellRing,
  Briefcase,
  CalendarDays,
  Eye,
  Inbox,
  UserRound,
  ExternalLink,
  Menu,
  GraduationCap,
  Images,
  LayoutGrid,
  PanelsTopLeft,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'

const NAV_ETAB = [
  { groupe: null, items: [
    { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid },
    { cle: 'page', libelle: 'Ma page', i: PanelsTopLeft, badge: '4' },
    { cle: 'formations', libelle: 'Formations', i: GraduationCap },
    { cle: 'admission', libelle: 'Admission et calendrier', i: CalendarDays },
    { cle: 'galerie', libelle: 'Galerie', i: Images },
    { cle: 'evenements', libelle: 'Événements', i: Ticket },
  ] },
  { groupe: 'Visibilité', items: [
    { cle: 'partager', libelle: 'Partager et parrainer', i: Send },
    { cle: 'stats', libelle: 'Statistiques', i: BarChart3 },
  ] },
  { groupe: 'Confiance', items: [
    { cle: 'registres', libelle: 'Registres', i: ShieldCheck },
    { cle: 'notifications', libelle: 'Notifications', i: Bell, badge: '+2', vert: true },
  ] },
  { groupe: 'Compte', items: [
    { cle: 'equipe', libelle: 'Équipe', i: Users },
    { cle: 'compte', libelle: 'Compte et sécurité', i: Settings },
  ] },
]

type Item = { cle: string; libelle: string; i: typeof Bell; badge?: string; vert?: boolean }
type Groupe = { groupe: string | null; items: Item[] }

const VISIBILITE: Groupe = { groupe: 'Visibilité', items: [
  { cle: 'partager', libelle: 'Partager et parrainer', i: Send },
  { cle: 'stats', libelle: 'Statistiques', i: BarChart3 },
] }
const COMPTE: Groupe = { groupe: 'Compte', items: [
  { cle: 'equipe', libelle: 'Équipe', i: Users },
  { cle: 'compte', libelle: 'Compte et sécurité', i: Settings },
] }
const confiance = (badge: string): Groupe => ({ groupe: 'Confiance', items: [
  { cle: 'registres', libelle: 'Registres', i: ShieldCheck },
  { cle: 'notifications', libelle: 'Notifications', i: Bell, badge, vert: true },
] })

const navCandidat = (etudiant: boolean): Groupe[] => [
  { groupe: null, items: [
    { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid },
    { cle: 'offres', libelle: 'Offres pour vous', i: Briefcase, badge: '12', vert: true },
    { cle: 'candidatures', libelle: 'Candidatures', i: Inbox },
    { cle: 'profil', libelle: 'Mon profil', i: UserRound },
    ...(etudiant ? [{ cle: 'formation', libelle: 'Ma formation', i: GraduationCap }] : []),
  ] },
  { groupe: 'Recherche', items: [
    { cle: 'alertes', libelle: 'Alertes emploi', i: BellRing },
    { cle: 'visibilite', libelle: 'Visibilité', i: Eye },
  ] },
  { groupe: 'Compte', items: [
    { cle: 'notifications', libelle: 'Notifications', i: Bell },
    { cle: 'compte', libelle: 'Compte et sécurité', i: Settings },
  ] },
]

export const PROFILS = {
  dentiste: {
    mono: 'MD', l1: 'Dr Martin Dupont', l2: 'Cabinet Sainte-Catherine', long: 'Dr Martin Dupont',
    url: 'dentalmap.fr/dentistes/gironde/bordeaux/dr-martin-dupont', libelleUrl: 'Fiche en ligne', voir: 'Voir ma fiche',
    nav: [
      { groupe: null, items: [
        { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid },
        { cle: 'fiche', libelle: 'Ma fiche', i: FileText },
        { cle: 'missions', libelle: 'Missions', i: Sparkles, badge: '4' },
        { cle: 'fraicheur', libelle: 'Fraîcheur', i: RefreshCw },
        { cle: 'emploi', libelle: 'Emploi', i: Briefcase, badge: '3', vert: true },
      ] },
      VISIBILITE,
      { groupe: 'Confiance', items: [
        { cle: 'registres', libelle: 'Registre', i: ShieldCheck },
        { cle: 'distinctions', libelle: 'Distinctions', i: Award },
        { cle: 'notifications', libelle: 'Notifications', i: Bell, badge: '+1', vert: true },
      ] },
      { groupe: 'Compte', items: [{ cle: 'compte', libelle: 'Compte et sécurité', i: Settings }] },
    ] as Groupe[],
  },
  etablissement: {
    mono: 'EPB', l1: 'École de prothèse', l2: 'dentaire de Bordeaux', long: 'École de prothèse dentaire de Bordeaux',
    url: 'dentalmap.fr/formation/ecoles-de-prothese/ecole-prothese-bordeaux', libelleUrl: 'Page en ligne', voir: 'Voir ma page',
    nav: NAV_ETAB as unknown as Groupe[],
  },
  labo: {
    mono: 'AD', l1: 'Laboratoire Artemis', l2: 'Dentaire · Mérignac', long: 'Laboratoire Artemis Dentaire',
    url: 'dentalmap.fr/prothesistes/gironde/merignac/artemis-dentaire', libelleUrl: 'Fiche en ligne', voir: 'Voir ma fiche',
    nav: [
      { groupe: null, items: [
        { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid },
        { cle: 'fiche', libelle: 'Ma fiche', i: PanelsTopLeft },
        { cle: 'delais', libelle: 'Délais de fabrication', i: Clock, badge: '1' },
        { cle: 'savoir', libelle: 'Savoir-faire', i: Wrench },
        { cle: 'zone', libelle: 'Zone et logistique', i: Route },
        { cle: 'realisations', libelle: 'Réalisations', i: Images },
        { cle: 'conformite', libelle: 'Conformité', i: FileCheck2 },
        { cle: 'emploi', libelle: 'Emploi', i: Briefcase, badge: '3', vert: true },
      ] },
      VISIBILITE, confiance('+1'), COMPTE,
    ] as Groupe[],
  },
  faculte: {
    mono: 'UE', l1: 'Faculté d’odontologie', l2: 'Université de l’Estuaire', long: 'Faculté d’odontologie, Université de l’Estuaire',
    url: 'dentalmap.fr/formation/facultes-odontologie/universite-estuaire', libelleUrl: 'Page en ligne', voir: 'Voir ma page',
    nav: [
      { groupe: null, items: [
        { cle: 'vue', libelle: 'Vue d’ensemble', i: LayoutGrid },
        { cle: 'page', libelle: 'Ma page', i: PanelsTopLeft, badge: '3' },
        { cle: 'acces', libelle: 'Accès aux études', i: GraduationCap },
        { cle: 'cursus', libelle: 'Cursus et internat', i: Map },
        { cle: 'soins', libelle: 'Centres de soins', i: HeartPulse },
        { cle: 'galerie', libelle: 'Galerie', i: Images },
        { cle: 'evenements', libelle: 'Événements', i: Ticket },
      ] },
      VISIBILITE, confiance('+3'), COMPTE,
    ] as Groupe[],
  },
  salarie: {
    mono: 'CM', l1: 'Camille Martin', l2: 'Assistante dentaire · Bordeaux', long: 'Camille Martin',
    url: 'dentalmap.fr/emploi/profil/cm-bordeaux', libelleUrl: 'Profil visible', voir: 'Voir mon profil',
    nav: navCandidat(false),
  },
  etudiant: {
    mono: 'LB', l1: 'Lucas Bernard', l2: 'BTS prothésiste dentaire, 1re année', long: 'Lucas Bernard',
    url: 'dentalmap.fr/emploi/profil/lb-bordeaux', libelleUrl: 'Profil visible', voir: 'Voir mon profil',
    nav: navCandidat(true),
  },
} as const
export type Profil = keyof typeof PROFILS
/** Les quatre profils d’établissement ou de praticien (hors candidats). */
export type ProfilPro = 'dentiste' | 'etablissement' | 'labo' | 'faculte'

export function Coque({ profil = 'etablissement', actif, titre, sousTitre, action, children }: { profil?: Profil; actif: string; titre: string; sousTitre: string; action?: React.ReactNode; children: React.ReactNode }) {
  const P = PROFILS[profil]
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 flex-col self-stretch border-r border-line bg-bg-soft px-4 py-5 lg:flex">
        <div className="flex items-center gap-2 px-2">
          <span className="size-7 rounded-md bg-brand" />
          <span className="text-lg font-bold tracking-tight text-fg">DentalMap</span>
          <span className="squircle-full bg-fg px-2 py-0.5 text-[10px] font-semibold text-bg">Pro</span>
        </div>
        <div className="squircle-xl mt-6 flex items-center gap-3 border border-line bg-bg p-3">
          <span className="squircle-lg grid size-9 place-items-center bg-white text-xs font-bold text-[#0e1317] ring-1 ring-line">{P.mono}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{P.l1}</p>
            <p className="truncate text-xs text-fg-2">{P.l2}</p>
          </div>
        </div>
        <nav className="mt-5 flex-1 space-y-5">
          {P.nav.map((g) => (
            <div key={g.groupe ?? 'principal'}>
              {g.groupe && <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-fg-2">{g.groupe}</p>}
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.cle}>
                    <span
                      className={`squircle-lg flex items-center gap-3 px-3 py-2 text-sm ${
                        it.cle === actif ? 'border border-line bg-bg font-semibold text-fg shadow-sm' : 'text-fg-2'
                      }`}
                    >
                      <it.i className="size-4" aria-hidden />
                      <span className="flex-1">{it.libelle}</span>
                      {'badge' in it && it.badge && (
                        <span className={`squircle-full px-1.5 text-[11px] font-semibold ${'vert' in it && it.vert ? 'bg-teal/15 text-teal' : 'bg-amber-100 text-amber-700'}`}>{it.badge}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="squircle-xl sticky bottom-5 mt-6 border border-line bg-bg p-3 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-fg">
            <span className="size-2 rounded-full bg-teal" /> {P.libelleUrl} <ExternalLink className="ml-auto size-3.5 text-fg-2" aria-hidden />
          </p>
          <p className="mt-1 break-all font-mono text-[11px] text-fg-2">{P.url}</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <div className="-mx-4 -mt-6 mb-6 flex items-center gap-3 border-b border-line bg-bg-soft px-4 py-3 lg:hidden">
          <span className="squircle-lg grid size-8 place-items-center bg-white text-[10px] font-bold text-[#0e1317] ring-1 ring-line">{P.mono}</span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{P.long}</p>
          <span className="grid size-9 place-items-center rounded-full border border-line bg-bg">
            <Menu className="size-4" aria-hidden />
          </span>
        </div>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg">{titre}</h1>
            <p className="text-sm text-fg-2">{sousTitre}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="squircle-full hidden h-10 w-72 items-center gap-2 border border-line bg-bg px-4 text-sm text-fg-2 md:flex">
              <Search className="size-4" aria-hidden /> Rechercher ou agir…
              <span className="ml-auto rounded border border-line px-1.5 text-[10px]">⌘K</span>
            </span>
            <span className="relative grid size-10 place-items-center rounded-full border border-line bg-bg text-fg">
              <Bell className="size-4" aria-hidden />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-teal" />
            </span>
            {action ?? (
              <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium text-fg shadow-sm">
                <ExternalLink className="size-4" aria-hidden /> {P.voir}
              </span>
            )}
          </div>
        </header>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}

export function Tuile({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <section className={`squircle-2xl border border-line bg-bg p-5 ${className}`}>{children}</section>
}

export function TitreTuile({ i: I, children, droite }: { i: typeof Bell; children: React.ReactNode; droite?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <I className="size-4 text-fg-2" aria-hidden /> {children}
      </h2>
      {droite}
    </div>
  )
}

/** Statut d'une section de la page publique. */
export function Statut({ s }: { s: 'publiee' | 'incomplete' | 'vide' | 'auto' }) {
  const m = {
    publiee: ['Publiée', 'bg-teal/10 text-teal ring-teal/25'],
    incomplete: ['À compléter', 'bg-amber-50 text-amber-700 ring-amber-200'],
    vide: ['Masquée, vide', 'bg-bg-soft text-fg-2 ring-line'],
    auto: ['Automatique', 'bg-bg text-fg ring-line'],
  }[s]
  return <span className={`squircle-full inline-flex px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${m[1]}`}>{m[0]}</span>
}
