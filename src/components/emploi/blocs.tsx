/** Briques communes aux pages Emploi. */
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeEuro,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  FlaskConical,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { chemin } from '@/lib/navigation'
import { RECHERCHE_EMPLOI, cheminFicheMetier, cheminOffre } from '@/lib/emploi/chemins'
import { contratTexte, dateCourte, euros, km, monogramme, remuneration, tempsTexte } from '@/lib/emploi/format'
import { CODES_CONTRAT, LIBELLE_CONTRAT, METIERS, type CodeMetier, type Metier } from '@/lib/emploi/metiers'
import { OBJET_SALAIRES, SALAIRES, SANS_GRILLE, SECTEURS, montantTexte, sourcesDe, type CaseSalaire, type LigneSalaires, type Source } from '@/lib/emploi/salaires'
import type { OffreResume } from '@/lib/emploi/types'

export function Etiquette({ children, ton = 'neutre' }: { children: React.ReactNode; ton?: 'neutre' | 'teal' | 'sombre' }) {
  const c = {
    neutre: 'bg-bg text-fg ring-line',
    teal: 'bg-teal/10 text-teal ring-teal/30',
    sombre: 'bg-white/10 text-white ring-white/15',
  }[ton]
  return <span className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`}>{children}</span>
}

/** Pastille de confiance : seul un recruteur à la fiche vérifiée auprès des registres peut publier. */
export function FicheVerifiee({ sombre, taille = 'sm' }: { sombre?: boolean; taille?: 'sm' | 'xs' }) {
  return (
    <span
      className={`squircle-full inline-flex shrink-0 items-center gap-1 font-medium ring-1 ring-inset ${
        taille === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
      } ${sombre ? 'bg-white/10 text-white ring-white/15' : 'bg-bg text-fg ring-line'}`}
    >
      <ShieldCheck className="size-3.5 text-teal" aria-hidden /> Fiche vérifiée
    </span>
  )
}

export function Remuneration({ o, sombre, grand }: { o: Pick<OffreResume, 'mode' | 'min' | 'max'>; sombre?: boolean; grand?: boolean }) {
  const r = remuneration(o)
  const t2 = sombre ? 'text-white/65' : 'text-fg-2'
  return (
    <div className={grand ? '' : 'leading-tight'}>
      <p>
        <span className={`font-semibold tabular-nums ${grand ? 'text-3xl tracking-tight md:text-4xl' : 'text-base'} ${sombre ? 'text-white' : 'text-fg'}`}>
          {r.principal}
        </span>
        <span className={`${grand ? 'mt-1 block text-sm' : 'ml-1 text-xs'} ${t2}`}>{r.detail}</span>
      </p>
    </div>
  )
}

function IconeType({ o, className }: { o: Pick<OffreResume, 'type'>; className: string }) {
  const I = o.type === 'laboratoire' ? FlaskConical : o.type === 'centre' ? Building2 : Stethoscope
  return <I className={className} aria-hidden />
}

/**
 * Visuel d'une offre : la photo déposée par le recruteur sur sa fiche, ou un
 * fond neutre (monogramme et icône du type de structure). Jamais une photo
 * d'illustration : elle laisserait croire qu'elle montre ce cabinet.
 */
export function Visuel({ o, className = '', petit }: { o: Pick<OffreResume, 'photo' | 'recruteur' | 'type'>; className?: string; petit?: boolean }) {
  if (o.photo) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={o.photo} alt="" fill sizes={petit ? '96px' : '(min-width: 1024px) 24rem, 90vw'} className="object-cover" />
      </div>
    )
  }
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-[color-mix(in_oklch,var(--color-teal)_7%,var(--bg-soft))] ${className}`} aria-hidden>
      <span className={`font-semibold tracking-tight text-fg/70 ${petit ? 'text-xl' : 'text-4xl'}`}>{monogramme(o.recruteur)}</span>
      <IconeType o={o} className={`absolute text-teal/70 ${petit ? 'bottom-1.5 right-1.5 size-3.5' : 'bottom-3 right-3 size-5'}`} />
    </div>
  )
}

