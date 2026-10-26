/**
 * Pages 404 (adresse inconnue) et 410 (fiche retirée à la demande du
 * professionnel). Héros sombre sous l'en-tête transparent, titre en deux
 * tons, peu de texte. La 500 est à part, dans `page-500.tsx` : elle est rendue
 * par une limite d'erreur, donc côté client.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, GraduationCap, MapPin, Search, Stethoscope } from 'lucide-react'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'
import { chemin } from '@/lib/navigation'
import { FichesProches } from './fiches-proches'
import { Fond, RepereVide } from './fond'
import { RESSOURCES_VISIBLE } from '@/lib/visibilite'

const RACCOURCIS = [
  { icone: Stethoscope, titre: 'Trouver un dentiste', href: '/dentistes/', image: '/images/demo/pexels-6627320.jpg' },
  { icone: FlaskConical, titre: 'Trouver un laboratoire', href: '/prothesistes/', image: '/images/demo/pexels-8413334.jpg' },
  { icone: GraduationCap, titre: 'Formation', href: '/formation/', image: '/images/demo/pexels-19879741.jpg' },
  { icone: BookOpen, titre: 'Ressources', href: '/conseils/', image: '/images/demo/pexels-3881296.jpg' },
].filter((r) => RESSOURCES_VISIBLE || r.href !== '/conseils/')

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
                <Link href={chemin(r.href)} className="squircle-2xl group relative block h-32 overflow-hidden border border-white/10 text-left md:h-40">
                  <Image src={r.image} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                  <span className="squircle-lg absolute left-3 top-3 grid size-9 place-items-center bg-white/95 text-teal">
                    <r.icone className="size-4" aria-hidden />
                  </span>
                  <ArrowUpRight className="absolute right-3 top-3 size-4 text-white/80" aria-hidden />
                  <span className="absolute inset-x-3 bottom-3 font-semibold leading-tight text-white md:text-lg">{r.titre}</span>
                </Link>
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
function RechercheCommune({ commune, base = 'dentistes' }: { commune?: string; base?: string }) {
  return (
    <form method="get" action="/recherche/" role="search" className="w-full max-w-xl">
      <input type="hidden" name="profession" value={base} />
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

const JOUR_MOIS_AN: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }
const JOUR_MOIS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }

export type FicheRetiree = {
  /** Date du retrait, et dernier jour où l'adresse répond encore 410. */
  retireLe: Date
  jusquAu: Date
  /** Commune de la fiche : préremplit la recherche et titre la liste. */
  commune: string
  base: string
  profession: Profession
  /** Libellé au singulier, en minuscules : « chirurgien-dentiste ». */
  libelle: string
  /** Trois fiches au plus, de la même profession, par distance puis ordre alphabétique. */
  proches: PraticienProche[]
  /** Page où le professionnel annule le retrait. */
  annulation: string
}

export function Page410({ fiche }: { fiche: FicheRetiree }) {
  const { retireLe, jusquAu, commune, base, profession, libelle, proches, annulation } = fiche
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
          <p className="mt-5 text-sm text-white/60">
            Retirée le {retireLe.toLocaleDateString('fr-FR', JOUR_MOIS_AN)}. Cette adresse reste active jusqu’au {jusquAu.toLocaleDateString('fr-FR', JOUR_MOIS_AN)}.
          </p>
          <h2 className="mt-14 text-lg font-medium text-white/80 md:text-xl">
            Trouver un autre {libelle} près de {commune}
          </h2>
          <div className="mt-5 flex w-full justify-center">
            <RechercheCommune commune={commune} base={base} />
          </div>
          {proches.length > 0 && (
            <div className="mt-12 w-full max-w-5xl text-left">
              <FichesProches fiches={proches} base={base} profession={profession} />
            </div>
          )}
          <Link href={chemin(annulation)} className="mt-10 inline-flex items-center gap-1.5 text-sm text-white/60 underline decoration-white/25 underline-offset-4 hover:text-white">
            Vous êtes ce professionnel ? Revenir sur votre décision avant le {jusquAu.toLocaleDateString('fr-FR', JOUR_MOIS)} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  )
}
