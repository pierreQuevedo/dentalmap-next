import type { Metadata } from 'next'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { FormulaireConnexion } from '@/components/site/formulaire-connexion'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à DentalMap pour accéder aux coordonnées des professionnels et revendiquer votre fiche.',
  robots: { index: false, follow: true },
}

export const instant = false

/**
 * Seuls les chemins internes sont acceptés comme retour.
 *
 * Un paramètre de redirection non filtré est un tremplin classique vers un
 * autre site : on n'accepte qu'un chemin commençant par une seule barre.
 */
function retourSur(valeur: string | undefined): string {
  if (!valeur || !valeur.startsWith('/') || valeur.startsWith('//')) return '/'
  return valeur
}

export default async function ConnexionPage(props: { searchParams: Promise<{ retour?: string }> }) {
  const { retour } = await props.searchParams
  const cible = retourSur(retour)

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Connexion</h1>
      <p className="mt-2 text-fg-2">
        Un compte donne accès aux coordonnées téléphoniques des professionnels et permet aux praticiens de revendiquer
        leur fiche.
      </p>

      <div className="mt-8">
        <FormulaireConnexion retour={cible} />
      </div>

      <p className="mt-8 border-t border-line pt-6 text-sm text-fg-2">
        Les informations de l’annuaire restent consultables sans compte : identité, adresse, spécialité et
        identifiants officiels sont publics et le resteront.{' '}
        <Link href={chemin('/confidentialite/')} className="text-fg underline hover:no-underline">
          Vos données personnelles
        </Link>
      </p>
    </main>
  )
}
