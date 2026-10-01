import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { chemin } from '@/lib/navigation'
import { BASE_URL } from '@/lib/annuaire/types'
import { NB_ETAPES } from '@/lib/espace-pro/fiche-completee'
import { getFichesDuCompte, type FicheDuCompte } from '@/lib/espace-pro/revendication'

export const metadata: Metadata = {
  title: 'Ma fiche',
  description: 'Compléter les informations que vous seul pouvez fournir.',
  robots: { index: false, follow: true },
}

export const instant = false

/**
 * Les fiches du compte connecté, avec l'état de chacune.
 *
 * Une fiche attribuée mène au parcours d'accueil, qu'il soit à commencer, à
 * reprendre ou à modifier. Une demande manuelle en attente le dit. Sans aucune
 * fiche, la page renvoie vers la recherche : c'est sur sa fiche que l'on se
 * reconnaît.
 */
export default async function Page(props: { searchParams: Promise<{ enregistre?: string }> }) {
  const sp = await props.searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(chemin('/connexion/?retour=%2Fespace-pro%2Ffiche%2F'))

  const fiches = await getFichesDuCompte(session.user.id)

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Ma fiche</h1>
      <p className="mt-3 text-fg-2">
        Ce que vous complétez ici s’affiche sur votre fiche publique, à part des données du registre, qui restent
        celles de l’Annuaire Santé.
      </p>

      {sp.enregistre === '1' && (
        <p className="squircle-lg mt-8 border border-line bg-bg-soft p-4 text-sm text-fg">
          Vos informations sont enregistrées et déjà visibles sur votre fiche publique.
        </p>
      )}

      {fiches.length === 0 ? (
        <section className="mt-8 border-t border-line pt-8">
          <h2 className="text-lg font-semibold text-fg">Aucune fiche revendiquée</h2>
          <p className="mt-2 text-fg-2">
            Cherchez-vous dans l’annuaire, puis cliquez sur « Revendiquer cette fiche » depuis votre page.
          </p>
          <Link
            href={chemin('/recherche/')}
            className="squircle-full mt-4 inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
          >
            Chercher ma fiche
          </Link>
        </section>
      ) : (
        <ul className="mt-8 grid gap-4">
          {fiches.map((f) => (
            <li key={f.slug}>
              <CarteFiche fiche={f} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function CarteFiche({ fiche: f }: { fiche: FicheDuCompte }) {
  const nom =
    f.profession === 'prothesiste' ? (f.raisonSociale ?? f.nom) : `Dr ${[f.prenom, f.nom].filter(Boolean).join(' ')}`
  const cheminPublic =
    f.departementSlug && f.communeSlug ? `/${BASE_URL[f.profession]}/${f.departementSlug}/${f.communeSlug}/${f.slug}/` : null

  const etat =
    f.statut === 'acceptee'
      ? f.termineLe
        ? 'Fiche complétée'
        : f.etape > 0
          ? `Parcours en cours, étape ${Math.min(f.etape + 1, NB_ETAPES)} sur ${NB_ETAPES}`
          : 'Fiche attribuée, à compléter'
      : f.statut === 'en_attente'
        ? 'Demande en cours d’examen'
        : 'Demande non validée'

  return (
    <div className="squircle-xl border border-line p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-fg">{nom}</p>
          {f.communeNom && <p className="mt-0.5 text-sm text-fg-2">{f.communeNom}</p>}
        </div>
        <span className="squircle-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-fg ring-1 ring-inset ring-line">
          {etat}
        </span>
      </div>

      <p className="mt-3 text-xs text-fg-2">
        {f.statut === 'acceptee'
          ? f.methode === 'pro_sante_connect'
            ? 'Identité vérifiée par Pro Santé Connect.'
            : 'Identité vérifiée par DentalMap.'
          : `Demande déposée le ${new Date(f.demandeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {f.statut === 'acceptee' && (
          <Link
            href={chemin(`/espace-pro/onboarding/?fiche=${encodeURIComponent(f.slug)}`)}
            className="squircle-full inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
          >
            {f.termineLe ? 'Modifier mes informations' : f.etape > 0 ? 'Reprendre' : 'Compléter ma fiche'}
          </Link>
        )}
        {cheminPublic && (
          <Link href={chemin(cheminPublic)} className="text-sm text-fg underline hover:no-underline">
            Voir la fiche publique
          </Link>
        )}
      </div>
    </div>
  )
}
