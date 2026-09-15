import Link from 'next/link'
import { chemin, type ConseilCategorie } from '@/lib/navigation'
import type { ConseilResume } from '@/lib/wp/queries'

export const LIBELLE_CATEGORIE: Record<ConseilCategorie, string> = {
  patients: 'Patients',
  praticiens: 'Praticiens',
  prothesistes: 'Prothésistes',
}

/**
 * Pastille de rubrique.
 *
 * Les trois teintes éditoriales n'apparaissent qu'ici, en point de huit
 * pixels : la charte les réserve à la distinction des rubriques, jamais à un
 * aplat ni à un bouton.
 */
const POINT: Record<string, string> = {
  patients: 'bg-editorial-1',
  praticiens: 'bg-editorial-2',
  prothesistes: 'bg-editorial-3',
}

export function Rubrique({ categorie }: { categorie: string | null }) {
  if (!categorie || !(categorie in LIBELLE_CATEGORIE)) return null
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-fg-2">
      <span aria-hidden className={`size-2 rounded-full ${POINT[categorie] ?? 'bg-fg-2'}`} />
      {LIBELLE_CATEGORIE[categorie as ConseilCategorie]}
    </span>
  )
}

const dateLongue = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

export function formaterDate(valeur: string | null) {
  if (!valeur) return null
  const d = new Date(valeur)
  return Number.isNaN(d.getTime()) ? null : dateLongue.format(d)
}

export function lienConseil(c: { categorie: string | null; slug: string }) {
  return c.categorie ? `/conseils/${c.categorie}/${c.slug}/` : `/conseils/${c.slug}/`
}

/** Ligne d'article, pour l'index des conseils et les pages de rubrique. */
export function CarteConseil({ conseil }: { conseil: ConseilResume }) {
  return (
    <article className="border-b border-line py-5 last:border-b-0">
      <Rubrique categorie={conseil.categorie} />
      <h2 className="mt-2 text-lg font-semibold text-fg">
        <Link href={chemin(lienConseil(conseil))} className="hover:underline">
          {conseil.titre}
        </Link>
      </h2>
      {conseil.extrait && <p className="mt-1 max-w-2xl text-sm text-fg-2">{conseil.extrait}</p>}
      <p className="mt-2 text-xs text-fg-2">
        {[formaterDate(conseil.date), conseil.tempsLecture ? `${conseil.tempsLecture} min de lecture` : null]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </article>
  )
}
