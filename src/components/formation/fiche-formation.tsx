import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Award,
  Building2,
  Clock,
  ExternalLink,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Repeat,
  Stethoscope,
  Users,
} from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import type { FormationType } from '@/lib/navigation'
import { FAMILLES, lienFormation } from '@/lib/formation/types'
import { postesInternat, type Ecole, type Faculte } from '@/lib/formation/faculte'
import { Balisage, etablissementFormation, filAriane } from '@/lib/seo/jsonld'
import type { FormationComplete, FormationResume } from '@/lib/wp/queries'
import { CarteFaculte, type PointFaculte } from './carte-faculte'
import { CarteFormation } from './carte-formation'

/**
 * Fiche d'un établissement de formation.
 *
 * Une fiche se lit comme une page de présentation, pas comme un article :
 * l'en-tête met l'établissement en situation, une rangée de chiffres donne
 * l'essentiel d'un coup d'œil, puis chaque module répond à une question du
 * lecteur, dans l'ordre où il se la pose : comment on y entre, ce qu'on y
 * fait après le diplôme, où l'on soigne. Les coordonnées restent à portée de
 * main dans la colonne de droite. Les facultés d'odontologie et les écoles de
 * prothèse, dont le contenu est balisé, reçoivent leurs modules ; les autres
 * formations gardent leur contenu tel que le CMS le livre, dans la même mise
 * en page.
 */
export type FicheFormationProps = {
  f: FormationComplete
  type: FormationType
  faculte: Faculte | null
  ecole: Ecole | null
  points: PointFaculte[]
  /** Autres formations de la même famille, les plus proches d'abord. */
  autres: FormationResume[]
  regionNom: string | null
}

