/**
 * Page « Devenir partenaire » : héros clair avec le formulaire public de
 * partenariat (six champs, sans compte), engagements en bento, ce que
 * DentalMap propose par type de partenaire, étapes, « Ils nous font
 * confiance » et FAQ courte, appel final qui ramène au formulaire.
 */
import Image from 'next/image'
import { ArrowDown, ArrowRight, Check, Clock, FileSignature, GraduationCap, MailCheck, UserX, X } from 'lucide-react'
import { ANCRE_FORMULAIRE, Bouton, ETAPES, FaqCourte, JAMAIS, LienFleche, MONOGRAMMES, OFFRES, Photo, ROUTE_ETABLISSEMENT, Surtitre } from './commun'
import { FormulairePartenariat } from './formulaire'

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-bg-soft">
      <div className="container grid grid-cols-1 items-center gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
        <div className="min-w-0">
          <Surtitre>Devenir partenaire</Surtitre>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            {'Un projet ?'}
            <span className="block text-fg-2">Parlons-en.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-fg-2">Six champs, sans compte, et une réponse sous sept jours.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Bouton href={ANCRE_FORMULAIRE}>
              Proposer un partenariat <ArrowDown className="size-4" aria-hidden />
            </Bouton>
            <Bouton href={ROUTE_ETABLISSEMENT} ton="secondaire">
              <GraduationCap className="size-4" aria-hidden /> Je représente une école
            </Bouton>
          </div>
        </div>
        <div className="relative min-w-0 lg:pl-6">
          <Photo src="/images/demo/pexels-6627447.jpg" className="squircle-3xl absolute -bottom-8 -left-10 hidden h-44 w-36 -rotate-6 border-4 border-bg shadow-pop lg:block" sizes="10rem" />
          <div className="relative">
            <FormulairePartenariat />
          </div>
        </div>
      </div>
    </section>
  )
}

const ENGAGEMENTS = [
  { i: UserX, titre: 'Sans compte', texte: 'Votre demande part par email à l’équipe.' },
  { i: Clock, titre: 'Sept jours', texte: 'Le délai de réponse d’une personne de l’équipe.' },
  { i: MailCheck, titre: 'Accusé de réception', texte: 'Par email, dès l’envoi de votre demande.' },
  { i: FileSignature, titre: 'Convention écrite', texte: 'Chaque partenariat est encadré par écrit.' },
]

