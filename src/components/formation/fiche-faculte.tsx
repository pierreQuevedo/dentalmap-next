import { CalendarDays, Clock, Globe, GraduationCap, HeartPulse, Phone, Stethoscope } from 'lucide-react'
import { FAMILLES, lienFormation } from '@/lib/formation/types'
import { nomCourt, postesInternat, sitesDe, type Faculte } from '@/lib/formation/faculte'
import { CYCLES_DEFAUT, decouper } from '@/lib/espace-pro/etablissement'
import {
  capacitesParAnnee,
  citationRelevee,
  dateLisible,
  dureeInternat,
  lignesFrais,
  prochainesPortesOuvertes,
  rentree,
} from '@/lib/formation/page-etablissement'
import { evenementsAVenir, prochainePorteOuverteSaisie, type DetailsFormation } from '@/lib/formation/details'
import { Balisage, etablissementFormation, filAriane } from '@/lib/seo/jsonld'
import type { FormationComplete, FormationResume } from '@/lib/wp/queries'
import type { DeclarationPublique } from '@/lib/espace-pro/etablissement-donnees'
import { CarteFaculte, type PointFaculte } from './carte-faculte'
import { EncartGestion } from './module-etablissement'
import {
  BarreMobile,
  BoutonHeros,
  Citation,
  Contacts,
  Couts,
  Etapes,
  Etiquette,
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
 * Page d'une faculté d'odontologie.
 *
 * Le contenu relevé dans WordPress (université, accès, capacité, cursus,
 * internat, lieux de soins, sources) et ce que la faculté déclare depuis son
 * espace, dans Neon (accroche, présentation, photos, étapes d'accès, cycles,
 * centres de soins détaillés, portes ouvertes) sont présentés côte à côte,
 * chacun avec sa provenance. Le groupe ACF « Formation, informations
 * détaillées » complète le relevé : étapes d'accès, frais, rendez-vous,
 * contact. Un bloc sans donnée ne s'affiche pas.
 */
export type FicheFaculteProps = {
  f: FormationComplete
  fac: Faculte
  declaration: DeclarationPublique | null
  position: Position | null
  /** Sites et lieux de soins géocodés, pour la carte des soins. */
  points: PointFaculte[]
  autres: FormationResume[]
}

const TYPE = 'facultes-odontologie'

type Centre = { id: string; nom: string; adresse: string | null; horaires: string | null; telephone: string | null }

export function FicheFaculte({ f, fac, declaration, position, points, autres }: FicheFaculteProps) {
  const famille = FAMILLES[TYPE]
  const cheminFiche = lienFormation(f)
  const d = declaration?.donnees ?? null
  const x = f.details
  const siteWeb = f.siteWeb ?? fac.siteWeb
  const universite = fac.universite ?? x.universite
  const telephone = fac.telephone ?? x.telephone
  const email = fac.email ?? x.email
  const presentation = d?.presentation ?? fac.presentation ?? f.extrait
  const po = prochainesPortesOuvertes(d)
  // Rendez-vous saisis dans WordPress, quand la faculté ne déclare pas de portes ouvertes.
  const poSaisie = po || d?.aucunePorteOuverte ? null : prochainePorteOuverteSaisie(x.evenements)
  const evenementsSaisis = po || d?.aucunePorteOuverte ? [] : evenementsAVenir(x.evenements)
  const photo = d?.galerie[0] ? { url: d.galerie[0].url, alt: d.galerie[0].legende, credit: d.credit } : f.image ? { url: f.image.url, alt: f.image.alt, credit: f.creditImage } : null
  const internat = postesInternat(fac)
  const sites = sitesDe(fac.adresse, f.titre)
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: 'Formation', chemin: '/formation/' },
    { nom: famille.titre, chemin: `/formation/${TYPE}/` },
    { nom: f.titre, chemin: cheminFiche },
  ]

  const centresDeclares = d?.centres ?? []
  const centres: Centre[] = centresDeclares.length
    ? centresDeclares.map((c) => ({
        id: c.id,
        nom: c.nom,
        adresse: c.adresse || null,
        horaires: c.jours.length && c.horaires ? `${c.jours.map((j) => j.charAt(0).toUpperCase() + j.slice(1, 3)).join(', ')} · ${c.horaires}` : c.horaires || null,
        telephone: c.telephone || null,
      }))
    : fac.centresDeSoins.map((c, i) => {
        const nom = nomCourt(c)
        const reste = c.slice(nom.length).replace(/^[\s,;:]+/, '')
        return { id: `centre-${i}`, nom, adresse: reste || null, horaires: null, telephone: null }
      })
  const soins = [...new Set(centresDeclares.flatMap((c) => c.soins))]

  const chiffres = [
    fac.capacite.nombre !== null && { v: fac.capacite.nombre.toLocaleString('fr-FR'), l: `places en 2e année${fac.capacite.annee ? `, ${rentree(fac.capacite.annee)}` : ''}` },
    f.duree && { v: f.duree, l: 'd’études, internat compris' },
    internat.total > 0 && { v: String(internat.total), l: `postes d’internat${internat.annee ? `, ${rentree(internat.annee)}` : ''}` },
    centres.length > 0 && { v: String(centres.length), l: centres.length > 1 ? 'lieux de soins ouverts aux patients' : 'lieu de soins ouvert aux patients' },
    fac.effectif && { v: fac.effectif.toLocaleString('fr-FR'), l: 'étudiants' },
  ]
    .filter((c): c is { v: string; l: string } => !!c)
    .slice(0, 4)

  const blocs: BlocCarteHeros[] = [
    ...(po
      ? [{ icone: CalendarDays, titre: 'Prochaines portes ouvertes', valeur: dateLisible(po, true), grand: true }]
      : poSaisie
        ? [{ icone: CalendarDays, titre: 'Prochaines portes ouvertes', valeur: dateLisible(poSaisie.date, true), detail: poSaisie.detail, grand: true }]
        : []),
    { icone: Clock, titre: 'Entrer en odontologie', valeur: 'PASS ou L.AS, puis admission en 2e année sur classement' },
  ]
  const dateReleve = fac.dateReleve ?? (x.dateReleve ? dateLisible(x.dateReleve) : null)
  const sourceReleve = dateReleve
    ? `Relevé le ${dateReleve} sur les pages officielles de l’université et les arrêtés publiés au Journal officiel.`
    : 'Relevé sur les pages officielles de l’université et les arrêtés publiés au Journal officiel.'
  const citation = presentation ? (d?.accroche ? { avant: d.accroche, suite: null, texte: presentation } : citationRelevee(presentation)) : null
  const galerie = d?.galerie ?? []
  const frais = lignesFrais(x.frais)

  return (
    <main>
      <Balisage donnees={filAriane(segments)} />
      <Balisage
        donnees={etablissementFormation({
          nom: f.titre,
          chemin: cheminFiche,
          universitaire: true,
          description: presentation,
          siteWeb,
          adresse: fac.adresse ?? x.adresse,
          ville: f.ville,
          telephone,
          email,
          image: f.image?.url,
        })}
      />

      <Heros
        profession="dentistes"
        position={position}
        rayon={2500}
        segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))}
        famille={famille.singulier}
        uai={f.uai}
        geree={!!declaration}
        gereePar="la faculté"
        logo={f.logo}
        titre={f.titre}
        sousTitre={universite}
        ligne={sites.map((s) => (sites.length > 1 ? `${s.nom}, ${s.adresse}` : s.adresse)).join(' · ') || f.ville}
        actions={
          <>
            <BoutonHeros href="#acces" icone={GraduationCap} principal>
              Accès aux études
            </BoutonHeros>
            {centres.length > 0 && (
              <BoutonHeros href="#soins" icone={HeartPulse}>
                Se faire soigner
              </BoutonHeros>
            )}
            {siteWeb && (
              <BoutonHeros href={siteWeb} icone={Globe} externe>
                Site
              </BoutonHeros>
            )}
          </>
        }
        photo={photo}
        blocs={blocs}
        chiffres={chiffres}
      />
      <BarreMobile
        titre={universite ? `${f.titre}, ${universite}` : f.titre}
        detail={po ? `Portes ouvertes le ${dateLisible(po)}` : poSaisie ? `Portes ouvertes le ${dateLisible(poSaisie.date)}` : f.ville}
        secondaire={centres.length > 0 ? { href: '#soins', libelle: 'Se faire soigner', icone: <HeartPulse className="size-5" aria-hidden /> } : null}
        principal={
          telephone
            ? { href: `tel:${telephone.replace(/[\s.]/g, '')}`, libelle: 'Appeler', icone: <Phone className="size-4" aria-hidden /> }
            : siteWeb
              ? { href: siteWeb, libelle: 'Site', icone: <Globe className="size-4" aria-hidden />, externe: true }
              : null
        }
      />

      {(citation || galerie.length > 0) && (
        <section id="presentation" className="container py-20 md:py-24">
          {citation && (
            <Citation
              {...citation}
              mention={<Mention>{d?.presentation && declaration ? `Déclaré par la faculté, confirmé le ${confirmeLe(declaration, 'presentation')}` : sourceReleve}</Mention>}
            />
          )}
          {galerie.length > 0 && (
            <div className={citation ? 'mt-12' : ''}>
              <Galerie photos={galerie} credit={d?.credit ?? null} source={`Photos publiées par la faculté, ${galerie.length} au total.`} />
            </div>
          )}
        </section>
      )}

      <Acces fac={fac} details={x} declaration={declaration} sourceReleve={sourceReleve} />
      <Cursus fac={fac} declaration={declaration} />
      <Internat fac={fac} sourceReleve={sourceReleve} />
      {centres.length > 0 && <Soins centres={centres} soins={soins} chu={fac.chu} points={points} declaration={declaration} sourceReleve={sourceReleve} />}

      <Couts lignes={frais} sous="Ce que coûtent les études, tel que l’université le publie." mention={sourceReleve} />

      {po && declaration && (
        <Evenements
          sous="Rencontrer la faculté avant de s’inscrire en santé."
          evenements={[{ date: dateLisible(po), titre: 'Journée portes ouvertes' }]}
          mention={`Les dates passées disparaissent d’elles-mêmes. Déclarées par la faculté, confirmées le ${confirmeLe(declaration, 'portesOuvertes')}.`}
        />
      )}
      {evenementsSaisis.length > 0 && (
        <Evenements
          sous="Rencontrer la faculté avant de s’inscrire en santé."
          evenements={evenementsSaisis.map((e) => ({ date: dateLisible(e.date), titre: e.titre, detail: e.detail }))}
          mention={`Les dates passées disparaissent d’elles-mêmes. ${sourceReleve}`}
        />
      )}

      <Contacts
        adresses={sites.length ? sites.map((s) => (sites.length > 1 ? `${s.nom}, ${s.adresse}` : s.adresse)) : f.ville ? [f.ville] : []}
        contact={telephone || email ? { titre: 'Scolarité', telephone, email } : null}
        siteWeb={siteWeb}
        position={position}
        profession="dentistes"
      />

      <RegistreEtAutres
        sous="Ces informations viennent des référentiels, des arrêtés et des pages officielles, et ne sont pas modifiables par la faculté."
        lignes={[
          ...(f.uai ? [['Numéro UAI', f.uai] as [string, string]] : []),
          ...(universite ? [['Université', universite] as [string, string]] : []),
          ...(fac.diplome ? [['Diplôme', fac.diplome] as [string, string]] : []),
          ...(fac.capacite.nombre !== null ? [['Places en 2e année', `${fac.capacite.nombre}${fac.capacite.annee ? `, ${fac.capacite.annee}` : ''}`] as [string, string]] : []),
          ...(fac.internats.length ? [['Postes d’internat', `${internat.total}${internat.annee ? `, ${internat.annee}` : ''}`] as [string, string]] : []),
          ...(dateReleve ? [['Dernière vérification', dateReleve] as [string, string]] : []),
        ]}
        sources={[...new Set([...fac.sources, ...x.sources])]}
        autresTitre="Autres facultés d’odontologie"
        autres={autres.map((a) => ({ href: lienFormation(a), nom: a.titre, detail: a.ville }))}
        tousHref={`/formation/${TYPE}/`}
        tousLibelle={`Toutes les ${famille.titre.toLowerCase()}`}
        gestion={<EncartGestion slug={f.slug} geree={!!declaration} />}
      />
    </main>
  )
}

