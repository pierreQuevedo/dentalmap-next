import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { PageAnnonce } from '@/components/cessions/annonce'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { IMAGE_PARTAGE, OPEN_GRAPH } from '@/lib/seo/site'
import { chiffreAffaires, paragraphes, prixLong } from '@/lib/cessions/format'
import { getAnnonceCession, getAnnoncesProches } from '@/lib/cessions/queries'
import { LISTE_CESSIONS, cheminAnnonceCession, cheminDepartementCession } from '@/lib/cessions/routes'
import { LIBELLE_TYPE } from '@/lib/cessions/types'

type Params = Promise<{ departement: string; slug: string }>

/** Bloquante : une annonce expirée, retirée ou inconnue doit renvoyer 404. */
export const instant = false

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { departement, slug } = await props.params
  const a = await getAnnonceCession(slug)
  if (!a || a.departementSlug !== departement) return { title: 'Annonce introuvable', robots: { index: false, follow: true } }
  const url = cheminAnnonceCession(a.departementSlug, a.slug)
  const titre = `${a.titre}, secteur ${a.secteur} (${a.departementCode})`
  const description = `${LIBELLE_TYPE[a.type]} à céder, secteur ${a.secteur}, ${a.departementNom}. Prix : ${prixLong(a.prix).toLowerCase()}. CA indicatif : ${chiffreAffaires(a.caMin, a.caMax)}. ${paragraphes(a.description)[0] ?? ''}`
  return {
    title: titre,
    description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
    alternates: { canonical: url },
    openGraph: { ...OPEN_GRAPH, title: titre, url, type: 'article', images: [a.photo ? { url: a.photo } : IMAGE_PARTAGE] },
  }
}

export default async function Page(props: { params: Params }) {
  const { departement, slug } = await props.params
  const a = await getAnnonceCession(slug)
  // Le département de l'URL doit être celui de l'annonce : une seule adresse par annonce.
  if (!a || a.departementSlug !== departement) notFound()
  const proches = await getAnnoncesProches(a.id, a.departementCode, a.lon, a.lat)
  return (
    <>
      <Balisage
        donnees={filAriane([
          { nom: 'Accueil', chemin: '/' },
          { nom: 'Cessions de cabinet', chemin: LISTE_CESSIONS },
          { nom: a.departementNom, chemin: cheminDepartementCession(a.departementSlug) },
          { nom: a.titre, chemin: cheminAnnonceCession(a.departementSlug, a.slug) },
        ])}
      />
      <HeaderTransparent />
      <PageAnnonce a={a} proches={proches} />
    </>
  )
}
