import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, FlaskConical } from 'lucide-react'
import { DepotJustificatif } from '@/components/compte/choix'
import { Encart, Etapes, Pictogramme, discret, pastille, saisie, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { demanderAjoutLabo } from '@/lib/espace-pro/actions-revendication'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { CoquilleParcours, garde } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Votre laboratoire n’est pas listé', robots: { index: false, follow: false } }
export const instant = false

/**
 * LA1 : faire entrer un laboratoire absent de l'annuaire. Le SIRET est
 * contrôlé dans Sirene (établissement actif, activité) ; aucune fiche n'est
 * créée sans examen.
 */
export default async function Page(props: { searchParams: Promise<{ siret?: string; erreur?: string; envoyee?: string }> }) {
  const sp = await props.searchParams
  const compte = await garde('/espace-pro/laboratoire/ajout/', 'prothesiste')
  return (
    <CoquilleParcours profession="prothesiste" recherche={sp.siret ?? ''} encart={{ icone: 'sablier', ton: 'attention', titre: 'Absent de l’annuaire', texte: 'Contrôle Sirene avant toute création.' }} retour={`${LABO}/`} libelleRetour="Retour">
      <Etapes etape={1} libelle="Laboratoire" />
      <Pictogramme icone={FlaskConical} />
      <h1 className={titre}>Votre laboratoire n’est pas listé</h1>
      {sp.envoyee ? (
        <>
          <p className="mt-2 text-sm text-fg-2">Votre demande est enregistrée.</p>
          <Encart titre="Ce qui se passe maintenant" className="mt-6">
            L’équipe vérifie l’établissement dans Sirene et votre Kbis, puis crée la fiche. Vous recevez un email : vous pourrez alors la revendiquer.
          </Encart>
          <Link href={chemin('/')} className={`${discret} mt-1`}>
            Retour à l’accueil
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-fg-2">Décrivez-le : nous vérifions l’activité dans Sirene avant d’ajouter la fiche.</p>
          <div className="mt-6">
            <DepotJustificatif
              pdfSeul
              action={demanderAjoutLabo}
              champsCaches={{}}
              dossier={`justificatifs/ajout-${compte.id}`}
              direct={televersementDirect()}
              erreurInitiale={sp.erreur}
              emplacements={[{ nom: 'document', titre: 'Extrait Kbis de moins de 3 mois', detail: 'PDF, 10 Mo au plus' }]}
              libelle="Envoyer la demande"
              avant={
                <div className="mb-4 space-y-4">
                  <div>
                    <label htmlFor="ajout-siret" className="mb-1.5 block text-sm font-medium text-fg">
                      SIRET
                    </label>
                    <div className={pastille}>
                      <Building2 className="size-4 shrink-0 text-fg-2" aria-hidden />
                      <input id="ajout-siret" name="siret" required inputMode="numeric" defaultValue={sp.siret ?? ''} placeholder="912 004 118 00015" className={`${saisie} font-mono`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ajout-raison" className="mb-1.5 block text-sm font-medium text-fg">
                      Raison sociale
                    </label>
                    <div className={pastille}>
                      <FlaskConical className="size-4 shrink-0 text-fg-2" aria-hidden />
                      <input id="ajout-raison" name="raison" required minLength={2} placeholder="Atelier Prothèse Garonne" className={saisie} />
                    </div>
                  </div>
                </div>
              }
              apres={null}
            />
          </div>
          <Link href={chemin(`${LABO}/`)} className={`${discret} mt-1`}>
            Retour
          </Link>
        </>
      )}
    </CoquilleParcours>
  )
}
