import type { Metadata } from 'next'
import { Mail, ShieldCheck, UserPlus, X } from 'lucide-react'
import { Encart, pastille, principal, saisie } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { annulerInvitation, inviter, retirerMembre } from '@/lib/espace-pro/actions-equipe'
import { getEquipe } from '@/lib/espace-pro/equipe'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Équipe', robots: { index: false, follow: false } }
export const instant = false

/** U-COL : les personnes qui gèrent la fiche, les invitations en cours, et l'invitation d'une nouvelle adresse. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; invitee?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, compte, q } = await chargerTableau('equipe', sp.fiche)
  const { membres, invitations } = await getEquipe(espace.fiche.id)
  const moi = membres.find((m) => m.userId === compte.id)
  const peutGerer = !!moi?.titulaire
  const caches = (
    <>
      <input type="hidden" name="fiche" value={espace.fiche.slug} />
      <input type="hidden" name="q" value={q} />
    </>
  )
  return (
    <CoqueEspace c={coque} actif="equipe" titre="Équipe" sousTitre="Les personnes qui gèrent la fiche, et ce que chacune peut faire">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile className="p-0">
            {membres.map((m) => (
              <div key={m.revendicationId} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                <span className="grid size-10 place-items-center rounded-full bg-bg-soft text-sm font-semibold text-fg">
                  {(m.nom || m.email)
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((x) => x[0]?.toUpperCase())
                    .join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg">
                    {m.nom || m.email}
                    {m.userId === compte.id && <span className="ml-2 text-xs font-normal text-fg-2">vous</span>}
                  </p>
                  <p className="truncate text-sm text-fg-2">{m.email}</p>
                </div>
                <span className="squircle-full bg-bg px-2.5 py-0.5 text-xs font-medium text-fg ring-1 ring-inset ring-line">{m.fonction}</span>
                {peutGerer && !m.titulaire && (
                  <form action={retirerMembre}>
                    {caches}
                    <input type="hidden" name="membre" value={m.revendicationId} />
                    <button type="submit" className="cursor-pointer text-sm text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                      Retirer
                    </button>
                  </form>
                )}
              </div>
            ))}
            {invitations.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                <span className="grid size-10 place-items-center rounded-full border border-dashed border-line text-fg-2">
                  <Mail className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg">{i.email}</p>
                  <p className="text-sm text-fg-2">{i.fonction ?? 'Invitation envoyée'}</p>
                </div>
                <span className="squircle-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30">Invitation envoyée</span>
                {peutGerer && (
                  <form action={annulerInvitation}>
                    {caches}
                    <input type="hidden" name="invitation" value={i.id} />
                    <button type="submit" aria-label={`Annuler l’invitation de ${i.email}`} className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
                      <X className="size-4" aria-hidden />
                    </button>
                  </form>
                )}
              </div>
            ))}
          </Tuile>
          {peutGerer && (
            <Tuile>
              <TitreTuile i={UserPlus}>Inviter quelqu’un</TitreTuile>
              {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
              {sp.invitee && <Encart className="mt-4">Invitation envoyée. Le lien vaut trente jours.</Encart>}
              <form action={inviter} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
                {caches}
                <div className={pastille}>
                  <Mail className="size-4 shrink-0 text-fg-2" aria-hidden />
                  <input name="email" type="email" required placeholder="prenom@laboratoire.fr" aria-label="Adresse à inviter" className={saisie} />
                </div>
                <div className={pastille}>
                  <input name="fonction" placeholder="Fonction (facultatif)" aria-label="Fonction" maxLength={60} className={saisie} />
                </div>
                <button type="submit" className={`${principal} w-auto px-5`}>
                  Inviter
                </button>
              </form>
            </Tuile>
          )}
        </div>
        <Tuile>
          <TitreTuile i={ShieldCheck}>Qui peut quoi</TitreTuile>
          <ul className="mt-4 space-y-3 text-sm text-fg-2">
            <li>Les titulaires, vérifiés par Kbis ou par Pro Santé Connect, invitent et retirent.</li>
            <li>Les invités complètent la fiche : délais, savoir-faire, réalisations, présentation.</li>
            <li>L’identité et les registres ne se modifient par personne ici.</li>
          </ul>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
