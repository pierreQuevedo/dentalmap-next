import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, ShieldAlert } from 'lucide-react'
import { Coquille } from '@/components/compte/coquille'
import { Encart, Pictogramme, discret, principal, secondaire, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { repondreContestation } from '@/lib/espace-pro/actions-contestation'
import { DELAI_CONTESTATION_JOURS, contestationPourTitulaire } from '@/lib/espace-pro/contestation'
import { dateLongue } from '@/lib/espace-pro/chemins'
import { exigerConnexion } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Un autre compte demande à gérer votre fiche', robots: { index: false, follow: false } }
export const instant = false

/**
 * La réponse du titulaire à une contestation (lien de l'email) : il gère
 * toujours la fiche, ou il la cède. L'équipe tranche dans tous les cas.
 */
export default async function Page(props: { params: Promise<{ id: string }>; searchParams: Promise<{ fait?: string }> }) {
  const { id } = await props.params
  const { fait } = await props.searchParams
  const compte = await exigerConnexion(`/espace-pro/contestation/${id}/`)
  const c = await contestationPourTitulaire(id, compte.id)
  if (!c) notFound()
  const reponse = fait === 'maintient' || fait === 'cede' ? fait : c.reponse
  return (
    <Coquille retour="/espace-pro/" libelleRetour="Mon espace">
      <Pictogramme icone={reponse ? Check : ShieldAlert} ton={reponse ? 'succes' : 'attention'} />
      <h1 className={titre}>{reponse ? 'Merci, votre réponse est transmise' : `Un autre compte demande à gérer « ${c.fiche} »`}</h1>
      {reponse ? (
        <>
          <p className="mt-2 text-sm text-fg-2">
            {reponse === 'maintient'
              ? 'Vous gérez toujours la fiche : l’équipe examine les deux demandes et vous écrit sa décision. D’ici là, rien ne change.'
              : 'Vous cédez la fiche : l’équipe vérifie la preuve de l’autre compte avant de la lui confier.'}
          </p>
          <Link href={chemin('/espace-pro/')} className={`${principal} mt-6`}>
            Retour à mon espace
          </Link>
        </>
      ) : c.statut !== 'en_attente' ? (
        <p className="mt-2 text-sm text-fg-2">Cette demande a déjà été traitée par l’équipe.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-fg-2">
            La demande date du {dateLongue(c.demandeLe)}. Dites-nous sous {DELAI_CONTESTATION_JOURS} jours si vous gérez toujours cette fiche : sans réponse, l’équipe examine la preuve et tranche.
          </p>
          <form action={repondreContestation} className="mt-6 space-y-2.5">
            <input type="hidden" name="id" value={c.id} />
            <button type="submit" name="reponse" value="maintient" className={principal}>
              Je gère toujours cette fiche
            </button>
            <button type="submit" name="reponse" value="cede" className={secondaire}>
              Ce n’est plus moi : je la cède
            </button>
          </form>
          <Encart className="mt-6">Ni l’une ni l’autre réponse ne change la fiche tout de suite : l’équipe vérifie les deux demandes avant de décider.</Encart>
          <Link href={chemin('/contact/?objet=praticien')} className={`${discret} mt-1`}>
            Une question ? Écrire à l’équipe
          </Link>
        </>
      )}
    </Coquille>
  )
}
