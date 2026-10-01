import type { Metadata } from 'next'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { getFichesDuCompte } from '@/lib/espace-pro/revendication'
import { exigerEtape } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Demande en cours', robots: { index: false, follow: false } }
export const instant = false

/**
 * Écran d'attente : ce qui est en cours de vérification, et ce que l'on peut
 * déjà faire. Squelette sans mise en page.
 */
export default async function Page() {
  const compte = await exigerEtape('tableau-de-bord', '/espace-pro/attente/')
  const fiches = await getFichesDuCompte(compte.id)
  const enAttente = fiches.filter((f) => f.statut === 'en_attente')

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Nous vérifions votre demande</h1>
      <p className="mt-2 text-fg-2">
        Comptez 48 heures ouvrées. Vous recevrez un email dès qu’elle est traitée. En attendant, vous pouvez déjà préparer votre fiche.
      </p>
      <ul className="mt-6 space-y-3">
        {enAttente.map((f) => (
          <li key={f.slug} className="rounded-xl border border-line p-4">
            <p className="font-medium text-fg">{[f.prenom, f.nom].filter(Boolean).join(' ') || f.raisonSociale}</p>
            <p className="text-sm text-fg-2">Demande du {new Date(f.demandeLe).toLocaleDateString('fr-FR')}, {f.methode === 'pro_sante_connect' ? 'Pro Santé Connect' : 'vérification manuelle'}</p>
            <Link href={chemin(`/espace-pro/onboarding/?fiche=${encodeURIComponent(f.slug)}`)} className="mt-2 inline-block text-sm text-fg underline">
              Préparer ma fiche
            </Link>
          </li>
        ))}
        {compte.etat.demandeCreationEnAttente && (
          <li className="rounded-xl border border-line p-4 text-sm text-fg-2">Votre demande de création de fiche est en cours d’examen.</li>
        )}
      </ul>
      <p className="mt-8 text-sm">
        <Link href={chemin('/espace-pro/')} className="text-fg underline">Retour à l’espace professionnel</Link>
      </p>
    </main>
  )
}
