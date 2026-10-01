import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { chemin } from '@/lib/navigation'
import { BASE_URL } from '@/lib/annuaire/types'
import { detientLaFiche, getFicheCompleteeParPraticien, getFicheParSlug } from '@/lib/espace-pro/revendication'
import { Onboarding } from '@/components/espace-pro/onboarding'

export const metadata: Metadata = {
  title: 'Compléter ma fiche',
  robots: { index: false, follow: false },
}

export const instant = false

type Params = { fiche?: string; bienvenue?: string }

/**
 * Parcours d'accueil après revendication.
 *
 * Quatre étapes courtes, dans l'ordre où un patient en a besoin : horaires,
 * langues, accessibilité, paiement. Le praticien peut s'arrêter à tout moment
 * et revenir : chaque étape est enregistrée dès qu'elle est validée.
 *
 * La page revérifie la revendication : un lien copié ne donne rien à qui ne
 * détient pas la fiche.
 */
export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const slug = sp.fiche ?? ''
  const retour = `/espace-pro/onboarding/?fiche=${encodeURIComponent(slug)}`

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  if (!slug) redirect(chemin('/espace-pro/fiche/'))

  const fiche = await getFicheParSlug(slug)
  if (!fiche) redirect(chemin('/espace-pro/fiche/'))
  if (!(await detientLaFiche(session.user.id, fiche.id))) {
    redirect(chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(slug)}`))
  }

  const existante = await getFicheCompleteeParPraticien(fiche.id)
  const nom =
    fiche.profession === 'prothesiste'
      ? (fiche.raisonSociale ?? fiche.nom)
      : `Dr ${[fiche.prenom, fiche.nom].filter(Boolean).join(' ')}`
  const cheminPublic =
    fiche.departementSlug && fiche.communeSlug
      ? `/${BASE_URL[fiche.profession]}/${fiche.departementSlug}/${fiche.communeSlug}/${fiche.slug}/`
      : null

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Onboarding
        slug={fiche.slug}
        nom={nom}
        commune={fiche.communeNom}
        cheminPublic={cheminPublic}
        existante={existante}
        bienvenue={sp.bienvenue === '1'}
      />
    </main>
  )
}
