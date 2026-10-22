import { Briefcase, CalendarDays, CircleCheck, Globe, GraduationCap, Phone } from 'lucide-react'
import Link from 'next/link'
import { Carte } from '@/components/map/carte'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import { chemin } from '@/lib/navigation'
import { FAMILLES, lienFormation } from '@/lib/formation/types'
import type { Ecole } from '@/lib/formation/faculte'
import {
  citationRelevee,
  dateLisible,
  formationsAffichees,
  lignesFrais,
  niveauMax,
  prochainesPortesOuvertes,
  siglesDiplomes,
  type FormationAffichee,
} from '@/lib/formation/page-etablissement'
import { evenementsAVenir, prochainePorteOuverteSaisie } from '@/lib/formation/details'
import { Balisage, etablissementFormation, filAriane } from '@/lib/seo/jsonld'
import type { FormationComplete, FormationResume } from '@/lib/wp/queries'
import type { DeclarationPublique } from '@/lib/espace-pro/etablissement-donnees'
import { EncartGestion } from './module-etablissement'
import {
  BarreMobile,
  BoutonHeros,
  Citation,
  Contacts,
  Couts,
  Etapes,
  Evenements,
  Galerie,
  Heros,
  Mention,
  Pastille,
  RegistreEtAutres,
  Titre2,
  confirmeLe,
  type BlocCarteHeros,
  type Position,
} from './blocs-etablissement'

/**
 * Page d'une école de prothèse dentaire.
 *
 * Deux sources, jamais mêlées : le contenu relevé dans WordPress (identité,
 * diplômes, admission, sources, et le groupe « Formation, informations
 * détaillées » : étapes d'admission, prérequis, rentrée, frais, rendez-vous,
 * contact) et ce que l'établissement déclare depuis son espace, dans Neon
 * (accroche, présentation, photos, formations détaillées, étapes d'accès,
 * portes ouvertes). Le déclaratif passe avant le relevé, bloc par bloc.
 * Chaque bloc dit d'où il vient ; un bloc sans donnée ne s'affiche pas.
 */
export type FicheEcoleProps = {
  f: FormationComplete
  ecole: Ecole
  declaration: DeclarationPublique | null
  position: Position | null
  /** Autres écoles, celles de la région d'abord. */
  autres: FormationResume[]
  departement: { slug: string; nom: string } | null
  /** L'heure de référence (`maintenantPage`) : les dates passées ne s'affichent plus. */
  maintenant: string
}

const TYPE = 'ecoles-de-prothese'

