import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Clock, MailCheck, UserX } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteContact } from '@/components/contact/carte-contact'
import { CtaCompte } from '@/components/contact/cta-compte'
import { EntreesContact } from '@/components/contact/entrees-contact'
import { estObjet } from '@/lib/contact/objets'
import { FORMULAIRES } from '@/lib/contact/formulaires'
import { Balisage, filAriane, pageWeb } from '@/lib/seo/jsonld'

const DESCRIPTION =
  'Signaler une erreur sur une fiche ou une annonce, poser une question, proposer un partenariat ou exercer vos droits sur vos données.'

/**
 * Page contact, dans le style des pages de la vitrine : titre en deux tons,
 * puis les entrées par demande, chacune ouvrant son formulaire dédié dans un
 * panneau (même animation que la recherche de l'en-tête), ce qui se passe
 * ensuite, et l'appel aux professionnels pour finir.
 *
 * Les liens « Signaler » du site arrivent avec `?objet=…` (et `fiche`, `page`,
 * `erreur`, ou `laboratoire` et `siren` pour préremplir) : le panneau s'ouvre alors seul sur le bon
 * formulaire. Lire l'URL est une donnée de requête : seule la grille en
 * dépend, derrière un `Suspense` dont le repli est la même grille sans
 * ouverture, de sorte que le reste de la page reste une coquille statique.
 */
export const metadata: Metadata = {
  title: 'Contact',
  description: DESCRIPTION,
  alternates: { canonical: '/contact/' },
}

type Params = Promise<{ objet?: string; fiche?: string; page?: string; laboratoire?: string; siren?: string; erreur?: string }>

/** Un slug de fiche ou un chemin du site passé par l'URL, gardé seulement s'il en a la forme. */
const slug = (v: string | undefined) => (v && /^[a-z0-9-]{1,120}$/.test(v) ? v : undefined)
const cheminSite = (v: string | undefined) => (v && /^\/[a-z0-9/_-]{1,200}$/.test(v) ? v : undefined)
/** Nom et SIREN d'un laboratoire, passés par le suivi d'un Kbis refusé. */
const texteCourt = (v: string | undefined) => (v && v.trim().length <= 120 ? v.trim() : undefined)
const siren = (v: string | undefined) => (v && /^\d{9}$/.test(v) ? v : undefined)
/** Ce qui est inexact, s'il fait partie des choix du formulaire d'erreur. */
const erreurConnue = (v: string | undefined) => (FORMULAIRES['erreur-fiche'].champs.find((c) => c.nom === 'erreur')?.options?.some(([o]) => o === v) ? v : undefined)

async function EntreesSelonUrl({ searchParams }: { searchParams: Params }) {
  const { objet, fiche, page, laboratoire, siren: numero, erreur } = await searchParams
  const objetInitial = estObjet(objet) ? objet : undefined
  const initiales = { fiche: slug(fiche), page: cheminSite(page), laboratoire: texteCourt(laboratoire), siren: siren(numero), erreur: erreurConnue(erreur) }
  return <EntreesContact objetInitial={objetInitial} initiales={initiales} />
}

const REPERES = [
  { icone: UserX, texte: 'Sans compte' },
  { icone: MailCheck, texte: 'Lu par une personne de l’équipe' },
  { icone: Clock, texte: 'Données personnelles : réponse sous un mois' },
] as const

export default function Page(props: { searchParams: Params }) {
  return (
    <main>
      <Balisage donnees={pageWeb('ContactPage', { nom: 'Contacter l’équipe DentalMap', chemin: '/contact/', description: DESCRIPTION })} />
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Contact', chemin: '/contact/' }])} />

      <section className="container pb-12 pt-8 md:pb-16">
        <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: 'Contact' }]} />
        {/* Le H1 porte le sujet de la page ; le slogan dessous garde sa taille. */}
        <h1 className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-fg-2">
          <span className="size-1.5 rounded-full bg-teal" /> Contacter l’équipe DentalMap
        </h1>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <p className="text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            Nous écrire
            <span className="block text-fg-2">une personne vous répond.</span>
          </p>
          <ul className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
            {REPERES.map((r) => (
              <li key={r.texte} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm text-fg">
                <r.icone className="size-4 text-teal" aria-hidden />
                {r.texte}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Suspense fallback={<EntreesContact />}>
        <EntreesSelonUrl searchParams={props.searchParams} />
      </Suspense>

      <section className="border-t border-line bg-bg-soft">
        <div className="container py-16 md:py-20">
          <CarteContact />
        </div>
      </section>

      <div className="pt-16 md:pt-20">
        <CtaCompte />
      </div>
    </main>
  )
}
