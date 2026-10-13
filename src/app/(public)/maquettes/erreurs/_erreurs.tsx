/**
 * MAQUETTE, à supprimer une fois `not-found.tsx`, la page 410 et
 * `error.tsx` codés. Trois pages d'erreur dans la direction d'À propos E :
 * héros sombre sous l'en-tête transparent, titre en deux tons, peu de texte.
 */
import Image from 'next/image'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, GraduationCap, House, Mail, MapPin, RotateCw, Search, Stethoscope } from 'lucide-react'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { FichesProches } from './_fiches'

/** Fond commun : le plan de Bordeaux, teinté et voilé, sur le fond sombre. */
function Fond({ chiffre }: { chiffre?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image src="/images/cartes/bordeaux.jpg" alt="" fill priority sizes="100vw" className="scale-110 object-cover opacity-[0.10] blur-[2px] grayscale" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_60%_55%_at_50%_42%,transparent_0%,var(--background)_85%)]" />
      {chiffre && (
        <p className="absolute inset-x-0 top-[12%] select-none text-center text-[38vw] font-semibold leading-none tracking-tighter text-white/[0.045] md:top-[6%] md:text-[30vw]">
          {chiffre}
        </p>
      )}
    </div>
  )
}

/** Le repère vide : un point de la carte sans fiche dessous. */
function RepereVide() {
  return (
    <div aria-hidden className="relative mx-auto grid size-20 place-items-center">
      <span className="absolute inset-0 rounded-full border border-dashed border-white/25" />
      <span className="absolute inset-3 rounded-full border border-white/10" />
      <MapPin className="size-8 text-teal" strokeWidth={1.5} />
    </div>
  )
}

const RACCOURCIS = [
  { icone: Stethoscope, titre: 'Trouver un dentiste', href: '/dentistes/', image: '/images/demo/pexels-6627320.jpg' },
  { icone: FlaskConical, titre: 'Trouver un laboratoire', href: '/prothesistes/', image: '/images/demo/pexels-8413334.jpg' },
  { icone: GraduationCap, titre: 'Formation', href: '/formation/', image: '/images/demo/pexels-19879741.jpg' },
  { icone: BookOpen, titre: 'Ressources', href: '/conseils/', image: '/images/demo/pexels-3881296.jpg' },
]

export function Page404() {
  return (
    <main>
      <HeaderTransparent />
      <section className="dark relative -mt-20 flex min-h-svh flex-col overflow-hidden bg-background pt-20 text-fg">
        <Fond chiffre="404" />
        <div className="container relative z-10 flex flex-1 flex-col items-center justify-center py-14 text-center">
          <RepereVide />
          <p className="mt-6 font-mono text-sm tracking-widest text-white/50">ERREUR 404</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
            Rien à cette adresse.
            <span className="block text-white/50">Cherchons ailleurs.</span>
          </h1>
          <div className="mt-10 flex w-full justify-center">
            <RechercheCommune />
          </div>
          <ul className="mt-12 grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
            {RACCOURCIS.map((r) => (
              <li key={r.titre}>
                <a href={r.href} className="squircle-2xl group relative block h-32 overflow-hidden border border-white/10 text-left md:h-40">
                  <Image src={r.image} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                  <span className="squircle-lg absolute left-3 top-3 grid size-9 place-items-center bg-white/95 text-teal">
                    <r.icone className="size-4" aria-hidden />
                  </span>
                  <ArrowUpRight className="absolute right-3 top-3 size-4 text-white/80" aria-hidden />
                  <span className="absolute inset-x-3 bottom-3 font-semibold leading-tight text-white md:text-lg">{r.titre}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

/**
 * Champ de recherche, même dessin que celui de `RechercheUniverselle` sans le
 * sélecteur de profession (huit cibles sur une grille de quatre : il passe
 * sur deux lignes et déborde à 390 px). Prérempli sur la commune pour la 410 ;
 * le composant de l'accueil ne prend pas de valeur initiale.
 */
function RechercheCommune({ commune }: { commune?: string }) {
  return (
    <form method="get" action="/recherche/" role="search" className="w-full max-w-xl">
      <input type="hidden" name="profession" value="dentistes" />
      <label htmlFor="recherche-commune" className="sr-only">
        Votre ville ou votre code postal
      </label>
      <div className="squircle-full flex items-center gap-2 border border-line bg-bg/80 p-1.5 pl-5 shadow-pill backdrop-blur-xl focus-within:border-line-strong">
        <MapPin className="size-5 shrink-0 text-fg-2" strokeWidth={1.8} aria-hidden />
        <input
          id="recherche-commune"
          name="q"
          defaultValue={commune}
          placeholder="Votre ville ou votre code postal"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none placeholder:text-fg-2"
        />
        <button type="submit" className="squircle-full flex size-11 shrink-0 items-center justify-center bg-teal text-white">
          <span className="sr-only">Rechercher</span>
          <Search className="size-5" aria-hidden />
        </button>
      </div>
    </form>
  )
}

export function Page410() {
  return (
    <main>
      <HeaderTransparent />
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <Fond />
        <div className="container relative z-10 flex flex-col items-center py-16 text-center md:py-20">
          <RepereVide />
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Cette fiche a été retirée
            <span className="block text-white/50">à la demande du professionnel.</span>
          </h1>
          <p className="mt-5 text-sm text-white/60">Retirée le 13 octobre 2026. Cette adresse reste active jusqu’au 12 novembre 2026.</p>
          <h2 className="mt-14 text-lg font-medium text-white/80 md:text-xl">Trouver un autre chirurgien-dentiste près de Bordeaux</h2>
          <div className="mt-5 flex w-full justify-center">
            <RechercheCommune commune="Bordeaux" />
          </div>
          <div className="mt-12 w-full max-w-5xl text-left">
            <FichesProches />
          </div>
          <Link href={chemin('/espace-pro/')} className="mt-10 inline-flex items-center gap-1.5 text-sm text-white/60 underline decoration-white/25 underline-offset-4 hover:text-white">
            Vous êtes ce professionnel ? Revenir sur votre décision avant le 12 novembre <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  )
}

export function Page500() {
  return (
    <main>
      <HeaderTransparent />
      <section className="dark relative -mt-20 flex min-h-svh flex-col overflow-hidden bg-background pt-20 text-fg">
        <Fond chiffre="500" />
        <div className="container relative z-10 flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div aria-hidden className="relative grid size-20 place-items-center">
            <span className="absolute inset-0 rounded-full border border-dashed border-white/25" />
            <RotateCw className="size-8 text-teal" strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
            Un souci de notre côté.
            <span className="block text-white/50">Réessayez dans un instant.</span>
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <a href="" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-hover">
              <RotateCw className="size-4" aria-hidden /> Réessayer
            </a>
            <Link href={chemin('/')} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10">
              <House className="size-4" aria-hidden /> Accueil
            </Link>
            <Link href={chemin('/contact/')} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10">
              <Mail className="size-4" aria-hidden /> Contact
            </Link>
          </div>
          <p className="mt-10 font-mono text-xs text-white/40">Référence de l’incident : 7f3a 91c2 e4b0</p>
        </div>
      </section>
    </main>
  )
}
