/**
 * Briques communes aux fiches praticien et laboratoire : en-tête sombre sur
 * carte, pastilles, horaires, tableau du registre, barre d'action mobile.
 *
 * Chaque brique reçoit des données réelles et ne rend rien quand elles
 * manquent : une fiche brute du registre doit rester juste, pas vide de
 * cadres. Les données déclaratives portent toujours leur mention de source.
 */
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Bookmark, BookmarkCheck, Navigation, ShieldCheck } from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { clePosition, empriseAutour } from '@/lib/annuaire/emprise'
import { JOURS, LIBELLE_JOUR, type FicheCompletee, type Horaires, type Jour } from '@/lib/espace-pro/fiche-completee'
import { plagesDuJour, type Ouverture } from '@/lib/annuaire/ouverture'
import type { BaseUrl, Lieu, Praticien } from '@/lib/annuaire/types'
import { basculerFavori } from '@/lib/tunnel/actions'
import { chemin, FilAriane } from './primitives'
import { BoutonAppeler } from './telephone-protege'

const formatDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
export const dateLongue = (d: string | Date) => formatDate.format(new Date(d))

/* Gabarits des boutons de l'en-tête : principal, puis secondaires sur fond sombre. */
export const BOUTON_PRINCIPAL =
  'hover-lift inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover'
export const BOUTON_SOMBRE =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 sm:px-5'

