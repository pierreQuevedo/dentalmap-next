import Image from 'next/image'
import { Logo } from '@/components/site/logo'
import { illustration } from '@/lib/annuaire/illustration'
import { Check, CircleX, Info, Lock, MapPin, UserRound, type LucideIcon } from 'lucide-react'

/**
 * Les briques des écrans du compte, reprises de la bibliothèque Figma
 * « Composants · DA site » : pastille de saisie, boutons, encart, carte
 * d'option, pictogramme. Partagées par la connexion (composant client) et
 * les pages serveur du compte, d'où l'absence d'état ici.
 */

// Fond opaque, pas de flou : le préremplissage du navigateur peint le champ
// seul, il doit se fondre dans la pastille (voir `.champ-compte` dans globals.css).
const pastilleBase = 'champ-compte squircle-full flex items-center gap-2.5 border bg-bg px-4 shadow-pill transition-colors'
export const pastille = `${pastilleBase} border-line focus-within:border-line-strong`
/** En erreur, le contour reste rouge, même au focus. */
export const pastilleInvalide = `${pastilleBase} border-destructive`
export const saisie = 'min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none placeholder:text-fg-2'
export const principal =
  'hover-lift squircle-full inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-action px-5 text-sm font-semibold text-action-foreground shadow-pill hover:bg-action-hover disabled:cursor-default disabled:opacity-60'
export const secondaire =
  'hover-lift squircle-full inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 border border-line bg-bg px-5 text-sm font-semibold text-fg shadow-pill hover:border-line-strong disabled:cursor-default disabled:opacity-60'
export const discret =
  'squircle-full inline-flex h-11 w-full cursor-pointer items-center justify-center px-5 text-sm font-medium text-fg-2 hover:text-fg'
export const lien = 'cursor-pointer font-medium text-fg underline underline-offset-4 hover:no-underline'
export const titre = 'text-balance text-2xl font-semibold tracking-tight text-fg md:text-3xl'

/** La marque, au-dessus du formulaire quand le volet de gauche est caché. */
export function Marque() {
  return (
    <div className="mb-8 flex items-center gap-3 lg:hidden">
      <Logo />
    </div>
  )
}

const TONS_PICTO = {
  neutre: 'bg-bg-soft text-fg',
  attention: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  erreur: 'bg-destructive/10 text-destructive',
  succes: 'bg-teal/15 text-teal',
}

/** Le rond qui ouvre un écran d'état : clé, sablier, croix, coche. */
export function Pictogramme({ icone: Icone, ton = 'neutre' }: { icone: LucideIcon; ton?: keyof typeof TONS_PICTO }) {
  return (
    <span aria-hidden className={`mb-5 grid size-[52px] place-items-center rounded-full ${TONS_PICTO[ton]}`}>
      <Icone className="size-6" />
    </span>
  )
}

/**
 * L'avancement du parcours : « Étape 2 sur 4 · Identification », et quatre
 * segments dont les premiers sont remplis.
 */
