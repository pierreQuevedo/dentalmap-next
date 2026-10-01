import { Building2, RefreshCw, Scale, ShieldCheck } from 'lucide-react'
import { Stats9 } from '@/components/stats9'
import { getChiffresCles } from '@/lib/annuaire/queries'

const nombre = (n: number) => n.toLocaleString('fr-FR')

/**
 * Z2 et Z3 réunis. Le block porte trois chiffres et quatre cartes : les
 * chiffres sont calculés sur la base, jamais saisis, et les cartes reprennent
 * les trois piliers de vérification plus la fraîcheur, avec la date réelle du
 * dernier passage. « Accès libre » et « Erreur signalable » n'ont plus de
 * place ici ; le signalement reste la quatrième étape de « Comment ça marche ».
 */
export async function HomeStats() {
  const c = await getChiffresCles()
  const synchro = c.synchroniseLe
    ? new Date(c.synchroniseLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <Stats9
      className="py-20 md:py-24"
      label="Notre méthode"
      heading="Rien de déclaratif, tout est sourcé"
      description="Un praticien n’entre pas dans DentalMap parce qu’il s’y inscrit, mais parce que les registres publics l’attestent. Voici ce qui est contrôlé, et ce qui ne l’est jamais."
      stats={[
        { value: nombre(c.dentistes), label: 'chirurgiens-dentistes' },
        { value: nombre(c.prothesistes), label: 'laboratoires de prothèse' },
        { value: nombre(c.communes), label: 'communes couvertes' },
      ]}
      features={[
        {
          icon: <ShieldCheck className="size-7" strokeWidth={1.5} />,
          title: 'Identité vérifiée',
          description:
            'Chaque praticien est rapproché de l’Annuaire Santé de l’ANS : numéro RPPS ou ADELI, profession, spécialité déclarée à l’Ordre.',
        },
        {
          icon: <Building2 className="size-7" strokeWidth={1.5} />,
          title: 'Activité vérifiée',
          description:
            'Chaque cabinet et chaque laboratoire est rapproché du répertoire Sirene : établissement ouvert, adresse déclarée, activité cohérente.',
        },
        {
          icon: <Scale className="size-7" strokeWidth={1.5} />,
          title: 'Classement transparent',
          description:
            'Les résultats sont triés par distance, puis par ordre alphabétique. Aucune fiche n’est remontée, et la règle est publiée en clair.',
        },
        {
          icon: <RefreshCw className="size-7" strokeWidth={1.5} />,
          title: 'Mise à jour hebdomadaire',
          description: synchro
            ? `Les registres sont resynchronisés chaque semaine et la date du dernier passage est affichée telle quelle. Dernier passage le ${synchro}.`
            : 'Les registres sont resynchronisés chaque semaine et la date du dernier passage est affichée telle quelle, même en cas de retard.',
        },
      ]}
    />
  )
}
