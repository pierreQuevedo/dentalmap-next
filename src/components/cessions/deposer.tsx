/**
 * Comment déposer une annonce de cession : trois étapes en images, ce que
 * l'annonce demande, durée de publication, renvoi vers l'espace pro. Seul un
 * praticien à la fiche vérifiée dépose ; l'équipe relit avant publication ;
 * l'annonce reste en ligne 90 jours, renouvelable d'un clic.
 */
import Image from 'next/image'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { ArrowRight, Armchair, CalendarClock, Camera, Check, Euro, FileText, MapPin, Maximize2, Tag, TrendingUp, Wrench } from 'lucide-react'
import { DUREE_PUBLICATION_JOURS, RAPPEL_AVANT_JOURS } from '@/lib/cessions/format'
import { LISTE_CESSIONS, ROUTE_DEPOT_CESSION } from '@/lib/cessions/routes'

const ETAPES = [
  { titre: 'Connectez-vous à votre espace pro', texte: 'Votre fiche de praticien vérifié est votre identité de cédant.', image: '/images/demo/pexels-6627471.jpg' },
  { titre: 'Remplissez l’annonce', texte: 'Le secteur suffit : l’adresse n’est jamais publiée.', image: '/images/demo/pexels-6627320.jpg' },
  { titre: 'Relecture par l’équipe', texte: 'L’annonce est relue avant d’être publiée ; vous êtes prévenu par email.', image: '/images/demo/pexels-8413334.jpg' },
]

const CHAMPS = [
  { i: Tag, t: 'Type de cession', d: 'Cabinet, parts, patientèle, murs ou locaux' },
  { i: MapPin, t: 'Secteur', d: 'Votre commune : le rayon affiché est calculé pour vous' },
  { i: Armchair, t: 'Fauteuils', d: 'Nombre de postes de soins' },
  { i: TrendingUp, t: 'Chiffre d’affaires', d: 'En fourchette, indicatif' },
  { i: Euro, t: 'Prix', d: 'Montant ou «\u00a0sur demande\u00a0»' },
  { i: Maximize2, t: 'Surface', d: 'En mètres carrés' },
  { i: CalendarClock, t: 'Disponibilité', d: 'Date ou délai' },
  { i: Wrench, t: 'Équipements', d: 'Fauteuils, imagerie, stérilisation' },
  { i: FileText, t: 'Conditions', d: 'Accompagnement, présentation à la patientèle' },
  { i: Camera, t: 'Photos', d: 'Facultatives, sans patient identifiable' },
]

export function Deposer() {
  return (
    <main>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <div className="container grid grid-cols-1 items-center gap-12 py-14 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
              <span className="size-1.5 rounded-full bg-teal" /> Annonces de cession
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
              Céder votre cabinet,
              <span className="block text-white/50">en toute discrétion.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/70">Un secteur, jamais d’adresse, et des messages reçus sans afficher vos coordonnées.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href={chemin(ROUTE_DEPOT_CESSION)} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-hover">
                Déposer depuis mon espace pro <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href={chemin(LISTE_CESSIONS)} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10">
                Voir les annonces
              </Link>
            </div>
          </div>
          <div aria-hidden className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              ['/images/demo/pexels-6627447.jpg', 'row-span-2 min-h-[16rem] lg:translate-y-6'],
              ['/images/demo/pexels-3881296.jpg', 'aspect-[4/3] lg:-translate-y-3'],
              ['/images/demo/pexels-7800669.jpg', 'aspect-[4/3] lg:-translate-y-3'],
            ].map(([src, c]) => (
              <div key={src} className={`squircle-3xl relative overflow-hidden border border-white/10 ${c}`}>
                <Image src={src!} alt="" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-24">
        <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Trois étapes.</h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          <span aria-hidden className="absolute left-5 right-5 top-5 hidden border-t border-dashed border-line-strong md:block" />
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="relative">
              <span className="relative grid size-10 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-foreground ring-8 ring-bg">{i + 1}</span>
              <div className="squircle-2xl relative mt-6 aspect-[16/10] overflow-hidden border border-line">
                <Image src={e.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <p className="mt-5 text-xl font-semibold tracking-tight text-fg">{e.titre}</p>
              <p className="mt-1 text-fg-2">{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <div className="container py-20 md:py-24">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
            Ce que l’annonce
            <span className="block text-fg-2">vous demande.</span>
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {CHAMPS.map((c) => (
              <li key={c.t} className="squircle-2xl flex flex-col border border-line bg-bg p-5">
                <c.i className="size-6 text-teal" strokeWidth={1.5} aria-hidden />
                <p className="mt-6 font-semibold text-fg">{c.t}</p>
                <p className="mt-1 text-sm text-fg-2">{c.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-20 md:py-24">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="squircle-3xl dark flex flex-col justify-between bg-background p-6 text-fg md:col-span-1 md:p-8">
            <CalendarClock className="size-7 text-teal" strokeWidth={1.5} aria-hidden />
            <div className="mt-10">
              <p className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{DUREE_PUBLICATION_JOURS} jours</p>
              <p className="mt-2 text-white/70">
                de publication, date de fin affichée sur l’annonce. Un rappel vous arrive {RAPPEL_AVANT_JOURS} jours avant : un clic la renouvelle.
              </p>
            </div>
          </div>
          <ul className="squircle-3xl space-y-4 border border-line bg-bg-soft p-6 md:col-span-2 md:p-8">
            {[
              'Seul un praticien à la fiche vérifiée publie',
              'L’adresse et vos coordonnées ne sont jamais publiées : un secteur de 2, 5 ou 10 km selon la taille de la commune',
              'Les repreneurs vous écrivent avec un compte ; leurs messages arrivent dans votre espace pro, et vous êtes prévenu par email',
              'L’annonce expire à sa date : plus de cession fantôme',
            ].map((t) => (
              <li key={t} className="flex gap-3 text-fg">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                  <Check className="size-4" aria-hidden />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 flex justify-center">
          <Link href={chemin(ROUTE_DEPOT_CESSION)} className="inline-flex h-12 items-center gap-2 rounded-full bg-action px-7 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Déposer depuis mon espace pro <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  )
}
