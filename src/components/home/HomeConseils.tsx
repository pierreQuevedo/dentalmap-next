import Link from 'next/link'
import { Blog31 } from '@/components/blog31'
import { getConseilsAccueil } from '@/lib/wp/queries'

/**
 * Z7. Les trois dernières ressources du CMS dans blog31 : le premier en grande
 * carte image, les deux suivants en cartes classiques. Titre, extrait, date
 * et image viennent de WordPress ; sans image, un aplat neutre.
 */
export async function HomeConseils() {
  const conseils = await getConseilsAccueil(3)
  if (conseils.length === 0) return null

  return (
    <Blog31
      // Sans le retrait interne du block : la section s'aligne sur la largeur des autres.
      className="px-0 py-20 md:py-24"
      title="Ressources"
      header={{
        mainLine1: 'Devis, remboursements, installation, relation avec le laboratoire : ',
        mainLine2: 'des réponses sourcées, relues et sans jargon.',
        sideNote: (
          <Link
            href="/conseils"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground hover:bg-brand-hover"
          >
            Toutes les ressources
          </Link>
        ),
      }}
      blogs={conseils.map((c, i) => ({
        id: String(i + 1).padStart(2, '0'),
        url: `/conseils/${c.categorie ?? 'patients'}/${c.slug}/`,
        image: c.image?.url ?? '/images/conseil-sans-image.svg',
        title: c.titre,
        description: c.extrait ?? '',
        topNote: c.date
          ? new Date(c.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
          : undefined,
      }))}
    />
  )
}
