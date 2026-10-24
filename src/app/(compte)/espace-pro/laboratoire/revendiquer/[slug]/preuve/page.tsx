import type { Metadata } from 'next'
import { CarteOption, Encart, Etapes, titre } from '@/components/compte/ui'
import { DepotJustificatif } from '@/components/compte/choix'
import { FileText, Send } from 'lucide-react'
import { deposerJustificatif } from '@/lib/espace-pro/actions-revendication'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { CoquilleParcours, ficheOu404, garde } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, lieuxDe, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Vérifions que vous représentez ce laboratoire', robots: { index: false, follow: false } }
export const instant = false

/**
 * L3 : la preuve du gérant. Un extrait Kbis de moins de trois mois, au nom du
 * gérant, même SIREN : examiné sous 48 heures ouvrées. Le code au siège par
 * courrier est annoncé, sans prestataire d'envoi pour l'instant.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ lieux?: string; erreur?: string; contestation?: string }> }) {
  const { slug } = await props.params
  const sp = await props.searchParams
  const compte = await garde(`${LABO}/${slug}/preuve/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  return (
    <CoquilleParcours profession="prothesiste"
      fiche={fiche}
      etiquette="Fiche non revendiquée"
      encart={{ icone: 'document', ton: 'attention', titre: 'Extrait Kbis', texte: 'Examiné par l’équipe sous 48 heures ouvrées.' }}
      retour={fiche.gereeParUnAutre ? versLabo(fiche.slug, 'conflit') : versLabo(fiche.slug, '', lieuxDe(sp.lieux))}
      libelleRetour="Retour"
    >
      <Etapes etape={3} libelle="Vérification" />
      <h1 className={titre}>Vérifions que vous représentez ce laboratoire</h1>
      <p className="mt-2 text-sm text-fg-2">Deux preuves possibles, selon ce que vous avez sous la main.</p>
      <div className="mt-6 grid gap-2.5">
        <CarteOption name="preuve" value="kbis" titre="Extrait Kbis" detail="De moins de 3 mois, à votre nom de gérant." icone={FileText} badge="48 h" defaultChecked />
        <CarteOption name="preuve" value="courrier" titre="Code au siège" detail="Un courrier avec un code à 8 chiffres, à l’adresse Sirene." icone={Send} badge="Bientôt" disabled />
      </div>
      <div className="mt-4">
        <DepotJustificatif
          pdfSeul
          action={deposerJustificatif}
          champsCaches={{ fiche: fiche.slug, objet: 'revendication', role: 'gerant', lieux: lieuxDe(sp.lieux).join(',') }}
          dossier={`justificatifs/${fiche.id}`}
          direct={televersementDirect()}
          erreurInitiale={sp.erreur}
          emplacements={[{ nom: 'document', titre: 'Glissez votre extrait Kbis', detail: 'PDF, 10 Mo au plus', document: 'Extrait Kbis' }]}
          libelle="Envoyer l’extrait Kbis"
          apres={
            <>
              <p className="mt-2 text-xs text-fg-2">
                Pas d’extrait récent ? Le dirigeant l’obtient gratuitement sur{' '}
                <a href="https://www.monidenum.fr/" target="_blank" rel="noreferrer" className="font-medium text-fg underline underline-offset-2">
                  MonIdenum
                </a>
                , ou sur{' '}
                <a href="https://www.infogreffe.fr/" target="_blank" rel="noreferrer" className="font-medium text-fg underline underline-offset-2">
                  Infogreffe
                </a>
                .
              </p>
              <Encart className="mt-3">L’équipe vérifie la date (moins de trois mois), le SIREN et le nom du gérant. Le document n’est vu que par elle, et il est supprimé 30 jours après sa décision.</Encart>
            </>
          }
        />
      </div>
    </CoquilleParcours>
  )
}
