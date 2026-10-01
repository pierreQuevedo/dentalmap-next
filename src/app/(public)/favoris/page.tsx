import type { Metadata } from 'next'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { cheminPraticien, nomAffiche } from '@/lib/annuaire/types'
import { basculerFavori } from '@/lib/tunnel/actions'
import { exigerConnexion, getFavoris } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Mes favoris', robots: { index: false, follow: false } }
export const instant = false

/** Les fiches mises de côté par le compte. Squelette sans mise en page. */
export default async function Page() {
  const compte = await exigerConnexion('/favoris/')
  const favoris = await getFavoris(compte.id)

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Mes favoris</h1>
      {favoris.length === 0 ? (
        <p className="mt-4 text-fg-2">Aucune fiche mise de côté pour le moment.</p>
      ) : (
        <ol className="mt-6 divide-y divide-line">
          {favoris.map((f) => (
            <li key={f.slug} className="flex items-center justify-between gap-4 py-3">
              <div>
                {f.communeSlug && f.departementSlug ? (
                  <Link href={chemin(cheminPraticien(f.profession === 'dentiste' ? 'dentistes' : 'prothesistes', f.departementSlug, f.communeSlug, f.slug))} className="font-medium text-fg hover:underline">
                    {nomAffiche(f)}
                  </Link>
                ) : (
                  <span className="font-medium text-fg">{nomAffiche(f)}</span>
                )}
                <p className="text-sm text-fg-2">{f.communeNom}</p>
              </div>
              <form action={basculerFavori}>
                <input type="hidden" name="slug" value={f.slug} />
                <input type="hidden" name="retour" value="/favoris/" />
                <button type="submit" className="rounded-full border border-line px-3 py-1.5 text-sm text-fg">Retirer</button>
              </form>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
