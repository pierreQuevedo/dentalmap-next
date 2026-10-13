/**
 * `/emploi/remplacements/` et `/emploi/remplacements/[departement]/` :
 * remplacements et collaborations de chirurgiens-dentistes, en deux onglets
 * (`?contrat=collaboration`). Offres avec rétrocession ou redevance, repères
 * issus d'études, conditions d'exercice avec renvoi vers l'Ordre.
 *
 * En national, les offres les plus récentes et les départements qui en
 * comptent le plus ; dans un département, les offres par distance à sa
 * commune la plus peuplée, puis par ordre alphabétique.
 */
import Link from 'next/link'
import { ArrowRight, Check, Info } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import type { Departement } from '@/lib/annuaire/queries'
import { chemin } from '@/lib/navigation'
import { EMPLOI, REMPLACEMENTS, cheminRemplacementsDepartement } from '@/lib/emploi/chemins'
import { euros } from '@/lib/emploi/format'
import { PAR_PAGE_EMPLOI, getComptes, getDepartementsQuiRecrutent, getOffresDepartement, getOffresRecentes, getOrigineDepartement } from '@/lib/emploi/queries'
import { RETROCESSION_MOYENNE, SALAIRES, SOURCE_SALAIRES } from '@/lib/emploi/salaires'
import { AucuneOffre } from './accueil'
import { AlerteEmail } from './alerte-email'
import { CarteOffre, ListeLiens, TitreDeuxTons, nombreOffres } from './blocs'

const CONDITIONS = [
  {
    titre: 'Remplacement',
    items: [
      'Inscription au tableau de l’Ordre, ou autorisation de remplacement délivrée par le conseil départemental pour un étudiant',
      'Carte de professionnel de santé (CPS) de remplaçant',
      'Contrat de remplacement écrit, communiqué au conseil départemental de l’Ordre',
      'Pendant le remplacement, le titulaire cesse son activité au cabinet',
    ],
  },
  {
    titre: 'Collaboration libérale',
    items: [
      'Inscription au tableau de l’Ordre',
      'Contrat de collaboration écrit, communiqué au conseil départemental de l’Ordre',
      'Redevance versée au titulaire, fixée au contrat en pourcentage des honoraires',
      'Possibilité de constituer sa propre patientèle',
    ],
  },
]

