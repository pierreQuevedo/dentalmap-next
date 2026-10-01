import type { Metadata } from 'next'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { nomAffiche } from '@/lib/annuaire/types'
import { exigerEtape, rechercherMaFiche } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Trouvez votre fiche', robots: { index: false, follow: false } }
export const instant = false

/**
 * Étape 5 du tunnel : le professionnel retrouve sa fiche dans l'annuaire.
 *
 * Recherche par nom ou par numéro, résultats limités à sa profession, lien
 * vers l'étape de vérification avec la fiche déjà choisie. Squelette sans
 * mise en page.
 */
export default async function Page(props: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await props.searchParams
  const compte = await exigerEtape('fiche', `/espace-pro/fiche/choisir/${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  const resultats = compte.role && q ? await rechercherMaFiche(compte.role, q) : []

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Trouvez votre fiche</h1>
      <p className="mt-2 text-fg-2">Votre nom, ou votre numéro RPPS ou SIRET.</p>
      <form method="get" className="mt-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Nom, prénom, RPPS ou SIRET" className="w-full rounded-md border border-line px-3 py-2" />
        <button type="submit" className="rounded-full bg-action px-5 py-2.5 font-medium text-action-foreground">Chercher</button>
      </form>

      {q && (
        <p className="mt-6 text-sm text-fg-2" aria-live="polite">
          {resultats.length === 0 ? 'Aucune fiche ne correspond.' : `${resultats.length} ${resultats.length > 1 ? 'fiches' : 'fiche'}`}
        </p>
      )}
      <ol className="mt-3 divide-y divide-line">
        {resultats.map((f) => (
          <li key={f.slug} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-fg">{nomAffiche(f)}</p>
              <p className="text-sm text-fg-2">
                {[f.codePostal, f.communeNom].filter(Boolean).join(' ')}
                {f.dejaGeree && ' · déjà gérée par un compte'}
              </p>
            </div>
            <Link href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(f.slug)}`)} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg">
              C’est moi
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-fg-2">
        Votre fiche n’apparaît pas ?{' '}
        <Link href={chemin('/espace-pro/fiche/creer/')} className="text-fg underline">
          Demandez sa création
        </Link>
        .
      </p>
    </main>
  )
}
