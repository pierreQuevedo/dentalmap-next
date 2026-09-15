'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from '@/components/motion-primitives/morphing-dialog'
import { chemin } from '@/lib/navigation'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { BASE_URL, nomAffiche, type PraticienResume, type Profession } from '@/lib/annuaire/types'
import { Verification } from './primitives'

/**
 * Aperçu d'une fiche, ouvert depuis une liste ou un marqueur de carte.
 *
 * La carte se déplie en place plutôt que de renvoyer sur une autre page : sur
 * une liste de commune, comparer trois praticiens demandait trois allers et
 * retours. La fiche complète reste la page de référence, et le lien y mène :
 * l'aperçu ne la remplace pas, il évite de la charger pour rien.
 *
 * Le composant prend un `PraticienResume`, exactement ce que renvoient déjà
 * `getPraticiensDeCommune` et `getPraticiensProches` : rien à ajouter côté
 * requête pour s'en servir.
 */
export function ApercuFiche({
  praticien,
  profession,
  image,
  distance,
}: {
  praticien: PraticienResume
  profession: Profession
  /** Optionnelle, et absente sur l'annuaire : aucune fiche n'a de photo. */
  image?: string
  /** Mètres, quand l'aperçu est ouvert depuis une recherche géolocalisée. */
  distance?: number
}) {
  const nom = nomAffiche({ profession, ...praticien })
  const lieu = [praticien.codePostal, praticien.communeNom].filter(Boolean).join(' ')
  const versFiche =
    praticien.departementSlug && praticien.communeSlug
      ? `/${BASE_URL[profession]}/${praticien.departementSlug}/${praticien.communeSlug}/${praticien.slug}/`
      : null

  return (
    <MorphingDialog
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.6 }}
    >
      <MorphingDialogTrigger
        aria-label={`Aperçu de la fiche de ${nom}`}
        className="w-full overflow-hidden rounded-2xl border border-line bg-bg text-left"
      >
        <div className="flex items-center gap-4 p-4">
          <Monogramme nom={nom} image={image} />
          <span className="min-w-0 flex-1">
            <MorphingDialogTitle className="block truncate font-semibold text-fg">
              {nom}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="block truncate text-sm text-fg-2">
              {lieu || 'Adresse non communiquée'}
            </MorphingDialogSubtitle>
          </span>
          {typeof distance === 'number' && (
            <span className="shrink-0 text-sm tabular-nums text-fg-2">
              {distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`}
            </span>
          )}
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="relative w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-line bg-bg shadow-pop">
          <div className="flex items-start gap-4 p-5">
            <Monogramme nom={nom} image={image} grand />
            <div className="min-w-0 flex-1">
              <MorphingDialogTitle className="block text-lg font-semibold text-fg">
                {nom}
              </MorphingDialogTitle>
              <MorphingDialogSubtitle className="mt-0.5 block text-sm text-fg-2">
                {profession === 'prothesiste' ? 'Laboratoire de prothèse dentaire' : 'Chirurgien-dentiste'}
              </MorphingDialogSubtitle>
              <div className="mt-2">
                <Verification statut={praticien.statutVerification} />
              </div>
            </div>
          </div>

          <dl className="border-t border-line px-5 py-4 text-sm">
            <div className="flex gap-4 py-1.5">
              <dt className="w-28 shrink-0 text-fg-2">Adresse</dt>
              <dd className="text-fg">
                {praticien.adresseLigne ? formaterAdresse(praticien.adresseLigne) : '—'}
                {lieu && <span className="block">{lieu}</span>}
              </dd>
            </div>
            <div className="flex gap-4 py-1.5">
              <dt className="w-28 shrink-0 text-fg-2">Téléphone</dt>
              <dd className="text-fg">
                {praticien.telephone ? (
                  <a href={`tel:${praticien.telephone.replace(/\s/g, '')}`} className="hover:underline">
                    {praticien.telephone}
                  </a>
                ) : (
                  'Non communiqué'
                )}
              </dd>
            </div>
          </dl>

          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
            <p className="text-xs text-fg-2">Données issues des registres publics</p>
            {versFiche && (
              <Link
                href={chemin(versFiche)}
                className="rounded-full bg-action px-4 py-2 text-sm font-semibold text-action-foreground hover:bg-action-hover"
              >
                Voir la fiche
              </Link>
            )}
          </div>

          <MorphingDialogClose className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-bg text-fg-2 hover:bg-bg-soft" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}

/**
 * Initiales à la place d'une photo.
 *
 * Aucune fiche de l'annuaire n'a de portrait, et il ne faut pas en inventer :
 * une photo d'illustration laisserait croire qu'elle montre ce praticien.
 */
function Monogramme({ nom, image, grand }: { nom: string; image?: string; grand?: boolean }) {
  const taille = grand ? 'size-14 text-lg' : 'size-11 text-sm'
  if (image) {
    return (
      <span className={`relative shrink-0 overflow-hidden rounded-xl ${grand ? 'size-14' : 'size-11'}`}>
        <Image src={image} alt="" fill sizes="56px" className="object-cover" />
      </span>
    )
  }
  const initiales = nom
    .replace(/^Dr\s+/, '')
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((mot) => mot[0])
    .join('')
    .toUpperCase()
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-xl bg-bg-soft font-semibold text-fg-2 ${taille}`}
    >
      {initiales}
    </span>
  )
}
