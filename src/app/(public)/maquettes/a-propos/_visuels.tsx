/**
 * MAQUETTE, à supprimer après arbitrage. Sections visuelles partagées par les
 * variantes d et e : bento des chiffres, visuels des étapes, schéma du tri,
 * données, FAQ centrée et appel final en image. Les chiffres sont ceux de
 * l'accueil, lus sur la base ; les fiches sont les cartes d'exemple du héros.
 */
import Image from 'next/image'
import { ArrowRight, BadgeCheck, Flag, Landmark, Lock, Mail, PenLine, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { FicheDentisteExemple } from '@/components/home/fiches-exemple'
import { Bouton, FaqListe, LienFleche, lireChiffres } from './_blocs'
import { LIENS, type Etape } from './_contenu'

export function Photo({ src, className = '', sizes = '(min-width: 1024px) 50vw, 100vw', voile }: { src: string; className?: string; sizes?: string; voile?: boolean }) {
  return (
    <div className={`${/\babsolute\b/.test(className) ? '' : 'relative'} overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      {voile && <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />}
    </div>
  )
}

/** Pastille blanche posée sur une image. */
export function Pastille({ children, icone: I = ShieldCheck, className = '' }: { children: React.ReactNode; icone?: typeof ShieldCheck; className?: string }) {
  return (
    <span className={`squircle-full inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 text-xs font-medium text-[#0e1317] shadow-pop backdrop-blur ${className}`}>
      <I className="size-3.5 text-teal" aria-hidden /> {children}
    </span>
  )
}

/** Une fiche d'exemple de l'accueil, à sa largeur réelle, réduite par une échelle CSS. */
export function FicheReduite({ className = '', echelle = 'scale-[0.6]' }: { className?: string; echelle?: string }) {
  return (
    <div aria-hidden inert className={`pointer-events-none w-[22rem] ${echelle} ${className}`}>
      <FicheDentisteExemple />
    </div>
  )
}

/** Bento des chiffres : photo et chiffre géant, aplats, plan, citation. */
export async function BentoChiffres() {
  const [dentistes, labos, communes] = await lireChiffres()
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-[repeat(3,minmax(12rem,auto))]">
      <div className="squircle-3xl relative col-span-2 min-h-[22rem] overflow-hidden lg:row-span-2">
        <Photo src="/images/demo/pexels-6627320.jpg" className="absolute inset-0" voile />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <p className="text-7xl font-light tabular-nums tracking-tight text-white md:text-8xl">{dentistes!.value}</p>
          <p className="mt-2 text-lg text-white/80">{dentistes!.label}</p>
        </div>
      </div>
      <div className="squircle-3xl flex flex-col justify-between bg-ardoise p-5 text-white md:p-6">
        <Landmark className="size-6 text-teal" strokeWidth={1.5} aria-hidden />
        <div className="mt-8">
          <p className="text-5xl font-light tabular-nums tracking-tight md:text-6xl">{labos!.value}</p>
          <p className="mt-1 text-sm text-white/70">{labos!.label}</p>
        </div>
      </div>
      <div className="squircle-3xl relative min-h-[14rem] overflow-hidden border border-line lg:row-span-2">
        <Photo src="/images/cartes/bordeaux.jpg" className="absolute inset-0" />
        {[
          ['left-[22%] top-[30%]', 'size-3'],
          ['left-[58%] top-[22%]', 'size-2.5'],
          ['left-[44%] top-[48%]', 'size-4'],
          ['left-[70%] top-[55%]', 'size-3'],
          ['left-[30%] top-[62%]', 'size-2.5'],
        ].map(([pos, taille]) => (
          <span key={pos} className={`absolute ${pos} ${taille} rounded-full bg-teal ring-4 ring-teal/25`} aria-hidden />
        ))}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent p-5 pt-16 md:p-6 md:pt-20">
          <p className="text-5xl font-light tabular-nums tracking-tight text-[#0e1317] md:text-6xl">{communes!.value}</p>
          <p className="mt-1 text-sm text-[#0e1317]/70">{communes!.label}</p>
        </div>
      </div>
      <div className="squircle-3xl col-span-2 flex flex-col justify-between border border-teal/25 bg-teal/[0.08] p-5 md:p-6 lg:col-span-1">
        <RefreshCw className="size-6 text-teal" strokeWidth={1.5} aria-hidden />
        <div className="mt-8">
          <p className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Chaque jour</p>
          <p className="mt-1 text-sm text-fg-2">les registres sont resynchronisés</p>
        </div>
      </div>
      <div className="squircle-3xl col-span-2 flex flex-col justify-between border border-line bg-bg-soft p-6 md:p-8">
        <p className="text-6xl leading-none text-teal" aria-hidden>
          “
        </p>
        <p className="text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">Rien de déclaratif, tout est sourcé.</p>
      </div>
      <div className="squircle-3xl relative col-span-2 min-h-[14rem] overflow-hidden">
        <Photo src="/images/demo/pexels-8413334.jpg" className="absolute inset-0" voile />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-6 md:p-8">
          <p className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Laboratoires de prothèse rapprochés de Sirene</p>
        </div>
      </div>
    </div>
  )
}

/** Le visuel de chaque étape de la méthode. */
export function VisuelEtape({ visuel, className = '' }: { visuel: Etape['visuel']; className?: string }) {
  switch (visuel) {
    case 'registre':
      return (
        <div className={`relative overflow-hidden bg-bg-soft ${className}`}>
          <Photo src="/images/cartes/bordeaux.jpg" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-transparent" />
          <div className="absolute left-3 top-4 flex flex-col items-start gap-2 md:left-8 md:top-8">
            <Pastille icone={Landmark}>Annuaire Santé · ANS</Pastille>
            <Pastille icone={Landmark}>Base Sirene · INSEE</Pastille>
          </div>
          <FicheReduite className="absolute right-4 top-1/2 origin-right -translate-y-1/2 md:right-10" echelle="scale-[0.42] md:scale-[0.58]" />
        </div>
      )
    case 'semaine':
      return (
        <div className={`relative overflow-hidden ${className}`}>
          <Photo src="/images/demo/pexels-6627447.jpg" className="absolute inset-0" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="squircle-2xl bg-white/95 p-5 text-[#0e1317] shadow-pop backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-teal text-white">
                  <RefreshCw className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">Vérifié auprès des registres officiels</p>
                  <p className="text-xs text-[#0e1317]/60">Dernière vérification le 13 octobre 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    case 'separe':
      return (
        <div className={`flex flex-col justify-center gap-3 bg-bg-soft p-5 md:p-8 ${className}`}>
          <div className="squircle-2xl border border-line bg-bg p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fg-2">
              <Lock className="size-3.5" aria-hidden /> Registre, lecture seule
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              <dt className="text-fg-2">Profession</dt>
              <dd className="text-fg">Chirurgien-dentiste</dd>
              <dt className="text-fg-2">RPPS</dt>
              <dd className="font-mono text-fg">10 1XX XXX XXX</dd>
            </dl>
          </div>
          <div className="squircle-2xl ml-6 border border-teal/30 bg-teal/[0.08] p-4 md:ml-10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal">
              <PenLine className="size-3.5" aria-hidden /> Renseigné par le praticien
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              <dt className="text-fg-2">Lundi</dt>
              <dd className="tabular-nums text-fg">8h30 à 19h00</dd>
              <dt className="text-fg-2">Langues</dt>
              <dd className="text-fg">Français, anglais</dd>
            </dl>
          </div>
        </div>
      )
    case 'identite':
      return (
        <div className={`relative overflow-hidden ${className}`}>
          <Photo src="/images/demo/pexels-6627325.jpg" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/55 to-transparent" />
          <div className="absolute bottom-5 right-5 flex flex-col items-end gap-2 md:bottom-8 md:right-8">
            <Pastille icone={BadgeCheck}>Pro Santé Connect</Pastille>
            <Pastille icone={ShieldCheck}>Aucun document demandé</Pastille>
          </div>
        </div>
      )
    case 'date':
      return (
        <div className={`relative overflow-hidden ${className}`}>
          <Photo src="/images/demo/pexels-7800669.jpg" className="absolute inset-0" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="squircle-2xl absolute bottom-5 left-5 right-5 bg-white/95 p-4 text-[#0e1317] shadow-pop backdrop-blur md:bottom-8 md:left-8 md:right-auto md:w-80">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0e1317]/60">Horaires</p>
            <p className="mt-1 text-sm">Renseigné par le praticien</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
              <PenLine className="size-3.5" aria-hidden /> Confirmé le 2 octobre 2026
            </p>
          </div>
        </div>
      )
  }
}

const EXEMPLE = [
  { nom: 'Dr Antoine Bernard', km: '0,4 km', pos: 'left-[61%] top-[39%]' },
  { nom: 'Dr Camille Rivière', km: '0,4 km', pos: 'left-[39%] top-[61%]' },
  { nom: 'Dr Léa Martin', km: '1,2 km', pos: 'left-[80%] top-[61%]' },
  { nom: 'Dr Hugo Petit', km: '2,7 km', pos: 'left-[16%] top-[16%]' },
]

/** Le tri, en image : des cercles de distance autour de vous, puis la liste. Noms inventés. */
export function TriVisuel() {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative mx-auto aspect-square w-full max-w-[16rem] sm:max-w-[20rem]" aria-hidden>
        {['inset-[34%]', 'inset-[18%]', 'inset-[2%]'].map((r) => (
          <span key={r} className={`absolute ${r} rounded-full border border-dashed border-white/20`} />
        ))}
        <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-xs font-semibold text-[#0e1317]">
          Vous
        </span>
        {EXEMPLE.map((e, i) => (
          <span
            key={e.nom}
            className={`absolute ${e.pos} grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-teal text-sm font-semibold text-white ring-4 ring-teal/25`}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <ol className="squircle-2xl divide-y divide-white/10 border border-white/10 bg-white/[0.04] px-5">
        {EXEMPLE.map((e, i) => (
          <li key={e.nom} className="flex items-center gap-3 py-3.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{e.nom}</span>
            <span className="shrink-0 text-sm tabular-nums text-white/60">{e.km}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Bande sombre de neutralité : une phrase, le schéma du tri. */
export function Neutralite() {
  return (
    <section className="dark bg-background text-fg">
      <div className="container grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
            <span className="size-1.5 rounded-full bg-teal" /> Neutralité
          </p>
          <h2 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
            Distance,
            <span className="block text-white/55">puis A à Z.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-white/70">Le classement ne dépend ni de la complétude d’une fiche ni d’un score.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">Complétude sans effet sur la place</span>
            <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">Distinctions privées</span>
          </div>
        </div>
        <TriVisuel />
      </div>
    </section>
  )
}

/** Données personnelles, une ligne. */
export function Donnees() {
  return (
    <div className="container py-14 md:py-16">
      <div className="squircle-2xl md:squircle-full mx-auto flex max-w-4xl flex-col items-center gap-3 border border-line bg-bg-soft px-6 py-5 text-center md:flex-row md:justify-between md:text-left">
        <p className="flex items-center gap-3 text-fg">
          <Users className="hidden size-5 shrink-0 text-teal md:block" aria-hidden />
          Un compte patient ne demande que votre email. Aucune donnée de santé, nulle part.
        </p>
        <LienFleche href={LIENS.donnees} petit>
          Vos données
        </LienFleche>
      </div>
    </div>
  )
}

export function FaqCentree() {
  return (
    <section className="container pb-20 pt-6 md:pb-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-4xl font-semibold tracking-tight text-fg md:text-5xl">Questions fréquentes</h2>
        <div className="mt-10">
          <FaqListe />
        </div>
        <p className="mt-8 text-center">
          <LienFleche href={LIENS.faq} petit>
            Toutes les questions
          </LienFleche>
        </p>
      </div>
    </section>
  )
}

/** Appel final en image, puis les liens secondaires. */
export function Fin() {
  return (
    <section className="container pb-20 md:pb-24">
      <div className="squircle-3xl relative min-h-[30rem] overflow-hidden md:min-h-[34rem]">
        <Photo src="/images/demo/pexels-6627471.jpg" className="absolute inset-0" sizes="100vw" />
        <div className="absolute inset-0 bg-black/40 md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10 md:bg-gradient-to-r md:from-black/80 md:via-black/50" />
        <div className="relative flex min-h-[inherit] max-w-xl flex-col justify-end p-6 md:p-12">
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">Votre fiche existe déjà.</h2>
          <p className="mt-4 text-lg text-white/80">Revendiquez-la pour la compléter. Une erreur ? Signalez-la, sans compte.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Bouton href={LIENS.revendiquer}>
              Revendiquer ma fiche <ArrowRight className="size-4" aria-hidden />
            </Bouton>
            <Bouton href={LIENS.erreur} ton="secondaire" sombre>
              <Flag className="size-4" aria-hidden /> Signaler une erreur
            </Bouton>
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          { titre: 'Nous contacter', texte: 'Une personne vous répond.', href: LIENS.contact, icone: Mail },
          { titre: 'Devenir partenaire', texte: 'Institutions, écoles, éditeurs.', href: LIENS.partenaires, icone: Users },
        ].map((c) => (
          <a key={c.titre} href={c.href} className="squircle-2xl group flex items-center gap-4 border border-line bg-bg-soft p-5 hover:bg-bg">
            <span className="squircle-lg grid size-11 shrink-0 place-items-center bg-teal/10 text-teal">
              <c.icone className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-fg">{c.titre}</span>
              <span className="block text-sm text-fg-2">{c.texte}</span>
            </span>
            <ArrowRight className="size-5 text-fg-2 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
        ))}
      </div>
    </section>
  )
}
