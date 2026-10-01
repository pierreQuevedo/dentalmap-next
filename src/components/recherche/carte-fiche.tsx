'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Adresse, BadgeGeree, Verification } from '@/components/annuaire/primitives'
import { Skeleton } from '@/components/ui/skeleton'
import { chemin } from '@/lib/navigation'
import { clePosition } from '@/lib/annuaire/emprise'
import { illustration } from '@/lib/annuaire/illustration'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import type { PraticienProche } from '@/lib/annuaire/queries'

/**
 * Carte de résultat.
 *
 * Deux formes, choisies sur le banc d'essai du guide de style. Pour un
 * dentiste, l'image occupe toute la carte au repos, le texte posé dessus en
 * bas derrière un voile ; au survol, depuis la liste comme depuis la carte,
 * l'image remonte, le bloc de texte devient opaque et la distance apparaît.
 * Pour un laboratoire, l'image est en tête et le texte dessous, sans
 * transformation.
 *
 * Aucune fiche de l'annuaire n'a de photo : elles viennent de registres, pas
 * d'inscriptions. Le fond est donc une illustration de remplacement, choisie
 * sur la civilité portée par le registre, `M` ou `MME`. C'est une donnée de
 * source, jamais une déduction faite sur le prénom : un annuaire qui devine le
 * genre de ses praticiens se trompe, et se trompe visiblement. Les laboratoires
 * et les praticiens sans civilité retombent sur une surface neutre. Le jour où
 * un professionnel gère sa fiche et dépose une photo, elle prend la place du
 * fond, et l'étiquette « Gérée par le praticien » le dit.
 */
export function CarteFiche(props: {
  praticien: PraticienProche
  base: string
  profession: Profession
  /** Photo déposée par le professionnel. Absente sur toute fiche non gérée. */
  photo?: string
  /** Mis en évidence depuis la carte : même état que le survol de la liste. */
  actif: boolean
  onSurvol: (cle: string | null, slug?: string | null) => void
  /** Rang dans la liste : l'entrée de la carte est retardée d'autant. Absent, pas d'entrée. */
  rang?: number
}) {
  return props.profession === 'prothesiste' ? <CarteLaboratoire {...props} /> : <CarteDentiste {...props} />
}

type Props = Parameters<typeof CarteFiche>[0]

/** Classe et retard de l'entrée d'une carte selon son rang, 40 ms par carte, plafonné à la moitié d'une seconde. */
function entree(rang: number | undefined) {
  if (rang === undefined) return { className: '', style: undefined }
  return { className: 'animate-fiche-entree', style: { animationDelay: `${Math.min(rang * 40, 480)}ms` } }
}

/** « 1,2 km », ou « 350 m » en dessous du kilomètre. */
function distance(metres: number): string {
  if (metres < 1000) return `${metres} m`
  return `${(metres / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`
}

/**
 * Le survol se déclenche aussi au clavier : sans cela, la correspondance
 * entre la liste et la carte n'existerait qu'à la souris.
 */
function evenements(cle: string | null, slug: string, onSurvol: Props['onSurvol']) {
  return {
    onMouseEnter: () => onSurvol(cle, slug),
    onMouseLeave: () => onSurvol(null),
    onFocus: () => onSurvol(cle, slug),
    onBlur: () => onSurvol(null),
  }
}