function Publiee({ o }: { o: Pick<OffreResume, 'publieeLe'> }) {
  return o.publieeLe ? <span className="text-xs text-fg-2">Publiée le {dateCourte(o.publieeLe)}</span> : null
}

/**
 * Une offre dans une liste.
 * - `carte` : visuel en tête, pour les grilles.
 * - `ligne` : vignette à gauche, pour les listes de recherche.
 * - `compacte` : sans vignette, pour la colonne étroite à côté de la carte.
 */
export function CarteOffre({
  o,
  forme = 'carte',
  actif,
  className = '',
  sansLien,
}: {
  o: OffreResume
  forme?: 'carte' | 'ligne' | 'compacte'
  actif?: boolean
  className?: string
  /** Aperçu (page Recruter) : la carte ne mène nulle part. */
  sansLien?: boolean
}) {
  const titre = sansLien ? (
    <span>{o.titre}</span>
  ) : (
    <Link href={chemin(cheminOffre(o.slug))} className="after:absolute after:inset-0">
      {o.titre}
    </Link>
  )
  const lieu = (
    <span className="inline-flex items-center gap-1.5">
      <MapPin className="size-3.5 shrink-0 text-geo" aria-hidden /> {o.commune}
      {o.metres != null ? ` · ${km(o.metres)}` : ''}
    </span>
  )
  if (forme === 'ligne' || forme === 'compacte') {
    const compacte = forme === 'compacte'
    return (
      <li
        className={`${className} squircle-2xl hover-lift group relative flex gap-4 border bg-bg p-3 [--lift:3px] hover:shadow-pop sm:p-4 ${
          actif ? 'border-line-strong shadow-pop' : 'border-line'
        }`}
      >
        {!compacte && <Visuel o={o} petit className="squircle-xl hidden size-24 shrink-0 sm:grid sm:place-items-center" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Etiquette ton="teal">{contratTexte(o)}</Etiquette>
            {!compacte && <Etiquette>{tempsTexte(o)}</Etiquette>}
            <Publiee o={o} />
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug text-fg">{titre}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-2">
            <span className="text-fg">{o.recruteur}</span>
            {!compacte && <FicheVerifiee taille="xs" />}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <Remuneration o={o} />
            <p className="text-sm text-fg-2">{lieu}</p>
          </div>
        </div>
      </li>
    )
  }
  return (
    <li className={`${className} squircle-2xl hover-lift group relative flex flex-col overflow-hidden border border-line bg-bg-soft [--lift:4px] hover:shadow-pop ${actif ? 'ring-2 ring-geo' : ''}`}>
      <div className="relative">
        <Visuel o={o} className="aspect-[16/9]" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">{contratTexte(o)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-fg-2">{METIERS.find((m) => m.code === o.metier)?.nom}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-fg">{titre}</h3>
        <p className="mt-1 text-sm text-fg-2">
          {o.recruteur} · {tempsTexte(o)}
        </p>
        <div className="mt-3">
          <FicheVerifiee taille="xs" />
        </div>
        <div className="mt-auto pt-4">
          <Remuneration o={o} />
        </div>
      </div>
      <p className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-fg-2">
        {lieu}
        <Publiee o={o} />
      </p>
    </li>
  )
}

/** Un champ de la recherche : libellé en surtitre, contrôle natif en dessous. */
function Champ({ icone: I, label, className = '', children }: { icone: typeof Search; label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex min-w-0 items-center gap-3 px-4 py-2.5 ${className}`}>
      <I className="size-4 shrink-0 text-fg-2" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-fg-2">{label}</span>
        {children}
      </span>
    </label>
  )
}

const controle = 'w-full min-w-0 truncate bg-transparent text-sm text-fg outline-none placeholder:text-fg-2'

/**
 * Recherche : métier, ville, contrat. Formulaire GET vers `/emploi/recherche/`,
 * qui résout la ville et redirige vers la page de la commune. En ligne à
 * partir de `md`, empilée en dessous, le bouton en pleine largeur pour le pouce.
 */
export function Recherche({ metier = METIERS[0]!.slug, ville, grande }: { metier?: string; ville?: string; grande?: boolean }) {
  return (
    <form role="search" action={RECHERCHE_EMPLOI} method="get" className="w-full rounded-3xl border border-line bg-bg p-1.5 text-left shadow-pill md:rounded-full">
      <div className="flex flex-col divide-y divide-line md:flex-row md:items-stretch md:divide-x md:divide-y-0">
        <Champ icone={Briefcase} label="Métier" className="md:flex-[1.3]">
          <select name="metier" defaultValue={metier} className={controle}>
            {METIERS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nom}
              </option>
            ))}
          </select>
        </Champ>
        <Champ icone={MapPin} label="Ville" className="md:flex-1">
          <input name="ville" type="text" defaultValue={ville} placeholder="Ville ou code postal" autoComplete="address-level2" className={controle} />
        </Champ>
        <Champ icone={Clock} label="Contrat" className="md:flex-1">
          <select name="contrat" defaultValue="" className={controle}>
            <option value="">Tous les contrats</option>
            {CODES_CONTRAT.map((c) => (
              <option key={c} value={c}>
                {LIBELLE_CONTRAT[c]}
              </option>
            ))}
          </select>
        </Champ>
        {/* En ligne, le bouton prend toute la hauteur : même retrait en haut, en bas et sur le côté. */}
        <div className="flex p-1.5 md:p-0 md:pl-1.5">
          <button
            type="submit"
            className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground hover:bg-action-hover md:h-auto ${grande ? 'h-12 px-7' : 'h-11 px-6'}`}
          >
            <Search className="size-4" aria-hidden /> Rechercher
          </button>
        </div>
      </div>
    </form>
  )
}

