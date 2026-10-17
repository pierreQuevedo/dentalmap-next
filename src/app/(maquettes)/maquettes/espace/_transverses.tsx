/** MAQUETTE. États transverses : menu mobile, recherche ⌘K, changement d'espace, états vides, chargement, erreur, session. */
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarPlus,
  Check,
  ChevronsUpDown,
  Clock,
  CornerDownLeft,
  ExternalLink,
  FileText,
  HelpCircle,
  ImagePlus,
  Images,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Send,
  Ticket,
  WifiOff,
  X,
} from 'lucide-react'
import { Coque, PROFILS, Tuile, type Profil } from './_coque'
import { DentFiche, DentVue } from './_dentiste'
import { LaboVue } from './_labo'

/** Calque posé sur un écran. En mobile, on cadre sur la hauteur d'un téléphone. */
function Calque({ base, children }: { base: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative max-lg:h-[844px] max-lg:overflow-hidden">
      {base}
      {children}
    </div>
  )
}

const Voile = () => <div className="absolute inset-0 bg-[#0e1317]/45" />

/* Menu mobile ouvert */

export function MenuMobile({ profil }: { profil: Profil }) {
  const P = PROFILS[profil]
  return (
    <div className="flex h-[844px] flex-col bg-bg-soft">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="size-7 rounded-md bg-brand" />
        <span className="text-lg font-bold tracking-tight text-fg">DentalMap</span>
        <span className="squircle-full bg-fg px-2 py-0.5 text-[10px] font-semibold text-bg">Pro</span>
        <span className="ml-auto grid size-9 place-items-center rounded-full border border-line bg-bg text-fg">
          <X className="size-4" aria-hidden />
        </span>
      </div>
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="squircle-xl mt-4 flex items-center gap-3 border border-line bg-bg p-3">
          <span className="squircle-lg grid size-9 place-items-center bg-white text-xs font-bold text-[#0e1317] ring-1 ring-line">{P.mono}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{P.l1}</p>
            <p className="truncate text-xs text-fg-2">{P.l2}</p>
          </div>
          <ChevronsUpDown className="size-4 text-fg-2" aria-hidden />
        </div>
        <span className="squircle-full mt-3 flex h-11 items-center gap-2 border border-line bg-bg px-4 text-sm text-fg-2">
          <Search className="size-4" aria-hidden /> Rechercher ou agir…
        </span>
        <nav className="mt-4 space-y-4">
          {P.nav.map((g) => (
            <div key={g.groupe ?? 'principal'}>
              {g.groupe && <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-fg-2">{g.groupe}</p>}
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.cle}>
                    <span className={`squircle-lg flex items-center gap-3 px-3 py-2 text-sm ${it.cle === 'vue' ? 'border border-line bg-bg font-semibold text-fg shadow-sm' : 'text-fg-2'}`}>
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
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-line bg-bg p-4">
        <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg">
          <LogOut className="size-4" aria-hidden /> Se déconnecter
        </span>
        <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground">
          <ExternalLink className="size-4" aria-hidden /> {P.voir}
        </span>
      </div>
    </div>
  )
}

/* Recherche et actions rapides (⌘K) */

type Ligne = { i: typeof Bell; t: string; d: string; actif?: boolean }

function Palette({ requete, groupes, vide }: { requete: string; groupes: [string, Ligne[]][]; vide?: boolean }) {
  return (
    <div className="absolute inset-x-0 top-0 flex justify-center px-3 pt-3 lg:top-20 lg:px-4 lg:pt-0">
      <div className="squircle-2xl w-full max-w-xl overflow-hidden bg-bg shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="size-5 text-fg-2" aria-hidden />
          <span className={`flex-1 text-base ${requete ? 'text-fg' : 'text-fg-2'}`}>{requete || 'Rechercher une rubrique, une action, une aide…'}</span>
          <span className="rounded border border-line px-1.5 text-[11px] text-fg-2">Échap</span>
        </div>
        {vide ? (
          <div className="px-6 py-10 text-center">
            <p className="font-semibold text-fg">Aucun résultat pour « {requete} »</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-fg-2">Essayez un autre mot, ou écrivez-nous : nous répondons sous deux jours ouvrés.</p>
            <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg">
              <HelpCircle className="size-4" aria-hidden /> Contacter l’équipe
            </span>
          </div>
        ) : (
          <div className="max-h-[32rem] space-y-1 overflow-hidden p-2">
            {groupes.map(([g, lignes]) => (
              <div key={g}>
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-fg-2">{g}</p>
                <ul>
                  {lignes.map((l) => (
                    <li key={l.t} className={`squircle-lg flex items-center gap-3 px-3 py-2.5 ${l.actif ? 'bg-bg-soft' : ''}`}>
                      <span className="squircle-lg grid size-8 shrink-0 place-items-center border border-line bg-bg text-fg-2">
                        <l.i className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-fg">{l.t}</span>
                        <span className="block truncate text-xs text-fg-2">{l.d}</span>
                      </span>
                      {l.actif && <CornerDownLeft className="size-4 text-fg-2" aria-hidden />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-fg-2 sm:flex">
          <span><kbd className="rounded border border-line px-1">↑</kbd> <kbd className="rounded border border-line px-1">↓</kbd> naviguer</span>
          <span><kbd className="rounded border border-line px-1">↵</kbd> ouvrir</span>
          <span className="ml-auto">Les actions ouvrent le panneau de modification</span>
        </div>
      </div>
    </div>
  )
}

export function PaletteSuggestions() {
  return (
    <Calque base={<DentVue />}>
      <Voile />
      <Palette
        requete=""
        groupes={[
          ['Suggéré pour vous', [
            { i: RefreshCw, t: 'Reconfirmer mes horaires', d: 'Fraîcheur · à faire dans 15 jours', actif: true },
            { i: ImagePlus, t: 'Ajouter une photo du cabinet', d: 'Mission · 3 minutes' },
          ]],
          ['Aller à', [
            { i: FileText, t: 'Ma fiche', d: 'Rubrique' },
            { i: BarChart3, t: 'Statistiques', d: 'Rubrique' },
            { i: Send, t: 'Partager et parrainer', d: 'Rubrique' },
          ]],
          ['Aide', [{ i: HelpCircle, t: 'Comment les résultats sont-ils classés ?', d: 'Distance, puis ordre alphabétique' }]],
        ]}
      />
    </Calque>
  )
}

export function PaletteResultats() {
  return (
    <Calque base={<DentVue />}>
      <Voile />
      <Palette
        requete="horaires"
        groupes={[
          ['Actions', [
            { i: Clock, t: 'Modifier mes horaires', d: 'Ma fiche · Horaires', actif: true },
            { i: RefreshCw, t: 'Reconfirmer mes horaires', d: 'Fraîcheur · à faire dans 15 jours' },
            { i: CalendarPlus, t: 'Ajouter une fermeture exceptionnelle', d: 'Ma fiche · Horaires' },
          ]],
          ['Aide', [
            { i: HelpCircle, t: 'Pourquoi reconfirmer mes horaires ?', d: 'Au-delà de douze mois, ils sont masqués' },
          ]],
        ]}
      />
    </Calque>
  )
}

export function PaletteVide() {
  return (
    <Calque base={<DentVue />}>
      <Voile />
      <Palette requete="facturation tiers" groupes={[]} vide />
    </Calque>
  )
}

/* Changement d'espace (plusieurs fiches ou établissements) */

type Espace = { mono: string; t: string; d: string; role: string; actif?: boolean }

function Selecteur({ espaces, ajout }: { espaces: Espace[]; ajout: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 lg:inset-x-auto lg:bottom-auto lg:left-4 lg:top-[7.75rem] lg:w-80">
      <div className="rounded-t-3xl bg-bg p-2 shadow-pop lg:rounded-2xl lg:border lg:border-line">
        <span className="mx-auto mb-2 mt-1 block h-1 w-10 rounded-full bg-line lg:hidden" />
        <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-fg-2">Vos espaces</p>
        <ul>
          {espaces.map((e) => (
            <li key={e.t} className={`squircle-lg flex items-center gap-3 px-3 py-2.5 ${e.actif ? 'bg-bg-soft' : ''}`}>
              <span className="squircle-lg grid size-9 shrink-0 place-items-center bg-white text-xs font-bold text-[#0e1317] ring-1 ring-line">{e.mono}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-fg">{e.t}</span>
                <span className="block truncate text-xs text-fg-2">{e.d} · {e.role}</span>
              </span>
              {e.actif && <Check className="size-4 text-teal" aria-hidden />}
            </li>
          ))}
        </ul>
        <div className="mt-1 border-t border-line pt-1">
          <span className="squircle-lg flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-fg">
            <span className="squircle-lg grid size-9 place-items-center border border-dashed border-line text-fg-2">
              <Plus className="size-4" aria-hidden />
            </span>
            {ajout}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ChangerEspaceDentiste() {
  return (
    <Calque base={<DentVue />}>
      <div className="absolute inset-0 bg-[#0e1317]/45 lg:bg-transparent" />
      <Selecteur
        espaces={[
          { mono: 'MD', t: 'Dr Martin Dupont', d: 'Fiche praticien', role: 'Titulaire', actif: true },
          { mono: 'UE', t: 'Faculté d’odontologie', d: 'Université de l’Estuaire', role: 'Éditeur' },
        ]}
        ajout="Revendiquer une autre fiche"
      />
    </Calque>
  )
}

export function ChangerEspaceLabo() {
  return (
    <Calque base={<LaboVue />}>
      <div className="absolute inset-0 bg-[#0e1317]/45 lg:bg-transparent" />
      <Selecteur
        espaces={[
          { mono: 'AD', t: 'Laboratoire Artemis Dentaire', d: 'Mérignac, siège', role: 'Gérant', actif: true },
          { mono: 'AD', t: 'Artemis Dentaire', d: 'Libourne, second site', role: 'Gérant' },
          { mono: 'PC', t: 'Prothèse Céramique Atlantique', d: 'Pessac', role: 'Membre' },
        ]}
        ajout="Ajouter un établissement"
      />
    </Calque>
  )
}

/* États vides */

function Vide({ i: I, titre, texte, action, aide, children }: { i: typeof Bell; titre: string; texte: string; action?: string; aide?: string; children?: React.ReactNode }) {
  return (
    <Tuile className="px-6 py-14 text-center sm:py-20">
      <span className="squircle-2xl mx-auto grid size-14 place-items-center bg-bg-soft text-fg-2 ring-1 ring-line">
        <I className="size-6" aria-hidden />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-fg">{titre}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-fg-2">{texte}</p>
      {action && (
        <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
          <Plus className="size-4" aria-hidden /> {action}
        </span>
      )}
      {aide && <p className="mt-4 text-xs text-fg-2">{aide}</p>}
      {children}
    </Tuile>
  )
}

export function VideGalerie() {
  return (
    <Coque profil="etablissement" actif="galerie" titre="Galerie" sousTitre="Aucune photo · la galerie est masquée de votre page">
      <Vide
        i={Images}
        titre="Montrez vos locaux et vos plateaux techniques"
        texte="La galerie apparaît sur votre page dès la première photo. Les cinq premières s’affichent en mosaïque, les suivantes dans la visionneuse."
        action="Ajouter des photos"
        aide="JPEG ou PNG, 12 Mo au plus par photo. Vous indiquez le crédit photo à l’envoi."
      />
    </Coque>
  )
}

export function VideEvenements() {
  return (
    <Coque profil="faculte" actif="evenements" titre="Événements" sousTitre="Aucun événement à venir">
      <Vide
        i={Ticket}
        titre="Aucun événement à venir"
        texte="Journées portes ouvertes, conférences, soutenances publiques : chaque événement s’affiche sur votre page jusqu’à sa date, puis disparaît de lui-même."
        action="Ajouter un événement"
      />
    </Coque>
  )
}

export function VideNotifications() {
  return (
    <Coque profil="labo" actif="notifications" titre="Notifications" sousTitre="Tout est à jour">
      <Vide
        i={Bell}
        titre="Rien de nouveau"
        texte="Vous serez prévenu ici, et par courriel si vous le souhaitez, quand une information est à reconfirmer ou qu’un registre change."
        aide="Réglages des courriels dans Compte et sécurité."
      />
    </Coque>
  )
}

export function VideStatistiques() {
  return (
    <Coque profil="dentiste" actif="stats" titre="Statistiques" sousTitre="Fiche publiée il y a 2 jours">
      <Vide
        i={BarChart3}
        titre="Vos premiers chiffres arrivent dans 5 jours"
        texte="Il faut une semaine de consultations pour afficher des tendances fiables. En attendant, partagez votre fiche à vos patients."
      >
        <div className="mx-auto mt-8 flex h-24 max-w-md items-end gap-1.5 opacity-60" aria-hidden>
          {[30, 45, 38, 52, 47, 60, 55, 68, 62, 70, 66, 74].map((h, i) => (
            <span key={i} className="flex-1 rounded-t bg-line" style={{ height: `${h}px` }} />
          ))}
        </div>
        <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg">
          <Send className="size-4" aria-hidden /> Partager ma fiche
        </span>
      </Vide>
    </Coque>
  )
}

export function VideRealisations() {
  return (
    <Coque profil="labo" actif="realisations" titre="Réalisations" sousTitre="Aucune réalisation · la section est masquée de votre fiche">
      <Vide
        i={ImagePlus}
        titre="Montrez votre travail aux praticiens"
        texte="Couronnes, bridges, gouttières : quelques photos de pièces suffisent. Aucune photo de patient reconnaissable."
        action="Ajouter une réalisation"
        aide="Vous indiquez le matériau et le crédit photo à l’envoi."
      />
    </Coque>
  )
}

/* Chargement, erreur, session */

const Os = ({ className }: { className: string }) => <span className={`block animate-none rounded-lg bg-line/70 ${className}`} />

export function Chargement() {
  return (
    <Coque profil="dentiste" actif="vue" titre="Vue d’ensemble" sousTitre="Chargement…">
      <div className="space-y-6">
        <div className="squircle-2xl bg-bg-soft p-8">
          <Os className="h-5 w-32" />
          <Os className="mt-5 h-8 w-80 max-w-full" />
          <Os className="mt-3 h-4 w-96 max-w-full" />
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <Os className="h-7 w-16" />
                <Os className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Tuile key={i}>
              <Os className="h-4 w-40" />
              {[0, 1, 2].map((j) => (
                <div key={j} className="mt-5 flex items-center gap-3">
                  <Os className="size-9 shrink-0" />
                  <div className="flex-1">
                    <Os className="h-3.5 w-3/4" />
                    <Os className="mt-2 h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </Tuile>
          ))}
        </div>
      </div>
    </Coque>
  )
}

export function ErreurEnregistrement() {
  return (
    <Calque base={<DentFiche />}>
      <div className="absolute inset-x-3 bottom-6 flex justify-center lg:inset-x-0 lg:bottom-8">
        <div className="flex max-w-xl items-center gap-3 rounded-2xl bg-[#0e1317] px-5 py-3.5 text-sm text-white shadow-pop">
          <WifiOff className="size-4 shrink-0 text-amber-300" aria-hidden />
          <span className="flex-1">Connexion perdue : vos horaires n’ont pas été enregistrés. Rien n’est perdu sur cet écran.</span>
          <span className="shrink-0 font-semibold text-white underline underline-offset-2">Réessayer</span>
        </div>
      </div>
    </Calque>
  )
}

export function ErreurPage() {
  return (
    <Coque profil="etablissement" actif="page" titre="Ma page" sousTitre="Impossible de charger cette rubrique">
      <Tuile className="px-6 py-14 text-center sm:py-20">
        <span className="squircle-2xl mx-auto grid size-14 place-items-center bg-amber-50 text-amber-700 ring-1 ring-amber-200">
          <AlertTriangle className="size-6" aria-hidden />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-fg">Cette rubrique n’a pas pu être chargée</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-2">Votre page publique n’est pas touchée et reste en ligne. Réessayez dans un instant ; si le problème persiste, écrivez-nous.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
            <RefreshCw className="size-4" aria-hidden /> Réessayer
          </span>
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg">
            <HelpCircle className="size-4" aria-hidden /> Contacter l’équipe
          </span>
        </div>
        <p className="mt-4 font-mono text-[11px] text-fg-2">Référence de l’incident : 7F3K-21</p>
      </Tuile>
    </Coque>
  )
}

export function SessionExpiree() {
  return (
    <Calque base={<DentFiche />}>
      <Voile />
      <div className="absolute inset-x-0 top-24 flex justify-center px-4">
        <div className="squircle-2xl w-full max-w-md bg-bg p-6 text-center shadow-pop">
          <span className="squircle-2xl mx-auto grid size-12 place-items-center bg-bg-soft text-fg ring-1 ring-line">
            <Building2 className="size-5" aria-hidden />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-fg">Votre session a expiré</h2>
          <p className="mt-2 text-sm text-fg-2">Pour protéger votre compte, la session se ferme après une période d’inactivité. Reconnectez-vous pour reprendre là où vous en étiez.</p>
          <span className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground">
            Se reconnecter <ArrowRight className="size-4" aria-hidden />
          </span>
          <p className="mt-3 text-xs text-fg-2">Un code à 6 chiffres vous sera envoyé par courriel.</p>
        </div>
      </div>
    </Calque>
  )
}

export const TRANSVERSES = {
  't-menu-dentiste': () => <MenuMobile profil="dentiste" />,
  't-menu-labo': () => <MenuMobile profil="labo" />,
  't-menu-etablissement': () => <MenuMobile profil="etablissement" />,
  't-menu-faculte': () => <MenuMobile profil="faculte" />,
  't-menu-salarie': () => <MenuMobile profil="salarie" />,
  't-menu-etudiant': () => <MenuMobile profil="etudiant" />,
  't-cmdk': PaletteSuggestions,
  't-cmdk-resultats': PaletteResultats,
  't-cmdk-vide': PaletteVide,
  't-espaces-dentiste': ChangerEspaceDentiste,
  't-espaces-labo': ChangerEspaceLabo,
  't-vide-galerie': VideGalerie,
  't-vide-evenements': VideEvenements,
  't-vide-notifications': VideNotifications,
  't-vide-stats': VideStatistiques,
  't-vide-realisations': VideRealisations,
  't-chargement': Chargement,
  't-erreur-enregistrement': ErreurEnregistrement,
  't-erreur-page': ErreurPage,
  't-session': SessionExpiree,
}
