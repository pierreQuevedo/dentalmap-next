import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { Encart, Etapes, FicheResume, Pictogramme, discret, pastille, pastilleInvalide, principal, saisie, titre } from '@/components/compte/ui'
import { SurvolFiche } from '@/components/compte/survol-fiche'
import { chemin } from '@/lib/navigation'
import { nomAffiche } from '@/lib/annuaire/types'
import { ouvrirFicheLabo } from '@/lib/espace-pro/actions-revendication'
import { nettoyerNumero, sirenValide, siretValide } from '@/lib/espace-pro/labo'
import { chercherLabos, getFicheRevendication } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, adresseDe, garde } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Retrouvons votre laboratoire', robots: { index: false, follow: false } }
export const instant = false

/**
 * L1 : retrouver la fiche du laboratoire, par SIREN, SIRET ou raison sociale.
 * Depuis une fiche (`?fiche=`), la recherche est faite : on passe droit au
 * rôle (L2). Un résultat : L2. Plusieurs : le choix. Aucun : la demande
 * d'ajout (LA1).
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; q?: string }> }) {
  const sp = await props.searchParams
  const q = (sp.q ?? '').trim()
  const ici = `${LABO}/${sp.fiche ? `?fiche=${encodeURIComponent(sp.fiche)}` : q ? `?q=${encodeURIComponent(q)}` : ''}`
  const compte = await garde(ici, 'prothesiste')
  if (sp.fiche) {
    const fiche = await getFicheRevendication(sp.fiche, compte.id)
    if (fiche) redirect(chemin(versLabo(fiche.slug)))
  }

  const chiffres = nettoyerNumero(q)
  const numero = /^\d{9}$|^\d{14}$/.test(chiffres)
  const cleFausse = numero && !(chiffres.length === 9 ? sirenValide(chiffres) : siretValide(chiffres))
  const resultats = q && !cleFausse ? await chercherLabos(q) : []
  if (resultats.length === 1) redirect(chemin(versLabo(resultats[0].slug)))

  if (q && !cleFausse && resultats.length === 0) {
    return (
      <CoquilleParcours profession="prothesiste" recherche={q} encart={{ icone: 'sablier', ton: 'attention', titre: 'Absent de l’annuaire', texte: 'Contrôle Sirene avant toute création.' }} retour={LABO + '/'} libelleRetour="Modifier ma recherche">
        <Etapes etape={1} libelle="Laboratoire" />
        <Pictogramme icone={Search} />
        <h1 className={titre}>Aucun laboratoire ne correspond</h1>
        <p className="mt-2 text-sm text-fg-2">
          Rien pour « <span className="font-medium text-fg">{q}</span> ». Un laboratoire créé récemment n’apparaît qu’après la synchronisation de la base Sirene.
        </p>
        <Link href={chemin(`/espace-pro/laboratoire/ajout/${numero ? `?siret=${chiffres}` : ''}`)} className={`${principal} mt-6`}>
          Demander l’ajout du laboratoire
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href={chemin(`${LABO}/`)} className={`${discret} mt-1`}>
          Modifier ma recherche
        </Link>
      </CoquilleParcours>
    )
  }

  // Plusieurs laboratoires : le choix, comme H1 côté dentiste. Vingt au plus : au-delà, mieux vaut le SIREN.
  if (resultats.length > 1) {
    const plafond = resultats.length >= 20
    const titreListe = plafond ? 'Au moins 20 laboratoires correspondent' : `${resultats.length} laboratoires correspondent`
    return (
      <CoquilleParcours profession="prothesiste" praticiens={resultats} etiquette={titreListe} recherche={q} retour={`${LABO}/?q=${encodeURIComponent(q)}`} libelleRetour="Nouvelle recherche">
        <Etapes etape={1} libelle="Laboratoire" />
        <h1 className={titre}>{titreListe}</h1>
        <p className="mt-2 text-sm text-fg-2">Choisissez le vôtre{plafond ? ', ou cherchez par SIREN : il est sur votre extrait Kbis.' : '.'}</p>
        <form action={ouvrirFicheLabo} className="mt-6">
          <fieldset>
            <legend className="sr-only">Votre laboratoire</legend>
            {/* Hauteur bornée : le haut de la page et les boutons restent visibles, la liste défile. */}
            <div className="-mx-1 grid max-h-[min(46dvh,26rem)] gap-2.5 overflow-y-auto overscroll-contain px-1 py-1">
              {resultats.map((r, i) => (
                <SurvolFiche key={r.slug} index={i}>
                  <label className="group squircle-xl relative flex cursor-pointer items-center border border-line bg-bg px-[18px] py-4 transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:checked]:ring-[0.5px] has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action">
                    <input type="radio" name="fiche" value={r.slug} defaultChecked={i === 0} required className="sr-only" />
                    <FicheResume profession="Laboratoire de prothèse" nom={nomAffiche({ ...r, profession: 'prothesiste' })} adresse={adresseDe(r)} rpps={null}>
                      <span aria-hidden className="size-5 shrink-0 rounded-full border border-line-strong bg-bg transition-[border-width,border-color] group-has-[:checked]:border-[6px] group-has-[:checked]:border-fg" />
                    </FicheResume>
                  </label>
                </SurvolFiche>
              ))}
            </div>
          </fieldset>
          <button type="submit" className={`${principal} mt-4`}>
            C’est mon laboratoire
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </form>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Link href={chemin(`${LABO}/?q=${encodeURIComponent(q)}`)} className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-fg-2 hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden />
            Étape précédente
          </Link>
          <Link href={chemin('/espace-pro/laboratoire/ajout/')} className="inline-flex h-11 items-center text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
            Aucun n’est le mien
          </Link>
        </div>
      </CoquilleParcours>
    )
  }

  return (
    <CoquilleParcours profession="prothesiste" recherche={q} encart={{ icone: 'document', titre: 'Votre SIREN', texte: 'Sur l’extrait Kbis, ou sur annuaire-entreprises.data.gouv.fr.' }} retour="/">
      <Etapes etape={1} libelle="Laboratoire" />
      <h1 className={titre}>Retrouvons votre laboratoire</h1>
      <p className="mt-2 text-sm text-fg-2">Votre SIREN ou SIRET est le plus sûr. La raison sociale marche aussi.</p>
      <form method="get" action={chemin(`${LABO}/`)} className="mt-6">
        <label htmlFor="labo-q" className="mb-1.5 block text-sm font-medium text-fg">
          SIREN, SIRET ou raison sociale
        </label>
        <div className={cleFausse ? pastilleInvalide : pastille}>
          <Search className="size-4 shrink-0 text-fg-2" aria-hidden />
          <input id="labo-q" name="q" required minLength={2} autoFocus defaultValue={q} placeholder="812 345 678" aria-invalid={cleFausse || undefined} aria-describedby="labo-aide" className={`${saisie} font-mono`} />
        </div>
        <p id="labo-aide" className={`mt-1.5 text-xs ${cleFausse ? 'text-destructive' : 'text-fg-2'}`}>
          {cleFausse ? 'Ce numéro ne passe pas le contrôle de clé : un chiffre est sans doute mal saisi.' : 'Sur votre extrait Kbis ou sur annuaire-entreprises.data.gouv.fr.'}
        </p>
        <button type="submit" className={`${principal} mt-5`}>
          <Search className="size-4" aria-hidden />
          Rechercher
        </button>
      </form>
      <Link href={chemin('/espace-pro/laboratoire/ajout/')} className={`${discret} mt-1`}>
        Mon laboratoire vient d’être créé
      </Link>
      <Encart className="mt-4">Vous êtes prothésiste salarié ? Recherchez le laboratoire qui vous emploie : l’écran suivant vous propose votre rôle.</Encart>
    </CoquilleParcours>
  )
}
