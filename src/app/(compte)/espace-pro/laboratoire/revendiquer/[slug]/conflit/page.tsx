import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { ChoixVoies } from '@/components/compte/choix'
import { Encart, Etapes, FicheResume, Pictogramme, cadre, discret, titre } from '@/components/compte/ui'
import { demanderInvitation } from '@/lib/espace-pro/actions-revendication'
import { sirenDe } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, adresseDe, ficheOu404, garde, nomDe } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, libelleSiren, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Ce laboratoire est déjà géré', robots: { index: false, follow: false } }
export const instant = false

/**
 * LC1 : le laboratoire est déjà géré par un autre compte. Un Kbis ouvre une
 * contestation (sept jours pour répondre) ; sinon, on demande au titulaire
 * de vous inviter dans son équipe. Il n'est jamais nommé.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ invitation?: string }> }) {
  const { slug } = await props.params
  const { invitation } = await props.searchParams
  const compte = await garde(`${LABO}/${slug}/conflit/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  const siren = await sirenDe(fiche.id)
  return (
    <CoquilleParcours fiche={fiche} etiquette="Gérée par un autre compte" retour={`${LABO}/`} libelleRetour="Retour">
      <Etapes etape={3} libelle="Vérification" />
      <Pictogramme icone={ShieldCheck} ton="attention" />
      <h1 className={titre}>Ce laboratoire est déjà géré par un autre compte</h1>
      <p className="mt-2 text-sm text-fg-2">Si vous le représentez, envoyez un extrait Kbis : le compte actuel aura 7 jours pour répondre. Sinon, demandez-lui une invitation.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession="Laboratoire de prothèse" nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={libelleSiren(siren)} libelleIdentifiant="SIREN" verifiee />
      </div>
      {invitation ? (
        <Encart titre="Demande transmise" className="mt-4">
          Le titulaire a reçu votre demande par email. S’il vous invite, vous recevrez un lien pour rejoindre la fiche.
        </Encart>
      ) : (
        <>
          <div className="mt-2.5">
            <ChoixVoies
              voies={[{ valeur: 'kbis', titre: 'Extrait Kbis', detail: 'De moins de 3 mois, à votre nom de gérant.', icone: 'document', badge: '48 h', bouton: 'Envoyer un extrait Kbis', href: versLabo(fiche.slug, 'preuve') }]}
            />
          </div>
          <form action={demanderInvitation}>
            <input type="hidden" name="fiche" value={fiche.slug} />
            <button type="submit" className={`${discret} mt-1`}>
              Demander une invitation
            </button>
          </form>
        </>
      )}
    </CoquilleParcours>
  )
}
