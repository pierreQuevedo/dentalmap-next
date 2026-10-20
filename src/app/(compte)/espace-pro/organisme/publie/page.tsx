import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowUpRight, CircleCheck, Hourglass, LayoutGrid, Pencil } from 'lucide-react'
import { Pictogramme, cadre, discret, principal, secondaire, titre } from '@/components/compte/ui'
import { ResumeEtablissement } from '@/components/espace/etablissement'
import { chemin } from '@/lib/navigation'
import { actives } from '@/lib/espace-pro/etablissement'
import { ESPACE_ETAB, getFicheEtablissement } from '@/lib/espace-pro/etablissement-donnees'
import { CoquilleOrganisme, ORGANISME, etablissementOu404, gardeOrganisme, lignesDe } from '../_commun'

export const metadata: Metadata = { title: 'Votre établissement est en ligne', robots: { index: false, follow: false } }

/**
 * OEND : la publication est faite (l'action a invalidé `wp:formation`). Une
 * attestation encore en examen donne la variante « prêtes, en attente ».
 */
type Params = { fiche?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const ici = `${ORGANISME}/publie/?fiche=${encodeURIComponent(sp.fiche ?? '')}`
  const compte = await gardeOrganisme(ici)
  const { source, gestion } = await etablissementOu404(sp.fiche, compte)
  const fiche = await getFicheEtablissement(source.slug)
  if (!gestion || !fiche) redirect(chemin(`${ORGANISME}/etablissement/`))
  const enLigne = gestion.statut === 'acceptee' && !!fiche.publieeLe
  const n = actives(fiche.donnees).length
  const modifier = `${ORGANISME}/formations/?fiche=${encodeURIComponent(source.slug)}`
  const espace = `${ESPACE_ETAB}/?fiche=${encodeURIComponent(source.slug)}`

  return (
    <CoquilleOrganisme
      source={source}
      lignes={lignesDe(fiche.donnees.formations)}
      etiquette={enLigne ? 'Gérée par l’établissement' : 'Vérification en cours'}
      retour={source.lien}
      libelleRetour="Retour au site"
    >
      <Pictogramme icone={enLigne ? CircleCheck : Hourglass} ton={enLigne ? 'succes' : 'attention'} />
      <h1 className={titre}>{enLigne ? 'Votre établissement est en ligne' : 'Vos formations sont prêtes'}</h1>
      <p className="mt-2 text-sm text-fg-2">
        {enLigne
          ? 'Les étudiants le trouvent dès maintenant dans l’annuaire de la formation.'
          : 'Elles seront publiées dès la vérification de votre attestation, sous 48 heures ouvrées. Un email vous prévient.'}
      </p>
      <div className={`${cadre} mt-6`}>
        <ResumeEtablissement
          titre={source.titre}
          type={source.type}
          adresse={source.adresse ?? source.ville}
          uai={null}
          ligne={`${n} formation${n > 1 ? 's' : ''} active${n > 1 ? 's' : ''}`}
          verifie={enLigne ? gestion.methode : null}
        />
      </div>
      {enLigne ? (
        <>
          <Link href={chemin(source.lien)} className={`${principal} mt-6`}>
            <ArrowUpRight className="size-4" aria-hidden />
            Voir la fiche publique
          </Link>
          {/* La suite logique : photos, portes ouvertes, présentation. */}
          <Link href={chemin(espace)} className={`${secondaire} mt-3`}>
            <LayoutGrid className="size-4" aria-hidden />
            Compléter ma page depuis mon espace
          </Link>
          <Link href={chemin(modifier)} className={`${discret} mt-1`}>
            <Pencil className="size-4" aria-hidden />
            Modifier les formations
          </Link>
        </>
      ) : (
        <>
          <Link href={chemin(espace)} className={`${principal} mt-6`}>
            <LayoutGrid className="size-4" aria-hidden />
            Aller à mon espace
          </Link>
          <Link href={chemin(modifier)} className={`${secondaire} mt-3`}>
            <Pencil className="size-4" aria-hidden />
            Modifier les formations
          </Link>
        </>
      )}
    </CoquilleOrganisme>
  )
}