function Engagements() {
  return (
    <section className="container py-20 md:py-24">
      <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
        Ce que vous pouvez
        <span className="block text-fg-2">attendre de nous.</span>
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="squircle-3xl relative col-span-2 min-h-[20rem] overflow-hidden lg:row-span-2">
          <Image src="/images/demo/pexels-6627320.jpg" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <p className="absolute inset-x-0 bottom-0 p-6 text-3xl font-semibold tracking-tight text-white md:p-8 md:text-4xl">Un annuaire vérifié, à construire ensemble.</p>
        </div>
        {ENGAGEMENTS.map((e, k) => (
          <div key={e.titre} className={`squircle-3xl flex flex-col justify-between p-5 md:p-6 ${k === 3 ? 'dark bg-background text-fg' : 'border border-line bg-bg-soft'}`}>
            <e.i className="size-6 text-teal" strokeWidth={1.5} aria-hidden />
            <div className="mt-8">
              <p className={`text-xl font-semibold tracking-tight ${k === 3 ? 'text-white' : 'text-fg'}`}>{e.titre}</p>
              <p className="mt-1 text-sm text-fg-2">{e.texte}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Offres() {
  return (
    <section className="border-y border-line bg-bg-soft">
      <div className="container py-20 md:py-24">
        <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
          Ce que DentalMap
          <span className="block text-fg-2">propose à ses partenaires.</span>
        </h2>
        <ul className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          {OFFRES.map((o, k) => (
            <li key={o.cle} className={`squircle-3xl flex flex-col overflow-hidden border border-line bg-bg ${k < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className={`relative aspect-[16/9] ${k < 3 ? '' : 'lg:aspect-[16/6]'}`}>
                <Image src={o.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-2xl font-semibold tracking-tight text-white">{o.titre}</p>
                  <p className="text-sm text-white/75">{o.pour}</p>
                </div>
              </div>
              <ul className="flex-1 space-y-3 p-5 md:p-6">
                {o.benefices.map((b) => (
                  <li key={b} className="flex gap-3 text-[15px] leading-snug text-fg">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-5 py-4 md:px-6">
                {o.lien ? (
                  <LienFleche href={o.lien.href} petit>
                    {o.lien.texte}
                  </LienFleche>
                ) : (
                  <LienFleche href={ANCRE_FORMULAIRE} petit>
                    Proposer un partenariat
                  </LienFleche>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="squircle-3xl dark mt-3 flex flex-col gap-5 bg-background p-6 text-fg md:flex-row md:items-center md:justify-between md:p-8">
          <p className="text-xl font-semibold tracking-tight text-white md:shrink-0">Ce qu’aucun partenariat n’achète</p>
          <ul className="flex flex-wrap gap-2 md:justify-end">
            {JAMAIS.map((j) => (
              <li key={j} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85">
                <X className="size-3.5 text-white/55" aria-hidden /> {j}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Etapes() {
  return (
    <section className="container py-20 md:py-24">
      <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Trois étapes.</h2>
      <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
        <span aria-hidden className="absolute left-5 right-5 top-5 hidden border-t border-dashed border-line-strong md:block" />
        {ETAPES.map((e, i) => (
          <li key={e.titre} className="relative">
            <span className="relative grid size-10 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-foreground ring-8 ring-bg">{i + 1}</span>
            <Photo src={e.image} className="squircle-2xl mt-6 aspect-[16/10] border border-line" sizes="(min-width: 768px) 33vw, 100vw" />
            <p className="mt-5 text-xl font-semibold tracking-tight text-fg">{e.titre}</p>
            <p className="mt-1 text-fg-2">{e.texte}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Faq() {
  return (
    <section className="border-y border-line bg-bg-soft">
      <div className="container grid gap-10 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Questions fréquentes</h2>
          <div className="mt-6">
            <LienFleche href="/faq/">Toutes les questions</LienFleche>
          </div>
          <p className="mt-10 text-sm font-medium text-fg-2">Ils nous font confiance</p>
          {/* Monogrammes fictifs, sans aucun organisme réel : à remplacer par les logos des partenaires une fois les conventions signées. */}
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {MONOGRAMMES.map((m) => (
              <li key={m} className="squircle-2xl grid h-20 place-items-center border border-line bg-bg">
                <span className="grid size-11 place-items-center rounded-full bg-bg-soft text-sm font-semibold text-fg-2">{m}</span>
              </li>
            ))}
          </ul>
        </div>
        <FaqCourte />
      </div>
    </section>
  )
}

function Fin() {
  return (
    <section className="container py-20 md:py-24">
      <div className="squircle-3xl relative grid overflow-hidden bg-ardoise text-white md:grid-cols-2">
        <div className="flex flex-col justify-center p-6 md:p-12">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Présentez votre projet.</h2>
          <p className="mt-4 text-lg text-white/75">Réponse sous sept jours, par email.</p>
          <div className="mt-8">
            <a href={ANCRE_FORMULAIRE} className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Remplir le formulaire <ArrowRight className="size-4 -rotate-90" aria-hidden />
            </a>
          </div>
        </div>
        <Photo src="/images/demo/pexels-6627471.jpg" className="min-h-[16rem] md:min-h-[24rem]" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    </section>
  )
}

export function PagePartenaires() {
  return (
    <main>
      <Hero />
      <Engagements />
      <Offres />
      <Etapes />
      <Faq />
      <Fin />
    </main>
  )
}
