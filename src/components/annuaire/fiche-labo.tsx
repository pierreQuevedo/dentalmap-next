/**
 * Fiche d'un laboratoire de prothèse dentaire.
 *
 * Lue d'abord par des cabinets : en-tête sombre sur la zone desservie, chiffres
 * clés, présentation en citation et tableau du savoir-faire, délais en frise,
 * puis ce que dit la base Sirene. Tout ce qui n'est pas Sirene est renseigné
 * par le laboratoire, et la fiche le dit.
 */
import Link from 'next/link'
import { Cpu, ExternalLink, FileCheck2, Gem, Globe, Languages, Navigation, Quote, Truck, Wrench } from 'lucide-react'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { aDesHoraires } from '@/lib/annuaire/ouverture'
import { LANGUES, libelle, type FicheCompletee } from '@/lib/espace-pro/fiche-completee'
import { JOURS_RAMASSAGE, MATERIAUX, TECHNIQUES, formaterSiret, libelleDe } from '@/lib/espace-pro/labo'
import { chemin } from './primitives'
import { BadgeRecruteFiche } from './recrutement'
import { BoutonAppeler } from './telephone-protege'
import { SectionDelais, delaisAffiches } from './delais'
import {
  ArianeSombre,
  AsideFiche,
  BarreMobile,
  BOUTON_PRINCIPAL,
  BOUTON_SOMBRE,
  BoutonFavori,
  BoutonItineraire,
  Etiquette,
  FondCarte,
  MarqueGeree,
  MarqueSombre,
  PastilleSombre,
  Photo,
  Registre,
  Renseigne,
  Semaine,
  Titre2,
  VerificationSombre,
  dateLongue,
  lienItineraire,
  type ContexteFiche,
} from './fiche-blocs'

/** Rayon de la carte d'en-tête sans zone déclarée, en mètres. */
const RAYON_SANS_ZONE = 2_000

/** « Lundi, mardi » ou « chaque jour ouvré » quand le ramassage couvre la semaine. */
function joursDeRamassage(codes: string[]): string | null {
  if (!codes.length) return null
  const ouvres = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
  if (ouvres.every((j) => codes.includes(j))) return 'chaque jour ouvré'
  const noms = JOURS_RAMASSAGE.filter((j) => codes.includes(j.code)).map((j) => j.code)
  return noms.length > 1 ? `le ${noms.slice(0, -1).join(', ')} et le ${noms.at(-1)}` : `le ${noms[0]}`
}

