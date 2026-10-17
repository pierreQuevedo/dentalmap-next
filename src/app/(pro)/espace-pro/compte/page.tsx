import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { CreditCard, Fingerprint, GraduationCap, KeyRound, Mail, Smartphone } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { Appareils, ClesAcces, MotDePasse } from '@/components/espace/compte-securite'
import { auth } from '@/lib/auth'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Compte et sécurité', robots: { index: false, follow: false } }
export const instant = false

/** Compte et sécurité : adresse, mot de passe, preuve d'identité, appareils connectés. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque, compte } = await chargerTableau('compte', (await props.searchParams).fiche)
  const session = await auth.api.getSession({ headers: await headers() })
  const d = espace.fiche.demande
  const preuve =
    d?.statut === 'acceptee'
      ? d.methode === 'pro_sante_connect'
        ? `Pro Santé Connect, le ${new Date(d.traiteLe ?? d.demandeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : 'Justificatif vérifié par l’équipe'
      : 'Vérification en cours'
  return (
    <CoqueEspace c={coque} actif="compte" titre="Compte et sécurité" sousTitre="Votre connexion à l’espace pro">
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Mail}>Adresse électronique</TitreTuile>
          <p className="mt-4 text-sm text-fg">{compte.email}</p>
          <p className="mt-1 text-xs text-fg-2">Pour en changer, écrivez-nous depuis cette adresse : le changement passe par une vérification.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={CreditCard}>Preuve d’identité</TitreTuile>
          <p className="mt-4 text-sm text-fg">{preuve}</p>
          <p className="mt-1 text-xs text-fg-2">Elle rattache la fiche à votre compte. Elle n’apparaît pas sur la fiche publique.</p>
        </Tuile>
        <Tuile>
          <TitreTuile i={KeyRound}>Mot de passe</TitreTuile>
          <MotDePasse />
        </Tuile>
        <Tuile>
          <TitreTuile i={Fingerprint}>Clés d’accès</TitreTuile>
          <ClesAcces />
        </Tuile>
        <Tuile>
          <TitreTuile i={Smartphone}>Appareils connectés</TitreTuile>
          <Appareils jetonCourant={session?.session.token ?? null} />
        </Tuile>
        <Tuile>
          <TitreTuile i={GraduationCap}>Proposer une formation</TitreTuile>
          <p className="mt-4 text-sm text-fg-2">Vous organisez une formation continue ? Proposez-la : l’équipe la vérifie avant de la publier dans la rubrique des formations privées.</p>
          <Link href={chemin('/espace-pro/compte/formation/')} className="mt-3 inline-flex text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
            Proposer une formation
          </Link>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
