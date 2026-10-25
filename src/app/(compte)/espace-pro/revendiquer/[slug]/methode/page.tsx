import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChoixVoies } from '@/components/compte/choix'
import { Etapes, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { pscOuvert } from '@/lib/psc/config'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { CoquilleParcours, dejaEngage, ficheOu404, garde, versFiche, voiesIdentite } from '../../_commun'

export const metadata: Metadata = { title: 'Comment prouver que c’est vous ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * S3b : choisir sa preuve. Le registre ne porte pas d'adresse électronique,
 * d'où cet écran plutôt que le lien par email (S3a).
 *
 * Aucun document n'est demandé (décision du 2026-10-13) : Pro Santé
 * Connect, la carte d'identité par FranceConnect+ (annoncée), ou l'équipe.
 * Avec `objet=retrait`, la même preuve sert au retrait.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ objet?: string }> }) {
  const { slug } = await props.params
  const retrait = (await props.searchParams).objet === 'retrait'
  const compte = await garde(`${REVENDIQUER}/${slug}/methode/${retrait ? '?objet=retrait' : ''}`)
  const fiche = await ficheOu404(slug, compte)
  if (!retrait) {
    const deja = dejaEngage(fiche)
    if (deja) redirect(chemin(deja))
    if (fiche.gereeParUnAutre) redirect(chemin(versFiche(fiche, 'conflit')))
  }
  const psc = pscOuvert() && fiche.rpps !== null

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={retrait ? 'Retrait demandé' : 'Fiche non revendiquée'}
      retour={versFiche(fiche, retrait ? 'retrait' : '')}
      libelleRetour="Retour"
    >
      <Etapes etape={3} libelle="Vérification" />
      <h1 className={titre}>{retrait ? 'Vérifions votre identité' : 'Comment prouver que c’est vous ?'}</h1>
      <p className="mt-2 text-sm text-fg-2">
        {retrait
          ? 'Le retrait n’est appliqué qu’une fois votre identité vérifiée : personne d’autre ne peut retirer votre fiche.'
          : 'Seul le titulaire de la fiche peut la gérer. Choisissez comment prouver votre identité.'}
      </p>
      <div className="mt-6">
        <ChoixVoies defaut={psc ? 'psc' : 'equipe'} voies={voiesIdentite(fiche, { psc, retrait })} />
      </div>
    </CoquilleParcours>
  )
}
