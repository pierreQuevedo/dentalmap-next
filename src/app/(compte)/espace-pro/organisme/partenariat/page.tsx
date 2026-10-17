import type { Metadata } from 'next'
import Link from 'next/link'
import { Landmark, Mail, Send, UserRound } from 'lucide-react'
import { Encart, discret, pastille, principal, saisie, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { proposerPartenariat } from '@/lib/espace-pro/actions-etablissement'
import { ACCROCHE_PARTENARIAT, CoquilleOrganisme, ORGANISME, gardeOrganisme } from '../_commun'

export const metadata: Metadata = { title: 'Devenir partenaire', robots: { index: false, follow: false } }

/**
 * O2b : un ordre, un syndicat ou un éditeur présente son projet. Même
 * circuit que le formulaire de l'accueil : un courriel à l'équipe, aucun
 * compte professionnel ni affichage créé.
 */
type Params = { organisme?: string; fonction?: string; email?: string; projet?: string; erreur?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const compte = await gardeOrganisme(`${ORGANISME}/partenariat/`)
  return (
    <CoquilleOrganisme accroche={ACCROCHE_PARTENARIAT} retour={`${ORGANISME}/`} libelleRetour="Retour">
      <h1 className={titre}>Devenir partenaire</h1>
      <p className="mt-2 text-sm text-fg-2">Ordre, syndicat, éditeur : présentez votre projet, l’équipe vous répond sous une semaine.</p>
      {sp.erreur && (
        <Encart ton="erreur" className="mt-5">
          {sp.erreur}
        </Encart>
      )}
      <form action={proposerPartenariat} className="mt-6 space-y-4">
        {(
          [
            { id: 'organisme', libelle: 'Organisme', i: Landmark, exemple: 'Syndicat des chirurgiens-dentistes de Gironde', auto: 'organization', type: 'text' },
            { id: 'fonction', libelle: 'Votre fonction', i: UserRound, exemple: 'Secrétaire générale', auto: 'organization-title', type: 'text' },
            { id: 'email', libelle: 'Adresse électronique', i: Mail, exemple: 'contact@scd33.fr', auto: 'email', type: 'email' },
          ] as const
        ).map((c) => (
          <div key={c.id}>
            <label htmlFor={`partenariat-${c.id}`} className="mb-1.5 block text-sm font-medium text-fg">
              {c.libelle}
            </label>
            <div className={pastille}>
              <c.i className="size-4 shrink-0 text-fg-2" aria-hidden />
              <input
                id={`partenariat-${c.id}`}
                name={c.id}
                type={c.type}
                required
                minLength={2}
                maxLength={200}
                defaultValue={sp[c.id] ?? (c.id === 'email' ? compte.email : undefined)}
                placeholder={c.exemple}
                autoComplete={c.auto}
                className={saisie}
              />
            </div>
          </div>
        ))}
        <div>
          <label htmlFor="partenariat-projet" className="mb-1.5 block text-sm font-medium text-fg">
            Votre projet
          </label>
          <textarea
            id="partenariat-projet"
            name="projet"
            required
            minLength={10}
            maxLength={4000}
            rows={4}
            defaultValue={sp.projet}
            placeholder="Relayer la vérification des fiches auprès de nos adhérents, et proposer un lien depuis notre site."
            className="squircle-2xl w-full resize-y border border-line bg-bg px-4 py-3 text-sm text-fg shadow-pill outline-none placeholder:text-fg-2 focus:border-line-strong"
          />
        </div>
        <button type="submit" className={`${principal} !mt-5`}>
          <Send className="size-4" aria-hidden />
          Envoyer ma demande
        </button>
      </form>
      <Link href={chemin(`${ORGANISME}/`)} className={`${discret} mt-1`}>
        Retour
      </Link>
    </CoquilleOrganisme>
  )
}
