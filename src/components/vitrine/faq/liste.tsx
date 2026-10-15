'use client'

/**
 * Corps de la FAQ : héros court avec recherche, sommaire des catégories
 * (collant à gauche sur grand écran, pastilles défilantes sur mobile), toutes
 * les questions en accordéon, la catégorie lue surlignée dans le sommaire au fil du défilement, la première de chaque catégorie ouverte, bloc
 * contact discret. La recherche filtre les questions sur place, sans
 * tenir compte des accents ni de la casse.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, TOTAL, type Categorie } from './donnees'
import { LienFleche, Questions, Recherche } from './blocs'

const normaliser = (t: string) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, ' ')
    .toLowerCase()

function filtrer(categories: Categorie[], requete: string): Categorie[] {
  const mots = normaliser(requete).split(/\s+/).filter(Boolean)
  if (mots.length === 0) return categories
  return categories
    .map((c) => ({
      ...c,
      questions: c.questions.filter((q) => {
        const texte = normaliser(`${q.question} ${q.reponse}`)
        return mots.every((m) => texte.includes(m))
      }),
    }))
    .filter((c) => c.questions.length > 0)
}

/** Hauteur sous laquelle une section compte comme lue : l'en-tête collant et la marge de `scroll-mt-28`. */
const SEUIL_LECTURE = 120

/** La catégorie en cours de lecture : la dernière dont le titre est passé sous l'en-tête. */
function useCategorieActive(slugs: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(slugs[0])
  const cle = slugs.join(' ')
  useEffect(() => {
    const liste = cle ? cle.split(' ') : []
    let image = 0
    const mesurer = () => {
      image = 0
      let courante = liste[0]
      for (const slug of liste) {
        const el = document.getElementById(slug)
        if (el && el.getBoundingClientRect().top <= SEUIL_LECTURE) courante = slug
      }
      // Bas de page atteint : la dernière catégorie, même trop courte pour monter jusqu'au seuil.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) courante = liste[liste.length - 1]
      setActive(courante)
    }
    const surDefilement = () => {
      if (!image) image = requestAnimationFrame(mesurer)
    }
    mesurer()
    window.addEventListener('scroll', surDefilement, { passive: true })
    window.addEventListener('resize', surDefilement)
    return () => {
      cancelAnimationFrame(image)
      window.removeEventListener('scroll', surDefilement)
      window.removeEventListener('resize', surDefilement)
    }
  }, [cle])
  return active
}

function Sommaire({ categories }: { categories: Categorie[] }) {
  const active = useCategorieActive(categories.map((c) => c.slug))
  const rangee = useRef<HTMLOListElement>(null)

  // Mobile : la pastille active reste visible dans la rangée qui défile.
  useEffect(() => {
    const ol = rangee.current
    const lien = ol?.querySelector<HTMLElement>(`a[href="#${active}"]`)
    if (!ol || !lien || ol.scrollWidth <= ol.clientWidth) return
    const decalage = lien.getBoundingClientRect().left - ol.getBoundingClientRect().left
    ol.scrollTo({ left: ol.scrollLeft + decalage - ol.clientWidth / 2 + lien.offsetWidth / 2, behavior: 'smooth' })
  }, [active])

  return (
    <nav aria-label="Catégories" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <p className="hidden text-xs font-semibold uppercase tracking-wide text-fg-2 lg:block">Catégories</p>
      {/* Mobile : une rangée de pastilles qui défile, du bord au bord de l'écran. */}
      <ol ref={rangee} className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:mt-4 lg:block lg:space-y-1 lg:overflow-visible lg:border-l lg:border-line lg:px-0 lg:pb-0">
        {categories.map((c) => {
          const actif = c.slug === active
          return (
            <li key={c.slug} className="shrink-0">
              <a
                href={`#${c.slug}`}
                aria-current={actif ? 'location' : undefined}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors lg:-ml-px lg:flex lg:justify-between lg:rounded-none lg:border-0 lg:border-l-2 lg:py-2 lg:pl-4 lg:pr-0 ${
                  actif ? 'border-fg bg-fg text-bg lg:border-teal lg:bg-transparent lg:font-semibold lg:text-fg' : 'border-line text-fg hover:border-line-strong lg:border-transparent'
                }`}
              >
                {c.titre}
                <span className={`tabular-nums ${actif ? 'text-bg/70 lg:text-fg-2' : 'text-fg-2'}`}>{c.questions.length}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ListeFaq() {
  const [requete, setRequete] = useState('')
  const categories = useMemo(() => filtrer(CATEGORIES, requete), [requete])

  return (
    <>
      <section className="border-b border-line">
        <div className="container pb-12 pt-12 md:pb-16 md:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-6xl">Questions fréquentes</h1>
          <p className="mt-4 max-w-xl text-lg text-fg-2">{TOTAL} réponses courtes sur les fiches, leur vérification, l’emploi et vos données.</p>
          <div className="mt-8 max-w-xl">
            <Recherche valeur={requete} onChange={setRequete} />
          </div>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-10 py-10 md:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:py-20">
        <Sommaire categories={categories} />
        <div className="min-w-0 max-w-3xl space-y-16 md:space-y-20">
          {categories.length === 0 && (
            <p className="text-lg text-fg-2" role="status">
              {'Aucune question ne correspond à votre recherche. Essayez un autre mot, ou écrivez-nous.'}
            </p>
          )}
          {categories.map((c) => (
            <section key={c.slug} id={c.slug} className="scroll-mt-28">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-fg pb-3">
                <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">{c.titre}</h2>
                <p className="text-sm text-fg-2">{c.pour}</p>
              </div>
              <Questions key={requete} categorie={c} />
            </section>
          ))}

          <aside className="border-t border-line pt-8">
            <p className="font-semibold text-fg">{'Vous n’avez pas trouvé votre réponse ?'}</p>
            <p className="mt-1 text-fg-2">Écrivez-nous, une personne vous répond.</p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              <LienFleche href="/contact" petit>
                Nous écrire
              </LienFleche>
              <LienFleche href="/contact?objet=erreur-fiche" petit>
                Signaler une erreur sur une fiche
              </LienFleche>
            </p>
          </aside>
        </div>
      </div>
    </>
  )
}
