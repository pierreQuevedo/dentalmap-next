/**
 * Article modulaire des Ressources : en-tête, sommaire, sections, sources et
 * « À lire aussi », d'après les gabarits Figma desktop (221:1949) et mobile
 * (221:2308). Données : `src/lib/conseils/modules.ts`.
 *
 * En desktop, le sommaire est une colonne collante de 240 px à gauche d'une
 * colonne de lecture de 720 px ; en dessous de 1024 px, il se replie sous
 * l'en-tête.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { formaterDate, LIBELLE_CATEGORIE, lienConseil, Rubrique } from '@/components/conseils/primitives'
import { Avatar, SectionModule } from '@/components/conseils/article/modules'
import { SommaireDesktop, SommaireMobile } from '@/components/conseils/article/sommaire'
import { chemin, type ConseilCategorie } from '@/lib/navigation'
import { Balisage, faqPage } from '@/lib/seo/jsonld'
import { questionsDe, sommaire, type ArticleModulaire, type Source } from '@/lib/conseils/modules'
import type { ConseilResume } from '@/lib/wp/queries'

export type EnTeteArticle = {
  titre: string
  categorie: ConseilCategorie
  chapo: string | null
  reluPar: string | null
  /** Date de relecture, sinon de modification. */
  majLe: string | null
  tempsLecture: number
  image: { url: string; alt: string } | null
}

function EnTete({ e }: { e: EnTeteArticle }) {
  const maj = formaterDate(e.majLe)
  const meta = [maj ? `Mis à jour le ${maj}` : null, `${e.tempsLecture} min de lecture`].filter(Boolean).join(' · ')
  return (
    <header className="flex flex-col gap-4">
      <FilAriane
        segments={[
          { libelle: 'Accueil', href: '/' },
          { libelle: 'Ressources', href: '/conseils/' },
          { libelle: LIBELLE_CATEGORIE[e.categorie], href: `/conseils/${e.categorie}/` },
        ]}
      />
      <Rubrique categorie={e.categorie} />
      <h1 className="text-[34px] font-bold leading-10 tracking-[-0.025em] text-fg md:text-5xl md:leading-[56px]">{e.titre}</h1>
      {e.chapo && <p className="text-lg leading-7 text-fg-2 md:text-[21px] md:leading-8">{e.chapo}</p>}
      <div className="flex items-center gap-3 pt-2">
        {e.reluPar && <Avatar nom={e.reluPar} />}
        <div className="flex min-w-0 flex-col gap-0.5 text-sm leading-5">
          {e.reluPar && <p className="font-medium text-fg">Relu par {e.reluPar}</p>}
          <p className="text-fg-2">{meta}</p>
        </div>
      </div>
      {e.image && (
        <div className="squircle-xl relative mt-4 aspect-video overflow-hidden bg-accent">
          <Image src={e.image.url} alt={e.image.alt} fill priority sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
        </div>
      )}
    </header>
  )
}

function Sources({ sources }: { sources: Source[] }) {
  return (
    <footer className="flex flex-col gap-3 border-t border-line pt-6 text-sm leading-5 text-fg-2">
      <h2 className="text-base font-semibold leading-6 text-fg">Sources</h2>
      <ol className="flex flex-col gap-3">
        {sources.map((s, i) => (
          <li key={s.libelle + i} className="flex items-start gap-2">
            <span className="tabular-nums">{i + 1}.</span>
            {s.url ? (
              <a href={s.url} rel="noopener" target="_blank" className="inline-flex min-w-0 items-center gap-2 underline underline-offset-2 hover:text-fg">
                <span className="min-w-0">{s.libelle}</span>
                <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            ) : (
              <span>{s.libelle}</span>
            )}
          </li>
        ))}
      </ol>
      <p>
        Une erreur dans cet article ?{' '}
        <Link href={chemin('/contact?objet=autre')} className="underline underline-offset-2 hover:text-fg">
          Signalez-la.
        </Link>
      </p>
    </footer>
  )
}

/** Trois cartes côte à côte en desktop, empilées en mobile. */
export function ALireAussi({ articles }: { articles: ConseilResume[] }) {
  if (articles.length === 0) return null
  return (
    <section aria-labelledby="a-lire-aussi" className="flex flex-col gap-6">
      <h2 id="a-lire-aussi" className="text-[26px] font-semibold leading-[34px] tracking-[-0.01em] text-fg">
        À lire aussi
      </h2>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link href={chemin(lienConseil(a))} className="squircle-xl flex h-full flex-col gap-2.5 border border-line p-6 transition-colors hover:bg-bg-soft">
              <Rubrique categorie={a.categorie ?? 'patients'} />
              <p className="text-lg font-semibold leading-[26px] text-fg">{a.titre}</p>
              {a.tempsLecture && <p className="text-[13px] leading-[18px] text-fg-2">{a.tempsLecture} min de lecture</p>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ArticleModulairePage({ entete, article, aLireAussi }: { entete: EnTeteArticle; article: ArticleModulaire; aLireAussi: ConseilResume[] }) {
  const entrees = sommaire(article.sections)
  const questions = questionsDe(article.sections)
  return (
    <main className="mx-auto w-full max-w-[75rem] px-4 pb-16 pt-6 md:px-10 md:pb-24 md:pt-10 xl:px-0">
      {questions.length > 0 && <Balisage donnees={faqPage(questions)} />}
      <div className="mx-auto grid max-w-[45rem] gap-10 md:gap-14 lg:mx-0 lg:max-w-none lg:grid-cols-[15rem_minmax(0,45rem)] lg:gap-x-20">
        <div className="lg:col-start-2">
          <EnTete e={entete} />
        </div>
        {entrees.length > 0 && (
          <div className="lg:hidden">
            <SommaireMobile entrees={entrees} />
          </div>
        )}
        <div className="hidden lg:block">{entrees.length > 0 && <SommaireDesktop entrees={entrees} />}</div>
        <article className="flex min-w-0 flex-col gap-10 md:gap-14">
          {article.sections.map((s, i) => (
            <SectionModule key={s.ancre ?? `section-${i}`} section={s} />
          ))}
          {article.sources.length > 0 && <Sources sources={article.sources} />}
        </article>
      </div>
      {aLireAussi.length > 0 && (
        <div className="mx-auto mt-10 max-w-[45rem] md:mt-14 md:max-w-none md:pt-10">
          <ALireAussi articles={aLireAussi} />
        </div>
      )}
    </main>
  )
}
