import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mail } from 'lucide-react'
import { DepotJustificatif } from '@/components/compte/choix'
import { Etapes, Pictogramme, secondaire, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { deposerAttestation } from '@/lib/espace-pro/actions-etablissement'
import { domaineAttendu } from '@/lib/espace-pro/etablissement'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { CoquilleOrganisme, ORGANISME, etablissementOu404, gardeOrganisme } from '../../_commun'

export const metadata: Metadata = { title: 'Attestation de fonction', robots: { index: false, follow: false } }

/**
 * OAT : l'adresse du compte n'est pas sur le domaine de l'établissement. Une
 * attestation de fonction signée, de moins de trois mois, en PDF, part en
 * stockage privé et attend la décision de l'équipe. Le domaine attendu est
 * affiché, pour que la personne sache quelle adresse marcherait.
 */
type Params = { fiche?: string; erreur?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const ici = `${ORGANISME}/etablissement/attestation/?fiche=${encodeURIComponent(sp.fiche ?? '')}`
  const compte = await gardeOrganisme(ici)
  const { source, gestion } = await etablissementOu404(sp.fiche, compte)
  if (gestion) redirect(chemin(`${ORGANISME}/formations/?fiche=${encodeURIComponent(source.slug)}`))
  const domaine = domaineAttendu(source.domaines)
  const autreAdresse = `/connexion/?retour=${encodeURIComponent(`${ORGANISME}/etablissement/?q=${encodeURIComponent(source.titre)}`)}`

  return (
    <CoquilleOrganisme
      source={source}
      etiquette="Vérification en cours"
      encart={{ icone: 'courrier', ton: 'attention', titre: domaine ? `Domaine attendu : ${domaine}` : 'Adresse de l’établissement', texte: 'Ou une attestation de fonction signée.' }}
      retour={`${ORGANISME}/etablissement/`}
      libelleRetour="Retour au site"
    >
      <Etapes etape={2} total={3} libelle="Vérification" />
      <Pictogramme icone={Mail} ton="attention" />
      <h1 className={titre}>Votre email n’est pas sur le domaine de l’établissement</h1>
      <p className="mt-2 text-sm text-fg-2">
        <span className="font-medium text-fg">{compte.email}</span> ne correspond pas
        {domaine ? (
          <>
            {' '}
            à <span className="font-medium text-fg">{domaine}</span>
          </>
        ) : (
          ' à une adresse publiée par l’établissement'
        )}
        . Joignez une attestation de fonction, ou utilisez une adresse de l’établissement.
      </p>
      <div className="mt-6">
        <DepotJustificatif
          action={deposerAttestation}
          champsCaches={{ fiche: source.slug }}
          dossier={`justificatifs/${`etablissement-${source.slug}`.slice(0, 120)}`}
          direct={televersementDirect()}
          erreurInitiale={sp.erreur}
          emplacements={[{ nom: 'document', titre: 'Attestation de fonction signée', detail: 'PDF de moins de 3 mois, 10 Mo au plus' }]}
          libelle="Envoyer l’attestation"
          apres={null}
        />
      </div>
      <Link href={chemin(autreAdresse)} className={`${secondaire} mt-3`}>
        Utiliser une adresse de l’établissement
      </Link>
    </CoquilleOrganisme>
  )
}
