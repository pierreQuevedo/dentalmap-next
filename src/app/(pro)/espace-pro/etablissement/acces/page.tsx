import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { GraduationCap, Lock } from 'lucide-react'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { SaisieListe } from '@/components/espace/saisie-liste'
import { chemin } from '@/lib/navigation'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { Retour, chargerEtablissement, gainMissions, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Accès aux études', robots: { index: false, follow: false } }
export const instant = false

/**
 * FAC-ACC : les étapes affichées sur la page, de la première année de santé
 * à l'inscription, chacune avec sa période. Les places en deuxième année
 * viennent des arrêtés annuels et ne se modifient pas ici.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('acces', sp.fiche)
  if (t.source.type !== 'faculte') redirect(chemin(versEtab(t, 'formations')))
  const { source, fiche, coque } = t
  const cap = source.faculte?.capacite
  const voies = fiche.donnees.voiesAcces
  const detaillees = voies.filter((v) => v.detail.trim()).length
  const gain = gainMissions(t, 'acces')

  return (
    <CoqueEspace c={coque} actif="acces" titre="Accès aux études" sousTitre="Les étapes affichées sur la page, de la première année de santé à l’inscription">
      <div className="mb-4">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc="voiesAcces" />
      </div>
      <EnTeteEtab
        i={GraduationCap}
        etiquette="Accès aux études"
        titre={voies.length ? `${voies.length} voie${voies.length > 1 ? 's' : ''} d’accès décrite${voies.length > 1 ? 's' : ''}` : 'Décrivez l’accès aux études'}
        texte="PASS, L.AS, passerelles : les futurs étudiants lisent ici comment entrer en odontologie, étape par étape. Une voie détaillée dit quand candidater et ce qu’on y attend."
        pct={voies.length ? Math.round((detaillees / voies.length) * 100) : 0}
        legende="voies détaillées"
        gain={gain === null ? null : { pct: gain, quand: 'avec au moins une voie d’accès' }}
        progression={coque.progressionEtab!}
        q={t.q}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form action={enregistrerBloc}>
          <input type="hidden" name="fiche" value={source.slug} />
          <input type="hidden" name="bloc" value="voiesAcces" />
          <input type="hidden" name="retour" value={versEtab(t, 'acces')} />
          <SaisieListe
            cle="voiesAcces"
            prefixe="voie"
            initiales={fiche.donnees.voiesAcces}
            titre="titre"
            sousTitre="detail"
            ajout="Ajouter une étape"
            max={10}
            places={cap?.detail ?? null}
            champs={[
              { cle: 'titre', libelle: 'Étape', type: 'texte', max: 120, exemple: 'Admission en deuxième année', large: true },
              { cle: 'detail', libelle: 'Ce qu’il faut savoir', type: 'texte', max: 300, exemple: 'Sur classement, épreuves écrites puis orales', large: true },
              { cle: 'quand', libelle: 'Période', type: 'texte', max: 60, exemple: 'Fin de 1re année' },
            ]}
          />
          <div className="mt-4 flex justify-end">
            <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Enregistrer
            </button>
          </div>
        </form>
        <aside>
          <Tuile>
            <TitreTuile i={GraduationCap} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Automatique</span>}>
              Places en 2e année
            </TitreTuile>
            {cap?.nombre ? (
              <>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-fg">{cap.nombre}</p>
                <p className="text-sm text-fg-2">{cap.annee ? `En ${cap.annee}` : 'Dernier arrêté connu'}</p>
                {cap.detail && <p className="mt-2 text-xs text-fg-2">{cap.detail}</p>}
              </>
            ) : (
              <p className="mt-4 text-sm text-fg-2">Le chiffre apparaîtra à la publication de l’arrêté.</p>
            )}
            <p className="mt-4 text-xs text-fg-2">Source : arrêtés annuels fixant les capacités d’accueil.</p>
          </Tuile>
        </aside>
      </div>
    </CoqueEspace>
  )
}
