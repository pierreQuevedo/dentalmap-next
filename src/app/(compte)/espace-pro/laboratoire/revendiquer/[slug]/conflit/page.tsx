import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { AutreCompte } from '@/components/compte/autre-compte'
import { ChoixVoies } from '@/components/compte/choix'
import { Etapes, FicheResume, Pictogramme, cadre, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { sirenDe } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, adresseDe, dejaEngage, ficheOu404, garde, nomDe } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, libelleSiren, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Ce laboratoire est déjà géré', robots: { index: false, follow: false } }
export const instant = false

/**
 * LC1 : le laboratoire est déjà géré par un autre compte. Un Kbis ouvre une
 * contestation (sept jours pour répondre). Pas de demande d'invitation : comme
 * pour LINFO, aucun lien avec l'espace du laboratoire. Le titulaire n'est jamais nommé.
 */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${LABO}/${slug}/conflit/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  const deja = dejaEngage(fiche)
  if (deja) redirect(chemin(deja))
  // Comme C1 côté dentiste : sans titulaire, il n'y a pas de conflit, on revient au rôle.
  if (!fiche.gereeParUnAutre) redirect(chemin(versLabo(fiche.slug)))
  const siren = await sirenDe(fiche.id)
  return (
    <CoquilleParcours profession="prothesiste" fiche={fiche} etiquette="Gérée par un autre compte" retour={`${LABO}/`} libelleRetour="Retour">
      <Etapes etape={3} libelle="Vérification" />
      <Pictogramme icone={ShieldCheck} ton="attention" />
      <h1 className={titre}>Ce laboratoire est déjà géré par un autre compte</h1>
      <p className="mt-2 text-sm text-fg-2">Si vous le représentez, envoyez un extrait Kbis : le compte actuel aura 7 jours pour répondre.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession="Laboratoire de prothèse" nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={libelleSiren(siren)} libelleIdentifiant="SIREN" verifiee />
      </div>
      <div className="mt-2.5">
        <ChoixVoies
          voies={[{ valeur: 'kbis', titre: 'Extrait Kbis', detail: 'De moins de 3 mois, à votre nom de gérant.', icone: 'document', badge: '48 h', bouton: 'Envoyer un extrait Kbis', href: versLabo(fiche.slug, 'preuve') }]}
        />
      </div>
      <div className="mt-5 space-y-2 text-sm text-fg-2">
        <p>
          C’est vous qui le gérez, avec une autre adresse ? <AutreCompte retour="/espace-pro/">Connectez-vous avec cet autre compte</AutreCompte>.
        </p>
        <p>
          Vous y travaillez sans le représenter ?{' '}
          <Link href={chemin(versLabo(fiche.slug, 'salarie'))} className="font-semibold text-fg underline underline-offset-2 hover:no-underline">
            Créez votre profil de prothésiste
          </Link>
          .
        </p>
      </div>
    </CoquilleParcours>
  )
}
