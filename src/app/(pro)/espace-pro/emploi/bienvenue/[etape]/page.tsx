import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { CoqueEspace } from '@/components/espace/coque'
import { OngletsEmploi } from '@/components/emploi/espace-offres'
import { FormulaireBienvenue } from '@/components/emploi/formulaire-bienvenue'
import { chemin } from '@/lib/navigation'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { getEcoles } from '@/lib/emploi/ecoles'
import { TITRES_ETAPE, etapesBienvenue, lireCriteres } from '@/lib/emploi/profil-candidat'
import { ApercuCandidat } from '@/components/emploi/apercu-candidat'
import { chargerEmploi } from '../../../_commun'

export const metadata: Metadata = { title: 'Votre profil', robots: { index: false, follow: false } }
export const instant = false

const INTRO: Record<string, string> = {
  situation: 'Quelques questions pour vous proposer les offres qui vous correspondent. Une minute, tout reste modifiable.',
  recherche: 'Les offres sont triées par distance depuis votre ville. Une première alerte reprend ces critères.',
  qualification: 'Elle s’affiche sur votre profil et vos candidatures.',
  formation: 'Pour recevoir des alternances et des stages qui s’accordent avec votre rythme.',
  visibilite: 'Vous choisissez qui peut vous trouver et vous inviter à postuler.',
  pret: 'Voici ce que les recruteurs verront. Tout reste modifiable depuis « Mon profil ».',
}

/**
 * SE1 à SE5 : le parcours de bienvenue du candidat, dans l'espace pro, onglet
 * Emploi. `?retour=` ramène là d'où la personne venait, une offre par exemple.
 */
export default async function Page(props: { params: Promise<{ etape: string }>; searchParams: Promise<{ fiche?: string; retour?: string }> }) {
  const { etape } = await props.params
  const { retour: r, fiche } = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi(`bienvenue/${etape}`, fiche)
  const retour = r && /^\/[\w\-/]*(\?[\w=&%-]*)?$/.test(r) && !r.startsWith('//') ? r : null
  const profil = await getProfilCandidat(compte.id)
  const etapes = etapesBienvenue(profil?.situation ?? null)
  if (!(etapes as string[]).includes(etape)) notFound()
  if (!profil && etape !== 'situation') redirect(chemin(`/espace-pro/emploi/bienvenue/situation/${retour ? `?retour=${encodeURIComponent(retour)}` : ''}`))
  const e = etape as (typeof etapes)[number]
  const n = etapes.indexOf(e) + 1
  // L'étape d'avant, avec la fiche et l'offre de retour.
  const params = new URLSearchParams({ ...(fiche ? { fiche } : {}), ...(retour ? { retour } : {}) }).toString()
  const precedente = n > 1 ? `/espace-pro/emploi/bienvenue/${etapes[n - 2]}/${params ? `?${params}` : ''}` : null
  const ecoles = e === 'formation' ? await getEcoles() : []
  const criteres = profil?.criteres ?? lireCriteres({})

  return (
    <CoqueEspace c={coque} actif="emploi" titre="Emploi" sousTitre="Votre profil, en cinq étapes" sansLienFlottant>
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      {/* Toute la largeur, comme le reste de l'espace : l'intro reste lisible, les choix s'étalent en encarts. */}
      <div>
      <div className="mt-2 flex items-center gap-1.5" aria-hidden>
        {etapes.map((x, i) => (
          <span key={x} className={`h-1 flex-1 rounded-full ${i < n ? 'bg-teal' : 'bg-line'}`} />
        ))}
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-fg-2">
        Votre profil · étape {n} sur {etapes.length}
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
        {e === 'situation' && compte.nom ? `Bonjour ${compte.nom.split(' ')[0]}, ` : ''}
        {e === 'situation' ? 'quelle est votre situation ?' : TITRES_ETAPE[e]}
      </h2>
      <p className="mt-2 max-w-2xl text-fg-2">{INTRO[e]}</p>
      <div className="squircle-2xl mt-6 border border-line bg-bg p-5 sm:p-6">
        <FormulaireBienvenue
          etape={e}
          retour={retour}
          precedente={precedente}
          situation={profil?.situation ?? null}
          qualification={profil?.qualification ?? null}
          criteres={criteres}
          formation={profil?.formation ?? null}
          visibilite={profil?.visibilite ?? 'visible'}
          ecoles={ecoles}
        >
          {/* La fin du parcours montre le profil comme un recruteur le lit, plutôt qu'un tableau. */}
          {e === 'pret' && profil && (
            <div className="max-w-xl">
              <ApercuCandidat p={profil} nom={compte.nom ?? ''} cadre={false} />
            </div>
          )}
        </FormulaireBienvenue>
      </div>
      </div>
    </CoqueEspace>
  )
}
