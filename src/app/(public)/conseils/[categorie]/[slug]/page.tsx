import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import { formaterDate, LIBELLE_CATEGORIE, Rubrique } from '@/components/conseils/primitives'
import { CONSEIL_CATEGORIES, type ConseilCategorie } from '@/lib/navigation'
import { getConseil } from '@/lib/wp/queries'

export const instant = false

function estCategorie(v: string): v is ConseilCategorie {
  return (CONSEIL_CATEGORIES as readonly string[]).includes(v)
}

type Params = Promise<{ categorie: string; slug: string }>

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { categorie, slug } = await props.params
  if (!estCategorie(categorie)) return {}
  const conseil = await getConseil(slug)
  if (!conseil) return {}
  return {
    title: conseil.seoTitre || conseil.titre,
    description: conseil.seoDescription || conseil.extrait || undefined,
    robots: conseil.noindex ? { index: false, follow: true } : undefined,
  }
}

export default async function ArticleConseil(props: { params: Params }) {
  const { categorie, slug } = await props.params
  if (!estCategorie(categorie)) notFound()

  const conseil = await getConseil(slug)
  // La catégorie de l'URL doit être celle de l'article : sans ce contrôle, le
  // même contenu vivrait sous trois adresses, et le référencement paierait la
  // duplication.
  if (!conseil || conseil.categorie !== categorie) notFound()

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-10">
      <FilAriane
        segments={[
          { libelle: 'Accueil', href: '/' },
          { libelle: 'Conseils', href: '/conseils' },
          { libelle: LIBELLE_CATEGORIE[categorie], href: `/conseils/${categorie}` },
          { libelle: conseil.titre },
        ]}
      />

      <header className="mt-5">
        <Rubrique categorie={conseil.categorie} />
        <h1 className="mt-2 text-fg">{conseil.titre}</h1>
        <p className="mt-3 text-sm text-fg-2">
          {[formaterDate(conseil.date), conseil.tempsLecture ? `${conseil.tempsLecture} min de lecture` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {conseil.contenu && (
        // Le contenu vient de l'éditeur WordPress, dont le balisage n'est pas
        // sous notre contrôle : les styles sont posés par sélecteur plutôt
        // qu'en ajoutant des classes à des balises qu'on ne génère pas.
        <div
          className="mt-8 text-fg [&_a]:text-action [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: conseil.contenu }}
        />
      )}
    </main>
  )
}