/* Accès aux études, en étapes, avec les places en 2e année ---------------- */
function Acces({ fac, details, declaration, sourceReleve }: { fac: Faculte; details: DetailsFormation; declaration: DeclarationPublique | null; sourceReleve: string }) {
  const declarees = declaration?.donnees.voiesAcces ?? []
  // Le déclaratif, puis les étapes du champ ACF, puis les voies relevées dans le contenu.
  const etapes = declarees.length
    ? declarees.map((v) => ({ titre: v.titre, detail: v.detail || null, quand: v.quand || null }))
    : details.etapes.length
      ? details.etapes
      : // Le relevé sépare les voies par des points-virgules ; les virgules restent à l'intérieur d'une voie.
      (fac.voiesAcces ?? '')
        .split(/\s*;\s*/)
        .map((t) => t.replace(/\.$/, '').trim())
        .filter((t) => t.length > 1)
        .map((t) => ({ titre: t.charAt(0).toUpperCase() + t.slice(1), detail: null, quand: null }))
  const { annees, detail } = capacitesParAnnee(fac.capacite)
  const maxCap = Math.max(1, ...annees.map((c) => c.n))
  return (
    <section id="acces" className="scroll-mt-20 bg-bg-soft py-20 md:py-24">
      <div className={`container grid gap-12 ${etapes.length ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : ''}`}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Accès aux études</h2>
          <p className="mt-5 leading-relaxed text-fg-2">L’odontologie ne se choisit pas après le bac : on y entre en deuxième année, après une première année de santé.</p>
          <div className="squircle-2xl mt-8 border border-line bg-bg p-6">
            <p className="text-sm font-semibold text-fg">Places ouvertes en 2e année</p>
            {annees.length > 1 ? (
              <ul className="mt-5 flex h-36 items-end gap-3">
                {annees.map((c, i) => (
                  <li key={c.annee} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold tabular-nums text-fg">{c.n}</span>
                    <span className={`w-full rounded-t-lg ${i === annees.length - 1 ? 'bg-teal' : 'bg-teal/25'}`} style={{ height: Math.round((c.n / maxCap) * 96) }} />
                    <span className="text-xs tabular-nums text-fg-2">{c.annee}</span>
                  </li>
                ))}
              </ul>
            ) : fac.capacite.nombre !== null ? (
              <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight text-fg">
                {fac.capacite.nombre}
                {fac.capacite.annee && <span className="ml-2 text-sm font-normal text-fg-2">{fac.capacite.annee}</span>}
              </p>
            ) : (
              <p className="mt-3 text-sm text-fg-2">Chiffre non publié par l’université.</p>
            )}
            {detail && <p className="mt-4 text-sm leading-relaxed text-fg-2">{detail}</p>}
            <p className="mt-4 text-xs text-fg-2">Source : {sourceReleve.charAt(0).toLowerCase() + sourceReleve.slice(1)}</p>
          </div>
        </div>
        {etapes.length > 0 && (
          <div>
            <Etapes etapes={etapes} />
            <div className="mt-4">
              <Mention>{declarees.length && declaration ? `Déclaré par la faculté, confirmé le ${confirmeLe(declaration, 'voiesAcces')}` : sourceReleve}</Mention>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* Cursus, en frise de cycles ------------------------------------------------ */
function Cursus({ fac, declaration }: { fac: Faculte; declaration: DeclarationPublique | null }) {
  const d = declaration?.donnees
  const cycles = d?.cycles.length ? d.cycles : CYCLES_DEFAUT
  const autresDiplomes = d?.autresDiplomes.length ? d.autresDiplomes : decouper(fac.autresDiplomes, 20)
  return (
    <section id="cursus" className="container scroll-mt-20 py-20 md:py-24">
      <Titre2 sous="Six ans de la première année de santé au diplôme d’État, puis l’internat pour ceux qui se spécialisent.">Le cursus</Titre2>
      <ol className="mt-10 grid gap-3 md:grid-cols-3">
        {cycles.map((c, i) => (
          <li key={c.id} className="squircle-2xl relative border border-line bg-bg-soft p-6">
            <div className="flex items-center justify-between">
              {c.annees ? <Pastille accent>{c.annees}</Pastille> : <span />}
              <span className="text-4xl font-light tabular-nums text-fg-2">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight text-fg">{c.titre}</h3>
            {c.detail && <p className="mt-3 text-sm leading-relaxed text-fg-2">{c.detail}</p>}
          </li>
        ))}
      </ol>
      {autresDiplomes.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-fg">Après le diplôme, à la faculté</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {autresDiplomes.map((x) => (
              <Etiquette key={x}>{x}</Etiquette>
            ))}
          </div>
        </div>
      )}
      {d?.cycles.length && declaration ? (
        <div className="mt-4">
          <Mention>Déclaré par la faculté, confirmé le {confirmeLe(declaration, 'cursus')}</Mention>
        </div>
      ) : null}
    </section>
  )
}

