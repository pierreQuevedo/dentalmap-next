import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Etapes, Pictogramme, Puce, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { pscConfigure } from '@/lib/psc/config'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { getFicheRevendication } from '@/lib/espace-pro/parcours'
import { CoquilleParcours, garde } from '../_commun'

export const metadata: Metadata = { title: 'Pro Santé Connect', robots: { index: false, follow: false } }
export const instant = false

/**
 * PSC1, « Vous quittez DentalMap quelques instants ».
 *
 * Dit où l'on va, ce que DentalMap recevra, et ce qu'il faut avoir sous la
 * main. Le choix entre l'application et la carte n'est qu'indicatif : Pro
 * Santé Connect propose les deux. Le bouton part par la route d'API, qui pose
 * l'état signé et redirige vers l'ANS.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; objet?: string }> }) {
  const { fiche: slug, objet } = await props.searchParams
  const retrait = objet === 'retrait'
  const requete = new URLSearchParams({ ...(slug ? { fiche: slug } : {}), ...(retrait ? { objet: 'retrait' } : {}) }).toString()
  const compte = await garde(`${REVENDIQUER}/psc/${requete ? `?${requete}` : ''}`)
  if (!pscConfigure()) redirect(chemin(`${REVENDIQUER}/psc/erreur/?code=indisponible${slug ? `&fiche=${encodeURIComponent(slug)}` : ''}`))
  const fiche = slug ? await getFicheRevendication(slug, compte.id) : null
  const annuler = retrait && fiche ? `${REVENDIQUER}/${encodeURIComponent(fiche.slug)}/retrait/` : `${REVENDIQUER}/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`

  return (
    <CoquilleParcours
      fiche={fiche}
      encart={{ icone: 'sortie', titre: 'Vers l’Agence du Numérique en Santé', texte: 'Retour automatique sur DentalMap après validation.' }}
      retour={annuler}
      libelleRetour="Annuler"
    >
      <Etapes etape={2} libelle="Identification" />
      <Pictogramme icone={ExternalLink} />
      <h1 className={titre}>Vous quittez DentalMap quelques instants</h1>
      <p className="mt-2 text-sm text-fg-2">Pro Santé Connect est le service d’identification de l’Agence du Numérique en Santé. Vous reviendrez ici ensuite.</p>

      <div className="squircle-xl mt-6 border border-line bg-bg-soft px-4 py-3.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Ce que DentalMap reçoit</p>
        <p className="mt-2 text-[13px] leading-[18px] text-fg">Votre identifiant national (RPPS), vos nom et prénom, votre profession. Rien d’autre n’est conservé.</p>
      </div>

      <fieldset className="mt-5">
        <legend className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Gardez à portée de main</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Puce name="support" value="ecps" defaultChecked>
            Application e-CPS
          </Puce>
          <Puce name="support" value="carte">
            Carte CPS et lecteur
          </Puce>
        </div>
      </fieldset>

      <a href={`/api/psc/connexion/${requete ? `?${requete}` : ''}`} className={`${principal} mt-5`}>
        <ExternalLink className="size-4" aria-hidden />
        Continuer vers Pro Santé Connect
      </a>
      <Link href={chemin(annuler)} className={`${discret} mt-1`}>
        Annuler
      </Link>
    </CoquilleParcours>
  )
}
