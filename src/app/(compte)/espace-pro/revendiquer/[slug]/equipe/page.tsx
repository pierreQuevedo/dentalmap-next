import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Phone } from 'lucide-react'
import { DepotJustificatif } from '@/components/compte/choix'
import { Encart, Etapes, discret, pastille, saisie, titre } from '@/components/compte/ui'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { demanderEquipe } from '@/lib/espace-pro/actions-revendication'
import { CoquilleParcours, dejaEngage, ficheOu404, garde, nomDe, versFiche } from '../../_commun'

export const metadata: Metadata = { title: 'Demander à l’équipe', robots: { index: false, follow: false } }
export const instant = false

/**
 * S3b et C1, voie « Demander à l'équipe », dans la mise en page de JD1 :
 * sans carte CPS ni e-CPS, un justificatif PDF obligatoire, examiné par
 * l'équipe dans « Demandes à valider » du back-office WordPress.
 * Après l'envoi, le praticien enchaîne sur l'onboarding. La demande crée une revendication en
 * attente : le praticien prépare sa fiche en brouillon pendant ce temps, rien
 * n'est publié avant l'accord. Aucun document n'est demandé.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ objet?: string; erreur?: string }> }) {
  const { slug } = await props.params
  const { objet, erreur } = await props.searchParams
  const retrait = objet === 'retrait'
  const compte = await garde(`${REVENDIQUER}/${slug}/equipe/${retrait ? '?objet=retrait' : ''}`)
  const fiche = await ficheOu404(slug, compte)
  if (!retrait) {
    const deja = dejaEngage(fiche)
    if (deja) redirect(chemin(deja))
  }
  const versMethode = `${versFiche(fiche, fiche.gereeParUnAutre && !retrait ? 'conflit' : 'methode')}${retrait ? '?objet=retrait' : ''}`

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={retrait ? 'Retrait demandé' : 'Vérification en cours'}
      recherche={fiche.rpps ?? nomDe(fiche)}
      encart={{ icone: 'confrere', titre: 'Vérification par l’équipe', texte: 'Une personne de l’équipe vous répond sous 48 heures ouvrées.' }}
      retour={versMethode}
      libelleRetour="Retour"
    >
      <Etapes etape={3} libelle="Vérification" />
      <h1 className={titre}>Demander à l’équipe</h1>
      <p className="mt-2 text-sm text-fg-2">
        {retrait
          ? 'L’équipe vérifie votre identité avec vous avant de retirer la fiche : personne d’autre ne peut la retirer à votre place.'
          : 'Joignez un justificatif en PDF : l’équipe le vérifie, avec vous si besoin, et vous répond sous 48 heures ouvrées.'}
      </p>
      <div className="mt-5">
        <DepotJustificatif
          action={demanderEquipe}
          champsCaches={{ fiche: fiche.slug, objet: retrait ? 'retrait' : 'revendication' }}
          dossier={`justificatifs/${fiche.id}`}
          direct={televersementDirect()}
          erreurInitiale={erreur}
          pdfSeul
          emplacements={[{ nom: 'document', titre: 'Glissez votre justificatif ici', detail: 'ou choisissez-le · PDF uniquement, 10 Mo au plus', document: 'Justificatif' }]}
          libelle={retrait || fiche.gereeParUnAutre ? 'Envoyer la demande' : 'Envoyer et préparer ma fiche'}
          defilant
          avant={
            <>
              {!retrait && !fiche.gereeParUnAutre && (
                <Encart titre="La vérification ne vous bloque pas" className="mb-5">
                  Elle ne vous empêche pas de prendre la main sur votre fiche : après l’envoi, vous continuez directement (horaires, conventionnement, accueil). Tout reste en brouillon et sera publié dès que l’équipe aura validé votre identité.
                </Encart>
              )}
              <p className="mb-1 text-sm font-medium text-fg">
                Votre justificatif <span className="font-normal text-fg-2">(obligatoire)</span>
              </p>
              <p className="mb-2 text-xs text-fg-2">Votre attestation d’inscription à l’Ordre, ou le recto de votre carte CPS. En PDF, votre nom bien lisible.</p>
            </>
          }
          apres={
            <div className="mt-5">
              <label htmlFor="equipe-telephone" className="mb-1.5 block text-sm font-medium text-fg">
                Un téléphone pour vous joindre <span className="font-normal text-fg-2">(facultatif)</span>
              </label>
              <div className={pastille}>
                <Phone className="size-4 shrink-0 text-fg-2" aria-hidden />
                <input id="equipe-telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="05 56 00 00 00" className={saisie} />
              </div>
              <label htmlFor="equipe-message" className="mb-1.5 mt-4 block text-sm font-medium text-fg">
                Un mot pour l’équipe <span className="font-normal text-fg-2">(facultatif)</span>
              </label>
              <textarea
                id="equipe-message"
                name="message"
                rows={3}
                maxLength={1000}
                placeholder="Le meilleur moment pour vous appeler, une précision sur votre exercice…"
                className="squircle-xl w-full resize-y border border-line bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
              />
            </div>
          }
        />
      </div>
      <Link href={chemin(versMethode)} className={`${discret} mt-1`}>
        Choisir une autre preuve
      </Link>
    </CoquilleParcours>
  )
}