export function FicheEcole({ f, ecole, declaration, position, autres, departement, maintenant: iso }: FicheEcoleProps) {
  const maintenant = new Date(iso)
  const famille = FAMILLES[TYPE]
  const cheminFiche = lienFormation(f)
  const d = declaration?.donnees ?? null
  const x = f.details
  const siteWeb = f.siteWeb ?? ecole.siteWeb
  const telephone = ecole.telephone ?? x.telephone
  const email = ecole.email ?? x.email
  const adresse = ecole.adresse ?? x.adresse
  const presentation = d?.presentation ?? ecole.presentation ?? f.extrait
  const { formations, declarees } = formationsAffichees(d, ecole.diplomes)
  const po = prochainesPortesOuvertes(d, maintenant)
  // Portes ouvertes saisies dans WordPress, quand l'établissement n'en déclare pas.
  const poSaisie = po || d?.aucunePorteOuverte ? null : prochainePorteOuverteSaisie(x.evenements, maintenant)
  const evenementsSaisis = po || d?.aucunePorteOuverte ? [] : evenementsAVenir(x.evenements, maintenant)
  const photo = d?.galerie[0] ? { url: d.galerie[0].url, alt: d.galerie[0].legende, credit: d.credit } : f.image ? { url: f.image.url, alt: f.image.alt, credit: f.creditImage } : null
  const statut = ecole.statut === 'public' ? 'Public' : ecole.statut === 'prive' ? 'Privé' : null
  // « Lycée public » dit déjà le statut : on ne le répète pas.
  const nature = ecole.type ? (statut && !/public|priv/i.test(ecole.type) ? `${ecole.type}, ${statut.toLowerCase()}` : ecole.type) : statut
  const etapesDeclarees = d?.voiesAcces ?? []
  const etapes = etapesDeclarees.length ? etapesDeclarees.map((v) => ({ titre: v.titre, detail: v.detail || null, quand: v.quand || null })) : x.etapes
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: 'Formation', chemin: '/formation/' },
    { nom: famille.titre, chemin: `/formation/${TYPE}/` },
    { nom: f.titre, chemin: cheminFiche },
  ]

  const places = declarees && formations.some((fo) => fo.places) ? formations.reduce((s, fo) => s + (fo.places ?? 0), 0) : (ecole.capacite ?? x.capacite)
  const enApprentissage = formations.filter((fo) => fo.apprentissage)
  const max = niveauMax(formations)
  const chiffres = [
    formations.length > 0 && { v: String(formations.length), l: formations.length > 1 ? 'diplômes préparés' : 'diplôme préparé' },
    places && { v: places.toLocaleString('fr-FR'), l: declarees ? 'places par an' : 'places par promotion' },
    enApprentissage.length > 0 && { v: String(enApprentissage.length), l: enApprentissage.length > 1 ? 'diplômes en apprentissage' : 'diplôme en apprentissage' },
    max && { v: max, l: 'niveau le plus élevé' },
  ].filter((c): c is { v: string; l: string } => !!c)

  const blocs: BlocCarteHeros[] = [
    ...(po
      ? [{ icone: CalendarDays, titre: 'Prochaines portes ouvertes', valeur: dateLisible(po, true), grand: true }]
      : poSaisie
        ? [{ icone: CalendarDays, titre: 'Prochaines portes ouvertes', valeur: dateLisible(poSaisie.date, true), detail: poSaisie.detail, grand: true }]
        : []),
    ...(x.rentree ? [{ icone: GraduationCap, titre: 'Rentrée', valeur: x.rentree }] : []),
  ]
  const dateReleve = ecole.dateReleve ?? (x.dateReleve ? dateLisible(x.dateReleve) : null)
  const sourceReleve = dateReleve ? `Relevé le ${dateReleve} sur le site de l’établissement et les fiches de l’ONISEP.` : 'Relevé sur le site de l’établissement et les fiches de l’ONISEP.'
  const citation = presentation ? (d?.accroche ? { avant: d.accroche, suite: null, texte: presentation } : citationRelevee(presentation)) : null
  const frais = lignesFrais(x.frais ?? ecole.frais)
  const sources = [...new Set([...ecole.sources, ...x.sources])]

  return (
    <main>
      <Balisage donnees={filAriane(segments)} />
      <Balisage
        donnees={etablissementFormation({
          nom: f.titre,
          chemin: cheminFiche,
          universitaire: false,
          description: presentation,
          siteWeb,
          adresse,
          ville: f.ville,
          telephone,
          email,
          image: f.image?.url,
        })}
      />

      <Heros
        profession="prothesistes"
        position={position}
        rayon={9000}
        segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))}
        famille={famille.singulier}
        uai={f.uai}
        geree={!!declaration}
        gereePar="l’établissement"
        logo={f.logo}
        titre={f.titre}
        ligne={[nature, adresse ?? f.ville].filter(Boolean).join(' · ') || null}
        actions={
          <>
            {formations.length > 0 && (
              <BoutonHeros href="#formations" icone={GraduationCap} principal>
                Voir les formations
              </BoutonHeros>
            )}
            {siteWeb && (
              <BoutonHeros href={siteWeb} icone={Globe} externe>
                Site
              </BoutonHeros>
            )}
            {telephone && (
              <BoutonHeros href={`tel:${telephone.replace(/[\s.]/g, '')}`} icone={Phone}>
                Appeler
              </BoutonHeros>
            )}
          </>
        }
        photo={photo}
        blocs={blocs}
        chiffres={chiffres}
      />
      <BarreMobile
        titre={f.titre}
        detail={po ? `Portes ouvertes le ${dateLisible(po)}` : poSaisie ? `Portes ouvertes le ${dateLisible(poSaisie.date)}` : f.ville}
        secondaire={siteWeb && telephone ? { href: siteWeb, libelle: 'Site de l’établissement', icone: <Globe className="size-5" aria-hidden />, externe: true } : null}
        principal={
          telephone
            ? { href: `tel:${telephone.replace(/[\s.]/g, '')}`, libelle: 'Appeler', icone: <Phone className="size-4" aria-hidden /> }
            : siteWeb
              ? { href: siteWeb, libelle: 'Site', icone: <Globe className="size-4" aria-hidden />, externe: true }
              : null
        }
      />

      {citation && (
        <section id="presentation" className="container py-20 md:py-24">
          <Citation
            {...citation}
            mention={<Mention>{d?.presentation && declaration ? `Déclaré par l’établissement, confirmé le ${confirmeLe(declaration, 'presentation')}` : sourceReleve}</Mention>}
          />
        </section>
      )}

      {d && d.galerie.length > 0 && (
        <section className={`container pb-20 md:pb-24 ${citation ? '' : 'pt-20 md:pt-24'}`}>
          <Galerie photos={d.galerie} credit={d.credit} source={`Photos publiées par l’établissement, ${d.galerie.length} au total.`} />
        </section>
      )}

      {formations.length > 0 && (
        <Formations formations={formations} mention={declarees && declaration ? `Déclaré par l’établissement, confirmé le ${confirmeLe(declaration, 'formations')}` : sourceReleve} />
      )}

      {(etapes.length > 0 || x.prerequis.length > 0) && (
        <Admission
          etapes={etapes}
          prerequis={x.prerequis}
          rentree={x.rentree}
          mention={etapesDeclarees.length && declaration ? `Déclaré par l’établissement, confirmé le ${confirmeLe(declaration, 'voiesAcces')}` : sourceReleve}
        />
      )}

      {enApprentissage.length > 0 && <Alternance formations={enApprentissage} position={position} departement={departement} />}

      <Couts lignes={frais} sous="Ce que coûte la formation, tel que l’établissement le publie." mention={sourceReleve} />

      {po && declaration && (
        <Evenements
          sous="Venir voir les ateliers avant de candidater."
          evenements={[{ date: dateLisible(po), titre: 'Journée portes ouvertes' }]}
          mention={`Les dates passées disparaissent d’elles-mêmes. Déclarées par l’établissement, confirmées le ${confirmeLe(declaration, 'portesOuvertes')}.`}
        />
      )}
      {evenementsSaisis.length > 0 && (
        <Evenements
          sous="Venir voir les ateliers avant de candidater."
          evenements={evenementsSaisis.map((e) => ({ date: dateLisible(e.date), titre: e.titre, detail: e.detail }))}
          mention={`Les dates passées disparaissent d’elles-mêmes. ${sourceReleve}`}
        />
      )}

      <Contacts
        adresses={adresse ? [adresse] : f.ville ? [f.ville] : []}
        contact={telephone || email ? { titre: 'Accueil de l’établissement', telephone, email } : null}
        siteWeb={siteWeb}
        position={position}
        profession="prothesistes"
      />

      <RegistreEtAutres
        sous="Ces informations viennent des référentiels publics et des pages officielles, et ne sont pas modifiables par l’établissement."
        lignes={[
          ...(f.uai ? [['Numéro UAI', f.uai] as [string, string]] : []),
          ...(ecole.type ? [['Type', ecole.type] as [string, string]] : []),
          ...(statut ? [['Statut', statut] as [string, string]] : []),
          ...(ecole.diplomes.length ? [['Diplômes relevés', siglesDiplomes(ecole.diplomes)] as [string, string]] : []),
          ...(dateReleve ? [['Dernière vérification', dateReleve] as [string, string]] : []),
        ]}
        sources={sources}
        autresTitre="Former au même métier"
        autres={autres.map((a) => ({ href: lienFormation(a), nom: a.titre, detail: [a.ville, a.diplomes.length ? siglesDiplomes(a.diplomes) : a.diplome].filter(Boolean).join(' · ') || null }))}
        tousHref={`/formation/${TYPE}/`}
        tousLibelle={`Toutes les ${famille.titre.toLowerCase()}`}
        gestion={<EncartGestion slug={f.slug} geree={!!declaration} />}
      />
    </main>
  )
}

