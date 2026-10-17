import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CircleCheck, GraduationCap } from 'lucide-react'
import { CoqueEspace, Statut, TitreTuile, Tuile, type InfosCoque } from '@/components/espace/coque'
import { SaisieFormationPrivee } from '@/components/espace/saisie-formation-privee'
import { Logo } from '@/components/site/logo'
import { chemin } from '@/lib/navigation'
import { getEspace } from '@/lib/espace-pro/espace'
import { getFicheEtablissement, getGestions } from '@/lib/espace-pro/etablissement-donnees'
import { PROPOSER, getPropositions, type StatutProposition } from '@/lib/formation/privee-donnees'
import { exigerConnexion } from '@/lib/tunnel/compte'
import { chargerTableau } from '../../_commun'
import { chargerEtablissement } from '../../etablissement/_commun'

export const metadata: Metadata = { title: 'Proposer une formation', robots: { index: false, follow: false } }
export const instant = false

const STATUT: Record<StatutProposition, { s: 'attente' | 'publiee' | 'incomplete' | 'vide'; libelle: string }> = {
  en_attente: { s: 'attente', libelle: 'En vérification' },
  acceptee: { s: 'attente', libelle: 'Acceptée, bientôt en ligne' },
  publiee: { s: 'publiee', libelle: 'En ligne' },
  refusee: { s: 'incomplete', libelle: 'Refusée' },
}

/**
 * A : proposer une formation privée, depuis « Compte et sécurité ». Tout
 * professionnel connecté peut le faire : dans la coque de son espace s'il a
 * une fiche ou un établissement prêts, dans une coque simple sinon (un
 * organisme de formation continue n'a pas de fiche).
 */
async function coque(): Promise<{ coque: InfosCoque | null; organisme?: string }> {
  const compte = await exigerConnexion(`${PROPOSER}/`)
  if (!compte.role) redirect(chemin(`/inscription/profil/?retour=${encodeURIComponent(`${PROPOSER}/`)}`))
  if (compte.role === 'patient') redirect(chemin('/'))
  if (compte.role === 'organisme') {
    const gestion = (await getGestions(compte.id)).find((g) => g.statut !== 'refusee')
    const fiche = gestion ? await getFicheEtablissement(gestion.slug) : null
    if (gestion && fiche?.donnees.confirmeLe.formations) return { coque: (await chargerEtablissement('compte')).coque, organisme: gestion.titre }
    return { coque: null }
  }
  const espace = await getEspace(compte)
  if (espace?.completee?.termineLe) return { coque: (await chargerTableau('compte')).coque }
  return { coque: null }
}

export default async function Page(props: { searchParams: Promise<{ envoye?: string }> }) {
  const sp = await props.searchParams
  const { coque: c, organisme } = await coque()
  const compte = await exigerConnexion(`${PROPOSER}/`)
  const propositions = await getPropositions(compte.id)
  const retourCompte = c?.etablissement ? '/espace-pro/etablissement/compte/' : c ? '/espace-pro/compte/' : '/'

  const contenu = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        {sp.envoye && (
          <p role="status" className="squircle-xl flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
            <CircleCheck className="size-4 shrink-0" aria-hidden /> Proposition envoyée. L’équipe la vérifie avant toute publication ; un email vient de partir pour le confirmer.
          </p>
        )}
        <SaisieFormationPrivee organismeParDefaut={organisme} />
      </div>
      <aside className="space-y-4">
        <Tuile>
          <TitreTuile i={GraduationCap}>Vos propositions</TitreTuile>
          {propositions.length ? (
            <ul className="mt-3 divide-y divide-line">
              {propositions.map((p) => (
                <li key={p.id} className="py-3">
                  <p className="text-sm font-medium text-fg">{p.intitule}</p>
                  <p className="text-xs text-fg-2">
                    {p.organisme} · le {new Date(p.demandeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Statut s={STATUT[p.statut].s} libelle={STATUT[p.statut].libelle} />
                    {p.statut === 'publiee' && p.wpSlug && (
                      <Link href={chemin(`/formation/formations-privees/${p.wpSlug}/`)} className="text-xs font-medium text-fg underline underline-offset-4">
                        Voir
                      </Link>
                    )}
                  </div>
                  {p.statut === 'refusee' && p.motif && <p className="mt-1 text-xs text-fg-2">Motif : {p.motif}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-2">Aucune proposition pour le moment.</p>
          )}
        </Tuile>
        <Tuile>
          <p className="text-sm text-fg-2">
            Une formation proposée est vérifiée par l’équipe : organisme, sessions, liens. Les mentions DPC, FIF PL et Qualiopi s’affichent « déclarées par l’organisme » tant
            qu’elles ne sont pas vérifiées à leur source.
          </p>
        </Tuile>
      </aside>
    </div>
  )

  if (c) {
    return (
      <CoqueEspace c={c} actif="compte" titre="Proposer une formation" sousTitre="Une formation continue, publiée dans la rubrique des formations privées après vérification">
        <Link href={chemin(retourCompte)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> Compte et sécurité
        </Link>
        {contenu}
      </CoqueEspace>
    )
  }
  return (
    <div className="min-h-dvh bg-bg-soft">
      <header className="flex h-20 items-center justify-between border-b border-line bg-bg px-5 md:px-10">
        <Link href={chemin('/')} aria-label="DentalMap, accueil">
          <Logo />
        </Link>
        <Link href={chemin('/')} className="inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> Retour au site
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Proposer une formation</h1>
        <p className="mb-6 text-sm text-fg-2">Une formation continue, publiée dans la rubrique des formations privées après vérification.</p>
        {contenu}
      </main>
    </div>
  )
}
