import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MapPin, Navigation, Pencil, SlidersHorizontal } from 'lucide-react'
import { CoqueEspace, Tuile } from '@/components/espace/coque'
import { CarteOffre } from '@/components/emploi/blocs'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { chemin } from '@/lib/navigation'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { LIBELLE_CONTRAT } from '@/lib/emploi/metiers'
import { getOffresPourVous } from '@/lib/emploi/pour-vous'
import { situationDe } from '@/lib/emploi/profil-candidat'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Offres pour vous', robots: { index: false, follow: false } }
export const instant = false

const PAR_PAGE = 12

/**
 * CAND-OFFRES et ETU-OFFRES : les offres qui répondent au profil candidat,
 * les plus proches d'abord, puis par titre. Les critères se règlent dans
 * « Mon profil candidat » ; « Rechercher un poste » reste là pour chercher
 * ailleurs.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; n?: string }> }) {
  const sp = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi('pour-vous', sp.fiche)
  const profil = await getProfilCandidat(compte.id)
  if (!profil) redirect(chemin(`/espace-pro/emploi/bienvenue/situation/${q}`))
  const resultat = await getOffresPourVous(profil, compte.id)
  const n = Math.max(PAR_PAGE, Math.min(100, Number(sp.n) || PAR_PAGE))
  const offres = resultat?.offres ?? []
  const etudiant = profil.situation === 'etudiant'
  const situation = situationDe(profil.situation)
  const criteres = [
    situation?.metier ? situation.libelle : null,
    ...(resultat?.contrats ?? []).map((c) => LIBELLE_CONTRAT[c]),
    `≤ ${profil.criteres.rayonKm} km`,
    profil.criteres.temps === 'plein' ? 'Temps plein' : profil.criteres.temps === 'partiel' ? 'Temps partiel' : null,
  ].filter((x): x is string => Boolean(x))
  const plus = `/espace-pro/emploi/pour-vous/${q}${q ? '&' : '?'}n=${n + PAR_PAGE}`

  return (
    <CoqueEspace
      c={coque}
      actif="emploi"
      titre="Emploi"
      sousTitre={resultat ? `${etudiant ? 'Alternances et stages' : 'Offres'} autour de ${resultat.ville}, selon votre profil et vos critères` : 'Offres pour vous'}
    >
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      <SousOngletsCandidat actif="pour-vous" q={q} />
      {!resultat ? (
        <Tuile>
          <p className="text-sm text-fg">Indiquez votre ville dans votre profil candidat pour voir les offres autour de vous.</p>
          <Link href={chemin(`/espace-pro/emploi/profil-candidat/${q}#recherche`)} className="mt-4 inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Compléter mon profil
          </Link>
        </Tuile>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="squircle-full inline-flex items-center gap-1.5 border border-line bg-bg px-3 py-1.5 text-sm text-fg">
              <SlidersHorizontal className="size-3.5" aria-hidden /> Vos critères
            </span>
            {criteres.map((c) => (
              <span key={c} className="squircle-full border border-teal bg-teal/10 px-3 py-1.5 text-sm font-medium text-teal">
                {c}
              </span>
            ))}
            <Link href={chemin(`/espace-pro/emploi/profil-candidat/${q}#recherche`)} className="inline-flex items-center gap-1 px-2 text-sm font-medium text-fg-2 hover:text-fg">
              <Pencil className="size-3.5" aria-hidden /> Modifier
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-fg">
              <span className="font-semibold">
                {offres.length} offre{offres.length > 1 ? 's' : ''}
              </span>{' '}
              <span className="text-fg-2">{offres.length > 1 ? 'correspondent' : 'correspond'} à vos critères</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm text-fg-2">
              <Navigation className="size-3.5" aria-hidden /> Les plus proches d’abord
            </p>
          </div>
          {offres.length === 0 ? (
            <Tuile className="mt-3">
              <div className="flex flex-col items-center px-6 py-8 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-fg-2">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <p className="mt-3 font-semibold text-fg">Aucune offre pour l’instant dans votre rayon</p>
                <p className="mt-1 max-w-sm text-sm text-fg-2">Élargissez votre rayon ou vos contrats dans votre profil, ou cherchez ailleurs. Une alerte vous prévient dès qu’une offre paraît.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link href={chemin(`/espace-pro/emploi/recherche/${q}`)} className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong">
                    Rechercher un poste
                  </Link>
                  <Link href={chemin(`/espace-pro/emploi/alertes/${q}${q ? '&' : '?'}alerte=nouvelle`)} className="inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                    Créer une alerte
                  </Link>
                </div>
              </div>
            </Tuile>
          ) : (
            <ul className="mt-3 grid gap-3 lg:grid-cols-2">
              {offres.slice(0, n).map((o) => (
                <CarteOffre key={o.id} o={o} forme="ligne" />
              ))}
            </ul>
          )}
          {offres.length > n && (
            <p className="mt-4 text-center">
              <Link href={chemin(plus)} scroll={false} className="text-sm font-medium text-fg underline underline-offset-4">
                Afficher {Math.min(PAR_PAGE, offres.length - n)} offres de plus
              </Link>
            </p>
          )}
          <p className="mt-4 text-center text-xs text-fg-2">Toutes les offres affichent leur rémunération. Les offres sont triées par distance.</p>
        </>
      )}
    </CoqueEspace>
  )
}
