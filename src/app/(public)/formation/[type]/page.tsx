import { notFound } from 'next/navigation'
import { ListeFormations, metadonneesFormations, type ParamsLieu } from '@/components/formation/liste-formations'
import { PageFormationsPrivees } from '@/components/formation/liste-formations-privees'
import { getVuesFormationsPrivees } from '@/lib/formation/privee-donnees'
import { lireFiltres, nombreFiltres } from '@/lib/formation/privee-liste'
import { estFormationType } from '@/lib/formation/types'

/** Bloquante : une famille inconnue doit renvoyer 404, et le lieu vient de l'URL. */
export const instant = false

type Recherche = Record<string, string | string[] | undefined>

/** Les paramètres de lieu, seuls lus par les listes des établissements. */
const lieuDe = (sp: Recherche): ParamsLieu => {
  const un = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return { lieu: un(sp.lieu), departement: un(sp.departement), region: un(sp.region) }
}

export async function generateMetadata(props: { params: Promise<{ type: string }>; searchParams: Promise<Recherche> }) {
  const { type } = await props.params
  if (!estFormationType(type)) return { title: 'Formation introuvable' }
  const sp = await props.searchParams
  const meta = await metadonneesFormations(type, lieuDe(sp))
  if (type === 'formations-privees' && (await getVuesFormationsPrivees()).length > 0) {
    // Des formations sont publiées : la liste canonique s'indexe, ses vues filtrées non.
    const filtree = nombreFiltres(lireFiltres(sp)) > 0
    const lieu = Object.values(lieuDe(sp)).some(Boolean)
    return { ...meta, robots: filtree || lieu ? { index: false, follow: true } : undefined }
  }
  return meta
}

export default async function Page(props: { params: Promise<{ type: string }>; searchParams: Promise<Recherche> }) {
  const { type } = await props.params
  if (!estFormationType(type)) notFound()
  const sp = await props.searchParams
  if (type === 'formations-privees') {
    // Les formations privées ont leur liste dès qu'une est publiée ; avant, l'état d'attente.
    const vues = await getVuesFormationsPrivees()
    if (vues.length > 0) return <PageFormationsPrivees vues={vues} recherche={sp} />
  }
  return <ListeFormations type={type} params={lieuDe(sp)} />
}
