import type { Metadata } from 'next'
import Link from 'next/link'
import { sql } from 'drizzle-orm'
import { ArrowRight, Users } from 'lucide-react'
import { Coquille } from '@/components/compte/coquille'
import { Encart, Marque, Pictogramme, discret, principal, titre } from '@/components/compte/ui'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { accepterInvitation } from '@/lib/espace-pro/actions-equipe'
import { EQUIPE_OUVERTE, hacherJeton } from '@/lib/espace-pro/equipe'
import { exigerConnexion } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Invitation', robots: { index: false, follow: false } }
export const instant = false

/** Rejoindre l'équipe d'une fiche, avec le compte de l'adresse invitée. */
export default async function Page(props: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await props.params
  const compte = await exigerConnexion(`/espace-pro/invitation/${jeton}/`)
  const { rows } = await db.execute<{ email: string; statut: string; expiree: boolean; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null; invite_par: string }>(sql`
    SELECT i.email, i.statut, i.cree_le < now() - interval '30 days' AS expiree, p.profession, p.nom, p.prenom, p.raison_sociale, u.name AS invite_par
    FROM invitations_fiche i JOIN praticiens p ON p.id = i.praticien_id JOIN "user" u ON u.id = i.invite_par
    WHERE i.jeton_hash = ${hacherJeton(jeton)} LIMIT 1
  `)
  const inv = rows[0]
  const fiche = inv ? nomAffiche({ profession: inv.profession, nom: inv.nom, prenom: inv.prenom, raisonSociale: inv.raison_sociale }) : null
  const bonCompte = inv && inv.email.toLowerCase() === compte.email.toLowerCase()
  const valide = EQUIPE_OUVERTE && inv && inv.statut === 'envoyee' && !inv.expiree
  return (
    <Coquille>
      <Marque />
      <Pictogramme icone={Users} />
      {!inv || !valide ? (
        <>
          <h1 className={titre}>Cette invitation n’est plus valable</h1>
          <p className="mt-2 text-sm text-fg-2">
            {EQUIPE_OUVERTE
              ? 'Elle a déjà servi, a été annulée, ou date de plus de trente jours. Demandez une nouvelle invitation à la personne qui gère la fiche.'
              : 'Les invitations à gérer une fiche à plusieurs sont fermées. Pour gérer la fiche d’un laboratoire à la place du gérant, demandez-lui un mandat.'}
          </p>
          <Link href={chemin('/espace-pro/')} className={`${discret} mt-4`}>
            Mon espace
          </Link>
        </>
      ) : (
        <>
          <h1 className={titre}>Rejoindre « {fiche} »</h1>
          <p className="mt-2 text-sm text-fg-2">{inv.invite_par} vous invite à rejoindre l’équipe qui gère cette fiche. Vous pourrez la compléter ; l’identité et les registres restent en lecture seule.</p>
          {bonCompte ? (
            <form action={accepterInvitation} className="mt-6">
              <input type="hidden" name="jeton" value={jeton} />
              <button type="submit" className={principal}>
                Rejoindre l’équipe
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </form>
          ) : (
            <Encart ton="erreur" titre="Mauvais compte" className="mt-6">
              L’invitation est adressée à {inv.email}. Vous êtes connecté avec {compte.email} : déconnectez-vous, puis ouvrez de nouveau le lien.
            </Encart>
          )}
        </>
      )}
    </Coquille>
  )
}
