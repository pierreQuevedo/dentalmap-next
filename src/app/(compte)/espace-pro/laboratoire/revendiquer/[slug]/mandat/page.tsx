import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Mail } from 'lucide-react'
import { DepotJustificatif } from '@/components/compte/choix'
import { Etapes, pastille, saisie, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { deposerJustificatif } from '@/lib/espace-pro/actions-revendication'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { CoquilleParcours, ficheOu404, garde } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, lieuxDe, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Vous agissez pour le gérant', robots: { index: false, follow: false } }
export const instant = false

/** MAN : le salarié mandaté joint le Kbis et le mandat signé ; le gérant est prévenu par courriel. */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ lieux?: string; erreur?: string }> }) {
  const { slug } = await props.params
  const sp = await props.searchParams
  const compte = await garde(`${LABO}/${slug}/mandat/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  return (
    <CoquilleParcours profession="prothesiste"
      fiche={fiche}
      etiquette="Fiche non revendiquée"
      encart={{ icone: 'document', ton: 'attention', titre: 'Kbis et mandat', texte: 'Le gérant sera prévenu par email.' }}
      retour={versLabo(fiche.slug, '', lieuxDe(sp.lieux))}
      libelleRetour="Retour"
    >
      <Etapes etape={3} libelle="Vérification" />
      <h1 className={titre}>Vous agissez pour le gérant</h1>
      <p className="mt-2 text-sm text-fg-2">Joignez l’extrait Kbis et un mandat signé. Le gérant est prévenu par email.</p>
      <div className="mt-6">
        <DepotJustificatif
          pdfSeul
          action={deposerJustificatif}
          champsCaches={{ fiche: fiche.slug, objet: 'revendication', role: 'mandate', lieux: lieuxDe(sp.lieux).join(',') }}
          dossier={`justificatifs/${fiche.id}`}
          direct={televersementDirect()}
          erreurInitiale={sp.erreur}
          emplacements={[
            { nom: 'document', titre: 'Extrait Kbis de moins de 3 mois', detail: 'PDF, 10 Mo au plus' },
            { nom: 'mandat', titre: 'Mandat signé par le gérant', detail: 'PDF, 10 Mo au plus' },
          ]}
          libelle="Envoyer Kbis et mandat"
          apres={
            <div className="mt-2">
              {/* Le modèle, juste sous la zone du mandat : le gérant le signe, la personne le dépose. */}
              <Link href={chemin('/espace-pro/laboratoire/modele-mandat/')} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-medium text-fg underline underline-offset-2">
                <Download className="size-3.5" aria-hidden /> Télécharger le modèle de mandat
              </Link>
              <div className="mt-4">
              <label htmlFor="mandat-gerant" className="mb-1.5 block text-sm font-medium text-fg">
                Adresse du gérant
              </label>
              <div className={pastille}>
                <Mail className="size-4 shrink-0 text-fg-2" aria-hidden />
                <input id="mandat-gerant" name="gerantEmail" type="email" required autoComplete="off" placeholder="gerant@laboratoire.fr" className={saisie} />
              </div>
              </div>
            </div>
          }
        />
      </div>
    </CoquilleParcours>
  )
}
