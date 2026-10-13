/**
 * MAQUETTE. `/emploi/remplacements` : remplacements et collaborations de
 * chirurgiens-dentistes. Offres avec rétrocession ou redevance, repères issus
 * d'études, conditions d'exercice avec renvoi vers l'Ordre.
 */
import { ArrowRight, Check, Info, MapPin } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { AlerteEmail, CarteOffre, TitreDeuxTons, euros } from './_blocs'
import { PARCOURS, REMPLACEMENTS, RETROCESSION_MOYENNE, SALAIRES, SOURCE_SALAIRES } from './_donnees'

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

export function Remplacements() {
  const salarie = SALAIRES.find((s) => s.metier.startsWith('Chirurgien'))!
  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={[{ libelle: 'Emploi', href: '/emploi/' }, { libelle: 'Remplacements et collaborations' }]} />
        <div className="mt-8">
          <TitreDeuxTons as="h1" sous="pour les chirurgiens-dentistes.">
            Remplacements et collaborations
          </TitreDeuxTons>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-fg-2">
          Des remplacements de quelques jours à plusieurs mois, des collaborations libérales ou salariées. Chaque offre affiche son taux de rétrocession ou de redevance,
          avec une estimation mensuelle indicative.
        </p>
        <div role="tablist" className="mt-8 inline-flex rounded-full border border-line p-1">
          {PARCOURS.slice(2).map((p, i) => (
            <a key={p.slug} role="tab" aria-selected={i === 0} className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold ${i === 0 ? 'bg-fg text-bg' : 'text-fg'}`}>
              {p.nom} <span className={i === 0 ? 'text-bg/70' : 'text-fg-2'}>{euros(p.n)}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <dl className="container grid gap-6 py-10 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-fg-2">Rétrocession moyenne, remplacement</dt>
            <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{RETROCESSION_MOYENNE.remplacement} %</dd>
            <dd className="text-sm text-fg-2">des honoraires, versée au remplaçant</dd>
          </div>
          <div>
            <dt className="text-sm text-fg-2">Redevance moyenne, collaboration</dt>
            <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{RETROCESSION_MOYENNE.collaboration} %</dd>
            <dd className="text-sm text-fg-2">des honoraires, versée au titulaire</dd>
          </div>
          <div>
            <dt className="text-sm text-fg-2">Salaire moyen, chirurgien-dentiste salarié(e)</dt>
            <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{euros(salarie.valeurs[1]!)} €</dd>
            <dd className="text-sm text-fg-2">brut par mois, en centre de santé</dd>
          </div>
          <p className="text-xs text-fg-2 sm:col-span-3">Moyennes issues d’études, et non calculées sur les offres publiées. {SOURCE_SALAIRES}.</p>
        </dl>
      </section>

      <section className="container py-16">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Offres près de Bordeaux</h2>
          <p className="inline-flex items-center gap-1.5 text-sm text-fg-2">
            <MapPin className="size-4 text-geo" aria-hidden /> Les plus proches d’abord · <a className="font-medium text-fg underline underline-offset-4">Changer de ville</a>
          </p>
        </div>
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {REMPLACEMENTS.map((o) => (
            <CarteOffre key={o.id} o={o} forme="ligne" />
          ))}
        </ul>
        <a className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg">
          Tous les remplacements en Gironde <ArrowRight className="size-4" aria-hidden />
        </a>
      </section>

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
            Vous cherchez à reprendre un cabinet ? Les cessions restent dans les <a className="font-medium text-fg underline underline-offset-4">Annonces</a>.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-bg-soft">
        <div className="container py-16 md:py-20 lg:max-w-3xl lg:px-0">
          <AlerteEmail
            titre="Les nouveaux remplacements par email"
            detail="Remplacements et collaborations autour de Bordeaux. Un email par semaine au plus, et un lien de désinscription dans chaque envoi."
          />
        </div>
      </section>
    </main>
  )
}
