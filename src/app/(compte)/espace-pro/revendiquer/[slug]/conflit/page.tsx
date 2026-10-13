import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { ChoixVoies } from '@/components/compte/choix'
import { Etapes, FicheResume, Pictogramme, cadre, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { pscConfigure } from '@/lib/psc/config'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { CoquilleParcours, adresseDe, dejaEngage, ficheOu404, garde, libelleProfession, nomDe, versFiche, voiesIdentite } from '../../_commun'

export const metadata: Metadata = { title: 'Cette fiche est déjà gérée', robots: { index: false, follow: false } }
export const instant = false

/**
 * C1 : la fiche est déjà gérée par un autre compte.
 *
 * Seules les preuves fortes sont acceptées : Pro Santé Connect, la carte
 * d'identité par FranceConnect+ (annoncée), ou l'équipe. Le compte actuel a sept jours pour
 * répondre ; il n'est jamais nommé.
 */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${REVENDIQUER}/${slug}/conflit/`)
  const fiche = await ficheOu404(slug, compte)
  const deja = dejaEngage(fiche)
  if (deja) redirect(chemin(deja))
  if (!fiche.gereeParUnAutre) redirect(chemin(versFiche(fiche, 'methode')))
  const psc = pscConfigure() && fiche.rpps !== null

  return (
    <CoquilleParcours fiche={fiche} etiquette="Gérée par un autre compte" retour={versFiche(fiche)} libelleRetour="Retour">
      <Etapes etape={3} libelle="Vérification" />
      <Pictogramme icone={ShieldCheck} ton="attention" />
      <h1 className={titre}>Cette fiche est déjà gérée par un autre compte</h1>
      <p className="mt-2 text-sm text-fg-2">Si c’est la vôtre, prouvez-le : le compte actuel aura 7 jours pour répondre avant que la fiche vous soit transférée.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession={libelleProfession(fiche)} nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={fiche.rpps} verifiee />
      </div>
      <div className="mt-2.5">
        <ChoixVoies defaut={psc ? 'psc' : 'equipe'} voies={voiesIdentite(fiche, { psc, boutonPsc: 'Prouver avec Pro Santé Connect', detailPsc: 'La preuve la plus forte, immédiate.' })} />
      </div>
    </CoquilleParcours>
  )
}
