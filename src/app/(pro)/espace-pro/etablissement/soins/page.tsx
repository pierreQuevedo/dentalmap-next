import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CoqueEspace } from '@/components/espace/coque'
import { SaisieListe } from '@/components/espace/saisie-liste'
import { chemin } from '@/lib/navigation'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { JOURS_CENTRE, SOINS_CENTRE, manqueCentre } from '@/lib/espace-pro/etablissement'
import { HeartPulse, Sparkles } from 'lucide-react'
import { Anneau } from '@/components/espace/apercu'
import { Retour, chargerEtablissement, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Centres de soins', robots: { index: false, follow: false } }
export const instant = false

const COURTS: Record<string, string> = { lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu', vendredi: 'Ven', samedi: 'Sam' }

/**
 * FAC-SOINS : ce que voient les patients dans « Se faire soigner à la
 * faculté ». Les centres lus dans le contenu publié sont proposés au premier
 * passage ; un centre sans horaires reste affiché, avec la mention
 * « Horaires non communiqués ».
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('soins', sp.fiche)
  if (t.source.type !== 'faculte') redirect(chemin(versEtab(t, 'formations')))
  const { source, fiche, coque, missions } = t
  const centres = fiche.donnees.centres
  const complets = centres.filter((c) => !manqueCentre(c)).length
  const gain = missions.find((m) => m.cle === 'centres' && !m.faite)?.gain ?? 0

  return (
    <CoqueEspace c={coque} actif="soins" titre="Centres de soins" sousTitre="Ce que voient les patients dans « Se faire soigner à la faculté »">
      <div className="mb-4">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc="centres" />
      </div>
      <section className="dark squircle-2xl relative mb-4 overflow-hidden bg-background p-6 text-fg sm:p-8">
        <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/15 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
              <HeartPulse className="size-3.5" aria-hidden /> Se faire soigner à la faculté
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {complets === centres.length && centres.length ? 'Vos centres sont prêts pour les patients' : `${complets} centre${complets > 1 ? 's' : ''} complet${complets > 1 ? 's' : ''} sur ${centres.length}`}
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Les CSERD, centres de soins, d’enseignement et de recherche dentaires, soignent les patients avec les étudiants, encadrés par les enseignants. Adresse, téléphone et horaires
              permettent aux patients de prendre rendez-vous depuis votre page.
            </p>
            {gain > 0 && (
              <p className="squircle-full mt-4 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="size-3.5 text-[#BFE3D6]" aria-hidden /> +{gain} % de page complète quand tous les centres sont complets
              </p>
            )}
          </div>
          <Anneau pct={centres.length ? Math.round((complets / centres.length) * 100) : 0} taille={120} sombre legende="centres complets" />
        </div>
      </section>
      <form action={enregistrerBloc}>
        <input type="hidden" name="fiche" value={source.slug} />
        <input type="hidden" name="bloc" value="centres" />
        <input type="hidden" name="retour" value={versEtab(t, 'soins')} />
        <SaisieListe
          cle="centres"
          prefixe="centre"
          initiales={fiche.donnees.centres}
          titre="nom"
          sousTitre="adresse"
          ajout="Ajouter un centre"
          max={8}
          centres
          champs={[
            { cle: 'nom', libelle: 'Nom du centre', type: 'texte', max: 140, exemple: 'Centre de soins dentaires du centre-ville', large: true },
            { cle: 'adresse', libelle: 'Adresse', type: 'texte', max: 200, exemple: '3 rue de la Faculté, 33000 Bordeaux', large: true },
            { cle: 'telephone', libelle: 'Téléphone de rendez-vous', type: 'texte', max: 20, exemple: '05 56 00 00 00' },
            { cle: 'horaires', libelle: 'Horaires', type: 'texte', max: 60, exemple: '8 h 30 à 17 h' },
            { cle: 'delai', libelle: 'Délai pour un rendez-vous', type: 'texte', max: 60, exemple: 'Environ 3 semaines' },
            { cle: 'jours', libelle: 'Jours d’ouverture', type: 'puces', options: JOURS_CENTRE, courts: COURTS },
            { cle: 'soins', libelle: 'Soins proposés', type: 'puces', options: SOINS_CENTRE },
          ]}
        />
        <div className="mt-4 flex justify-end">
          <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Enregistrer
          </button>
        </div>
      </form>
      <p className="mt-4 text-xs text-fg-2">Un centre incomplet reste affiché sur votre page, avec la mention « Horaires non communiqués ».</p>
    </CoqueEspace>
  )
}
