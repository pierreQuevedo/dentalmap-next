import { getFormations } from '@/lib/wp/queries'

/** Les écoles de prothèse et facultés de l'annuaire, pour le choix de l'école d'un étudiant. */
export async function getEcoles(): Promise<{ slug: string; nom: string }[]> {
  try {
    const formations = await getFormations()
    return formations.filter((f) => f.type === 'ecole_prothese' || f.type === 'faculte').map((f) => ({ slug: f.slug, nom: f.ville ? `${f.titre}, ${f.ville}` : f.titre }))
  } catch {
    // WordPress injoignable : le champ reste vide, le reste du profil s'enregistre.
    return []
  }
}
