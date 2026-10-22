import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, Database, ExternalLink, FileText, Flag, Globe, Landmark, Lock, Newspaper, ShieldCheck, type LucideIcon } from 'lucide-react'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { LIBELLE_TYPE, actives, intituleDiplome } from '@/lib/espace-pro/etablissement'
import { REGISTRES_ECOLE, rangerSources, type SourceNommee } from '@/lib/espace-pro/sources-etablissement'
import { chargerEtablissement } from '../_commun'

export const metadata: Metadata = { title: 'Registres', robots: { index: false, follow: false } }
export const instant = false

const ICONE_NATURE: Record<SourceNommee['nature'], LucideIcon> = { page: Globe, pdf: FileText, texte: Landmark, registre: Database, article: Newspaper }

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
  const verifie = gestion.statut === 'acceptee'
  const lus = lignes.filter((l) => l[1] && !l[2]).length
  const fac = source.faculte
  const groupes = fac?.sources.length ? rangerSources(fac.sources) : [{ rubrique: 'Registres nationaux', sources: REGISTRES_ECOLE }]
  // Un signalement ouvre le formulaire d'erreur, l'établissement et la ligne déjà choisis.
  const signaler = (ligne: string) => `/contact/?objet=erreur-fiche&fiche=${encodeURIComponent(source.slug)}&erreur=${ligne === 'Adresse' || ligne === 'Ville' ? 'adresse' : 'autre'}`
  return (
    <CoqueEspace c={coque} actif="registre" titre="Registres" sousTitre="Ce que la page lit aux sources publiques, en lecture seule">
      <EnTeteEtab
        i={ShieldCheck}
        etiquette="Confiance"
        titre={verifie ? 'Identité vérifiée' : 'Identité en cours de vérification'}
        texte="Ces données viennent des référentiels publics : elles ne se modifient pas ici, une erreur se corrige à la source. La vérification de votre identité publie la page et lui donne la pastille « Vérifié »."
        pct={Math.round((lus / lignes.length) * 100)}
        legende="données lues"
        gain={{ pct: verifie ? 0 : 30, quand: 'dès la vérification' }}
        progression={coque.progressionEtab!}
        q={t.q}
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={ShieldCheck}>Identité de l’établissement</TitreTuile>
          <dl className="mt-3 divide-y divide-line">
            {lignes
              .filter((l): l is [string, string, boolean?] => !!l[1])
              .map(([l, v, absent]) => (
                <div key={l} className="group flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
                  <dt className="flex w-44 shrink-0 items-center gap-1.5 text-fg-2">
                    <Lock className="size-3 shrink-0" aria-label="Donnée de référence" /> {l}
                  </dt>
                  <dd className={`min-w-0 flex-1 ${absent ? 'italic text-fg-2' : 'text-fg'}`}>{v}</dd>
                  {l !== 'Identité du gestionnaire' && (
                    <Link
                      href={chemin(signaler(l))}
                      className="squircle-full inline-flex shrink-0 items-center gap-1 border border-line px-2 py-0.5 text-xs font-medium text-fg-2 transition-colors hover:border-line-strong hover:text-fg"
                    >
                      <Flag className="size-3" aria-hidden /> Signaler
                    </Link>
                  )}
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
        <Tuile className="lg:col-span-2">
          <TitreTuile i={ExternalLink} droite={fac?.dateReleve ? <span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">Relevées le {fac.dateReleve}</span> : undefined}>
            Sources
          </TitreTuile>
          <p className="mt-1 text-xs text-fg-2">Ce que la page a lu, rangé par ce que chaque source renseigne.</p>
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
            {groupes.map((g) => (
              <section key={g.rubrique}>
                <h3 className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-fg-2">
                  {g.rubrique} <span className="font-mono font-normal normal-case tracking-normal">{g.sources.length}</span>
                </h3>
                <ul className="mt-2 space-y-1">
                  {g.sources.map((x) => {
                    const I = ICONE_NATURE[x.nature]
                    return (
                      <li key={x.url}>
                        <a href={x.url} target="_blank" rel="noreferrer" title={x.url} className="squircle-lg group flex items-center gap-2.5 px-2 py-1.5 -mx-2 hover:bg-bg-soft">
                          <span className="squircle-md grid size-7 shrink-0 place-items-center bg-bg-soft text-fg-2 group-hover:bg-bg">
                            <I className="size-3.5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-fg">{x.libelle}</span>
                            <span className="block truncate font-mono text-[10.5px] text-fg-2">{x.domaine}</span>
                          </span>
                          <ExternalLink className="size-3.5 shrink-0 text-fg-2 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