/** Ce que sont les montants, puis leurs sources, avec un lien vers chaque texte. */
export function SourceSalaires({ className = '', objet = OBJET_SALAIRES, sources }: { className?: string; objet?: string; sources: Source[] }) {
  return (
    <p className={`text-xs text-fg-2 ${className}`}>
      {objet}
      {/[.!?]$/.test(objet) ? '' : '.'}
      {sources.length > 0 && (
        <>
          {' '}
          {sources.length > 1 ? 'Sources' : 'Source'}&nbsp;:{' '}
          {sources.map((src, k) => (
            <span key={src.url}>
              {k > 0 && ' ; '}
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
                {src.libelle}
              </a>
            </span>
          ))}
          .
        </>
      )}
    </p>
  )
}

/** Une case : le minimum (ou la fourchette), un texte tel quel, ou « Pas de grille de référence ». */
export function CaseSalaireVue({ c, grande }: { c: CaseSalaire; grande?: boolean }) {
  if (!c) return <span className={`text-fg-2 ${grande ? 'text-lg' : 'text-sm'}`}>{SANS_GRILLE}</span>
  const valeur = 'montant' in c ? montantTexte(c) : c.texte
  return (
    <span className="block">
      <span className={`font-semibold tabular-nums text-fg ${grande ? 'text-2xl tracking-tight md:text-3xl' : ''}`}>{valeur}</span>
      {'montant' in c && grande && <span className="block text-sm text-fg-2">brut par mois</span>}
      {c.precision && <span className="mt-0.5 block text-xs text-fg-2">{c.precision}</span>}
    </span>
  )
}

/**
 * Salaires minimums par métier et par secteur, avec leurs sources. Tableau à
 * partir de `md`, une carte par métier en dessous. Un seul métier : une case
 * par secteur. Rien si aucun des métiers demandés n'a de repère.
 */
