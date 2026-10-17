import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { Encart, Etapes, FicheResume, Pictogramme, cadre, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { COOKIE_IDENTITE, descellerIdentite } from '@/lib/psc/etat'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { confirmerPsc } from '@/lib/espace-pro/actions-revendication'
import { CoquilleParcours, adresseDe, ficheOu404, garde, libelleProfession, nomDe } from '../../_commun'

export const metadata: Metadata = { title: 'Pro Santé Connect a confirmé votre identité', robots: { index: false, follow: false } }
export const instant = false

/**
 * PSC2 : l'ANS a certifié le RPPS, et voici la fiche qui le porte. Rien n'est
 * écrit avant « Revendiquer et continuer ». Si la fiche est déjà gérée par un
 * autre compte, la confirmation ouvre une contestation (C1) au lieu d'accorder.
 */
export default async function Page() {
  const compte = await garde(`${REVENDIQUER}/psc/confirmer/`)
  const identite = descellerIdentite((await cookies()).get(COOKIE_IDENTITE)?.value, compte.id)
  if (!identite) redirect(chemin(`${REVENDIQUER}/psc/erreur/?code=etat`))
  const fiche = await ficheOu404(identite.fiche, compte)

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={fiche.gereeParUnAutre ? 'Gérée par un autre compte' : 'Fiche non revendiquée'}
      encart={{ icone: 'carte', titre: 'Identifié par Pro Santé Connect', texte: 'RPPS confirmé par l’ANS.' }}
    >
      <Etapes etape={3} libelle="Identification" />
      <Pictogramme icone={CircleCheck} ton="succes" />
      <h1 className={titre}>Bonjour {nomDe(fiche)}</h1>
      <p className="mt-2 text-sm text-fg-2">Pro Santé Connect a confirmé votre identité. Voici la fiche qui porte votre numéro RPPS.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession={libelleProfession(fiche)} nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={fiche.rpps} verifiee />
      </div>
      {fiche.gereeParUnAutre && (
        <Encart titre="Cette fiche est déjà gérée par un autre compte" className="mt-4">
          Votre preuve est la plus forte : le compte actuel aura sept jours pour répondre, puis la fiche vous sera transférée.
        </Encart>
      )}
      <form action={confirmerPsc}>
        <button type="submit" className={`${principal} mt-4`}>
          Revendiquer et continuer
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
      <Link href={chemin(`${REVENDIQUER}/recherche/`)} className={`${discret} mt-1`}>
        Ce n’est pas ma fiche
      </Link>
    </CoquilleParcours>
  )
}
