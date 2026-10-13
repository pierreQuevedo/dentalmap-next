import { PageLegaleVue, metadonneesLegales } from '@/components/vitrine/legal/page-legale'
import { pageLegale } from '@/components/vitrine/legal/contenu'

const page = pageLegale('mentions-legales')

export const metadata = metadonneesLegales(page)

export default function Page() {
  return <PageLegaleVue page={page} />
}