export function Etiquette({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        accent ? 'bg-partiel-bg text-partiel ring-partiel-line' : 'bg-bg text-fg ring-line'
      }`}
    >
      {children}
    </span>
  )
}

/** Pastille de l'en-tête sombre : profession, spécialité. */
export function PastilleSombre({ children }: { children: React.ReactNode }) {
  return <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">{children}</span>
}

/** Petite pastille à icône de l'en-tête sombre : vérification, fiche gérée, ANSM. */
export function MarqueSombre({ icone: Icone, children, ambre }: { icone: typeof ShieldCheck; children: React.ReactNode; ambre?: boolean }) {
  return (
    <span className="squircle-full inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
      <Icone className={`size-3.5 ${ambre ? 'text-partiel' : 'text-teal'}`} aria-hidden /> {children}
    </span>
  )
}

/**
 * État au regard des registres, dans l'en-tête sombre. Le libellé dit d'où
 * vient l'information ; l'exception, l'identité non confirmée, reste visible.
 */
export function VerificationSombre({ statut }: { statut: Praticien['statutVerification'] }) {
  if (statut === 'verifie') return <MarqueSombre icone={ShieldCheck}>Vérifié auprès des registres officiels</MarqueSombre>
  return (
    <MarqueSombre icone={ShieldCheck} ambre>
      {statut === 'partiel' ? 'Identité en cours de vérification' : 'Non confronté à un registre public'}
    </MarqueSombre>
  )
}

export function MarqueGeree({ labo }: { labo: boolean }) {
  return <MarqueSombre icone={BadgeCheck}>{labo ? 'Fiche gérée par le laboratoire' : 'Fiche gérée par le praticien'}</MarqueSombre>
}

/** « Ouvert · ferme à 19 h », calculé à la requête sur les horaires déclarés. */
export function Statut({ ouverture, sombre }: { ouverture: Ouverture; sombre?: boolean }) {
  const point = ouverture.ouvert ? 'bg-teal' : sombre ? 'bg-white/50' : 'bg-fg-2'
  return (
    <span
      className={`squircle-full inline-flex items-center gap-2 px-3 py-1 text-sm font-medium ${
        sombre ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15' : 'bg-teal/10 text-teal ring-1 ring-inset ring-teal/25'
      }`}
    >
      <span className="relative flex size-2">
        {ouverture.ouvert && <span className="absolute inline-flex size-full rounded-full bg-teal opacity-40" />}
        <span className={`relative inline-flex size-2 rounded-full ${point}`} />
      </span>
      {ouverture.texte} <span className={sombre ? 'text-white/70' : 'text-fg-2'}>· {ouverture.detail}</span>
    </span>
  )
}

/** Mention de source et de fraîcheur d'une donnée déclarée. */
export function Renseigne({ par, confirmeLe, majLe, sombre }: { par: string; confirmeLe: string | null; majLe: string; sombre?: boolean }) {
  return (
    <p className={`text-xs ${sombre ? 'text-white/60' : 'text-fg-2'}`}>
      Renseigné par le {par}, {confirmeLe ? `confirmé le ${dateLongue(confirmeLe)}` : `mis à jour le ${dateLongue(majLe)}`}
    </p>
  )
}

export function Titre2({ children, sous }: { children: React.ReactNode; sous?: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">{children}</h2>
      {sous && <p className="mt-2 max-w-2xl text-fg-2">{sous}</p>}
    </div>
  )
}

/** Ce que le registre affirme, ligne par ligne ; les identifiants en chasse fixe. */
export function Registre({ lignes }: { lignes: [string, string][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      {lignes.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-fg-2">{k}</dt>
          <dd className={/RPPS|SIREN|SIRET|FINESS/.test(k) ? 'font-mono text-fg' : 'text-fg'}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Fond de l'en-tête : la carte du quartier, désaturée, le cabinet marqué par
 * le halo de survol. Rendue seulement si la position désigne vraiment une
 * adresse : un centroïde de commune placerait la fiche au milieu de la ville.
 * `zone` dessine le rayon desservi d'un laboratoire.
 */
export function FondCarte({
  base,
  lieu,
  rayon,
  zone,
}: {
  base: BaseUrl
  lieu: Lieu | undefined
  rayon: number
  zone?: boolean
}) {
  const situe = lieu?.lon != null && lieu.lat != null && !lieu.approximative
  return (
    <div className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
      {situe && (
        <>
          <Carte profession={base} emprise={empriseAutour(lieu.lon!, lieu.lat!, rayon)} className="size-full" survol={clePosition(lieu.lon, lieu.lat)} />
          <div className="absolute inset-0 bg-ardoise mix-blend-color" />
          {zone && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="ml-[35%] aspect-square h-[78%] rounded-full border-2 border-dashed border-teal/70 bg-teal/10" />
            </div>
          )}
        </>
      )}
      {zone ? (
        <>
          <div className="absolute inset-0 bg-background/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 [background:radial-gradient(ellipse_70%_80%_at_70%_45%,color-mix(in_oklch,var(--background)_30%,transparent)_0%,var(--background)_85%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </>
      )}
    </div>
  )
}

/** Fil d'Ariane lisible sur fond sombre. */
export function ArianeSombre({ segments }: { segments: { libelle: string; href?: string }[] }) {
  return (
    <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
      <FilAriane segments={segments} />
    </div>
  )
}

export function lienItineraire(l: Lieu): string {
  const q = [l.adresseLigne, l.codePostal, l.communeNom].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

export function BoutonItineraire({ lieu }: { lieu: Lieu }) {
  return (
    <a href={lienItineraire(lieu)} rel="noopener" className={BOUTON_SOMBRE}>
      <Navigation className="size-4" aria-hidden /> Itinéraire
    </a>
  )
}

/**
 * Mettre de côté : un favori par compte. Sans session, le formulaire conduit
 * à la connexion et revient ici.
 */
export function BoutonFavori({ slug, retour, favori }: { slug: string; retour: string; favori: boolean }) {
  return (
    <form action={basculerFavori} className="contents">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="retour" value={retour} />
      <button type="submit" aria-pressed={favori} className={`${BOUTON_SOMBRE} ${favori ? '!border-teal/60 !text-teal' : ''}`}>
        {favori ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
        {favori ? 'Dans vos favoris' : 'Mettre de côté'}
      </button>
    </form>
  )
}

/** Barre d'action fixe en bas d'écran, mobile seulement : le nom, l'état, l'appel. */
export function BarreMobile({
  titre,
  detail,
  ouvert,
  lieu,
  libelleAppel,
  secondaire,
}: {
  titre: string
  detail: string | null
  ouvert?: boolean
  lieu: Lieu | undefined
  libelleAppel: string
  secondaire?: { href: string; libelle: string; icone: React.ReactNode; externe?: boolean }
}) {
  if (!lieu) return null
  return (
    <div data-barre-mobile className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pb-6 pt-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{titre}</p>
          {detail && (
            <p className={`flex items-center gap-1.5 truncate text-xs ${ouvert ? 'text-teal' : 'text-fg-2'}`}>
              {ouvert !== undefined && <span className={`size-1.5 shrink-0 rounded-full ${ouvert ? 'bg-teal' : 'bg-fg-2'}`} />} {detail}
            </p>
          )}
        </div>
        {secondaire && (
          <a
            href={secondaire.href}
            target={secondaire.externe ? '_blank' : undefined}
            rel={secondaire.externe ? 'noopener nofollow' : 'noopener'}
            aria-label={secondaire.libelle}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-fg"
          >
            {secondaire.icone}
          </a>
        )}
        <BoutonAppeler
          lieuId={lieu.id}
          possede={lieu.aTelephone}
          libelle={libelleAppel}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground"
        />
      </div>
    </div>
  )
}

/** Semaine en sept cases, jour courant cerclé. */
export function Semaine({ horaires, aujourdhui }: { horaires: Horaires; aujourdhui: Jour }) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {JOURS.map((j) => {
        const plages = plagesDuJour(horaires, j)
        const ouvert = plages.length > 0
        return (
          <li
            key={j}
            aria-current={j === aujourdhui ? 'date' : undefined}
            className={`squircle-lg border p-3 text-sm ${ouvert ? 'border-line bg-bg' : 'border-dashed border-line bg-bg-soft text-fg-2'} ${
              j === aujourdhui ? 'ring-2 ring-teal/50' : ''
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-2">{LIBELLE_JOUR[j]}</p>
            {ouvert ? (
              <ul className="mt-1.5 space-y-0.5 tabular-nums text-fg">
                {plages.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5">Fermé</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Liste verticale des horaires, jour courant en gras. */
export function HorairesListe({ horaires, aujourdhui }: { horaires: Horaires; aujourdhui: Jour }) {
  return (
    <dl className="divide-y divide-line text-sm">
      {JOURS.map((j) => {
        const plages = plagesDuJour(horaires, j)
        return (
          <div key={j} className={`flex justify-between gap-4 py-2 ${j === aujourdhui ? 'font-semibold text-fg' : 'text-white/80'}`}>
            <dt>{LIBELLE_JOUR[j]}</dt>
            <dd className="text-right tabular-nums">{plages.length ? plages.join(' · ') : 'Fermé'}</dd>
          </div>
        )
      })}
    </dl>
  )
}

export function Photo({ src, alt, className = '', sizes = '(min-width: 1024px) 50vw, 100vw' }: { src: string; alt: string; className?: string; sizes?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  )
}

/**
 * Revendication, signalement d'erreur et liens de l'annuaire : ce que la
 * fiche propose à côté du registre.
 */
export function AsideFiche({
  slug,
  radie,
  labo,
  liens,
}: {
  slug: string
  radie: boolean
  labo: boolean
  liens: { libelle: string; href: string }[]
}) {
  return (
    <aside className="space-y-4">
      {!radie && (
        <div className="squircle-2xl border border-line bg-bg-soft p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <BadgeCheck className="size-4 text-teal" aria-hidden />
            {labo ? 'Vous gérez ce laboratoire ?' : 'Vous êtes ce professionnel ?'}
          </h2>
          <p className="mt-2 text-sm text-fg-2">
            {labo
              ? 'Revendiquez la fiche pour présenter votre savoir-faire, vos délais et votre zone aux cabinets qui cherchent un laboratoire.'
              : 'Revendiquez votre fiche pour ajouter vos horaires, vos langues et l’accessibilité de votre cabinet, et pour être joint par les patients qui vous cherchent.'}
          </p>
          {/*
            Un seul point d'entrée : la revendication s'ouvre sur cette fiche,
            la recherche déjà faite. Pro Santé Connect y est proposé aux
            professions du RPPS.
          */}
          <Link
            href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(slug)}`)}
            className="squircle-full mt-4 inline-block bg-action px-5 py-2.5 text-sm font-medium text-action-foreground hover:bg-action-hover"
          >
            Revendiquer cette fiche
          </Link>
        </div>
      )}
      <nav aria-label="Voir aussi" className="squircle-2xl border border-line p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">Voir aussi</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {liens.map((l) => (
            <li key={l.href}>
              <Link href={chemin(l.href)} className="text-fg hover:underline">
                {l.libelle}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="px-1 text-xs leading-relaxed text-fg-2">
        Une erreur sur cette fiche ?{' '}
        <Link href={chemin(`/contact/?objet=erreur-fiche&fiche=${encodeURIComponent(slug)}`)} className="underline underline-offset-2 hover:text-fg">
          Signalez-la
        </Link>
        , nous la vérifions auprès du registre.
      </p>
    </aside>
  )
}

/** Ce que la page de fiche a lu et calculé, transmis aux deux mises en page. */
export type ContexteFiche = {
  p: Praticien
  base: BaseUrl
  nom: string
  /** Libellé de la profession, au singulier, avec majuscule. */
  qualite: string
  principal: Lieu | undefined
  /** Lieu dont le numéro sert au bouton « Appeler » : le principal, sinon le premier qui a un numéro au registre. */
  appel: Lieu | undefined
  /** Déclaratif publié, seulement s'il porte au moins une information. */
  fiche: FicheCompletee | null
  geree: boolean
  favori: boolean
  recrute: boolean
  radie: boolean
  etudiant: boolean
  cheminFiche: string
  ariane: { libelle: string; href?: string }[]
  /** Liens « Voir aussi » vers la commune, le département et la méthode. */
  liens: { libelle: string; href: string }[]
  aujourdhui: Jour
  maintenant: Date
}
