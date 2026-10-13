/**
 * MAQUETTE, à supprimer une fois `/conseils/` refait : index des Ressources
 * avec ses quatre rubriques (Patients, Praticiens, Prothésistes, Métiers),
 * l'article à la une, les derniers articles et l'entrée vers les métiers.
 * Titres d'articles repris du site ; photos de banque d'images. Jamais indexée.
 */
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteMetier } from '../metiers/_blocs'
import { METIERS } from '../metiers/_donnees'

export const metadata: Metadata = { title: 'Maquette Ressources', robots: { index: false, follow: false } }

const POINT = { patients: 'bg-editorial-1', praticiens: 'bg-editorial-2', prothesistes: 'bg-editorial-3', metiers: 'bg-teal' } as const
type Cle = keyof typeof POINT

const RUBRIQUES: { cle: Cle; nom: string; texte: string; n: number; photo: string }[] = [
  { cle: 'patients', nom: 'Patients', texte: 'Choisir un praticien, comprendre un devis, savoir ce qui est remboursé.', n: 14, photo: '/images/demo/pexels-6627447.jpg' },
  { cle: 'praticiens', nom: 'Praticiens', texte: 'Installation, conventionnement, obligations d’affichage.', n: 11, photo: '/images/demo/pexels-19879741.jpg' },
  { cle: 'prothesistes', nom: 'Prothésistes', texte: 'Traçabilité, marquage CE, relations avec les cabinets.', n: 7, photo: '/images/demo/pexels-6627325.jpg' },
  { cle: 'metiers', nom: 'Métiers', texte: 'Missions, formation et salaire moyen, métier par métier.', n: 6, photo: '/images/demo/pexels-6627320.jpg' },
]

const ARTICLES: { titre: string; extrait: string; cle: Cle; date: string; lecture: number }[] = [
  { titre: 'Comment vérifier qu’un dentiste est bien inscrit à l’Ordre', extrait: 'Les trois registres officiels à consulter et ce qu’ils prouvent réellement.', cle: 'patients', date: '11 septembre 2026', lecture: 4 },
  { titre: 'Lire un devis de prothèse dentaire ligne par ligne', extrait: 'Du prix de vente au reste à charge, avant de signer.', cle: 'patients', date: '22 septembre 2026', lecture: 6 },
  { titre: 'S’installer en libéral : les démarches dans l’ordre', extrait: 'Ordre, immatriculation, conventionnement, RPPS.', cle: 'praticiens', date: '22 septembre 2026', lecture: 8 },
  { titre: 'Marquage CE des dispositifs sur mesure : ce que dit le règlement', extrait: 'Ce que le règlement impose au laboratoire, et ce qu’il n’impose pas.', cle: 'prothesistes', date: '22 septembre 2026', lecture: 7 },
  { titre: 'Le métier d’assistant(e) dentaire', extrait: 'Missions, alternance, salaire moyen et évolutions.', cle: 'metiers', date: '13 octobre 2026', lecture: 6 },
  { titre: 'Revendiquer sa fiche DentalMap avec sa carte CPS', extrait: 'Votre fiche existe déjà : prenez la main en quelques minutes.', cle: 'praticiens', date: '22 septembre 2026', lecture: 3 },
]

const NOM = Object.fromEntries(RUBRIQUES.map((r) => [r.cle, r.nom])) as Record<Cle, string>

function Pastille({ cle, sombre }: { cle: Cle; sombre?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium ${sombre ? 'text-white/75' : 'text-fg-2'}`}>
      <span aria-hidden className={`size-2 rounded-full ${POINT[cle]}`} />
      {NOM[cle]}
    </span>
  )
}

export default function Ressources() {
  const [une, ...autres] = ARTICLES
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

      <section className="container pb-16">
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {RUBRIQUES.map((r) => (
            <li key={r.cle}>
              <a className="group squircle-3xl relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-neutral-900 p-4 text-white md:p-6">
                <Image src={r.photo} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.03]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <ArrowUpRight className="absolute right-4 top-4 size-5 text-white/80" aria-hidden />
                <div className="relative">
                  <span aria-hidden className={`block size-2.5 rounded-full ${POINT[r.cle]}`} />
                  <p className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{r.nom}</p>
                  <p className="mt-1 hidden text-sm text-white/75 md:block">{r.texte}</p>
                  <p className="mt-3 text-xs text-white/60">{r.n} articles</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <a className="group">
            <div className="squircle-3xl relative aspect-[16/10] overflow-hidden">
              <Image src="/images/demo/pexels-8413334.jpg" alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            </div>
            <div className="mt-6">
              <Pastille cle={une!.cle} />
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">{une!.titre}</h2>
              <p className="mt-3 text-lg text-fg-2">{une!.extrait}</p>
              <p className="mt-4 text-sm text-fg-2">
                {une!.date} · {une!.lecture} min de lecture
              </p>
            </div>
          </a>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg">Les derniers articles</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {autres.map((a) => (
                <li key={a.titre}>
                  <a className="group block py-5">
                    <Pastille cle={a.cle} />
                    <p className="mt-2 text-lg font-semibold leading-snug text-fg group-hover:underline">{a.titre}</p>
                    <p className="mt-1 text-xs text-fg-2">
                      {a.date} · {a.lecture} min
                    </p>
                  </a>
                </li>
              ))}
            </ul>
            <a className="mt-6 inline-flex items-center gap-2 font-medium text-fg">
              Tous les articles <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-bg-soft">
        <div className="container py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              Les métiers du dentaire
              <span className="block text-fg-2">missions, formation, salaire.</span>
            </h2>
            <a className="inline-flex items-center gap-2 font-medium text-fg">
              Les {METIERS.length} métiers <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {METIERS.slice(0, 3).map((m) => (
              <CarteMetier key={m.slug} m={m} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
