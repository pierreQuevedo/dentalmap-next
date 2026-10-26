import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { CoqueEspace } from '@/components/espace/coque'
import { PanneauMission } from '@/components/espace/mission'
import { SaisiePhoto } from '@/components/espace/saisie-photo'
import { ApercuPublic } from '@/components/espace/tuiles'
import { enregistrerPhoto } from '@/lib/espace-pro/actions-fiche'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Photo de profil', robots: { index: false, follow: false } }
export const instant = false

/** MIS-1 : la photo de profil, la mission recommandée. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('missions', sp.fiche, 'photo')
  const gardee = await lireSaisie('/espace-pro/missions/photo/', sp.erreur)
  const photoGardee = gardee.texte('photo')
  return (
    <CoqueEspace c={coque} actif="progression" titre="Photo de profil" sousTitre="+8 pts · 2 min" parent={{ libelle: 'Progression', href: `/espace-pro/progression/${q}` }}>
      <PanneauMission
        cle="photo"
        titre="Photo de profil"
        meta="Mission recommandée · +8 pts · 2 min"
        intro="Une photo de vous, de face, au format portrait. Elle s’affiche sur la fiche, dans les résultats et dans Google."
        action={enregistrerPhoto}
        fiche={espace.fiche.slug}
        avant={espace.force.total}
        q={q}
        erreur={sp.erreur}
        cote={<ApercuPublic praticien={espace.fiche.resume} profession={espace.fiche.profession} photo={espace.completee?.photoUrl} enDirect />}
      >
        <SaisiePhoto
          initiale={photoGardee || espace.completee?.photoUrl || null}
          droits={photoGardee !== undefined ? gardee.texte('droits') === 'on' : !!espace.completee?.photoUrl}
          direct={!!process.env.BLOB_READ_WRITE_TOKEN}
        />
      </PanneauMission>
    </CoqueEspace>
  )
}
