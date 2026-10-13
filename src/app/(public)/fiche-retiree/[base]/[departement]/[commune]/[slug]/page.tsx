import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getCommune, getPraticien, getPraticiensProches } from '@/lib/annuaire/queries'
import { delaiEcoule, finDuDelai, getRetrait } from '@/lib/annuaire/retrait'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { cheminFiche } from '@/lib/espace-pro/chemins'
import { Page410 } from '@/components/vitrine/erreurs/pages-erreur'
import { professionDuSegment } from '../../../../../[base]/base'

type Params = { base: string; departement: string; commune: string; slug: string }

/**
 * Page « fiche retirée ». Personne n'y arrive par cette adresse : `src/proxy.ts`
 * réécrit vers elle l'URL d'une fiche retirée depuis moins de trente jours, avec
 * le statut 410, et le visiteur garde l'URL de la fiche. Appelée directement,
 * elle refait les mêmes contrôles et répond 404 dès que la fiche n'est pas, ou
 * plus, dans son délai.
 *
 * Bloquante comme la fiche : la décision dépend des données.
 */
export const instant = false

export const metadata: Metadata = {
  title: 'Fiche retirée',
  robots: { index: false, follow: true },
}

/** Rayon de recherche des fiches proches, en mètres. */
const RAYON = 20_000

export default async function Page(props: { params: Promise<Params> }) {
  const { base, departement, commune, slug } = await props.params
  const profession = professionDuSegment(base)
  const retireLe = await getRetrait(profession, departement, commune, slug)
  if (!retireLe) notFound()

  // Le délai court à partir de la date réelle du retrait, comparée à l'heure
  // de la requête : rien de tout cela ne se précalcule.
  await connection()
  const jusquAu = finDuDelai(retireLe)
  if (delaiEcoule(retireLe)) notFound()

  const [p, lieuCommune] = await Promise.all([getPraticien(profession, departement, commune, slug), getCommune(departement, commune)])
  if (!p || !lieuCommune) notFound()

  // Le lieu de l'URL, sa position s'il est situé, sinon le centre de la commune.
  const lieu = p.lieux.find((l) => l.communeSlug === commune && l.departementSlug === departement)
  const situe = lieu?.lon != null && lieu.lat != null && !lieu.approximative
  const lon = situe ? lieu.lon! : lieuCommune.lon
  const lat = situe ? lieu.lat! : lieuCommune.lat
  const voisins = lon != null && lat != null ? await getPraticiensProches(profession, lon, lat, RAYON, 4) : []

  return (
    <Page410
      fiche={{
        retireLe: new Date(retireLe),
        jusquAu,
        commune: lieuCommune.nom,
        base,
        profession,
        libelle: LIBELLE[profession].singulier,
        proches: voisins.filter((v) => v.slug !== slug).slice(0, 3),
        annulation: cheminFiche(slug, 'retrait/confirme'),
      }}
    />
  )
}