/* Internat, bande sombre ------------------------------------------------------ */
function Internat({ fac, sourceReleve }: { fac: Faculte; sourceReleve: string }) {
  const { total, annee } = postesInternat(fac)
  const lignes = fac.internats.filter((i) => i.postes !== null && (!annee || !i.annee || i.annee === annee))
  if (!fac.internats.length) return null
  return (
    <section id="internat" className="dark scroll-mt-20 bg-background py-20 text-fg md:py-24">
      <div className="container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          L’internat en odontologie
          <span className="block text-white/55">
            {total > 0 ? 'Trois spécialités, sur concours national à la fin de la sixième année.' : 'Aucun poste ouvert sur ce site à la date du relevé : le concours se passe pour un autre CHU.'}
          </span>
        </h2>
        <div>
          {lignes.length > 0 && (
            <ul className="divide-y divide-line border-y border-line">
              {lignes.map((i) => {
                const duree = dureeInternat(i.specialite)
                return (
                  <li key={i.specialite} className="grid grid-cols-[1fr_auto] items-center gap-4 py-5">
                    <div>
                      <p className="text-lg font-semibold text-white">{i.specialite}</p>
                      {duree && <p className="text-sm text-white/60">{duree} d’internat</p>}
                    </div>
                    <p className="text-right">
                      <span className="block text-3xl font-semibold tabular-nums text-white">{i.postes}</span>
                      <span className="text-xs text-white/60">{i.postes === 1 ? 'poste' : 'postes'}{(i.annee ?? annee) ? ` en ${rentree(i.annee ?? annee)?.replace('rentrée ', '')}` : ''}</span>
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-white/55">
            Source : {sourceReleve.charAt(0).toLowerCase() + sourceReleve.slice(1)}
            {fac.chu && ` Rattachement hospitalier : ${fac.chu}.`}
          </p>
        </div>
      </div>
    </section>
  )
}

/* Se faire soigner : la section pour les patients ------------------------------ */
function Soins({
  centres,
  soins,
  chu,
  points,
  declaration,
  sourceReleve,
}: {
  centres: Centre[]
  soins: string[]
  chu: string | null
  points: PointFaculte[]
  declaration: DeclarationPublique | null
  sourceReleve: string
}) {
  const declares = !!declaration?.donnees.centres.length
  return (
    <section id="soins" className="container scroll-mt-20 py-20 md:py-24">
      <div className={`grid gap-12 ${points.length ? 'lg:grid-cols-2 lg:items-start' : ''}`}>
        <div className="min-w-0">
          <Etiquette>Pour les patients</Etiquette>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Se faire soigner à la faculté</h2>
          <p className="mt-4 leading-relaxed text-fg-2">
            Les centres de soins reçoivent tous les patients. Les soins sont réalisés par les étudiants de quatrième à sixième année, encadrés par des praticiens
            hospitaliers, aux tarifs de la Sécurité sociale. Les séances sont plus longues qu’en cabinet.
          </p>
          {chu && !declares && <p className="mt-3 text-sm leading-relaxed text-fg-2">{chu}.</p>}
          {soins.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {soins.map((s) => (
                <Etiquette key={s}>{s}</Etiquette>
              ))}
            </div>
          )}
          <ul className="mt-8 space-y-3">
            {centres.map((c) => (
              <li key={c.id} className="squircle-2xl flex flex-wrap items-center justify-between gap-4 border border-line bg-bg-soft p-5">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-fg">
                    <Stethoscope className="size-4 shrink-0 text-teal" aria-hidden /> {c.nom}
                  </p>
                  {c.adresse && <p className="mt-1 text-sm text-fg-2">{c.adresse}</p>}
                  {c.horaires && <p className="text-sm text-fg-2">{c.horaires}</p>}
                </div>
                {c.telephone && (
                  <a href={`tel:${c.telephone.replace(/[\s.]/g, '')}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                    <Phone className="size-4" aria-hidden /> Rendez-vous
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Mention>{declares && declaration ? `Déclaré par la faculté, confirmé le ${confirmeLe(declaration, 'centres')}` : sourceReleve}</Mention>
          </div>
        </div>
        {points.length > 0 && (
          <div className="squircle-2xl relative aspect-square overflow-hidden border border-line bg-bg-soft">
            <CarteFaculte points={points} />
          </div>
        )}
      </div>
    </section>
  )
}