export function SalairesSecteurs({ metiers }: { metiers?: CodeMetier[] }) {
  const lignes = (Object.entries(SALAIRES) as [CodeMetier, LigneSalaires][]).filter(([code]) => !metiers || metiers.includes(code)).map(([, l]) => l)
  if (!lignes.length) return null
  const sources = sourcesDe(lignes)
  if (lignes.length === 1) {
    const l = lignes[0]!
    return (
      <div>
        <dl className="grid grid-cols-2 gap-3">
          {l.valeurs.map((c, i) => (
            <div key={SECTEURS[i]} className="squircle-2xl border border-line bg-bg p-4">
              <dt className="text-sm text-fg-2">{SECTEURS[i]}</dt>
              <dd className="mt-2">
                <CaseSalaireVue c={c} grande />
              </dd>
            </div>
          ))}
        </dl>
        <SourceSalaires className="mt-4" sources={sources} />
      </div>
    )
  }
  return (
    <div>
      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full text-left">
          <thead className="bg-bg-soft text-xs uppercase tracking-wide text-fg-2">
            <tr>
              <th className="px-5 py-3.5 font-medium">Métier</th>
              {SECTEURS.map((s) => (
                <th key={s} className="px-5 py-3.5 font-medium">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lignes.map((l) => (
              <tr key={l.libelle}>
                <th className="px-5 py-4 align-top font-medium text-fg">{l.libelle}</th>
                {l.valeurs.map((c, i) => (
                  <td key={SECTEURS[i]} className="px-5 py-4 align-top">
                    <CaseSalaireVue c={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {lignes.map((l) => (
          <li key={l.libelle} className="squircle-2xl border border-line p-4">
            <p className="font-semibold text-fg">{l.libelle}</p>
            <dl className="mt-2 divide-y divide-line text-sm">
              {l.valeurs.map((c, i) => (
                <div key={SECTEURS[i]} className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="min-w-0 text-fg-2">{SECTEURS[i]}</dt>
                  <dd className="max-w-[55%] text-right">
                    <CaseSalaireVue c={c} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <SourceSalaires className="mt-4" sources={sources} />
    </div>
  )
}

export const PILIERS = [
  {
    icone: ShieldCheck,
    titre: 'Recruteurs vérifiés',
    texte: 'Seuls les cabinets, centres de santé et laboratoires vérifiés auprès des registres officiels publient. Chaque offre renvoie à la fiche du recruteur.',
  },
  {
    icone: BadgeEuro,
    titre: 'Rémunération affichée',
    texte: 'Salaire brut mensuel, ou taux de rétrocession pour un remplacement. Vous comparez avant de postuler.',
  },
  {
    icone: Lock,
    titre: 'Coordonnées protégées',
    texte: 'Votre téléphone et votre email ne sont transmis qu’au recruteur de l’offre à laquelle vous postulez.',
  },
]

export const FAQ = [
  {
    q: 'Qui peut publier une offre ?',
    r: 'Seuls les cabinets dentaires, centres de santé et laboratoires dont l’identité a été vérifiée auprès des registres officiels, l’Annuaire Santé pour les praticiens et la base Sirene pour les entreprises. Chaque offre renvoie à la fiche du recruteur.',
  },
  {
    q: 'Faut-il un compte pour postuler ?',
    r: 'Oui. Une candidature passe par votre compte DentalMap, ce qui permet au recruteur de vous répondre et à vous de suivre vos démarches. Pour recevoir les nouvelles offres par email, en revanche, aucun compte n’est nécessaire.',
  },
  {
    q: 'Quand mes coordonnées sont-elles transmises ?',
    r: 'Quand vous postulez : le recruteur de l’offre reçoit votre nom, votre téléphone, votre email, votre message et votre CV. Les profils disponibles, eux, ne montrent jamais vos coordonnées.',
  },
  {
    q: 'Pourquoi la rémunération est-elle toujours indiquée ?',
    r: 'Une offre ne peut pas être publiée sans sa rémunération : fourchette brute mensuelle pour un contrat salarié ou une alternance, taux de rétrocession ou de redevance pour un remplacement ou une collaboration.',
  },
]

export function FaqEmploi({ items = FAQ }: { items?: { q: string; r: string }[] }) {
  return (
    <Accordion defaultValue={['q-0']}>
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`q-${i}`} className="border-b border-line last:border-b-0">
          <AccordionTrigger className="py-5 text-base font-semibold text-fg hover:no-underline md:text-lg">
            <span className="pr-4">{f.q}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 leading-relaxed text-fg-2">{f.r}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/** Lien souligné à flèche, celui de « Comment ça marche » et de la FAQ. */
export function LienFleche({ href, children, sombre, petit }: { href: string; children: React.ReactNode; sombre?: boolean; petit?: boolean }) {
  return (
    <Link href={chemin(href)} className={`group inline-flex items-center font-medium transition-colors hover:text-teal ${petit ? 'text-sm' : 'text-base'} ${sombre ? 'text-white' : 'text-fg'}`}>
      <span className={`border-b-2 pb-0.5 ${sombre ? 'border-white/25' : 'border-line'}`}>{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </Link>
  )
}

export function BoutonSecondaire({ href, children, sombre }: { href: string; children: React.ReactNode; sombre?: boolean }) {
  return (
    <Link
      href={chemin(href)}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium ${
        sombre ? 'border-white/20 bg-white/5 text-white hover:bg-white/10' : 'border-line bg-bg text-fg hover:bg-bg-soft'
      }`}
    >
      {children}
    </Link>
  )
}

/** Lien vers la fiche métier des Ressources (`/conseils/metiers/assistant-dentaire/`). */
export function LienFicheMetier({ metier }: { metier: Metier }) {
  return (
    <Link href={chemin(cheminFicheMetier(metier.slug))} className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-fg">
      <BookOpen className="size-4" aria-hidden /> Le métier {metier.de} <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  )
}

/** Liste de liens vers d'autres territoires ou métiers, forme des pages commune de l'annuaire. Rien sans lien. */
export function ListeLiens({ titre, liens, colonnes = 2 }: { titre: string; liens: { nom: string; href: string; n: number; detail?: string }[]; colonnes?: 2 | 3 }) {
  if (!liens.length) return null
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">{titre}</h2>
      <ul className={`mt-3 grid gap-x-8 sm:grid-cols-2 ${colonnes === 3 ? 'lg:grid-cols-3' : ''}`}>
        {liens.map((l) => (
          <li key={l.href} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
            <Link href={chemin(l.href)} className="min-w-0 text-fg hover:underline">
              {l.nom}
            </Link>
            <span className="shrink-0 text-sm tabular-nums text-fg-2">
              {euros(l.n)} {l.n > 1 ? 'offres' : 'offre'}
              {l.detail ? ` · ${l.detail}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Photo({ src, className = '', alt = '', sizes = '(min-width: 1024px) 50vw, 100vw' }: { src: string; className?: string; alt?: string; sizes?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  )
}

/** En-tête de page éditorial, titre en deux tons (celui d'« Explorer l'annuaire »). */
export function TitreDeuxTons({ children, sous, as: Tag = 'h2', grand }: { children: React.ReactNode; sous?: string; as?: 'h1' | 'h2'; grand?: boolean }) {
  return (
    <Tag className={`font-semibold tracking-tight text-fg ${grand ? 'text-5xl leading-[1.02] md:text-7xl lg:text-8xl' : 'text-3xl md:text-5xl'}`}>
      {children}
      {sous && <span className="block text-fg-2">{sous}</span>}
    </Tag>
  )
}

/** « 3 offres », « 1 offre », « Aucune offre ». */
export function nombreOffres(n: number): string {
  if (n === 0) return 'Aucune offre'
  return `${euros(n)} ${n > 1 ? 'offres' : 'offre'}`
}