export function FicheLabo({ c }: { c: ContexteFiche }) {
  const { p, fiche: f, principal } = c
  const delais = f ? delaisAffiches(f, c.maintenant) : []
  const min = delais.length ? Math.min(...delais.map((d) => d.jours)) : 0
  const max = delais.length ? Math.max(...delais.map((d) => d.jours)) : 0
  const plage = delais.length ? (min === max ? `${min} j` : `${min} à ${max} j`) : null
  const ramassage = f?.ramassage ? joursDeRamassage(f.joursRamassage) : null

  const adresse = principal
    ? [principal.adresseLigne && formaterAdresse(principal.adresseLigne), [principal.codePostal, principal.communeNom].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ')
    : ''
  const zone = f?.rayonKm
    ? `dessert ${f.rayonKm} km${f.ramassage ? (ramassage === 'chaque jour ouvré' ? ', ramassage quotidien' : ', ramassage des empreintes') : ''}`
    : null

  const chiffres: [string, string][] = []
  if (plage) chiffres.push([plage, 'délais moyens, en jours ouvrés'])
  if (f?.rayonKm) chiffres.push([`${f.rayonKm} km`, 'zone desservie'])
  if (f?.techniques.length) chiffres.push([String(f.techniques.length), f.techniques.length > 1 ? 'techniques' : 'technique'])
  if (f?.empreintesStl) chiffres.push(['STL', 'empreintes numériques'])

  return (
    <>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <FondCarte base={c.base} lieu={principal} rayon={f?.rayonKm ? f.rayonKm * 1125 : RAYON_SANS_ZONE} zone={!!f?.rayonKm} />
        <div className="container relative z-10 pb-16 pt-10">
          <ArianeSombre segments={c.ariane} />
          <div className="mt-10 max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <PastilleSombre>{c.qualite}</PastilleSombre>
              {f?.ansmNumero && <MarqueSombre icone={FileCheck2}>Déclaré ANSM</MarqueSombre>}
              {/* Fiche gérée et vérifiée : la pastille « gérée » suffit, comme sur la maquette validée. */}
              {!(c.geree && p.statutVerification === 'verifie') && <VerificationSombre statut={p.statutVerification} />}
              {c.geree && <MarqueGeree labo />}
              {c.recrute && <BadgeRecruteFiche />}
              {c.radie && <Etiquette accent>Ne figure plus au registre</Etiquette>}
            </div>
            <h1 className="mt-5 text-balance break-words text-5xl font-normal tracking-tight text-white md:text-6xl">{c.nom}</h1>
            {adresse && <p className="mt-3 text-lg text-white/75">{[adresse, zone].filter(Boolean).join(' · ')}</p>}
            <div className="mt-8 flex flex-wrap gap-2">
              {c.appel && <BoutonAppeler lieuId={c.appel.id} possede={c.appel.aTelephone} libelle="Appeler le laboratoire" className={BOUTON_PRINCIPAL} />}
              {f?.siteWeb && (
                <a href={f.siteWeb} target="_blank" rel="noopener nofollow" className={BOUTON_SOMBRE}>
                  <Globe className="size-4" aria-hidden /> Site du laboratoire <ExternalLink className="size-3.5 opacity-60" aria-hidden />
                </a>
              )}
              {principal && <BoutonItineraire lieu={principal} />}
              <BoutonFavori slug={p.slug} retour={c.cheminFiche} favori={c.favori} />
            </div>
          </div>
          {chiffres.length > 0 && (
            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
              {chiffres.map(([v, l]) => (
                <div key={l}>
                  <p className="text-3xl font-semibold tracking-tight text-white">{v}</p>
                  <p className="mt-1 text-sm text-white/60">{l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <BarreMobile
        titre={c.nom}
        detail={plage ? `Délais de ${plage.replace(' j', '')} j ouvrés` : (principal?.communeNom ?? null)}
        lieu={c.appel}
        libelleAppel="Appeler"
        secondaire={
          f?.siteWeb
            ? { href: f.siteWeb, libelle: 'Site du laboratoire', icone: <Globe className="size-5" aria-hidden />, externe: true }
            : principal
              ? { href: lienItineraire(principal), libelle: 'Itinéraire', icone: <Navigation className="size-5" aria-hidden /> }
              : undefined
        }
      />

      {c.radie && (
        <div className="container pt-10">
          <p className="squircle-xl border border-partiel-line bg-partiel-bg p-4 text-sm text-partiel">
            Ce laboratoire ne figure plus au registre officiel. La fiche est conservée à titre d’archive.
          </p>
        </div>
      )}

      {f ? <SectionLabo f={f} /> : <SectionVide c={c} />}
      {f && delais.length > 0 && <SectionDelais delais={delais} confirmeLe={f.delaisConfirmesLe ?? f.majLe} />}
      {f && aDesHoraires(f.horaires) && (
        <section className="container pb-20">
          <Titre2>Horaires du laboratoire</Titre2>
          <div className="mt-6">
            <Semaine horaires={f.horaires} aujourdhui={c.aujourdhui} />
          </div>
          <div className="mt-4">
            <Renseigne par="laboratoire" confirmeLe={f.horairesConfirmesLe} majLe={f.majLe} />
          </div>
        </section>
      )}
      <SectionRegistre c={c} />
    </>
  )
}

/** Sans déclaratif : ce que le laboratoire pourrait dire, et comment le dire. */
function SectionVide({ c }: { c: ContexteFiche }) {
  return (
    <section className="container py-20 md:py-24">
      <div className="squircle-2xl max-w-3xl border border-dashed border-line p-6 text-fg-2">
        <p>
          Savoir-faire, matériaux, délais de fabrication et zone desservie ne viennent d’aucun registre : seul le laboratoire peut les donner. Il ne l’a pas encore
          fait.
        </p>
        {!c.radie && (
          <p className="mt-3 text-sm">
            Vous gérez ce laboratoire ?{' '}
            <Link href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(c.p.slug)}`)} className="font-medium text-fg underline underline-offset-4">
              Revendiquez la fiche
            </Link>{' '}
            pour les renseigner.
          </p>
        )}
      </div>
    </section>
  )
}

/** La première phrase en clair, la suite en retrait : la présentation en citation. */
function decouper(texte: string): [string, string] {
  const m = texte.trim().match(/^([\s\S]+?[.!?…])\s+([\s\S]+)$/)
  return m ? [m[1], m[2]] : [texte.trim(), '']
}

/** Présentation en citation, réalisations, tableau du savoir-faire. Chaque ligne n'existe que renseignée. */
function SectionLabo({ f }: { f: FicheCompletee }) {
  const ramassage = f.ramassage ? joursDeRamassage(f.joursRamassage) : null
  const numerique = [
    f.empreintesStl && 'Empreintes numériques : fichiers STL acceptés',
    f.usinage && 'Usinage sur place',
    f.impression3d && 'Impression 3D',
  ].filter(Boolean) as string[]
  const logistique = [
    f.rayonKm && `Dessert ${f.rayonKm} km autour du laboratoire.`,
    f.ramassage && (ramassage ? `Ramassage des empreintes au cabinet ${ramassage}.` : 'Ramassage des empreintes au cabinet.'),
    f.transporteur && (f.rayonKm ? `Envoi par transporteur au-delà de ${f.rayonKm} km.` : 'Envoi par transporteur.'),
  ].filter(Boolean) as string[]
  const lignes: { i: typeof Wrench; k: string; v: string }[] = []
  if (f.techniques.length) lignes.push({ i: Wrench, k: 'Techniques', v: f.techniques.map((t) => libelleDe(TECHNIQUES, t)).join(', ') })
  if (f.materiaux.length) lignes.push({ i: Gem, k: 'Matériaux', v: f.materiaux.map((m) => libelleDe(MATERIAUX, m)).join(', ') })
  if (numerique.length) lignes.push({ i: Cpu, k: 'Numérique', v: numerique.join(' · ') })
  if (logistique.length) lignes.push({ i: Truck, k: 'Logistique', v: logistique.join(' ') })
  if (f.ansmNumero) {
    lignes.push({
      i: FileCheck2,
      k: 'Conformité',
      v: `Déclaré auprès de l’ANSM comme fabricant de dispositifs médicaux sur mesure, n° ${f.ansmNumero}${f.ansmDeclareLe ? `, déclaration du ${dateLongue(f.ansmDeclareLe)}` : ''}`,
    })
  }
  if (f.langues.length) lignes.push({ i: Languages, k: 'Langues parlées', v: f.langues.map((l) => libelle(LANGUES, l)).join(', ') })

  const photos = [...(f.photoUrl ? [{ url: f.photoUrl, legende: 'Le laboratoire' }] : []), ...f.realisations]
  const [accroche, suite] = f.presentation ? decouper(f.presentation) : ['', '']
  const confirme = f.presentation ? f.presentationConfirmeeLe : (f.savoirFaireConfirmeLe ?? f.zoneConfirmeeLe)

  return (
    <section id="laboratoire" className="container scroll-mt-24 py-20 md:py-24">
      {f.presentation && (
        <div className="max-w-4xl">
          <Quote className="size-8 text-teal" aria-hidden />
          <p className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
            {accroche}
            {suite && (
              <>
                {' '}
                <span className="text-fg-2">{suite}</span>
              </>
            )}
          </p>
          <p className="mt-6 text-sm text-fg-2">Présentation rédigée par le laboratoire, dont l’identité a été vérifiée.</p>
        </div>
      )}
      {photos.length > 0 && (
        <figure className={f.presentation ? 'mt-12' : ''}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((r) => (
              <li key={r.url} className="relative">
                <Photo src={r.url} alt={r.legende || 'Réalisation du laboratoire'} className="squircle-2xl aspect-square border border-line" sizes="(min-width: 640px) 25vw, 50vw" />
                {r.legende && <span className="squircle-2xl pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 text-xs text-white">{r.legende}</span>}
              </li>
            ))}
          </ul>
          {f.creditPhotos && <figcaption className="mt-3 text-xs text-fg-2">Crédit photo : {f.creditPhotos}</figcaption>}
        </figure>
      )}
      {lignes.length > 0 && (
        <dl className={`${f.presentation || photos.length ? 'mt-12' : ''} divide-y divide-line border-y border-line`}>
          {lignes.map((l) => (
            <div key={l.k} className="grid gap-2 py-5 md:grid-cols-[18rem_1fr] md:gap-8">
              <dt className="flex items-center gap-2 text-sm font-medium text-fg-2">
                <l.i className="size-4 text-teal" aria-hidden /> {l.k}
              </dt>
              <dd className="text-fg">{l.v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-4">
        <Renseigne par="laboratoire" confirmeLe={confirme} majLe={f.majLe} />
      </div>
    </section>
  )
}

function SectionRegistre({ c }: { c: ContexteFiche }) {
  const { p } = c
  const lignes: [string, string][] = [['Activité', 'Laboratoire de prothèse dentaire']]
  if (p.siren) lignes.push(['SIREN', formaterSiret(p.siren) ?? p.siren])
  if (p.siret) lignes.push(['SIRET', formaterSiret(p.siret) ?? p.siret])
  lignes.push(['Registre', 'Base Sirene, INSEE'])
  lignes.push(['Adresse située par', 'Base Adresse Nationale'])
  lignes.push(['Dernière vérification', dateLongue(p.majLe)])
  return (
    <section id="registre" className="container scroll-mt-24 pb-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <Titre2 sous="Ces informations viennent de la base Sirene et ne sont pas modifiables par le laboratoire.">Ce que dit le registre</Titre2>
          <div className="mt-6 max-w-3xl">
            <Registre lignes={lignes} />
          </div>
        </div>
        <AsideFiche slug={p.slug} radie={c.radie} labo liens={c.liens} />
      </div>
    </section>
  )
}
