import type { Metadata } from 'next'
import { Globe, Link2, QrCode, ShieldCheck, UserPlus } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { Copier } from '@/components/espace/copier'
import { SITE_URL } from '@/lib/seo/site'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Partager et parrainer', robots: { index: false, follow: false } }
export const instant = false

/**
 * Faire connaître la fiche hors de DentalMap : le lien court, le badge du
 * site du cabinet. Le partage ne change pas la place dans les résultats.
 * Visuel pour les réseaux et parrainage : annoncés, pas encore ouverts.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque } = await chargerTableau('partager', (await props.searchParams).fiche)
  const site = SITE_URL.replace(/\/$/, '')
  const court = `${site}/p/${espace.fiche.slug}/`
  const badge = `<a href="${court}">Vérifié sur DentalMap</a>`
  return (
    <CoqueEspace c={coque} actif="partager" titre="Partager et parrainer" sousTitre="Faire connaître la fiche hors de DentalMap.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Link2} droite={<span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">Le plus efficace</span>}>
            Votre lien court
          </TitreTuile>
          <div className="mt-4">
            <Copier texte={court} affiche={court.replace(/^https?:\/\//, '')} />
          </div>
          <ol className="mt-5 space-y-3 text-sm">
            {['Ouvrez votre fiche d’établissement Google', 'Collez le lien dans « Site web » ou « Lien de prise de rendez-vous »', `Enregistrez : les ${espace.labo ? 'cabinets' : 'patients'} arrivent directement sur votre fiche`].map((e, i) => (
              <li key={e} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-bg-soft text-xs font-semibold text-fg">{i + 1}</span>
                <span className="text-fg">{e}</span>
              </li>
            ))}
          </ol>
        </Tuile>
        <Tuile>
          <TitreTuile i={Globe}>Badge pour le site du cabinet</TitreTuile>
          <div className="squircle-xl mt-4 flex items-center justify-center bg-bg-soft p-6">
            <a href={court} className="squircle-full inline-flex items-center gap-2 border border-line bg-bg px-4 py-2 text-sm font-medium text-fg">
              <ShieldCheck className="size-4 text-teal" aria-hidden /> Vérifié sur DentalMap
            </a>
          </div>
          <div className="mt-3">
            <Copier texte={badge} />
          </div>
          <p className="mt-2 text-xs text-fg-2">Un lien HTML simple, sans script : il compte comme un lien vers votre fiche pour les moteurs.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={QrCode} droite={<span className="rounded-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">Bientôt</span>}>
            Réseaux sociaux
          </TitreTuile>
          <p className="mt-3 text-sm text-fg-2">Un visuel prêt à publier, avec votre lien et un code QR, au format carré ou story.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={UserPlus} droite={<span className="rounded-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">Bientôt</span>}>
            Parrainer un confrère
          </TitreTuile>
          <p className="mt-3 text-sm text-fg-2">Il recevra une invitation à revendiquer sa fiche. Aucun effet sur votre place ni sur la sienne.</p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