export function Etapes({ etape, total = 4, libelle }: { etape: number; total?: number; libelle: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">
        {etape > 0 ? `Étape ${etape} sur ${total} · ${libelle}` : libelle}
      </p>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-[3px] rounded-full ${i < etape ? 'bg-teal' : 'bg-line'}`} />
        ))}
      </div>
    </div>
  )
}

/** Une puce : un choix parmi quelques-uns, cochée en ardoise. Un vrai bouton radio, masqué. */
export function Puce({
  name,
  value,
  children,
  defaultChecked,
  checked,
  onChange,
  multiple = false,
}: {
  name: string
  value: string
  children: React.ReactNode
  defaultChecked?: boolean
  checked?: boolean
  onChange?: () => void
  /** Plusieurs choix possibles : une case à cocher plutôt qu'un bouton radio. */
  multiple?: boolean
}) {
  return (
    <label className="group inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action">
      <input type={multiple ? 'checkbox' : 'radio'} name={name} value={value} defaultChecked={defaultChecked} checked={checked} onChange={onChange} className="sr-only" />
      <Check className="hidden size-3.5 group-has-[:checked]:block" aria-hidden />
      {children}
    </label>
  )
}

/**
 * Le résumé d'une fiche du registre : profession, nom, adresse, RPPS. Repris
 * dans tout le parcours, de « C'est bien vous ? » au retrait.
 */
export function FicheResume({
  profession,
  nom,
  adresse,
  rpps,
  libelleIdentifiant = 'RPPS',
  verifiee,
  children,
}: {
  profession: string
  nom: string
  adresse: string | null
  rpps: string | null
  /** « RPPS » pour un soignant, « SIREN » pour un laboratoire. */
  libelleIdentifiant?: string
  verifiee?: boolean
  /** Ce qui suit le résumé dans la carte : une case à cocher, un rond de choix. */
  children?: React.ReactNode
}) {
  return (
    <div className="flex w-full items-center gap-3.5">
      {/* Un laboratoire est une structure : son visuel de remplacement, l'établi, plutôt qu'une silhouette. */}
      {libelleIdentifiant === 'SIREN' || profession.startsWith('Laboratoire') ? (
        <Image src={illustration('prothesiste', null)} alt="" width={80} height={80} className="size-10 shrink-0 rounded-xl object-cover" />
      ) : (
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-2">
          <UserRound className="size-[18px]" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-medium text-teal">{profession}</span>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-fg">{nom}</p>
        {adresse && (
          <p className="mt-0.5 flex items-start gap-1 text-xs text-fg-2">
            <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
            {adresse}
          </p>
        )}
        {rpps && (
          <p className="mt-0.5 font-mono text-[11px] text-fg-2">
            {libelleIdentifiant} {rpps}
          </p>
        )}
        {verifiee && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-medium text-teal">
            <Check className="size-3" aria-hidden />
            Vérifié auprès des registres officiels
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

/** Un cadre de carte, pour `FicheResume` et les listes de données. */
export const cadre = 'squircle-xl border border-line bg-bg px-[18px] py-4'

/** Les données du registre, ligne à ligne, chacune sous verrou : on les lit ici, on ne les change pas. */
export function LignesRegistre({ lignes }: { lignes: { libelle: string; valeur: string }[] }) {
  return (
    <dl className={`${cadre} divide-y divide-line py-1`}>
      {lignes.map((l) => (
        <div key={l.libelle} className="flex items-center gap-3 py-3 text-sm">
          <dt className="w-32 shrink-0 text-fg-2">{l.libelle}</dt>
          <dd className="min-w-0 flex-1 text-fg">{l.valeur}</dd>
          <Lock className="size-3.5 shrink-0 text-fg-2" aria-label="Donnée du registre" />
        </div>
      ))}
    </dl>
  )
}

/**
 * Un encart : une icône, un titre facultatif, une ou deux phrases. En erreur,
 * fond rouge pâle et texte rouge ; neutre, le fond adouci du site.
 */
export function Encart({ ton = 'neutre', titre, children, className = '' }: { ton?: 'neutre' | 'erreur'; titre?: string; children: React.ReactNode; className?: string }) {
  const erreur = ton === 'erreur'
  const Icone = erreur ? CircleX : Info
  return (
    <div
      role={erreur ? 'alert' : undefined}
      className={`squircle-xl flex items-start gap-3 border px-4 py-3.5 text-[13px] leading-[18px] ${
        erreur ? 'border-transparent bg-destructive/10 text-destructive' : 'border-line bg-bg-soft text-fg-2'
      } ${className}`}
    >
      <Icone className="mt-px size-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {titre && <p className={`font-semibold ${erreur ? '' : 'text-fg'}`}>{titre}</p>}
        <div className={titre ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  )
}

/**
 * Une carte d'option, choix unique.
 *
 * Un vrai bouton radio, masqué : les flèches passent d'une carte à l'autre et
 * le formulaire reçoit la valeur sans script. La carte choisie prend un
 * contour ardoise et le fond adouci ; le rond se remplit.
 */
export function CarteOption({
  name,
  value,
  titre,
  detail,
  icone: Icone,
  badge,
  required,
  defaultChecked,
  checked,
  onChange,
  disabled,
}: {
  name: string
  value: string
  titre: string
  detail: string
  icone: LucideIcon
  badge?: string
  required?: boolean
  defaultChecked?: boolean
  checked?: boolean
  onChange?: () => void
  disabled?: boolean
}) {
  return (
    <label
      className={`group squircle-xl relative flex items-center gap-3.5 border border-line bg-bg px-[18px] py-4 transition-colors duration-fast has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:checked]:ring-[0.5px] has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${
        disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:border-line-strong'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        required={required}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-bg text-fg">
        <Icone className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="flex-1 text-[15px] font-semibold leading-[22px] text-fg">{titre}</span>
          {badge && <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium leading-[15px] text-fg-2">{badge}</span>}
        </span>
        <span className="mt-0.5 block text-[13px] leading-[18px] text-fg-2">{detail}</span>
      </span>
      <span
        aria-hidden
        className="size-5 shrink-0 rounded-full border border-line-strong bg-bg transition-[border-width,border-color] duration-fast group-has-[:checked]:border-[6px] group-has-[:checked]:border-fg"
      />
    </label>
  )
}
