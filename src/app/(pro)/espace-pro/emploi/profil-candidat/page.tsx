import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Check } from 'lucide-react'
import { ApercuCandidat } from '@/components/emploi/apercu-candidat'
import { CoqueEspace } from '@/components/espace/coque'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { FormulaireProfil } from '@/components/emploi/formulaire-profil'
import { chemin } from '@/lib/navigation'
import { tailleLisible } from '@/lib/espace-pro/justificatif'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { getEcoles } from '@/lib/emploi/ecoles'
import { initiales } from '@/lib/emploi/candidature'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Mon profil candidat', robots: { index: false, follow: false } }
export const instant = false

/** CAND-PROFIL et ETU-PROFIL, dans l'espace pro sous « Mes candidatures » : le profil, et à côté ce qu'un recruteur en voit. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi('profil-candidat', sp.fiche)
  const profil = await getProfilCandidat(compte.id)
  if (!profil) redirect(chemin('/espace-pro/emploi/bienvenue/situation/'))
  const ecoles = profil.situation === 'etudiant' ? await getEcoles() : []
  const nom = compte.nom ?? ''

  return (
    <CoqueEspace c={coque} actif="emploi" titre="Emploi" sousTitre="Mon profil candidat : ce que les recruteurs voient quand vous postulez" sansLienFlottant>
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      <SousOngletsCandidat actif="profil" q={q} />
      {sp.fait === 'profil' && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> Profil enregistré.
        </p>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <FormulaireProfil
            vous={{
              nom,
              email: compte.email,
              ville: profil.criteres.communeNom ?? null,
              telephone: profil.telephone,
              photoCompte: espace?.completee?.photoUrl ?? null,
              photoPerso: profil.photo,
              initiales: initiales(nom),
              direct: !!process.env.BLOB_READ_WRITE_TOKEN,
            }}
            situation={profil.situation}
            qualification={profil.qualification}
            criteres={profil.criteres}
            formation={profil.formation}
            experiences={profil.experiences}
            competences={profil.competences}
            cv={profil.cv ? { nom: profil.cv.nom, taille: tailleLisible(profil.cv.taille), url: '/espace-candidat/cv/' } : null}
            ecoles={ecoles}
          />
        </div>
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <ApercuCandidat p={profil} nom={nom} />
        </aside>
      </div>
    </CoqueEspace>
  )
}
