import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { choisirProfil } from '@/lib/tunnel/actions'
import { getCompte } from '@/lib/tunnel/compte'
import { estRole, prochaineEtape, retourSur, ROLES, libelleRole } from '@/lib/tunnel/etapes'

export const metadata: Metadata = { title: 'Qui êtes-vous ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * Étape 2b et 3 du tunnel : le rôle et le nom.
 *
 * Squelette sans mise en page : la structure, les champs et l'action sont là,
 * l'interface viendra se poser dessus. Un rôle passé dans l'URL, choisi
 * avant la connexion, préremplit le formulaire.
 */
export default async function Page(props: { searchParams: Promise<{ role?: string; retour?: string; erreur?: string }> }) {
  const { role, retour, erreur } = await props.searchParams
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(`/inscription/profil/${role ? `?role=${role}` : ''}`)}`))
  if (compte.role && !role) redirect(chemin(prochaineEtape(compte.etat, retourSur(retour))))
  const preselection = estRole(role) ? role : compte.role

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Qui êtes-vous ?</h1>
      {erreur && <p role="alert" className="mt-4 text-sm text-destructive">{erreur}</p>}
      <form action={choisirProfil} className="mt-6 space-y-4">
        <input type="hidden" name="retour" value={retourSur(retour, '')} />
        <fieldset>
          <legend className="text-sm font-medium text-fg">Vous êtes</legend>
          {ROLES.map((r) => (
            <label key={r} className="mt-2 flex items-center gap-2 text-sm text-fg">
              <input type="radio" name="role" value={r} defaultChecked={preselection === r} required />
              {libelleRole(r)}
            </label>
          ))}
        </fieldset>
        <label className="block text-sm font-medium text-fg">
          Votre nom
          <input name="nom" defaultValue={compte.nom} required minLength={2} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <button type="submit" className="rounded-full bg-action px-5 py-2.5 font-medium text-action-foreground">
          Continuer
        </button>
      </form>
    </main>
  )
}
