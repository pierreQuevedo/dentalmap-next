/**
 * Lien entre une fiche et ses offres d'emploi : la pastille « Recrute » de
 * l'en-tête et la section d'offres en fin de fiche.
 *
 * - La pastille s'affiche tant qu'au moins une offre de la structure est en
 *   ligne ; elle disparaît quand la dernière est pourvue, retirée ou expirée.
 * - Neutralité : elle est purement informative. Elle ne change jamais l'ordre
 *   des résultats (distance puis alphabétique) ni la mise en avant d'une fiche.
 * - Le patient reste le lecteur principal : pas de bandeau, une pastille de la
 *   même famille que celles de l'en-tête, et une section placée après les
 *   informations utiles au patient.
 */
import Link from 'next/link'
import { ArrowUpRight, Briefcase, FlaskConical, MapPin, ShieldCheck, Stethoscope } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import type { ContratOffre, OffreFiche } from '@/lib/annuaire/recrutement'

export const ANCRE_RECRUTEMENT = 'recrutement'

/** Pastille de l'en-tête de fiche, même gabarit que les étiquettes voisines. Mène à la section. */
export function BadgeRecruteFiche() {
  return (
    <a
      href={`#${ANCRE_RECRUTEMENT}`}
      className="squircle-full inline-flex items-center gap-1.5 bg-bg px-2.5 py-0.5 text-xs font-medium text-fg ring-1 ring-inset ring-line transition-colors hover:bg-bg-soft"
    >
      <Briefcase className="size-3.5 text-teal" aria-hidden /> Recrute
    </a>
  )
}

const CONTRAT: Record<ContratOffre, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  alternance: 'Alternance',
  stage: 'Stage',
  remplacement: 'Remplacement',
  collaboration: 'Collaboration',
}

const euros = (n: number) => n.toLocaleString('fr-FR')
const dateLongue = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function temps(o: OffreFiche): string {
  const base = o.tempsPlein ? 'Temps plein' : 'Temps partiel'
  return o.heuresHebdo ? `${base}, ${o.heuresHebdo} h` : base
}

/** « 2 100 à 2 400 € », ou un seul montant quand la fourchette est fermée. */
function fourchette(min: number, max: number, unite: string): string {
  return min === max ? `${euros(min)} ${unite}` : `${euros(min)} à ${euros(max)} ${unite}`
}

/**
 * Rémunération en deux temps, le principal et sa précision : fourchette brute
 * mensuelle pour un salaire, pourcentage des honoraires pour une rétrocession
 * ou une redevance.
 */
function remuneration(o: OffreFiche): { principal: string; detail: string } {
  switch (o.modeRemuneration) {
    case 'retrocession':
      return { principal: `Rétrocession de ${fourchette(o.remunerationMin, o.remunerationMax, '%')}`, detail: 'des honoraires' }
    case 'redevance':
      return { principal: `Redevance de ${fourchette(o.remunerationMin, o.remunerationMax, '%')}`, detail: 'des honoraires, versée au cabinet' }
    case 'gratification':
      return o.remunerationMax > 0
        ? { principal: fourchette(o.remunerationMin, o.remunerationMax, '€'), detail: 'de gratification par mois' }
        : { principal: 'Gratification légale', detail: 'au-delà de deux mois de stage' }
    default:
      return { principal: fourchette(o.remunerationMin, o.remunerationMax, '€'), detail: 'brut par mois' }
  }
}

/** Initiales du recruteur, pour le fond neutre d'une offre : jamais une photo d'illustration. */
function monogramme(nom: string): string {
  const mots = nom
    .replace(/^(Dr|Drs)\s+/i, '')
    .split(/\s+/)
    .filter((m) => /^\p{Lu}/u.test(m))
  return (mots[0]?.[0] ?? '') + (mots[1]?.[0] ?? '')
}

/** « 1,2 km », ou « 350 m » en dessous du kilomètre. */
function distance(metres: number): string {
  if (metres < 1000) return `${metres} m`
  return `${(metres / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`
}

/**
 * Une offre en ligne. `compacte` : sans vignette ni temps de travail ni
 * pastille de vérification, pour la colonne étroite d'une page commune.
 */