function CarteDentiste({ praticien: p, base, profession, photo, actif, onSurvol, rang }: Props) {
  const cle = clePosition(p.lon, p.lat)
  const anim = entree(rang)
  const nom = nomAffiche({ profession, nom: p.nom, prenom: p.prenom, raisonSociale: p.raisonSociale })
  const fond = photo ?? illustration(profession, p.civilite)

  /*
   * L'état « survolé » est porté par `data-actif` quand il vient de la carte,
   * et par `:hover` quand il vient de la liste : les mêmes classes répondent
   * aux deux, via `group-hover` et `group-data-[actif=true]`.
   *
   * Hauteur minimale plutôt que rapport fixe : la hauteur du bloc de texte
   * varie d'une fiche à l'autre selon l'adresse et la mention de précision.
   *
   * Le contour de mise au point est porté par la carte et non par le lien :
   * celui-ci s'étend en `::after` sur toute la surface, et un contour posé
   * dessus se dessinerait autour d'une boîte de texte invisible.
   */
  return (
    <li
      {...evenements(cle, p.slug, onSurvol)}
      data-actif={actif ? 'true' : 'false'}
      style={anim.style}
      className={`squircle-2xl hover-lift group relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden border bg-bg-soft [--lift:5px] hover:shadow-pop data-[actif=true]:-translate-y-[var(--lift)] data-[actif=true]:shadow-pop has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${anim.className} ${
        actif ? 'border-line-strong' : 'border-line'
      }`}
    >
      {/*
        L'image : pleine carte au repos, ramenée aux 62 % supérieurs au
        survol, juste ce qu'il faut pour que le texte se pose sur le fond
        doux de la carte sans laisser de vide au-dessus de lui. Une
        transition de hauteur, pas d'opacité : l'image reste nette pendant tout
        le mouvement, et le voile qui vit dans ce même conteneur suit son bord
        bas, de sorte que l'image se fond dans le bloc de texte dans les deux
        états au lieu de s'arrêter sur une ligne.
      */}
      <div className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden transition-[height] duration-slow ease-lift group-hover:h-[62%] group-data-[actif=true]:h-[62%] motion-reduce:transition-none">
        <Image
          src={fond}
          alt=""
          fill
          sizes="(min-width: 1280px) 24rem, 90vw"
          /*
           * Le recadrage est calé sur le tiers supérieur : l'illustration est un
           * portrait en pied, et `cover` centrerait sinon sur le torse en coupant
           * la tête. En thème sombre, une surface claire en pleine carte éblouit :
           * on la ramène au niveau du fond de page.
           */
          className="object-cover object-[center_26%] dark:brightness-[0.42]"
        />
        {/*
          Fondu progressif, en thème sombre seulement : une copie floutée de
          l'illustration, masquée en dégradé. Moins coûteuse qu'une pile de
          `backdrop-filter` sur vingt cartes. Elle s'efface au survol, où le
          bloc de texte devient opaque.
        */}
        <Image
          src={fond}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1280px) 24rem, 90vw"
          className="hidden scale-110 object-cover object-[center_26%] blur-lg brightness-[0.42] [mask-image:linear-gradient(to_top,black_42%,transparent_80%)] dark:block"
        />

        {/*
          Voile en bas de l'image, franc en clair, discret en sombre. Il part
          du fond de la carte, pour que le bas de l'image et le bloc de texte
          soient de la même couleur au survol. Au repos il monte assez haut
          pour porter le texte ; au survol, où le texte n'est plus dessus, il
          se réduit à un fondu au bord de l'image et laisse le visage net.
        */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-bg-soft from-30% via-bg-soft/88 via-56% to-transparent transition-[height] duration-slow ease-lift group-hover:h-[30%] group-data-[actif=true]:h-[30%] motion-reduce:transition-none dark:from-25% dark:via-bg-soft/45 dark:via-62%" />
      </div>

      {p.revendiquee && <BadgeGeree profession={profession} className="absolute left-3 top-3 z-10" />}

      {/*
        Ce bloc reste dans le flux, sans `relative` : les couches d'image
        passent sous lui par un z-index négatif, contenu par l'`isolate` de la
        carte. C'est ce qui permet au `::after` du lien de se caler sur la carte
        et non sur ce conteneur, où il ne couvrait que le texte.
      */}
      <div className="p-4">
        <h2 className="text-base font-semibold leading-tight text-fg">
          {/*
            Le lien couvre toute la carte plutôt que le seul nom : la surface
            cliquable est celle qu'on vise, et il n'y a qu'un lien par carte
            dans l'ordre de tabulation.
          */}
          <Link
            href={chemin(`/${base}/${p.departementSlug}/${p.communeSlug}/${p.slug}/`)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {nom}
          </Link>
        </h2>

        <div className="mt-2">
          <Verification statut={p.statutVerification} />
        </div>

        <div className="mt-2 text-sm">
          <Adresse ligne={p.adresseLigne} codePostal={p.codePostal} commune={p.communeNom} precision={p.precisionPosition} />
        </div>

        {/* La distance n'apparaît qu'au survol : une rangée de grille qui s'ouvre de 0fr à 1fr. */}
        <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-slow ease-lift group-hover:grid-rows-[1fr] group-hover:opacity-100 group-data-[actif=true]:grid-rows-[1fr] group-data-[actif=true]:opacity-100 motion-reduce:transition-none">
          <p className="min-h-0 overflow-hidden text-sm text-fg-2">
            <span className="block pt-2">À {distance(p.metres)} du centre de la carte</span>
          </p>
        </div>
      </div>
    </li>
  )
}

/**
 * Laboratoire : image en tête, texte dessous.
 *
 * Les prestations, les délais et la zone de livraison viendront de la fiche
 * gérée par le laboratoire ; tant qu'aucun laboratoire ne la complète, la
 * carte s'en tient au registre.
 */
function CarteLaboratoire({ praticien: p, base, profession, photo, actif, onSurvol, rang }: Props) {
  const cle = clePosition(p.lon, p.lat)
  const anim = entree(rang)
  const nom = nomAffiche({ profession, nom: p.nom, prenom: p.prenom, raisonSociale: p.raisonSociale })
  const fond = photo ?? illustration(profession, p.civilite)

  return (
    <li
      {...evenements(cle, p.slug, onSurvol)}
      data-actif={actif ? 'true' : 'false'}
      style={anim.style}
      className={`squircle-2xl hover-lift group relative isolate flex flex-col overflow-hidden border bg-bg-soft [--lift:5px] hover:shadow-pop data-[actif=true]:-translate-y-[var(--lift)] data-[actif=true]:shadow-pop has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${anim.className} ${
        actif ? 'border-line-strong' : 'border-line'
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={fond}
          alt=""
          fill
          sizes="(min-width: 1280px) 24rem, 90vw"
          className="object-cover transition-transform duration-slow ease-lift group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 dark:brightness-[0.42]"
        />
        {p.revendiquee && <BadgeGeree profession={profession} className="absolute left-3 top-3" />}
      </div>

      <div className="p-4">
        <h2 className="text-base font-semibold leading-tight text-fg">
          <Link
            href={chemin(`/${base}/${p.departementSlug}/${p.communeSlug}/${p.slug}/`)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {nom}
          </Link>
        </h2>
        <p className="mt-0.5 text-sm text-fg-2">Laboratoire de prothèse dentaire</p>

        <div className="mt-2 text-sm">
          <Adresse ligne={p.adresseLigne} codePostal={p.codePostal} commune={p.communeNom} precision={p.precisionPosition} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Verification statut={p.statutVerification} />
          <span className="text-sm text-fg-2">{distance(p.metres)}</span>
        </div>
      </div>
    </li>
  )
}

/**
 * Squelette d'une carte de résultat.
 *
 * Reprend la géométrie de la carte de la profession : même rayon, même
 * hauteur, mêmes blocs aux mêmes hauteurs. C'est la seule façon d'éviter que
 * la liste ne saute au moment où les vraies cartes arrivent.
 *
 * Il y en a autant que de cartes attendues, jamais un nombre fixe : une page
 * qui n'en ramène que cinq n'affiche que cinq squelettes, sinon l'attente
 * annonce une liste plus longue que celle qui arrive.
 */
export function SqueletteFiche({ profession = 'dentiste' }: { profession?: Profession }) {
  if (profession === 'prothesiste') {
    return (
      <li aria-hidden className="squircle-2xl relative flex flex-col overflow-hidden border border-line bg-bg">
        <Skeleton className="aspect-[16/9] w-full rounded-none" />
        <div className="p-4">
          <Skeleton className="h-5 w-3/4 bg-line" />
          <Skeleton className="mt-1.5 h-4 w-1/2 bg-line" />
          <Skeleton className="mt-3 h-4 w-2/3 bg-line" />
          <Skeleton className="mt-1.5 h-4 w-1/2 bg-line" />
          <Skeleton className="mt-3 h-5 w-56 max-w-full rounded-full bg-line" />
        </div>
      </li>
    )
  }
  return (
    <li
      aria-hidden
      className="squircle-2xl relative flex min-h-[28rem] flex-col justify-end overflow-hidden border border-line bg-bg"
    >
      {/* Zone de l'illustration, qui occupe toute la carte comme dans le rendu final. */}
      <Skeleton className="absolute inset-0 rounded-none" />

      {/*
        Les lignes sont en `--line` et non en `--muted` : celle-ci vaut
        exactement la couleur du fond des cartes, et les lignes y étaient
        invisibles.
      */}
      <div className="relative bg-bg p-4">
        <Skeleton className="h-5 w-3/4 bg-line" />
        <Skeleton className="mt-3 h-5 w-56 max-w-full rounded-full bg-line" />
        <Skeleton className="mt-3 h-4 w-2/3 bg-line" />
        <Skeleton className="mt-1.5 h-4 w-1/2 bg-line" />
      </div>
    </li>
  )
}
