import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ExternalLink, Lock, ShieldCheck } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { LIBELLE_TYPE, actives, intituleDiplome } from '@/lib/espace-pro/etablissement'
import { chargerEtablissement } from '../_commun'

export const metadata: Metadata = { title: 'Registres', robots: { index: false, follow: false } }
export const instant = false

/** Ce que la page lit aux sources publiques : en lecture seule, une erreur se signale. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const t = await chargerEtablissement('registre', (await props.searchParams).fiche)
  const { source, gestion, coque } = t
  // Les identifiants s'affichent toujours, même absents : l'établissement voit ce qui manque au référentiel.
  const lignes: [string, string | null, boolean?][] = [
    ['Type', LIBELLE_TYPE[source.type]],
    ['Statut', source.statut ?? 'Non trouvé au référentiel'],
    ...(source.universite ? [['Université', source.universite] as [string, string]] : []),
    ['Numéro UAI', source.uai ?? 'Non trouvé au référentiel UAI', !source.uai],
    ['Numéro SIRET', 'Non rapproché du répertoire Sirene', true],
    ['Adresse', source.adresse],
    ['Ville', source.ville],
    ['Identité du gestionnaire', gestion.statut === 'acceptee' ? (gestion.methode === 'domaine' ? 'Adresse sur le domaine de l’établissement' : 'Attestation de fonction vérifiée') : 'Attestation en cours d’examen'],
  ]
  const diplomes = actives(t.fiche.donnees)
  const sources = source.faculte?.sources ?? []
  return (
    <CoqueEspace c={coque} actif="registre" titre="Registres" sousTitre="Ce que la page lit aux sources publiques, en lecture seule">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={ShieldCheck}>Identité de l’établissement</TitreTuile>
          <dl className="mt-3 divide-y divide-line">
            {lignes
              .filter((l): l is [string, string, boolean?] => !!l[1])
              .map(([l, v, absent]) => (
              <div key={l} className="flex items-center gap-3 py-3 text-sm">
                <dt className="w-44 shrink-0 text-fg-2">{l}</dt>
                <dd className={`min-w-0 flex-1 ${absent ? 'italic text-fg-2' : 'text-fg'}`}>{v}</dd>
                <Lock className="size-3.5 shrink-0 text-fg-2" aria-label="Donnée de référence" />
              </div>
            ))}
          </dl>
        </Tuile>
        <Tuile>
          <TitreTuile i={Award}>Diplômes au RNCP</TitreTuile>
          <ul className="mt-3 divide-y divide-line">
            {diplomes.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fg">{intituleDiplome(f.intitule)}</span>
                  <span className="block text-xs italic text-fg-2">Fiche RNCP non rapprochée</span>
                </span>
                <a
                  href={`https://www.francecompetences.fr/recherche_certificationprofessionnelle/?types=certification&search=${encodeURIComponent(f.intitule)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg"
                >
                  Chercher <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Tuile>
        <Tuile>
          <TitreTuile i={ExternalLink}>Sources</TitreTuile>
          {sources.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {sources.map((s) => (
                <li key={s}>
                  <a href={s} target="_blank" rel="noreferrer" className="break-all text-fg underline underline-offset-4 hover:no-underline">
                    {s.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-2">Référentiel UAI de l’Éducation nationale, répertoire Sirene et France compétences, synchronisés chaque semaine.</p>
          )}
          <p className="mt-4 text-xs text-fg-2">
            Une information fausse ?{' '}
            <Link href={chemin('/contact/')} className="font-medium text-fg underline underline-offset-4">
              Signalez-la
            </Link>
            , nous la vérifions auprès de la source.
          </p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
