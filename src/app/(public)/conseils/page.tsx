import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteMetierPhoto } from '@/components/conseils/metier'
import { formaterDate, LIBELLE_CATEGORIE, lienConseil, Rubrique } from '@/components/conseils/primitives'
import { getMetiers } from '@/lib/conseils/metier'
import { chemin, CONSEIL_CATEGORIES, type ConseilCategorie } from '@/lib/navigation'
import { getConseils } from '@/lib/wp/queries'

export const instant = false

export const metadata: Metadata = {
  title: 'Ressources',
  description: 'Articles pour les patients, les praticiens et les prothésistes, et les métiers du dentaire, écrits à partir des règles et des registres officiels.',
  alternates: { canonical: '/conseils/' },
}

const TEXTE: Record<ConseilCategorie, string> = {
  patients: 'Choisir un praticien, comprendre un devis, savoir ce qui est remboursé.',
  praticiens: 'Installation, conventionnement, obligations d’affichage.',
  prothesistes: 'Traçabilité, marquage CE, relations avec les cabinets.',
  metiers: 'Missions, formation et salaire minimum, métier par métier.',
}

/**
 * Photo d'illustration d'une rubrique quand aucun de ses articles n'a d'image
 * à la une. Photos de banque d'images (voir `public/images/demo/LISEZMOI.md`),
 * jamais utilisées sur une fiche de l'annuaire.
 */
const PHOTO: Record<ConseilCategorie, string> = {
  patients: '/images/demo/pexels-6627447.jpg',
  praticiens: '/images/demo/pexels-19879741.jpg',
  prothesistes: '/images/demo/pexels-6627325.jpg',
  metiers: '/images/demo/pexels-6627320.jpg',
}

const POINT: Record<ConseilCategorie, string> = {
  patients: 'bg-editorial-1',
  praticiens: 'bg-editorial-2',
  prothesistes: 'bg-editorial-3',
  metiers: 'bg-teal',
}

/**
 * Index des Ressources : les rubriques en cartes photo, l'article à la une,
 * les derniers articles et l'entrée vers les métiers. Les trois rubriques
 * d'articles sont toujours là ; la rubrique Métiers n'apparaît qu'avec une
 * première fiche publiée.
 */
export default async function IndexConseils() {
  const [conseils, metiers] = await Promise.all([getConseils(), getMetiers()])
  const rubriques = CONSEIL_CATEGORIES.map((cle) => {
    const articles = conseils.filter((c) => (c.categorie ?? 'patients') === cle)
    return { cle, n: articles.length, photo: articles.find((a) => a.image)?.image?.url ?? PHOTO[cle] }
  }).filter((r) => r.n > 0 || r.cle !== 'metiers')
  const articles = conseils.filter((c) => c.categorie !== 'metiers')
  const une = articles.find((a) => a.image) ?? articles[0]
  const suite = articles.filter((a) => a !== une).slice(0, 5)

  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: 'Ressources' }]} />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            Ressources
            <span className="block text-fg-2">écrites depuis les registres.</span>
          </h1>
          <p className="max-w-sm text-lg text-fg-2">Pour les patients, les praticiens, les laboratoires et celles et ceux qui veulent y travailler.</p>
        </div>
      </section>

      {rubriques.length > 0 && (
        <section className="container pb-16">
          <ul className={`grid grid-cols-2 gap-3 md:gap-4 ${rubriques.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            {rubriques.map((r) => (
              <li key={r.cle}>
                <Link
                  href={chemin(`/conseils/${r.cle}/`)}
                  className="group squircle-3xl relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-neutral-900 p-4 text-white md:p-6"
                >
                  <Image src={r.photo} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <ArrowUpRight className="absolute right-4 top-4 size-5 text-white/80" aria-hidden />
                  <div className="relative">
                    <span aria-hidden className={`block size-2.5 rounded-full ${POINT[r.cle]}`} />
                    <p className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{LIBELLE_CATEGORIE[r.cle]}</p>
                    <p className="mt-1 hidden text-sm text-white/75 md:block">{TEXTE[r.cle]}</p>
                    <p className="mt-3 text-xs text-white/60">
                      {r.n === 0 ? 'Bientôt' : `${r.n} ${r.cle === 'metiers' ? (r.n > 1 ? 'fiches' : 'fiche') : r.n > 1 ? 'articles' : 'article'}`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {une ? (
        <section className="border-t border-line">
          <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <Link href={chemin(lienConseil(une))} className="group">
              {une.image && (
                <div className="squircle-3xl relative aspect-[16/10] overflow-hidden">
                  <Image src={une.image.url} alt={une.image.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
              )}
              <div className={une.image ? 'mt-6' : ''}>
                <Rubrique categorie={une.categorie ?? 'patients'} />
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-fg group-hover:underline md:text-4xl">{une.titre}</h2>
                {une.extrait && <p className="mt-3 text-lg text-fg-2">{une.extrait}</p>}
                <p className="mt-4 text-sm text-fg-2">
                  {[formaterDate(une.date), une.tempsLecture ? `${une.tempsLecture} min de lecture` : null].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
            {suite.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-fg">Les derniers articles</h2>
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {suite.map((a) => (
                    <li key={a.slug}>
                      <Link href={chemin(lienConseil(a))} className="group block py-5">
                        <Rubrique categorie={a.categorie ?? 'patients'} />
                        <p className="mt-2 text-lg font-semibold leading-snug text-fg group-hover:underline">{a.titre}</p>
                        <p className="mt-1 text-xs text-fg-2">
                          {[formaterDate(a.date), a.tempsLecture ? `${a.tempsLecture} min` : null].filter(Boolean).join(' · ')}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="container pb-16">
          <p className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-fg-2">Aucun article publié pour le moment.</p>
        </div>
      )}

      {metiers.length > 0 && (
        <section className="border-t border-line bg-bg-soft">
          <div className="container py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
                Les métiers du dentaire
                <span className="block text-fg-2">missions, formation, salaire.</span>
              </h2>
              <Link href={chemin('/conseils/metiers/')} className="inline-flex items-center gap-2 font-medium text-fg">
                {metiers.length > 1 ? `Les ${metiers.length} métiers` : 'Le métier'} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {metiers.slice(0, 3).map((m) => (
                <CarteMetierPhoto key={m.slug} m={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
