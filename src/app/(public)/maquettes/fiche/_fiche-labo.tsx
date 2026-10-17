/** MAQUETTE. Fiche laboratoire revendiquée et complète, style validé : B2 (héros carte, section Citation, délais en frise). */
import { BadgeCheck, Cpu, FileCheck2, Gem, Mail, Phone, Quote, Truck, Wrench } from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import { FilAriane } from '@/components/annuaire/primitives'
import { LABO as L } from './_donnees'
import { BarreMobile, Photo, Registre, Titre2 } from './_blocs'
import { SectionDelais } from './_delais'
import { BadgeRecrute, SectionRecrute, type OffreResume } from './_recrute'

const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Laboratoires de prothèse dentaire', href: '/prothesistes/' },
  { libelle: 'Mérignac', href: '/prothesistes/gironde/merignac/' },
  { libelle: L.nom },
]

function Gere({ sombre }: { sombre?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        sombre ? 'bg-white/10 text-white ring-white/15' : 'bg-bg text-fg ring-line'
      }`}
    >
      <BadgeCheck className="size-3.5 text-teal" aria-hidden /> Fiche gérée par le laboratoire
    </span>
  )
}

function Ansm({ sombre }: { sombre?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        sombre ? 'bg-white/10 text-white ring-white/15' : 'bg-teal/10 text-teal ring-teal/30'
      }`}
    >
      <FileCheck2 className="size-3.5" aria-hidden /> Déclaré ANSM
    </span>
  )
}

function ActionsLabo({ sombre, pleine }: { sombre?: boolean; pleine?: boolean }) {
  const sec = sombre ? 'border-white/20 bg-white/5 text-white' : 'border-line bg-bg text-fg hover:bg-bg-soft'
  return (
    <div className={`flex flex-wrap gap-2 ${pleine ? 'flex-col' : ''}`}>
      <a className="hover-lift inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
        <Phone className="size-4" aria-hidden /> Appeler le laboratoire
      </a>
      <a className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium ${sec}`}>
        <Mail className="size-4" aria-hidden /> Demander un premier travail
      </a>
    </div>
  )
}

/** 2 · Citation : grand titre en deux tons, bandeau de réalisations, tableau. */
function SectionLabo() {
  const lignes = [
    { i: Wrench, k: 'Techniques', v: L.techniques.join(', ') },
    { i: Gem, k: 'Matériaux', v: L.materiaux.join(', ') },
    { i: Cpu, k: 'Numérique', v: L.cfao.map((c) => `${c.titre} : ${c.detail.charAt(0).toLowerCase() + c.detail.slice(1)}`).join(' · ') },
    { i: Truck, k: 'Logistique', v: `${L.zone.ramassage}. ${L.zone.envoi}.` },
    { i: FileCheck2, k: 'Conformité', v: `${L.ansm.texte}, ${L.ansm.le}` },
  ]
  return (
    <section className="container py-20 md:py-24">
      <div className="max-w-4xl">
        <Quote className="size-8 text-teal" aria-hidden />
        <p className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
          Huit prothésistes, la prothèse fixe céramique et l’implantologie.{' '}
          <span className="text-fg-2">Vos empreintes numériques arrivent directement au laboratoire, et un prothésiste référent suit votre cabinet.</span>
        </p>
        <p className="mt-6 text-sm text-fg-2">Présentation rédigée par le laboratoire, dont l’identité a été vérifiée.</p>
      </div>
      <div className="mt-12 grid grid-cols-4 gap-3">
        {L.realisations.map((p) => (
          <Photo key={p} src={p} className="squircle-2xl aspect-square border border-line" />
        ))}
      </div>
      <dl className="mt-12 divide-y divide-line border-y border-line">
        {lignes.map((l) => (
          <div key={l.k} className="grid gap-2 py-5 md:grid-cols-[18rem_1fr] md:gap-8">
            <dt className="flex items-center gap-2 text-sm font-medium text-fg-2">
              <l.i className="size-4 text-teal" aria-hidden /> {l.k}
            </dt>
            <dd className="text-fg">{l.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * `recrute` : offres en ligne du laboratoire. Absente ou vide, la fiche est
 * celle validée en B2. La pastille est informative : elle ne touche ni au tri
 * des résultats ni à la mise en avant de la fiche.
 */
export function FicheLabo({ recrute }: { recrute?: OffreResume[] } = {}) {
  const recrutement = recrute && recrute.length > 0
  return (
    <>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <div className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
          <Carte profession="prothesistes" emprise={empriseAutour(L.lon, L.lat, 45000)} className="size-full" survol={clePosition(L.lon, L.lat)} />
          <div className="absolute inset-0 bg-ardoise mix-blend-color" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="ml-[35%] aspect-square h-[78%] rounded-full border-2 border-dashed border-teal/70 bg-teal/10" />
          </div>
          <div className="absolute inset-0 bg-background/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="container relative z-10 pb-16 pt-10">
          <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
            <FilAriane segments={ARIANE} />
          </div>
          <div className="mt-10 max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">{L.profession}</span>
              <Ansm sombre />
              <Gere sombre />
              {recrutement && <BadgeRecrute sombre />}
            </div>
            <h1 className="mt-5 text-5xl font-normal tracking-tight text-white md:text-6xl">{L.nom}</h1>
            <p className="mt-3 text-lg text-white/75">
              {L.adresse}, {L.cp} {L.commune} · dessert {L.zone.rayon} km, ramassage quotidien
            </p>
            <div className="mt-8">
              <ActionsLabo sombre />
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
            {[
              ['4 à 10 j', 'délais moyens, en jours ouvrés'],
              [`${L.zone.rayon} km`, 'zone desservie'],
              ['7', 'techniques'],
              ['STL', 'empreintes numériques'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-semibold tracking-tight text-white">{v}</p>
                <p className="mt-1 text-sm text-white/60">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BarreMobile titre={L.nom} detail="Délais de 4 à 10 j ouvrés" secondaire={<Mail className="size-5" aria-hidden />} />
      <SectionLabo />
      <SectionDelais />

      <section className="container pb-20">
        <Titre2 sous="Ces informations viennent de la base Sirene et ne sont pas modifiables par le laboratoire.">Ce que dit le registre</Titre2>
        <div className="mt-6 max-w-3xl">
          <Registre lignes={L.registre} />
        </div>
      </section>

      {recrutement && (
        <SectionRecrute
          titre="Ce laboratoire recrute"
          sous="Offres publiées par le laboratoire, dont l’identité a été vérifiée auprès des registres officiels."
          offres={recrute}
          lien={{ href: '/emploi/prothesiste-dentaire/gironde/merignac/', libelle: 'Voir les offres de prothésiste à Mérignac' }}
        />
      )}
    </>
  )
}
