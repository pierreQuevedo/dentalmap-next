/**
 * Page 404 (adresse inconnue). Une fiche retirée ne passe plus par ici : le
 * proxy la redirige vers la liste de sa commune. Héros sombre sous l'en-tête transparent, titre en deux
 * tons, peu de texte. La 500 est à part, dans `page-500.tsx` : elle est rendue
 * par une limite d'erreur, donc côté client.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, FlaskConical, GraduationCap, MapPin, Search, Stethoscope } from 'lucide-react'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { chemin } from '@/lib/navigation'
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
