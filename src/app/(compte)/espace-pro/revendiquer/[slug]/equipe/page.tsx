import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Phone } from 'lucide-react'
import { Encart, Etapes, discret, pastille, principal, saisie, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { demanderEquipe } from '@/lib/espace-pro/actions-revendication'
import { FenetreParcours, dejaEngage, ficheOu404, garde, nomDe, versFiche } from '../../_commun'

export const metadata: Metadata = { title: 'Demander à l’équipe', robots: { index: false, follow: false } }
export const instant = false

/**
 * S3b et C1, voie « Demander à l'équipe », en fenêtre au-dessus de la carte
 * floutée : sans carte CPS ni e-CPS, l'équipe vérifie l'identité à la main.
 * Après l'envoi, le praticien enchaîne sur l'onboarding. La demande crée une revendication en
 * attente : le praticien prépare sa fiche en brouillon pendant ce temps, rien
 * n'est publié avant l'accord. Aucun document n'est demandé.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ objet?: string }> }) {
  const { slug } = await props.params
  const retrait = (await props.searchParams).objet === 'retrait'
  const compte = await garde(`${REVENDIQUER}/${slug}/equipe/${retrait ? '?objet=retrait' : ''}`)
  const fiche = await ficheOu404(slug, compte)
  if (!retrait) {
    const deja = dejaEngage(fiche)
    if (deja) redirect(chemin(deja))
  }
  const versMethode = `${versFiche(fiche, fiche.gereeParUnAutre && !retrait ? 'conflit' : 'methode')}${retrait ? '?objet=retrait' : ''}`

  return (
    <FenetreParcours fiche={fiche} etiquette={retrait ? 'Retrait demandé' : 'Vérification en cours'} recherche={fiche.rpps ?? nomDe(fiche)} retour={versMethode}>
      <Etapes etape={3} libelle="Vérification" />
      <h1 id="fenetre-titre" className={titre}>Demander à l’équipe</h1>
      <p className="mt-2 text-sm text-fg-2">
        {retrait
          ? 'L’équipe vérifie votre identité avec vous avant de retirer la fiche : personne d’autre ne peut la retirer à votre place.'
          : 'Vous n’avez ni carte CPS ni e-CPS ? L’équipe vérifie votre identité avec vous, par téléphone au cabinet ou par email, et vous répond sous 48 heures ouvrées.'}
      </p>
      {!retrait && !fiche.gereeParUnAutre && (
        <Encart titre="Préparez votre fiche dès maintenant" className="mt-5">
          Après l’envoi, vous continuez directement sur votre fiche : horaires, conventionnement, accueil. Tout reste en brouillon et sera publié dès que l’équipe aura vérifié votre identité.
        </Encart>
      )}
      <form action={demanderEquipe} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="objet" value={retrait ? 'retrait' : 'revendication'} />
        <label htmlFor="equipe-telephone" className="mb-1.5 block text-sm font-medium text-fg">
          Un téléphone pour vous joindre <span className="font-normal text-fg-2">(facultatif)</span>
        </label>
        <div className={pastille}>
          <Phone className="size-4 shrink-0 text-fg-2" aria-hidden />
          <input id="equipe-telephone" name="telephone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="05 56 00 00 00" className={saisie} />
        </div>
        <label htmlFor="equipe-message" className="mb-1.5 mt-4 block text-sm font-medium text-fg">
          Un mot pour l’équipe <span className="font-normal text-fg-2">(facultatif)</span>
        </label>
        <textarea
          id="equipe-message"
          name="message"
          rows={3}
          maxLength={1000}
          placeholder="Le meilleur moment pour vous appeler, une précision sur votre exercice…"
          className="squircle-xl w-full resize-y border border-line bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
        />
        <button type="submit" className={`${principal} mt-5`}>
          {retrait || fiche.gereeParUnAutre ? 'Envoyer la demande' : 'Envoyer et préparer ma fiche'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
      <Link href={chemin(versMethode)} className={`${discret} mt-1`}>
        Choisir une autre preuve
      </Link>
    </FenetreParcours>
  )
}
