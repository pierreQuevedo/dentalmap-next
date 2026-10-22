import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Encart, Etapes, cadre, discret, principal, titre } from '@/components/compte/ui'
import { ResumeEtablissement } from '@/components/espace/etablissement'
import { SaisieFormations } from '@/components/espace/saisie-formations'
import { chemin } from '@/lib/navigation'
import { enregistrerFormationsOnboarding } from '@/lib/espace-pro/actions-etablissement'
import { getFicheEtablissement, initialiserFiche } from '@/lib/espace-pro/etablissement-donnees'
import { CoquilleOrganisme, ORGANISME, etablissementOu404, gardeOrganisme, lignesDe } from '../_commun'

export const metadata: Metadata = { title: 'Vos formations', robots: { index: false, follow: false } }

/**
 * O3a : les formations de l'établissement, préremplies depuis son contenu
 * publié. Au moins une active pour publier ; chacune s'active ou se
 * désactive sans être supprimée. Une attestation en cours d'examen n'empêche
 * pas de préparer : la publication attend la vérification.
 */
type Params = { fiche?: string; erreur?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const ici = `${ORGANISME}/formations/?fiche=${encodeURIComponent(sp.fiche ?? '')}`
  const compte = await gardeOrganisme(ici)
  const { source, gestion } = await etablissementOu404(sp.fiche, compte)
  if (!gestion) redirect(chemin(`${ORGANISME}/etablissement/?q=${encodeURIComponent(source.titre)}`))
  let fiche = await getFicheEtablissement(source.slug)
  if (!fiche) {
    await initialiserFiche(source, compte.id)
    fiche = await getFicheEtablissement(source.slug)
  }
  const formations = fiche?.donnees.formations ?? source.formationsInitiales
  const verifie = gestion.statut === 'acceptee'

  return (
    <CoquilleOrganisme
      source={source}
      lignes={lignesDe(formations)}
      etiquette={verifie ? 'Gérée par l’établissement' : 'Vérification en cours'}
      retour={source.lien}
      libelleRetour="Retour au site"
    >
      <Etapes etape={3} total={3} libelle="Formations" />
      <h1 className={titre}>Vos formations</h1>
      <p className="mt-2 text-sm text-fg-2">Au moins une formation active pour publier. Les étudiants filtrent par diplôme{source.type === 'faculte' ? ' et durée' : ', durée et alternance'}.</p>

      <div className={`${cadre} mt-6`}>
        <ResumeEtablissement titre={source.titre} type={source.type} adresse={source.adresse ?? source.ville} uai={source.uai} />
      </div>

      {!verifie && (
        <Encart titre="Attestation en cours d’examen" className="mt-4">
          Préparez vos formations dès maintenant : elles seront publiées dès la vérification, sous 48 heures ouvrées.
        </Encart>
      )}
      {sp.erreur && (
        <Encart ton="erreur" className="mt-4">
          {sp.erreur}
        </Encart>
      )}

      <form action={enregistrerFormationsOnboarding} className="mt-6">
        <input type="hidden" name="fiche" value={source.slug} />
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Formations</p>
        <SaisieFormations initiales={formations} />
        <button type="submit" name="suite" value="publier" className={`${principal} mt-4`}>
          {verifie ? 'Publier' : 'Enregistrer'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <button type="submit" name="suite" value="plus-tard" formNoValidate className={`${discret} mt-1`}>
          Terminer plus tard
        </button>
      </form>
    </CoquilleOrganisme>
  )
}
