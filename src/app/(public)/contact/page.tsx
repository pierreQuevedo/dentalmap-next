import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Clock, MailCheck, UserX } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteContact } from '@/components/contact/carte-contact'
import { CtaCompte } from '@/components/contact/cta-compte'
import { EntreesContact } from '@/components/contact/entrees-contact'
import { FormulaireContact } from '@/components/contact/formulaire-contact'
import { estObjet } from '@/lib/contact/objets'
import { Balisage, filAriane } from '@/lib/seo/jsonld'

/**
 * Page contact, dans le style des pages de la vitrine : titre en deux tons,
 * les entrées par public d'abord (on choisit son cas avant d'écrire), puis le
 * formulaire à côté de ce qui se passe ensuite, et l'appel aux
 * professionnels pour finir.
 *
 * L'objet du message, et pour une erreur la fiche concernée, peuvent arriver
 * par l'URL (`?objet=erreur-fiche&fiche=…` depuis une fiche). Lire l'URL est
 * une donnée de requête : seul le formulaire en dépend, derrière un
 * `Suspense` dont le repli est le même formulaire sans présélection, de sorte
 * que le reste de la page reste une coquille statique. Le formulaire est
 * remonté à chaque objet, ce qui remet ses champs à zéro plutôt que de mêler
 * deux demandes.
 */
export const metadata: Metadata = {
  title: 'Contact',
  description: 'Signaler une erreur sur une fiche ou une annonce, poser une question, proposer un partenariat ou exercer vos droits sur vos données.',
  alternates: { canonical: '/contact/' },
}

type Params = Promise<{ objet?: string; fiche?: string }>

/** Le slug d'une fiche passé par l'URL, gardé seulement s'il en a la forme. */
function ficheDepuisUrl(v: string | undefined): string | undefined {
  return v && /^[a-z0-9-]{1,120}$/.test(v) ? v : undefined
}

async function FormulaireSelonUrl({ searchParams }: { searchParams: Params }) {
  const { objet, fiche } = await searchParams
  const objetInitial = estObjet(objet) ? objet : undefined
  const ficheInitiale = ficheDepuisUrl(fiche)
  return <FormulaireContact key={`${objetInitial ?? 'vide'}-${ficheInitiale ?? ''}`} objetInitial={objetInitial} ficheInitiale={ficheInitiale} />
}

const REPERES = [
  { icone: UserX, texte: 'Sans compte' },
  { icone: MailCheck, texte: 'Lu par une personne de l’équipe' },
  { icone: Clock, texte: 'Données personnelles : réponse sous un mois' },
] as const

export default function Page(props: { searchParams: Params }) {
  return (
    <main>
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Contact', chemin: '/contact/' }])} />

      <section className="container pb-12 pt-8 md:pb-16">
        <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: 'Contact' }]} />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            Nous écrire
            <span className="block text-fg-2">une personne vous répond.</span>
          </h1>
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

      <EntreesContact />

      <section className="border-t border-line bg-bg-soft">
        <div className="container grid gap-4 py-16 md:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div id="formulaire" className="squircle-3xl scroll-mt-28 border border-line bg-bg p-6 shadow-pop md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Votre message</h2>
            <p className="mt-1 text-sm text-fg-2">Choisissez l’objet : il oriente votre message vers la bonne personne.</p>
            <div className="mt-8">
              <Suspense fallback={<FormulaireContact />}>
                <FormulaireSelonUrl searchParams={props.searchParams} />
              </Suspense>
            </div>
          </div>
          <CarteContact />
        </div>
      </section>

      <div className="pt-16 md:pt-20">
        <CtaCompte />
      </div>
    </main>
  )
}
