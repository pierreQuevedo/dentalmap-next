/** MAQUETTE, à supprimer après arbitrage. Briques communes aux pages Emploi. */
import Image from 'next/image'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeEuro,
  Bell,
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
import { FAQ, SALAIRES, SECTEURS, SOURCE_SALAIRES, type Offre } from './_donnees'

/** « 2 100 », espace fine insécable comme le reste du site. */
export const euros = (n: number) => n.toLocaleString('fr-FR')
export const km = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`

export function fourchette(o: Pick<Offre, 'min' | 'max'>) {
  return `${euros(o.min)} à ${euros(o.max)} €`
}

export function contratTexte(o: Offre) {
  return o.duree ? `${o.contrat} ${o.duree}` : o.contrat
}

/**
 * La rémunération d'une offre en deux lignes : le principal et sa précision.
 * Salaire brut mensuel pour les contrats salariés et l'alternance ;
 * pourcentage pour un remplacement ou une collaboration libérale, avec une
 * estimation mensuelle toujours libellée comme telle.
 */
export function remuneration(o: Offre): { principal: string; detail: string; estimation?: string } {
  switch (o.mode) {
    case 'retrocession':
      return { principal: `Rétrocession de ${o.taux}\u202f%`, detail: 'des honoraires', estimation: `Estimation : ${fourchette(o)} par mois, avant charges` }
    case 'redevance':
      return { principal: `Redevance de ${o.taux}\u202f%`, detail: 'des honoraires, versée au cabinet', estimation: `Estimation : ${fourchette(o)} par mois, avant charges` }
    case 'gratification':
      return { principal: 'Gratification légale', detail: 'au-delà de deux mois de stage' }
    default:
      return { principal: fourchette(o), detail: 'brut par mois' }
  }
}

/** Étiquette courte d'une offre sur la carte. */
export function etiquetteCarte(o: Offre) {
  if (o.mode === 'retrocession' || o.mode === 'redevance') return `${o.taux}\u202f%`
  if (o.mode === 'gratification') return 'Stage'
  return fourchette(o)
}

export function Etiquette({ children, ton = 'neutre' }: { children: React.ReactNode; ton?: 'neutre' | 'teal' | 'sombre' }) {
  const c = {
    neutre: 'bg-bg text-fg ring-line',
    teal: 'bg-teal/10 text-teal ring-teal/30',
    sombre: 'bg-white/10 text-white ring-white/15',
  }[ton]
  return <span className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`}>{children}</span>
}

/** Pastille de confiance : le recruteur a une fiche vérifiée auprès des registres. */
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

export function Remuneration({ o, sombre, grand }: { o: Offre; sombre?: boolean; grand?: boolean }) {
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
      {r.estimation && <p className={`${grand ? 'mt-1 text-sm' : 'mt-0.5 text-xs'} ${t2}`}>{r.estimation}</p>}
    </div>
  )
}

/** Initiales du recruteur, pour le fond neutre d'une offre sans photo. */
function monogramme(nom: string) {
  const mots = nom
    .replace(/^(Cabinet|Centre de santé dentaire|Laboratoire|Cabinet d’orthodontie)\s+/i, '')
    .replace(/^(Drs?|et)\s+/g, '')
    .split(/\s+/)
    .filter((m) => /^[A-ZÉ]/.test(m) && !/^(Drs?|Dr)$/.test(m))
  return (mots[0]?.[0] ?? '') + (mots[1]?.[0] ?? '')
}

function IconeType({ o, className }: { o: Offre; className: string }) {
  const I = o.type === 'laboratoire' ? FlaskConical : o.type === 'centre' ? Building2 : Stethoscope
  return <I className={className} aria-hidden />
}

/**
 * Visuel d'une offre : la photo déposée par le recruteur, ou un fond neutre
 * (monogramme et icône du type de structure). Jamais une photo d'illustration :
 * elle laisserait croire qu'elle montre ce cabinet.
 */
