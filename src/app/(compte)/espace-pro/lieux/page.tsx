import { formaterAdresse } from '@/lib/annuaire/nom'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChoixLieux } from '@/components/compte/choix'
import { Etapes, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { choisirLieux } from '@/lib/espace-pro/actions-revendication'
import { getFicheRevendication } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, garde } from '../revendiquer/_commun'

export const metadata: Metadata = { title: 'Où exercez-vous ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * M1 : la fiche est attribuée et le registre associe plusieurs lieux. On
 * choisit ceux à compléter, au moins un ; l'ordre suit le lieu principal.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const { fiche: slug = '' } = await props.searchParams
  const compte = await garde(`/espace-pro/lieux/?fiche=${encodeURIComponent(slug)}`)
  const fiche = slug ? await getFicheRevendication(slug, compte.id) : null
  if (!fiche || fiche.demande?.statut !== 'acceptee' || fiche.demande.objet !== 'revendication') redirect(chemin('/espace-pro/'))
  if (fiche.lieux.length < 2) redirect(chemin('/espace-pro/'))

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={`${fiche.lieux.length} lieux d’exercice au registre`}
      lieux={fiche.lieux.slice(1)}
      retour="/espace-pro/"
      libelleRetour="Mon espace"
    >
      <Etapes etape={4} libelle="Lieux d’exercice" />
      <h1 className={titre}>Où exercez-vous ?</h1>
      <p className="mt-2 text-sm text-fg-2">Le registre vous associe à {fiche.lieux.length} lieux. Choisissez ceux que vous voulez compléter.</p>
      <div className="mt-6">
        <ChoixLieux
          action={choisirLieux}
          fiche={fiche.slug}
          lieux={fiche.lieux.map((l) => ({
            id: l.id,
            titre: l.adresseLigne ? formaterAdresse(l.adresseLigne) : (l.communeNom ?? 'Adresse inconnue'),
            detail: [l.codePostal, l.communeNom].filter(Boolean).join(' '),
            principal: l.principal,
          }))}
        />
      </div>
    </CoquilleParcours>
  )
}