export async function PageRemplacements({ collaboration, departement: d, page = 1 }: { collaboration: boolean; departement?: Departement; page?: number }) {
  const contrat = collaboration ? 'collaboration' : 'remplacement'
  const filtre = { metier: 'chirurgien_dentiste' as const, contrats: [contrat] as ('remplacement' | 'collaboration')[] }
  const [comptes, liste, origine, departements] = await Promise.all([
    getComptes(d ? { departementCode: d.code } : {}),
    d ? getOffresDepartement(d.code, filtre, page) : getOffresRecentes({ ...filtre, limite: 12 }).then((offres) => ({ offres, total: offres.length })),
    d ? getOrigineDepartement(d.code) : Promise.resolve(null),
    d ? Promise.resolve([]) : getDepartementsQuiRecrutent({ metier: 'chirurgien_dentiste', contrats: ['remplacement', 'collaboration'] }, 12),
  ])
  const { offres, total } = liste
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE_EMPLOI))
  const base = d ? cheminRemplacementsDepartement(d.slug) : REMPLACEMENTS
  const salarie = SALAIRES.chirurgien_dentiste?.valeurs[1] ?? null
  const croise = (k: 'remplacement' | 'collaboration') =>
    comptes.croises.filter((x) => x.metier === 'chirurgien_dentiste' && x.contrat === k).reduce((n, x) => n + x.total, 0)
  const onglets = [
    { cle: 'remplacement', nom: 'Remplacements', n: croise('remplacement'), href: base },
    { cle: 'collaboration', nom: 'Collaborations', n: croise('collaboration'), href: `${base}?contrat=collaboration` },
  ]
  const ariane = d
    ? [{ libelle: 'Emploi', href: EMPLOI }, { libelle: 'Remplacements et collaborations', href: REMPLACEMENTS }, { libelle: d.nom }]
    : [{ libelle: 'Emploi', href: EMPLOI }, { libelle: 'Remplacements et collaborations' }]

  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={ariane} />
        <div className="mt-8">
          <TitreDeuxTons as="h1" sous={d ? `en ${d.nom}.` : 'pour les chirurgiens-dentistes.'}>
            Remplacements et collaborations
          </TitreDeuxTons>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-fg-2">
          Des remplacements de quelques jours à plusieurs mois et des collaborations libérales. Chaque offre affiche son taux de rétrocession ou de redevance.
        </p>
        <nav aria-label="Type de contrat" className="mt-8 inline-flex rounded-full border border-line p-1">
          {onglets.map((o) => {
            const actif = o.cle === contrat
            return (
              <Link
                key={o.cle}
                href={chemin(o.href)}
                aria-current={actif ? 'page' : undefined}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold ${actif ? 'bg-fg text-bg' : 'text-fg'}`}
              >
                {o.nom} <span className={actif ? 'text-bg/70' : 'text-fg-2'}>{euros(o.n)}</span>
              </Link>
            )
          })}
        </nav>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <dl className="container grid gap-6 py-10 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-fg-2">Rétrocession moyenne, remplacement</dt>
            <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{RETROCESSION_MOYENNE.remplacement}&nbsp;%</dd>
            <dd className="text-sm text-fg-2">des honoraires, versée au remplaçant</dd>
          </div>
          <div>
            <dt className="text-sm text-fg-2">Redevance moyenne, collaboration</dt>
            <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{RETROCESSION_MOYENNE.collaboration}&nbsp;%</dd>
            <dd className="text-sm text-fg-2">des honoraires, versée au titulaire</dd>
          </div>
          {salarie != null && (
            <div>
              <dt className="text-sm text-fg-2">Salaire moyen, chirurgien-dentiste salarié(e)</dt>
              <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{euros(salarie)} €</dd>
              <dd className="text-sm text-fg-2">brut par mois, en centre de santé</dd>
            </div>
          )}
          <p className="text-xs text-fg-2 sm:col-span-3">Moyennes issues d’études, et non calculées sur les offres publiées. {SOURCE_SALAIRES}.</p>
        </dl>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            {d ? `${nombreOffres(total)} en ${d.nom}` : collaboration ? 'Collaborations récentes' : 'Remplacements récents'}
          </h2>
          {offres.length > 0 && (
            <p className="text-sm text-fg-2">{d && origine ? `Les plus proches de ${origine.nom} d’abord.` : 'Les dernières publiées, partout en France.'}</p>
          )}
        </div>
        <div className="mt-5">
          {offres.length > 0 ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {offres.map((o) => (
                <CarteOffre key={o.id} o={o} forme="ligne" />
              ))}
            </ul>
          ) : (
            <AucuneOffre
              texte={`Aucun${collaboration ? 'e collaboration' : ' remplacement'} n’est en ligne${d ? ` en ${d.nom}` : ''} pour le moment. Recevez les prochaines offres par email dès leur publication.`}
              criteres={{ metiers: ['chirurgien_dentiste'], contrats: [contrat], ...(d ? { departement: d.code } : {}) }}
            />
          )}
        </div>
        {d && page < pages && (
          <Link
            href={chemin(`${base}?${collaboration ? 'contrat=collaboration&' : ''}page=${page + 1}`)}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg"
          >
            Afficher les offres suivantes <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        {d && (
          <Link href={chemin(REMPLACEMENTS)} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg">
            Toute la France <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </section>

      {departements.length > 0 && (
        <section className="border-t border-line bg-bg-soft">
          <div className="container py-16">
            <ListeLiens
              titre="Par département"
              liens={departements.map((x) => ({ nom: x.nom, href: cheminRemplacementsDepartement(x.slug), n: x.total }))}
              colonnes={3}
            />
          </div>
        </section>
      )}

      <section className="border-t border-line">
        <div className="container py-16 md:py-20">
          <TitreDeuxTons sous="ce que demande chaque type de contrat.">Conditions d’exercice</TitreDeuxTons>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {CONDITIONS.map((c) => (
              <div key={c.titre} className="squircle-2xl border border-line p-6">
                <h3 className="text-xl font-semibold tracking-tight text-fg">{c.titre}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((x) => (
                    <li key={x} className="flex gap-3 text-fg">
                      <Check className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="squircle-xl mt-4 flex items-start gap-2 bg-partiel-bg px-4 py-3 text-sm text-partiel">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Règles rappelées à titre indicatif, à vérifier avec l’Ordre des chirurgiens-dentistes et votre conseil départemental avant de signer.
          </p>
          <p className="mt-6 text-sm text-fg-2">
            Vous cherchez à reprendre un cabinet ? Les cessions restent dans les{' '}
            <Link href={chemin('/annonces/cession/')} className="font-medium text-fg underline underline-offset-4">
              Annonces
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-bg-soft">
        <div className="container py-16 md:py-20 lg:max-w-3xl lg:px-0">
          <AlerteEmail
            criteres={{ metiers: ['chirurgien_dentiste'], contrats: ['collaboration', 'remplacement'], ...(d ? { departement: d.code } : {}) }}
            titre="Les nouveaux remplacements par email"
            detail={`Remplacements et collaborations${d ? ` en ${d.nom}` : ', partout en France'}. Un email par semaine au plus, et un lien de désinscription dans chaque envoi.`}
          />
        </div>
      </section>
    </main>
  )
}
