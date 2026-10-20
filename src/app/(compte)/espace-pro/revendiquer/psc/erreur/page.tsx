import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleX, RefreshCw } from 'lucide-react'
import { Encart, Pictogramme, principal, secondaire, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { pscOuvert } from '@/lib/psc/config'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { getFicheRevendication } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, garde } from '../../_commun'

export const metadata: Metadata = { title: 'Pro Santé Connect n’a pas abouti', robots: { index: false, follow: false } }
export const instant = false

/**
 * PSC-E : ne jamais bloquer. Une phrase par cause, posée par les routes
 * `/api/psc/*`, et toujours deux issues : réessayer, ou retrouver sa fiche
 * autrement.
 */
const MESSAGES: Record<string, string> = {
  annule: 'La connexion a été annulée ou interrompue. Rien n’a été enregistré : vous pouvez réessayer, ou retrouver votre fiche autrement.',
  etat: 'La vérification a expiré ou a été ouverte dans un autre navigateur. Rien n’a été enregistré : relancez-la.',
  session: 'Votre session a changé pendant la vérification. Rien n’a été enregistré : relancez-la depuis ce navigateur.',
  technique: 'Pro Santé Connect n’a pas répondu comme attendu. Rien n’a été enregistré : réessayez dans quelques minutes, ou retrouvez votre fiche autrement.',
  profession: 'L’identité renvoyée n’est pas celle d’un chirurgien-dentiste ou d’un médecin du RPPS. Rien n’a été enregistré.',
  rpps: 'Le numéro RPPS de votre carte n’est pas celui de cette fiche. Vérifiez que c’est bien la vôtre, ou cherchez-la par votre numéro.',
  fiche: 'Cette fiche n’existe plus, ou ne peut pas être revendiquée. Rien n’a été enregistré.',
  indisponible: 'L’identification par Pro Santé Connect n’est pas encore ouverte. Retrouvez votre fiche : l’équipe peut vérifier votre identité avec vous.',
}

export default async function Page(props: { searchParams: Promise<{ code?: string; fiche?: string }> }) {
  const { code = 'technique', fiche: slug } = await props.searchParams
  const compte = await garde(`${REVENDIQUER}/psc/erreur/?code=${encodeURIComponent(code)}`)
  const fiche = slug ? await getFicheRevendication(slug, compte.id) : null
  const reessayer = pscOuvert() && code !== 'indisponible' && code !== 'profession'
  const versRecherche = fiche && code !== 'rpps' ? `${REVENDIQUER}/${encodeURIComponent(fiche.slug)}/` : `${REVENDIQUER}/recherche/`

  return (
    <CoquilleParcours encart={{ icone: 'erreur', ton: 'erreur', titre: 'Identification interrompue', texte: 'Rien n’a été enregistré.' }}>
      <Pictogramme icone={CircleX} ton="erreur" />
      <h1 className={titre}>{code === 'indisponible' ? 'Pro Santé Connect arrive bientôt' : 'Pro Santé Connect n’a pas abouti'}</h1>
      <p className="mt-2 text-sm text-fg-2">{MESSAGES[code] ?? MESSAGES.technique}</p>
      {reessayer && (
        <Link href={chemin(`${REVENDIQUER}/psc/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`)} className={`${principal} mt-6`}>
          <RefreshCw className="size-4" aria-hidden />
          Réessayer
        </Link>
      )}
      <Link href={chemin(versRecherche)} className={`${reessayer ? secondaire : principal} ${reessayer ? 'mt-3' : 'mt-6'}`}>
        Rechercher ma fiche
      </Link>
      {reessayer && (
        <Encart className="mt-4">Si le problème persiste, l’application e-CPS est peut-être à mettre à jour.</Encart>
      )}
    </CoquilleParcours>
  )
}
