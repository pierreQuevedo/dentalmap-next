import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { FicheEcole } from '@/components/formation/fiche-etablissement'
import { FicheFaculte } from '@/components/formation/fiche-faculte'
import { FicheFormation } from '@/components/formation/fiche-formation'
import { getDeclarationPublique } from '@/lib/espace-pro/etablissement-donnees'
import { getFormationPrivee } from '@/lib/formation/privee-donnees'
import type { PointFaculte } from '@/components/formation/carte-faculte'
import { chemin } from '@/lib/navigation'
import { enRegion as libelleRegion } from '@/lib/annuaire/libelles'
import { getCodesDepartementsDeRegion, getDepartementParCode } from '@/lib/annuaire/queries'
import { lireEcole, lireFaculte, nomCourt, sitesDe } from '@/lib/formation/faculte'
import { getPositionsFormation } from '@/lib/formation/geocodage'
import { estFormationType, FAMILLES, lienFormation, typeDe } from '@/lib/formation/types'
import { getFormation, getFormations } from '@/lib/wp/queries'

type Params = Promise<{ type: string; slug: string }>

/** Bloquante : une formation inconnue doit renvoyer 404. */
export const instant = false

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params
  const f = await getFormation(slug)
  if (!f) return { title: 'Formation introuvable' }
  const etab = lireFaculte(f.contenu) ?? lireEcole(f.contenu)
  return {
    title: f.seoTitre ?? f.titre,
    description: f.seoDescription ?? etab?.presentation ?? f.extrait ?? FAMILLES[typeDe(f)].intro,
    alternates: { canonical: lienFormation(f) },
    robots: f.noindex ? { index: false, follow: true } : undefined,
    openGraph: f.image ? { images: [{ url: f.image.url, alt: f.image.alt }] } : undefined,
  }
}

/**
 * Fiche d'une formation. Une formation n'a qu'une adresse, celle de sa
 * famille : appelée sous une autre, elle y renvoie.
 *
 * Une école de prothèse ou une faculté dont le contenu balisé se lit a sa
 * page d'établissement : héros sur carte, blocs relevés et déclarés. Les
 * lieux sont géocodés pour les cartes, et les autres établissements de la
 * même région sont proposés avant les autres. Les formations privées, et un
 * établissement dont le contenu ne se lit pas, gardent la fiche générique.
 */
export default async function Page(props: { params: Params }) {
  const { type, slug } = await props.params
  if (!estFormationType(type)) notFound()
  const [f, toutes] = await Promise.all([getFormation(slug), getFormations()])
  if (!f) notFound()
  if (typeDe(f) !== type) permanentRedirect(chemin(lienFormation(f)))

  const gerable = f.type === 'ecole_prothese' || f.type === 'faculte'
  const declaration = gerable ? await getDeclarationPublique(f.slug) : undefined
  const privee = f.type === 'privee' ? await getFormationPrivee(f.slug) : null
  const fac = type === 'facultes-odontologie' ? lireFaculte(f.contenu) : null
  const ecole = type === 'ecoles-de-prothese' ? lireEcole(f.contenu) : null

  const points: PointFaculte[] = []
  if (ecole?.adresse) {
    const [p] = await getPositionsFormation(f.slug, [ecole.adresse])
    if (p) points.push({ cle: 'etablissement', nom: f.titre, lon: p.lon, lat: p.lat, role: 'etablissement' })
  }
  if (fac) {
    const sites = sitesDe(fac.adresse, f.titre)
    const lieux = [
      ...sites.map((s) => ({ nom: s.nom, adresse: s.adresse, role: 'etablissement' as const })),
      ...fac.centresDeSoins.map((c) => ({ nom: nomCourt(c), adresse: c, role: 'soins' as const })),
    ]
    const positions = await getPositionsFormation(f.slug, lieux.map((l) => l.adresse))
    lieux.forEach((l, i) => {
      const p = positions[i]
      if (p) points.push({ cle: `${l.role}-${i}`, nom: l.nom, lon: p.lon, lat: p.lat, role: l.role })
    })
  }

  // Les autres formations de la famille : celles de la région d'abord.
  const departement = f.departement ? await getDepartementParCode(f.departement) : null
  const codesRegion = new Set(departement ? await getCodesDepartementsDeRegion(departement.regionCode) : [])
  const memeFamille = toutes.filter((x) => typeDe(x) === type && x.slug !== f.slug)
  const enRegion = memeFamille.filter((x) => x.departement && codesRegion.has(x.departement))
  const ailleurs = memeFamille.filter((x) => !enRegion.includes(x))
  const autres = [...enRegion, ...ailleurs].slice(0, 3)

  const position = points.find((p) => p.role === 'etablissement') ?? null
  const ici = position ? { lon: position.lon, lat: position.lat } : null

  if (ecole) {
    return (
      <>
        <HeaderTransparent />
        <FicheEcole
          f={f}
          ecole={ecole}
          declaration={declaration ?? null}
          position={ici}
          autres={autres}
          departement={departement ? { slug: departement.slug, nom: departement.nom } : null}
        />
      </>
    )
  }
  if (fac) {
    return (
      <>
        <HeaderTransparent />
        <FicheFaculte f={f} fac={fac} declaration={declaration ?? null} position={ici} points={points} autres={autres} />
      </>
    )
  }

  return (
    <FicheFormation
      f={f}
      type={type}
      faculte={fac}
      ecole={ecole}
      points={points}
      autres={autres}
      regionNom={enRegion.length > 0 && departement ? libelleRegion(departement.regionSlug, departement.regionNom) : null}
      declaration={declaration}
      privee={privee}
    />
  )
}