/* Formations proposées ------------------------------------------------- */
function Formations({ formations, mention }: { formations: FormationAffichee[]; mention: string }) {
  return (
    <section id="formations" className="scroll-mt-20 bg-bg-soft py-20 md:py-24">
      <div className="container">
        <Titre2 sous="Les diplômes préparés dans l’établissement, avec leur niveau, leur durée et leur voie.">Formations proposées</Titre2>
        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {formations.map((f) => {
            const lignes = [
              f.voies.length > 0 && ['Voie', f.voies.join(', ')],
              f.places && ['Places', `${f.places} par an`],
            ].filter((x): x is [string, string] => !!x)
            return (
              <li key={f.id} className="squircle-2xl flex flex-col border border-line bg-bg p-6">
                {(f.niveau || f.duree) && (
                  <div className="flex flex-wrap gap-1.5">
                    {f.niveau && <Pastille accent>{f.niveau}</Pastille>}
                    {f.duree && <Pastille>{f.duree}</Pastille>}
                  </div>
                )}
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-fg">{f.intitule}</h3>
                {f.acces && <p className="mt-1 text-sm text-fg-2">{f.acces}</p>}
                {lignes.length > 0 && (
                  <dl className="mt-6 flex-1 divide-y divide-line border-y border-line text-sm">
                    {lignes.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-fg-2">{k}</dt>
                        <dd className="text-right text-fg">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            )
          })}
        </ol>
        <div className="mt-4">
          <Mention>{mention}</Mention>
        </div>
      </div>
    </section>
  )
}

/* Admission, en étapes, avec ce que l'école attend ----------------------- */
function Admission({ etapes, prerequis, rentree, mention }: { etapes: { titre: string; detail: string | null; quand: string | null }[]; prerequis: string[]; rentree: string | null; mention: string }) {
  return (
    <section id="admission" className="container scroll-mt-20 py-20 md:py-24">
      <div className={`grid gap-12 ${etapes.length ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : ''}`}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Admission</h2>
          <p className="mt-5 leading-relaxed text-fg-2">
            {rentree ? `Du dépôt de la candidature à l’inscription, le calendrier de la rentrée : ${rentree.charAt(0).toLowerCase()}${rentree.slice(1)}.` : 'Du dépôt de la candidature à l’inscription, étape par étape.'}
          </p>
          {prerequis.length > 0 && (
            <div className="squircle-2xl mt-8 border border-line bg-bg-soft p-6">
              <p className="text-sm font-semibold text-fg">Ce que l’école attend</p>
              <ul className="mt-4 space-y-2.5">
                {prerequis.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-fg-2">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!etapes.length && (
            <div className="mt-4">
              <Mention>{mention}</Mention>
            </div>
          )}
        </div>
        {etapes.length > 0 && (
          <div>
            <Etapes etapes={etapes} />
            <div className="mt-4">
              <Mention>{mention}</Mention>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* Alternance, bande sombre avec les laboratoires autour ------------------ */
function Alternance({ formations, position, departement }: { formations: FormationAffichee[]; position: Position | null; departement: { slug: string; nom: string } | null }) {
  const n = formations.length
  return (
    <section className="dark bg-background py-20 text-fg md:py-24">
      <div className={`container grid gap-12 ${position ? 'lg:grid-cols-2 lg:items-center' : ''}`}>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            L’alternance
            <span className="block text-white/55">{n > 1 ? `${n} diplômes se préparent en apprentissage.` : 'Ce diplôme se prépare en apprentissage.'}</span>
          </h2>
          <ul className="mt-8 space-y-5">
            {formations.map((f) => (
              <li key={f.id} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
                  <Briefcase className="size-5 text-teal" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-white">{f.intitule}</p>
                  <p className="mt-1 text-sm text-white/65">{[f.niveau, f.duree, f.voies.join(', ')].filter(Boolean).join(' · ')}</p>
                </div>
              </li>
            ))}
          </ul>
          {departement && (
            <Link href={chemin(`/prothesistes/${departement.slug}/`)} className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0e1317]">
              Voir les laboratoires du département
            </Link>
          )}
        </div>
        {position && (
          <div className="squircle-2xl relative aspect-[4/3] overflow-hidden border border-line">
            <Carte profession="prothesistes" emprise={empriseAutour(position.lon, position.lat, 12000)} className="size-full" survol={clePosition(position.lon, position.lat)} />
            <div className="absolute bottom-3 left-3 rounded-full bg-bg/90 px-3 py-1 text-xs font-medium text-fg ring-1 ring-line">Laboratoires de prothèse autour de l’école</div>
          </div>
        )}
      </div>
    </section>
  )
}