export function Visuel({ o, className = '', petit }: { o: Offre; className?: string; petit?: boolean }) {
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
}: {
  o: Offre
  forme?: 'carte' | 'ligne' | 'compacte'
  actif?: boolean
  className?: string
}) {
  const lieu = (
    <span className="inline-flex items-center gap-1.5">
      <MapPin className="size-3.5 shrink-0 text-geo" aria-hidden /> {o.commune}
      {o.km !== undefined ? ` · ${km(o.km)}` : ''}
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
            {!compacte && <Etiquette>{o.temps}</Etiquette>}
            <span className="text-xs text-fg-2">{o.depuis}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug text-fg">
            <a className="after:absolute after:inset-0">{o.titre}</a>
          </h3>
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
        <p className="text-xs text-fg-2">{o.metier}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-fg">
          <a className="after:absolute after:inset-0">{o.titre}</a>
        </h3>
        <p className="mt-1 text-sm text-fg-2">
          {o.recruteur} · {o.temps}
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
        <span className="text-xs">{o.depuis}</span>
      </p>
    </li>
  )
}

/** Un champ de recherche dessiné, sans comportement : la maquette ne cherche rien. */
function Champ({ icone: I, label, valeur, className = '' }: { icone: typeof Search; label: string; valeur: string; className?: string }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 px-4 py-2.5 ${className}`}>
      <I className="size-4 shrink-0 text-fg-2" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-fg-2">{label}</p>
        <p className="truncate text-sm text-fg">{valeur}</p>
      </div>
    </div>
  )
}

/**
 * Recherche : métier, ville, contrat. En ligne à partir de `md`, empilée en
 * dessous, avec le bouton en pleine largeur pour le pouce.
 */
export function Recherche({
  metier = 'Tous les métiers',
  ville = 'Ville ou code postal',
  contrat = 'Tous les contrats',
  grande,
}: {
  metier?: string
  ville?: string
  contrat?: string
  grande?: boolean
}) {
  return (
    <form role="search" className="w-full rounded-3xl border border-line bg-bg p-1.5 text-left shadow-pill md:rounded-full">
      <div className="flex flex-col divide-y divide-line md:flex-row md:items-center md:divide-x md:divide-y-0">
        <Champ icone={Briefcase} label="Métier" valeur={metier} className="md:flex-[1.3]" />
        <Champ icone={MapPin} label="Ville" valeur={ville} className="md:flex-1" />
        <Champ icone={Clock} label="Contrat" valeur={contrat} className="md:flex-1" />
        <div className="p-1.5 md:p-0 md:pl-1.5">
          <button
            type="button"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground ${grande ? 'h-12 px-7' : 'h-11 px-6'}`}
          >
            <Search className="size-4" aria-hidden /> Rechercher
          </button>
        </div>
      </div>
    </form>
  )
}

/** Alerte email sans compte. */
export function AlerteEmail({
  titre = 'Recevez les nouvelles offres par email',
  detail = 'Un email par semaine au plus, et un lien de désinscription dans chaque envoi.',
  compacte,
}: {
  titre?: string
  detail?: string
  compacte?: boolean
}) {
  return (
    <div>
      {!compacte && (
        <>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-teal">
            <Bell className="size-4" aria-hidden /> Alerte email, sans compte
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg md:text-3xl">{titre}</h2>
          <p className="mt-2 max-w-xl text-fg-2">{detail}</p>
        </>
      )}
      <div className={`${compacte ? '' : 'mt-6'} flex flex-col gap-2 sm:flex-row`}>
        <label className="sr-only" htmlFor="alerte-email">
          Votre adresse email
        </label>
        <input
          id="alerte-email"
          type="email"
          placeholder="vous@exemple.fr"
          className="h-11 w-full min-w-0 rounded-full border border-line bg-bg px-5 text-sm text-fg outline-none placeholder:text-fg-2 sm:flex-1"
        />
        <button type="button" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground">
          <Bell className="size-4" aria-hidden /> Créer l’alerte
        </button>
      </div>
      <p className="mt-3 text-xs text-fg-2">Votre adresse ne sert qu’à cette alerte. Elle n’est jamais transmise aux recruteurs.</p>
    </div>
  )
}

/** Libellé de la source des salaires moyens, à renseigner. */
export function SourceSalaires({ className = '', objet = 'Salaire brut mensuel moyen pour un temps plein, issu d’études salariales' }: { className?: string; objet?: string }) {
  return (
    <p className={`text-xs text-fg-2 ${className}`}>
      {objet}, et non calculé sur les offres publiées. {SOURCE_SALAIRES}.
    </p>
  )
}

