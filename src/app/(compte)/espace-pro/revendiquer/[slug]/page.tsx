import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Etapes, FicheResume, LignesRegistre, cadre, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { CoquilleParcours, adresseDe, dejaEngage, ficheOu404, garde, libelleModeExercice, libelleProfession, nomDe, pageFiche, versFiche } from '../_commun'

export const metadata: Metadata = { title: 'C’est bien vous ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * S2, « C'est bien vous ? ».
 *
 * Les données du registre, ligne à ligne et sous verrou : on vérifie la fiche
 * avant de la revendiquer, on ne la corrige pas ici. « C'est ma fiche » mène
 * au choix de la preuve, ou au conflit si un autre compte la gère déjà. Le
 * registre ne porte pas d'adresse électronique : la voie « lien sur l'email
 * du registre » (S3a) ne s'ouvre donc jamais.
 */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${REVENDIQUER}/${slug}/`)
  const fiche = await ficheOu404(slug, compte)
  const deja = dejaEngage(fiche)
  if (deja) redirect(chemin(deja))

  return (
    <CoquilleParcours
      fiche={fiche}
      etiquette={fiche.gereeParUnAutre ? 'Gérée par un autre compte' : 'Fiche non revendiquée'}
      recherche={fiche.rpps ?? nomDe(fiche)}
      retour={pageFiche(fiche)}
    >
      <Etapes etape={2} libelle="Identification" />
      <h1 className={titre}>C’est bien vous ?</h1>
      <p className="mt-2 text-sm text-fg-2">Vérifiez la fiche avant de la revendiquer. Ces informations viennent du registre et ne se modifient pas ici.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession={libelleProfession(fiche)} nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={fiche.rpps} />
      </div>
      <div className="mt-2.5">
        <LignesRegistre
          lignes={[
            { libelle: 'Profession', valeur: fiche.specialite ?? libelleProfession(fiche) },
            { libelle: 'Mode d’exercice', valeur: libelleModeExercice(fiche.modeExercice) },
            { libelle: 'Registre', valeur: fiche.rpps ? 'Annuaire Santé (ANS)' : 'Sirene (INSEE)' },
          ]}
        />
      </div>
      <Link href={chemin(versFiche(fiche, fiche.gereeParUnAutre ? 'conflit' : 'methode'))} className={`${principal} mt-4`}>
        C’est ma fiche
        <ArrowRight className="size-4" aria-hidden />
      </Link>
      <Link href={chemin(`${REVENDIQUER}/recherche/`)} className={`${discret} mt-1`}>
        Ce n’est pas moi
      </Link>
      <p className="mt-3 text-center text-xs text-fg-2">
        <Link href={chemin(versFiche(fiche, 'remplacant'))} className="underline underline-offset-2 hover:text-fg">
          Vous êtes remplaçant ou collaborateur ?
        </Link>
        {' · '}
        <Link href={chemin(versFiche(fiche, 'retrait'))} className="underline underline-offset-2 hover:text-fg">
          Retirer ma fiche de DentalMap
        </Link>
      </p>
    </CoquilleParcours>
  )
}