export function FicheFormation({ f, type, faculte: fac, ecole, points, autres, regionNom }: FicheFormationProps) {
  const famille = FAMILLES[type]
  const cheminFiche = lienFormation(f)
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: 'Formation', chemin: '/formation/' },
    { nom: famille.titre, chemin: `/formation/${type}/` },
    { nom: f.titre, chemin: cheminFiche },
  ]
  const etab = fac ?? ecole
  const siteWeb = f.siteWeb ?? etab?.siteWeb ?? null
  const presentation = etab?.presentation ?? f.extrait
  const internat = fac ? postesInternat(fac) : null
  const sommaire = fac
    ? [
        { id: 'parcours', libelle: 'Le parcours' },
        { id: 'internat', libelle: 'L’internat' },
        { id: 'soins', libelle: 'Soins et hôpital' },
        { id: 'sources', libelle: 'Sources' },
      ]
    : ecole
      ? [
          { id: 'diplomes', libelle: 'Les diplômes' },
          { id: 'admission', libelle: 'Admission et coût' },
          { id: 'lieu', libelle: 'Où se trouve l’école' },
          { id: 'sources', libelle: 'Sources' },
        ]
      : []

  return (
    <main className="pb-20">
      <Balisage donnees={filAriane(segments)} />
      <Balisage
        donnees={etablissementFormation({
          nom: f.titre,
          chemin: cheminFiche,
          universitaire: type === 'facultes-odontologie',
          description: presentation,
          siteWeb,
          adresse: etab?.adresse,
          ville: f.ville,
          telephone: etab?.telephone,
          email: etab?.email,
          image: f.image?.url,
        })}
      />

      <div className="container pt-8">
        <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />

        {/* En-tête : l'établissement en situation, texte à gauche, photo à droite. */}
        {/* Sans photo, pas de cadre vide : le texte prend toute la largeur. */}
        <header className={`mt-8 grid gap-8 ${f.image ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center' : ''}`}>
          <div className="min-w-0">
            {f.logo && (
              <div className="squircle-xl mb-5 inline-flex h-20 max-w-[18rem] items-center border border-line bg-white px-4 py-3">
                {/* Le logo garde ses couleurs sur fond blanc, même en mode sombre. */}
                <Image src={f.logo.url} alt={f.logo.alt || `Logo, ${f.titre}`} width={240} height={56} className="max-h-14 w-auto max-w-full object-contain" />
              </div>
            )}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2">
              <span className="inline-flex rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
                {famille.singulier}
              </span>
              {fac?.universite && <span>{fac.universite}</span>}
              {ecole?.type && (
                <span>
                  {ecole.type}
                  {/* « Lycée public » dit déjà le statut : on ne le répète pas. */}
                  {ecole.statut && !/public|priv/i.test(ecole.type) && `, ${ecole.statut === 'public' ? 'public' : 'privé'}`}
                </span>
              )}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">{f.titre}</h1>
            {presentation && <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-fg-2">{presentation}</p>}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {siteWeb && (
                <a
                  href={siteWeb}
                  rel="noopener"
                  className="hover-lift inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover"
                >
                  Site de l’établissement
                  <ArrowUpRight className="size-4" aria-hidden />
                </a>
              )}
              {points.length > 0 ? (
                <a
                  href={fac ? '#soins' : '#lieu'}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-bg px-5 text-sm font-medium text-fg hover:bg-bg-soft"
                >
                  <MapPin className="size-4" aria-hidden />
                  Voir sur la carte
                </a>
              ) : (
                etab?.email && (
                  <a href={`mailto:${etab.email}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-bg px-5 text-sm font-medium text-fg hover:bg-bg-soft">
                    <Mail className="size-4" aria-hidden />
                    Écrire à l’établissement
                  </a>
                )
              )}
            </div>
          </div>

          {f.image && (
            <figure className="min-w-0">
              <div className="squircle-2xl relative aspect-[4/3] overflow-hidden border border-line bg-bg-soft">
                <Image src={f.image.url} alt={f.image.alt} fill priority sizes="(min-width: 1024px) 30rem, 100vw" className="object-cover dark:brightness-[0.42]" />
              </div>
              {f.creditImage && <figcaption className="mt-2 text-xs text-fg-2">{f.creditImage}</figcaption>}
            </figure>
          )}
        </header>

        {/* Chiffres clés : quatre tuiles, jamais plus. */}
        <dl className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {fac ? (
            <>
              <Tuile
                icone={GraduationCap}
                libelle="Places en 2e année"
                valeur={fac.capacite.nombre?.toLocaleString('fr-FR') ?? '—'}
                note={fac.capacite.nombre ? fac.capacite.annee ?? undefined : 'chiffre non publié'}
              />
              <Tuile
                icone={Users}
                libelle="Étudiants"
                valeur={fac.effectif?.toLocaleString('fr-FR') ?? '—'}
                note={fac.effectif ? 'toutes années confondues' : 'effectif non publié'}
              />
              <Tuile
                icone={Stethoscope}
                libelle="Postes d’internat"
                valeur={internat!.total.toLocaleString('fr-FR')}
                note={internat!.total > 0 ? internat!.annee ?? undefined : 'aucun poste ouvert'}
              />
              <Tuile icone={Clock} libelle="Durée des études" valeur={f.duree ?? '—'} note="internat compris" />
            </>
          ) : ecole ? (
            <>
              <Tuile
                icone={Award}
                libelle="Diplômes"
                valeur={String(ecole.diplomes.length)}
                note={[...new Set(ecole.diplomes.map((d) => d.niveau).filter(Boolean))].join(', ') || undefined}
              />
              <Tuile
                icone={Landmark}
                libelle="Statut"
                valeur={ecole.statut === 'public' ? 'Public' : ecole.statut === 'prive' ? 'Privé' : '—'}
                note={ecole.type ?? undefined}
              />
              <Tuile icone={Repeat} libelle="Rythme" valeur={rythme(ecole)} petite />
              <Tuile
                icone={Users}
                libelle="Places par promotion"
                valeur={ecole.capacite?.toLocaleString('fr-FR') ?? '—'}
                note={ecole.capacite ? undefined : 'non publié'}
              />
            </>
          ) : (
            <>
              <Tuile icone={Award} libelle="Diplôme" valeur={f.diplome ?? '—'} petite />
              <Tuile icone={Clock} libelle="Durée" valeur={f.duree ?? '—'} />
              <Tuile icone={MapPin} libelle="Ville" valeur={f.ville ?? '—'} />
              <Tuile icone={Building2} libelle="Famille" valeur={famille.pastille} />
            </>
          )}
        </dl>

        <div className="mt-14 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0 space-y-16">
            {fac ? (
              <>
                <ModuleParcours fac={fac} />
                <ModuleInternat fac={fac} />
                <ModuleSoins fac={fac} points={points} />
                <ModuleSources sources={fac.sources} dateReleve={fac.dateReleve} />
              </>
            ) : ecole ? (
              <>
                <ModuleDiplomes ecole={ecole} />
                <ModuleAdmission ecole={ecole} />
                <ModuleLieu ecole={ecole} points={points} />
                <ModuleSources sources={ecole.sources} dateReleve={ecole.dateReleve} />
              </>
            ) : (
              f.contenu && (
                <div
                  className="text-fg [&_a]:text-action [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: f.contenu }}
                />
              )
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="squircle-2xl border border-line bg-bg-soft p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">Coordonnées</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {(etab?.adresse || f.ville) && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                    <span className="text-fg">{etab?.adresse ?? f.ville}</span>
                  </li>
                )}
                {etab?.telephone && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                    <a href={`tel:${etab.telephone.replace(/\s/g, '')}`} className="tabular-nums text-fg hover:underline">
                      {etab.telephone}
                    </a>
                  </li>
                )}
                {etab?.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                    <a href={`mailto:${etab.email}`} className="break-all text-fg hover:underline">
                      {etab.email}
                    </a>
                  </li>
                )}
                {siteWeb && (
                  <li className="flex gap-3">
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                    <a href={siteWeb} rel="noopener" className="break-all text-fg hover:underline">
                      {siteWeb.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </li>
                )}
              </ul>
              {etab?.adresse && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(etab.adresse.split(';')[0]!)}`}
                  rel="noopener"
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-line bg-bg text-sm font-medium text-fg hover:bg-bg-soft"
                >
                  <Navigation className="size-4" aria-hidden />
                  Itinéraire
                </a>
              )}
            </div>

            {sommaire.length > 0 && (
              <nav aria-label="Sommaire" className="squircle-2xl border border-line p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">Sur cette page</h2>
                <ol className="mt-3 space-y-1.5 text-sm">
                  {sommaire.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-fg hover:underline">
                        {s.libelle}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <p className="px-1 text-xs leading-relaxed text-fg-2">
              {etab?.dateReleve
                ? fac
                  ? `Informations relevées le ${etab.dateReleve} sur les pages officielles de l’établissement et les arrêtés publiés au Journal officiel.`
                  : `Informations relevées le ${etab.dateReleve} sur le site de l’établissement et les fiches de l’ONISEP.`
                : 'Informations transmises par l’établissement ou relevées sur son site.'}{' '}
              <Link href={chemin('/contact/?objet=autre')} className="underline underline-offset-2 hover:text-fg">
                Signaler une erreur
              </Link>
              .
            </p>
          </aside>
        </div>

        {autres.length > 0 && (
          <section className="mt-20 border-t border-line pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">
                {regionNom ? `${famille.titre} ${regionNom}` : `Autres ${famille.titre.toLowerCase()}`}
              </h2>
              <Link href={chemin(`/formation/${type}/`)} className="inline-flex items-center gap-1 text-sm font-medium text-fg hover:underline">
                Toutes les {famille.titre.toLowerCase()}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {autres.map((a) => (
                <CarteFormation key={a.slug} formation={a} />
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  )
}

/** « Initiale », « Apprentissage » ou les deux, d'après les modalités des diplômes. */
function rythme(e: Ecole): string {
  const m = new Set(e.diplomes.map((d) => (d.modalite ?? '').toLowerCase()))
  const initiale = [...m].some((x) => x.includes('initiale'))
  const apprentissage = [...m].some((x) => x.includes('apprentissage'))
  if (initiale && apprentissage) return 'Initiale ou apprentissage'
  if (apprentissage) return 'Apprentissage'
  if (initiale) return 'Formation initiale'
  return [...m].filter(Boolean)[0] ?? '—'
}

function Tuile({
  icone: Icone,
  libelle,
  valeur,
  note,
  petite,
}: {
  icone: typeof Clock
  libelle: string
  valeur: string
  note?: string
  petite?: boolean
}) {
  return (
    <div className="squircle-xl border border-line bg-bg-soft p-4 md:p-5">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-fg-2">
        <Icone className="size-4 text-teal" aria-hidden />
        {libelle}
      </dt>
      <dd className="mt-3">
        <span className={`block font-semibold tracking-tight text-fg ${petite ? 'text-base leading-snug' : 'text-3xl tabular-nums'}`}>{valeur}</span>
        {note && <span className="mt-1 block text-xs text-fg-2">{note}</span>}
      </dd>
    </div>
  )
}

function Module({ id, titre, intro, children }: { id: string; titre: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-24">
      <h2 id={`${id}-titre`} className="text-2xl font-semibold tracking-tight text-fg">
        {titre}
      </h2>
      {intro && <p className="mt-2 max-w-2xl text-fg-2">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Facultés d'odontologie                                               */
/* ------------------------------------------------------------------ */

/** Les étapes communes à toutes les facultés : elles cadrent ce que la faculté dit de ses voies d'accès. */
const ETAPES = [
  { titre: 'Première année', duree: '1 an', detail: 'PASS ou L.AS à l’université, puis sélection sur les places ouvertes en odontologie.' },
  { titre: 'Premier cycle', duree: '2 ans', detail: 'DFGSO, deuxième et troisième années : sciences fondamentales et premiers gestes sur simulateur.' },
  { titre: 'Deuxième cycle', duree: '2 ans', detail: 'DFASO, quatrième et cinquième années : les soins aux patients commencent, au centre de soins du CHU.' },
  { titre: 'Troisième cycle', duree: '1 an, ou 3 à 4 ans', detail: 'Cycle court, thèse et diplôme d’État de docteur en chirurgie dentaire ; ou internat, sur concours national.' },
]

function ModuleParcours({ fac }: { fac: Faculte }) {
  return (
    <Module id="parcours" titre="Le parcours" intro="Six ans au minimum, huit à neuf avec l’internat. Le cursus est le même dans toutes les facultés ; ce qui change, c’est la porte d’entrée.">
      <ol className="relative grid gap-6 md:grid-cols-4 md:gap-4">
        <span aria-hidden className="absolute left-3 top-0 h-full w-px bg-line md:left-0 md:top-3 md:h-px md:w-full" />
        {ETAPES.map((e, i) => (
          <li key={e.titre} className="relative pl-10 md:pl-0 md:pt-8">
            <span className="absolute left-0 top-0 flex size-6 items-center justify-center rounded-full border-2 border-bg bg-teal text-xs font-semibold text-white md:-top-0 md:left-0">
              {i + 1}
            </span>
            <p className="text-xs font-medium uppercase tracking-wide text-fg-2">{e.duree}</p>
            <p className="mt-1 font-semibold text-fg">{e.titre}</p>
            <p className="mt-1 text-sm text-fg-2">{e.detail}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="squircle-xl border border-line p-5">
          <h3 className="text-sm font-semibold text-fg">Voies d’accès</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">{fac.voiesAcces ?? 'Non renseignées.'}</p>
        </div>
        <div className="squircle-xl border border-line p-5">
          <h3 className="text-sm font-semibold text-fg">Places en deuxième année</h3>
          {fac.capacite.nombre ? (
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-fg">
              {fac.capacite.nombre.toLocaleString('fr-FR')}
              {fac.capacite.annee && <span className="ml-2 text-sm font-normal text-fg-2">{fac.capacite.annee}</span>}
            </p>
          ) : (
            <p className="mt-2 text-sm text-fg-2">Chiffre non publié par l’université.</p>
          )}
          {fac.capacite.detail && <p className="mt-2 text-sm leading-relaxed text-fg-2">{fac.capacite.detail}</p>}
        </div>
      </div>

      {(fac.diplome || fac.autresDiplomes) && (
        <ul className="mt-4 divide-y divide-line squircle-xl border border-line">
          {fac.diplome && (
            <li className="flex flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:items-center sm:gap-3">
              <span className="inline-flex items-center gap-3 text-fg">
                <Award className="size-4 shrink-0 text-teal" aria-hidden />
                {fac.diplome}
              </span>
              {fac.duree && <span className="pl-7 text-fg-2 sm:ml-auto sm:shrink-0 sm:pl-0">{fac.duree}</span>}
            </li>
          )}
          {fac.autresDiplomes && (
            <li className="flex items-center gap-3 px-5 py-3 text-sm">
              <Award className="size-4 shrink-0 text-fg-2" aria-hidden />
              <span className="text-fg">{fac.autresDiplomes}</span>
            </li>
          )}
        </ul>
      )}
    </Module>
  )
}

const SPECIALITES_INTERNAT = ['Orthopédie dento-faciale', 'Chirurgie orale', 'Médecine bucco-dentaire']

function ModuleInternat({ fac }: { fac: Faculte }) {
  const { total, annee } = postesInternat(fac)
  const lignes = SPECIALITES_INTERNAT.map((s) => {
    const i = fac.internats.find((x) => x.specialite.toLowerCase().startsWith(s.toLowerCase().slice(0, 10)))
    return { specialite: s, postes: i?.postes ?? 0, texte: i?.texte ?? null }
  })
  const maximum = Math.max(1, ...lignes.map((l) => l.postes))
  return (
    <Module
      id="internat"
      titre="L’internat"
      intro={
        total > 0
          ? `Postes ouverts au concours national d’internat en odontologie pour ${annee ?? 'la dernière année publiée'}, dans les trois spécialités.`
          : 'Aucun poste d’internat n’est ouvert sur ce site à la date du relevé : les étudiants qui visent une spécialité passent le concours pour un autre CHU.'
      }
    >
      {total > 0 && (
        <ul className="space-y-4">
          {lignes.map((l) => (
            <li key={l.specialite} className="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-4 text-sm">
              <span className="truncate text-fg">{l.specialite}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-bg-soft ring-1 ring-inset ring-line">
                <span
                  className="block h-full rounded-full bg-teal transition-[width] duration-slow ease-lift"
                  style={{ width: `${(l.postes / maximum) * 100}%` }}
                />
              </span>
              <span className="w-16 text-right tabular-nums text-fg">
                {l.postes} {l.postes > 1 ? 'postes' : 'poste'}
              </span>
            </li>
          ))}
        </ul>
      )}
      {fac.internats.some((i) => /\d{4}-\d{4}\)?,/.test(i.texte)) && (
        <p className="mt-4 text-xs text-fg-2">
          Évolution : {fac.internats.map((i) => i.texte).join(' · ')}.
        </p>
      )}
    </Module>
  )
}

function ModuleSoins({ fac, points }: { fac: Faculte; points: PointFaculte[] }) {
  return (
    <Module
      id="soins"
      titre="Soins et hôpital"
      intro="Les étudiants soignent sous la responsabilité du CHU, à partir de la quatrième année. Ce sont ces lieux qui reçoivent le public."
    >
      {points.length > 0 && (
        <div className="squircle-2xl relative h-[22rem] overflow-hidden border border-line bg-bg-soft">
          <CarteFaculte points={points} />
        </div>
      )}
      {fac.chu && (
        <p className="mt-5 flex gap-3 text-sm leading-relaxed text-fg">
          <Building2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
          <span>{fac.chu}</span>
        </p>
      )}
      {fac.centresDeSoins.length > 0 && (
        <ol className="mt-4 divide-y divide-line squircle-xl border border-line">
          {fac.centresDeSoins.map((c, i) => (
            <li key={c} className="flex gap-3 px-5 py-3 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-fg text-[11px] font-semibold text-bg">{i + 1}</span>
              <span className="text-fg">{c}</span>
            </li>
          ))}
        </ol>
      )}
      {points.length > 0 && points.length < fac.centresDeSoins.length + 1 && (
        <p className="mt-3 text-xs text-fg-2">Seuls les lieux dont l’adresse est connue avec précision sont placés sur la carte.</p>
      )}
    </Module>
  )
}

/* ------------------------------------------------------------------ */
/* Écoles de prothèse dentaire                                          */
/* ------------------------------------------------------------------ */

function ModuleDiplomes({ ecole }: { ecole: Ecole }) {
  return (
    <Module
      id="diplomes"
      titre="Les diplômes"
      intro={
        ecole.diplomes.length > 1
          ? 'Plusieurs diplômes de prothèse dentaire se préparent ici, du bac professionnel au niveau bac+2 ou bac+3, en formation initiale ou en apprentissage.'
          : 'Le diplôme préparé dans cet établissement, avec sa durée et son rythme.'
      }
    >
      <ol className="divide-y divide-line squircle-xl border border-line">
        {ecole.diplomes.map((d) => (
          <li key={d.intitule} className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <Award className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
              <div className="min-w-0">
                <p className="font-medium text-fg">{d.intitule}</p>
                {d.modalite && <p className="mt-0.5 text-sm text-fg-2">{d.modalite}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-0">
              {d.niveau && <span className="rounded-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-fg ring-1 ring-inset ring-line">{d.niveau}</span>}
              {d.duree && (
                <span className="inline-flex items-center gap-1 text-sm text-fg-2">
                  <Clock className="size-3.5" aria-hidden />
                  {d.duree}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Module>
  )
}

function ModuleAdmission({ ecole }: { ecole: Ecole }) {
  const prive = ecole.statut === 'prive'
  return (
    <Module
      id="admission"
      titre="Admission et coût"
      intro={
        prive
          ? 'Établissement privé : les frais de scolarité sont ceux que l’école publie, l’apprentissage les prend en charge quand il est proposé.'
          : 'Établissement public : la formation initiale est gratuite, l’apprentissage est rémunéré.'
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="squircle-xl border border-line p-5">
          <h3 className="text-sm font-semibold text-fg">Places par promotion</h3>
          {ecole.capacite ? (
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-fg">{ecole.capacite.toLocaleString('fr-FR')}</p>
          ) : (
            <p className="mt-2 text-sm text-fg-2">Non publié par l’établissement.</p>
          )}
        </div>
        <div className="squircle-xl border border-line p-5">
          <h3 className="text-sm font-semibold text-fg">Frais de scolarité</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">
            {ecole.frais ?? (prive ? 'Non publiés par l’établissement.' : 'Gratuit en formation initiale, hors frais d’inscription et de matériel.')}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-fg-2">
        Les modalités d’inscription changent chaque année : vérifiez-les auprès de l’établissement avant de candidater.
      </p>
    </Module>
  )
}

function ModuleLieu({ ecole, points }: { ecole: Ecole; points: PointFaculte[] }) {
  return (
    <Module id="lieu" titre="Où se trouve l’école" intro={ecole.adresse ?? undefined}>
      {points.length > 0 ? (
        <div className="squircle-2xl relative h-[20rem] overflow-hidden border border-line bg-bg-soft">
          <CarteFaculte points={points} />
        </div>
      ) : (
        <p className="text-sm text-fg-2">L’adresse n’a pas pu être placée sur la carte.</p>
      )}
    </Module>
  )
}

function ModuleSources({ sources, dateReleve }: { sources: string[]; dateReleve: string | null }) {
  return (
    <Module id="sources" titre="Sources" intro="Rien de déclaratif : chaque information vient d’une page officielle, de l’établissement ou de l’ONISEP.">
      <details className="group squircle-xl border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
          {sources.length} {sources.length > 1 ? 'pages consultées' : 'page consultée'}
          {dateReleve && <span className="text-xs font-normal text-fg-2">relevé du {dateReleve}</span>}
        </summary>
        <ul className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
          {sources.map((u) => (
            <li key={u} className="truncate">
              <a href={u} rel="noopener" className="text-action underline underline-offset-4">
                {u.replace(/^https?:\/\//, '')}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </Module>
  )
}