/**
 * Salaires moyens par métier et par secteur. Tableau à partir de `md`,
 * une carte par métier en dessous, avec une ligne par secteur.
 */
export function SalairesSecteurs({ metiers }: { metiers?: string[] }) {
  const lignes = metiers ? SALAIRES.filter((s) => metiers.includes(s.metier)) : SALAIRES
  const cellule = (v: number | null) =>
    v === null ? <span className="text-sm text-fg-2">Peu de postes</span> : <span className="font-semibold tabular-nums text-fg">{euros(v)} €</span>
  if (lignes.length === 1) {
    /* Un seul métier : une case par secteur, lisible dans une demi-colonne. */
    const l = lignes[0]!
    return (
      <div>
        <dl className="grid grid-cols-2 gap-3">
          {l.valeurs.map((v, i) => (
            <div key={SECTEURS[i]} className="squircle-2xl border border-line bg-bg p-4">
              <dt className="text-sm text-fg-2">{SECTEURS[i]}</dt>
              <dd className="mt-2">
                {v === null ? (
                  <span className="text-fg-2">Peu de postes</span>
                ) : (
                  <>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight text-fg">{euros(v)} €</span>
                    <span className="block text-xs text-fg-2">brut par mois</span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <SourceSalaires className="mt-4" />
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
              <tr key={l.metier}>
                <th className="px-5 py-4 font-medium text-fg">{l.metier}</th>
                {l.valeurs.map((v, i) => (
                  <td key={SECTEURS[i]} className="px-5 py-4">
                    {cellule(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {lignes.map((l) => (
          <li key={l.metier} className="squircle-2xl border border-line p-4">
            <p className="font-semibold text-fg">{l.metier}</p>
            <dl className="mt-2 divide-y divide-line text-sm">
              {l.valeurs.map((v, i) => (
                <div key={SECTEURS[i]} className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="text-fg-2">{SECTEURS[i]}</dt>
                  <dd className="shrink-0">{cellule(v)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <SourceSalaires className="mt-4" />
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
    texte: 'Votre téléphone et votre email ne sont transmis au recruteur que si vous acceptez un échange.',
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
export function LienFleche({ children, sombre, petit }: { children: React.ReactNode; sombre?: boolean; petit?: boolean }) {
  return (
    <a className={`group inline-flex items-center font-medium transition-colors hover:text-teal ${petit ? 'text-sm' : 'text-base'} ${sombre ? 'text-white' : 'text-fg'}`}>
      <span className={`border-b-2 pb-0.5 ${sombre ? 'border-white/25' : 'border-line'}`}>{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </a>
  )
}

export function BoutonSecondaire({ children, sombre }: { children: React.ReactNode; sombre?: boolean }) {
  return (
    <a
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium ${
        sombre ? 'border-white/20 bg-white/5 text-white' : 'border-line bg-bg text-fg hover:bg-bg-soft'
      }`}
    >
      {children}
    </a>
  )
}

/** Lien vers la fiche métier des Ressources (`/conseils/metiers/assistant-dentaire/`). */
export function LienFicheMetier() {
  return (
    <a className="inline-flex items-center gap-2 text-sm text-fg-2 hover:text-fg">
      <BookOpen className="size-4" aria-hidden /> Le métier d’assistant(e) dentaire <ArrowRight className="size-3.5" aria-hidden />
    </a>
  )
}

/** Liste de liens vers d'autres territoires ou métiers, forme des pages commune de l'annuaire. */
export function ListeLiens({ titre, liens, colonnes = 2 }: { titre: string; liens: { nom: string; n: number; detail?: string }[]; colonnes?: 2 | 3 }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">{titre}</h2>
      <ul className={`mt-3 grid gap-x-8 sm:grid-cols-2 ${colonnes === 3 ? 'lg:grid-cols-3' : ''}`}>
        {liens.map((l) => (
          <li key={l.nom} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
            <a className="min-w-0 text-fg hover:underline">{l.nom}</a>
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
