import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Check, Lock } from 'lucide-react'
import { ApercuCandidat } from '@/components/emploi/apercu-candidat'
import { CoqueCandidat } from '@/components/emploi/coque-candidat'
import { FormulaireProfil } from '@/components/emploi/formulaire-profil'
import { chemin } from '@/lib/navigation'
import { tailleLisible } from '@/lib/espace-pro/justificatif'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { getEcoles } from '@/lib/emploi/ecoles'
import { initiales } from '@/lib/emploi/candidature'
import { exigerConnexion } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Mon profil candidat', robots: { index: false, follow: false } }
export const instant = false

/** CAND-PROFIL et ETU-PROFIL : le profil, et à côté ce qu'un recruteur en voit. */
export default async function Page(props: { searchParams: Promise<{ fait?: string }> }) {
  const sp = await props.searchParams
  const compte = await exigerConnexion('/espace-candidat/profil/')
  const profil = await getProfilCandidat(compte.id)
  if (!profil) redirect(chemin('/espace-candidat/bienvenue/situation/'))
  const ecoles = profil.situation === 'etudiant' ? await getEcoles() : []
  const nom = compte.nom ?? ''

  return (
    <CoqueCandidat actif="profil" titre="Mon profil" sousTitre="Ce que les recruteurs voient quand vous postulez, ou quand vous êtes visible." etudiant={profil.situation === 'etudiant'}>
      {sp.fait === 'profil' && (
        <p role="status" className="squircle-xl mb-6 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> Profil enregistré.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <section className="squircle-2xl flex items-center gap-4 border border-line p-5 sm:p-6">
            <span className="squircle-xl grid size-14 shrink-0 place-items-center bg-bg-soft text-base font-bold text-fg ring-1 ring-line">{initiales(nom)}</span>
            <div className="min-w-0">
              <p className="font-semibold text-fg">{nom || 'Votre nom'}</p>
              <p className="text-sm text-fg-2">{profil.criteres.communeNom ?? 'Ville à renseigner'}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-2">
                <Lock className="size-3" aria-hidden /> {compte.email} · jamais affichée
              </p>
            </div>
          </section>
          <FormulaireProfil
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
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ApercuCandidat p={profil} nom={nom} />
        </aside>
      </div>
    </CoqueCandidat>
  )
}
