/** Briques des pages de cession, dans le dessin des pages Emploi. */
import Image from 'next/image'
import Link from 'next/link'
import { Armchair, BadgeCheck, Building2, KeyRound, MapPin, Users } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { chiffreAffaires, dateCourte, fauteuils, km, phraseDisponibilite, prixLong } from '@/lib/cessions/format'
import { cheminAnnonceCession } from '@/lib/cessions/routes'
import { LIBELLE_TYPE, type AnnonceResume, type TypeCession } from '@/lib/cessions/types'

export function Etiquette({ children, ton = 'neutre' }: { children: React.ReactNode; ton?: 'neutre' | 'teal' | 'sombre' }) {
  const c = {
    neutre: 'bg-bg text-fg ring-line',
    teal: 'bg-teal/10 text-teal ring-teal/30',
    sombre: 'bg-white/10 text-white ring-white/15',
  }[ton]
  return <span className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`}>{children}</span>
}

/** « Annonce publiée par un praticien vérifié » : ni nom, ni coordonnées. */
export function CedantVerifie({ sombre, court }: { sombre?: boolean; court?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex shrink-0 items-center gap-1 font-medium ring-1 ring-inset ${court ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'} ${
        sombre ? 'bg-white/10 text-white ring-white/15' : 'bg-bg text-fg ring-line'
      }`}
    >
      <BadgeCheck className="size-3.5 text-teal" aria-hidden /> {court ? 'Praticien vérifié' : 'Annonce publiée par un praticien vérifié'}
    </span>
  )
}

const ICONES: Record<TypeCession, typeof Building2> = {
  cabinet: Armchair,
  parts: Users,
  patientele: Users,
  murs: KeyRound,
}

/** Photo déposée par le cédant, sinon fond neutre à l'icône du type de cession. */
export function Visuel({ a, className = '', petit, priorite }: { a: Pick<AnnonceResume, 'photo' | 'type'>; className?: string; petit?: boolean; priorite?: boolean }) {
  if (a.photo) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={a.photo} alt="" fill priority={priorite} sizes={petit ? '112px' : '(min-width: 1024px) 24rem, 90vw'} className="object-cover" />
      </div>
    )
  }
  const I = ICONES[a.type]
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-[color-mix(in_oklch,var(--color-teal)_7%,var(--bg-soft))] ${className}`} aria-hidden>
      <I className={`text-teal/70 ${petit ? 'size-7' : 'size-10'}`} strokeWidth={1.5} />
    </div>
  )
}

function Secteur({ a }: { a: AnnonceResume }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <MapPin className="size-3.5 shrink-0 text-geo" aria-hidden /> Secteur {a.secteur}
      {a.km !== undefined ? ` · ${km(a.km)}` : ''}
    </span>
  )
}

function Montants({ a, grand }: { a: AnnonceResume; grand?: boolean }) {
  return (
    <p className={grand ? '' : 'ml-auto text-right'}>
      <span className={`block font-semibold tabular-nums text-fg ${grand ? 'text-lg' : ''}`}>{prixLong(a.prix)}</span>
      <span className="block text-xs text-fg-2">CA {chiffreAffaires(a.caMin, a.caMax)}</span>
    </p>
  )
}

/**
 * Une annonce dans une liste.
 * - `ligne` : vignette à gauche, pour la recherche.
 * - `compacte` : sans vignette, à côté de la carte.
 * - `carte` : visuel en tête, pour les annonces proches.
 */
export function CarteAnnonce({ a, forme = 'ligne', actif }: { a: AnnonceResume; forme?: 'ligne' | 'compacte' | 'carte'; actif?: boolean }) {
  const href = chemin(cheminAnnonceCession(a.departementSlug, a.slug))
  const dispo = phraseDisponibilite(a.disponibilite)
  if (forme === 'carte') {
    return (
      <li className="squircle-2xl hover-lift group relative flex flex-col overflow-hidden border border-line bg-bg-soft [--lift:4px] hover:shadow-pop">
        <div className="relative">
          <Visuel a={a} className="aspect-[16/9]" />
          <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">{LIBELLE_TYPE[a.type]}</span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-semibold leading-snug text-fg">
            <Link href={href} className="after:absolute after:inset-0">
              {a.titre}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-fg-2">{[a.fauteuils ? fauteuils(a.fauteuils) : null, dispo].filter(Boolean).join(' · ')}</p>
          <div className="mt-auto pt-4">
            <Montants a={a} grand />
          </div>
        </div>
        <p className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-fg-2">
          <Secteur a={a} />
        </p>
      </li>
    )
  }
  const compacte = forme === 'compacte'
  return (
    <li
      className={`squircle-2xl hover-lift group relative flex gap-4 border bg-bg p-3 [--lift:3px] hover:shadow-pop sm:p-4 ${actif ? 'border-line-strong shadow-pop' : 'border-line'}`}
    >
      {!compacte && <Visuel a={a} petit className="squircle-xl hidden size-28 shrink-0 sm:grid" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Etiquette ton="teal">{LIBELLE_TYPE[a.type]}</Etiquette>
          {a.fauteuils ? <Etiquette>{fauteuils(a.fauteuils)}</Etiquette> : null}
          <span className="text-xs text-fg-2">Publiée le {dateCourte(a.publieeLe)}</span>
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-fg">
          <Link href={href} className="after:absolute after:inset-0">
            {a.titre}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-2">
          {dispo}
          {!compacte && <CedantVerifie court />}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <p className="text-sm text-fg-2">
            <Secteur a={a} />
          </p>
          <Montants a={a} />
        </div>
      </div>
    </li>
  )
}
