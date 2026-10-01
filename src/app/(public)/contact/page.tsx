import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CarteContact } from '@/components/contact/carte-contact'
import { CtaCompte } from '@/components/contact/cta-compte'
import { FormulaireContact } from '@/components/contact/formulaire-contact'
import { ServicesContact } from '@/components/contact/services-contact'
import { estObjet } from '@/lib/contact/objets'
import { Balisage, filAriane } from '@/lib/seo/jsonld'

/**
 * Page contact, sur le modèle d'Untitled UI (contact page 03), sans la
 * section des boutiques : le formulaire et la carte en tête, les entrées par
 * public ensuite, et l'appel à créer son compte pour finir.
 *
 * L'objet du message peut arriver par l'URL, `?objet=erreur-fiche` depuis le
 * pied de page par exemple. Lire l'URL est une donnée de requête : seul le
 * formulaire en dépend, derrière un `Suspense` dont le repli est le même
 * formulaire sans présélection, de sorte que le reste de la page reste une
 * coquille statique. Le formulaire est remonté à chaque objet, ce qui remet
 * ses champs à zéro plutôt que de mêler deux demandes.
 */
export const metadata: Metadata = {
  title: 'Contact',
  description: 'Signaler une erreur sur une fiche, poser une question, proposer un partenariat ou exercer vos droits sur vos données.',
}

type Params = Promise<{ objet?: string }>

async function FormulaireSelonUrl({ searchParams }: { searchParams: Params }) {
  const { objet } = await searchParams
  const objetInitial = estObjet(objet) ? objet : undefined
  return <FormulaireContact key={objetInitial ?? 'vide'} objetInitial={objetInitial} />
}

export default function Page(props: { searchParams: Params }) {
  return (
    <main>
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Contact', chemin: '/contact/' }])} />

      <section className="py-12 md:py-20">
        <div className="container grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Nous contacter</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Une erreur sur une fiche, une question sur l’annuaire, un projet à nous proposer : écrivez-nous, une personne de l’équipe vous répond.
            </p>
            <div id="formulaire" className="mt-10 scroll-mt-28">
              <Suspense fallback={<FormulaireContact />}>
                <FormulaireSelonUrl searchParams={props.searchParams} />
              </Suspense>
            </div>
          </div>
          <CarteContact />
        </div>
      </section>

      <ServicesContact />
      <CtaCompte />
    </main>
  )
}
