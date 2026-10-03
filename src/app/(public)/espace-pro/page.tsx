import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { BASE_URL, cheminPraticien } from '@/lib/annuaire/types'
import { getFichesDuCompte } from '@/lib/espace-pro/revendication'
import { estModerateur, getCompte } from '@/lib/tunnel/compte'
import { CHEMIN_ETAPE, etapeDe, libelleRole } from '@/lib/tunnel/etapes'

export const metadata: Metadata = { title: 'Espace professionnel', robots: { index: false, follow: false } }
export const instant = false

/**
 * Étape 8, le tableau de bord, et porte d'entrée du tunnel.
 *
 * Un compte qui n'a pas fini son parcours est renvoyé à son étape ; un
 * patient n'a rien à faire ici et rejoint ses favoris. Squelette sans mise en
 * page : les blocs sont là, l'interface viendra dessus.
 */
export default async function Page() {
  const compte = await getCompte()
  if (!compte) redirect(chemin('/connexion/?retour=%2Fespace-pro%2F'))
  if (compte.role === 'patient') redirect(chemin('/favoris/'))
  const fiches = await getFichesDuCompte(compte.id)
  const etape = etapeDe(compte.etat)
  if (etape === 'onboarding') {
    const aCompleter = fiches.find((f) => f.statut !== 'refusee' && !f.termineLe)
    redirect(chemin(aCompleter ? `/espace-pro/onboarding/?fiche=${encodeURIComponent(aCompleter.slug)}` : '/espace-pro/fiche/choisir/'))
  }
  if (etape !== 'tableau-de-bord') redirect(chemin(CHEMIN_ETAPE[etape]))

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Espace professionnel</h1>
      <p className="mt-2 text-fg-2">
        {compte.nom}, {libelleRole(compte.role).toLowerCase()}
      </p>

      <h2 className="mt-8 text-lg font-semibold text-fg">Vos fiches</h2>
      {fiches.length === 0 ? (
        <p className="mt-2 text-sm text-fg-2">
          Aucune fiche pour le moment.{' '}
          <Link href={chemin('/espace-pro/fiche/choisir/')} className="text-fg underline">Trouver ma fiche</Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {fiches.map((f) => (
            <li key={f.slug} className="rounded-xl border border-line p-4">
              <p className="font-medium text-fg">{[f.prenom, f.nom].filter(Boolean).join(' ') || f.raisonSociale}</p>
              <p className="text-sm text-fg-2">
                {f.statut === 'acceptee' ? 'Gérée par vous' : f.statut === 'en_attente' ? 'Vérification en cours' : 'Demande refusée'}
                {f.termineLe ? ' · fiche complétée' : f.etape > 0 ? ` · parcours en cours, étape ${f.etape}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {f.statut !== 'refusee' && (
                  <Link href={chemin(`/espace-pro/onboarding/?fiche=${encodeURIComponent(f.slug)}`)} className="text-fg underline">
                    {f.termineLe ? 'Modifier ma fiche' : 'Compléter ma fiche'}
                  </Link>
                )}
                {f.communeSlug && f.departementSlug && (
                  <Link href={chemin(cheminPraticien(BASE_URL[f.profession], f.departementSlug, f.communeSlug, f.slug))} className="text-fg underline">
                    Voir la fiche publique
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm">
        <Link href={chemin('/espace-pro/fiche/choisir/')} className="text-fg underline">Revendiquer une autre fiche</Link>
        {' · '}
        <Link href={chemin('/favoris/')} className="text-fg underline">Mes favoris</Link>
        {estModerateur(compte.email) && (
          <>
            {' · '}
            <Link href={chemin('/espace-pro/moderation/')} className="text-fg underline">Modération</Link>
          </>
        )}
      </p>
    </main>
  )
}