function LigneOffre({
  o,
  recruteur,
  labo,
  compacte = false,
  metres,
}: {
  o: OffreFiche
  recruteur: string
  labo: boolean
  compacte?: boolean
  metres?: number
}) {
  const r = remuneration(o)
  const Icone = labo ? FlaskConical : Stethoscope
  return (
    <li className="squircle-2xl hover-lift group relative flex gap-4 border border-line bg-bg p-3 [--lift:3px] hover:shadow-pop has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action sm:p-4">
      {!compacte && (
        <div
          aria-hidden
          className="squircle-xl relative hidden size-24 shrink-0 place-items-center overflow-hidden bg-[color-mix(in_oklch,var(--color-teal)_7%,var(--bg-soft))] sm:grid"
        >
          <span className="text-xl font-semibold tracking-tight text-fg/70">{monogramme(recruteur)}</span>
          <Icone className="absolute bottom-1.5 right-1.5 size-3.5 text-teal/70" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="squircle-full inline-flex items-center px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset bg-teal/10 text-teal ring-teal/30">
            {CONTRAT[o.contrat]}
          </span>
          {!compacte && (
            <span className="squircle-full inline-flex items-center px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset bg-bg text-fg ring-line">{temps(o)}</span>
          )}
          {o.publieeLe && <span className="text-xs text-fg-2">Publiée le {dateLongue.format(new Date(o.publieeLe))}</span>}
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-fg">
          <Link href={chemin(`/emploi/offre/${o.slug}/`)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {o.titre}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-2">
          <span className="text-fg">{recruteur}</span>
          {!compacte && (
            <span className="squircle-full inline-flex shrink-0 items-center gap-1 bg-bg px-2 py-0.5 text-[11px] font-medium text-fg ring-1 ring-inset ring-line">
              <ShieldCheck className="size-3.5 text-teal" aria-hidden /> Fiche vérifiée
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <p className="leading-tight">
            <span className="text-base font-semibold tabular-nums text-fg">{r.principal}</span>
            <span className="ml-1 text-xs text-fg-2">{r.detail}</span>
          </p>
          {o.communeNom && (
            <p className="inline-flex items-center gap-1.5 text-sm text-fg-2">
              <MapPin className="size-3.5 shrink-0 text-geo" aria-hidden /> {o.communeNom}
              {metres !== undefined ? ` · ${distance(metres)}` : ''}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

function LienOffres({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={chemin(href)} className="group inline-flex items-center text-sm font-medium text-fg transition-colors hover:text-teal">
      <span className="border-b-2 border-line pb-0.5">{children}</span>
      <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
    </Link>
  )
}

/**
 * Lien de fin de section : la liste du métier quand toutes les offres en
 * relèvent et qu'elle a sa page, sinon toutes les offres.
 */
function lienListe(offres: OffreFiche[]): { href: string; libelle: string } {
  if (offres.every((o) => o.metier === 'assistant_dentaire')) {
    return { href: '/emploi/assistant-dentaire/', libelle: 'Voir les offres d’assistant(e) dentaire' }
  }
  return { href: '/emploi/', libelle: 'Voir toutes les offres d’emploi' }
}

/**
 * Section d'offres, en fin de fiche. Deux colonnes : le titre et le lien à
 * gauche, les offres à droite, en lignes. Rien quand aucune offre n'est en ligne.
 */
export function SectionRecrute({ offres, recruteur, labo }: { offres: OffreFiche[]; recruteur: string; labo: boolean }) {
  if (offres.length === 0) return null
  const lien = lienListe(offres)
  const structure = labo ? 'laboratoire' : 'cabinet'
  return (
    <section id={ANCRE_RECRUTEMENT} className="mt-20 scroll-mt-24 border-t border-line pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-fg-2">
            <Briefcase className="size-4 text-teal" aria-hidden /> Emploi
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg md:text-3xl">Ce {structure} recrute</h2>
          <p className="mt-2 max-w-md text-fg-2">
            Offres publiées par le {structure}, dont l’identité a été vérifiée auprès des registres officiels.
          </p>
          <div className="mt-6 hidden lg:block">
            <LienOffres href={lien.href}>{lien.libelle}</LienOffres>
          </div>
        </div>
        <div>
          <ul className="grid gap-3">
            {offres.map((o) => (
              <LigneOffre key={o.slug} o={o} recruteur={recruteur} labo={labo} />
            ))}
          </ul>
          <div className="mt-6 lg:hidden">
            <LienOffres href={lien.href}>{lien.libelle}</LienOffres>
          </div>
        </div>
      </div>
    </section>
  )
}
