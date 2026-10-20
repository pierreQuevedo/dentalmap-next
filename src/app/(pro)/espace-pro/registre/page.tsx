import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Lock, MapPin, ShieldCheck } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { getChiffresCles } from '@/lib/annuaire/queries'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { formaterSiret } from '@/lib/espace-pro/labo'
import { sirenDe } from '@/lib/espace-pro/parcours'
import { chargerTableau } from '../_commun'
import { adresseDe, libelleModeExercice, libelleProfession, nomDe } from '../../../(compte)/espace-pro/revendiquer/_commun'

export const metadata: Metadata = { title: 'Registre', robots: { index: false, follow: false } }
export const instant = false

/** Ce que le registre dit du praticien, en lecture seule, et ses lieux d'exercice. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque } = await chargerTableau('registre', (await props.searchParams).fiche)
  const { fiche } = espace
  const synchro = (await getChiffresCles()).synchroniseLe
  const geres = new Set(fiche.demande?.lieuxGeres ?? [])
  const sourceNom = fiche.rpps ? 'l’Annuaire Santé' : 'la base Sirene'
  const siren = espace.labo ? await sirenDe(fiche.id) : null
  return (
    <CoqueEspace c={coque} actif="registre" titre="Registre" sousTitre={`Ce que ${sourceNom} dit de vous, synchronisé chaque semaine`}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={ShieldCheck} droite={<span className="squircle-full inline-flex items-center gap-1 bg-bg-soft px-2 py-0.5 text-xs text-fg-2"><Lock className="size-3" aria-hidden /> Lecture seule</span>}>
              Identité professionnelle
            </TitreTuile>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
              {[
                ['Nom', nomDe(fiche)],
                ['Profession', espace.labo ? 'Laboratoire de prothèse dentaire' : libelleProfession(fiche)],
                ...(fiche.rpps ? [['Numéro RPPS', fiche.rpps]] : []),
                ...(siren ? [['SIREN', formaterSiret(siren) ?? siren]] : []),
                ...(espace.labo
                  ? []
                  : [
                      ['Spécialité ordinale', fiche.specialite ?? 'Aucune déclarée'],
                      ['Mode d’exercice', libelleModeExercice(fiche.modeExercice)],
                    ]),
                ['Dernière synchronisation', synchro ? new Date(synchro).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Inconnue'],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-fg-2">{k}</dt>
                  <dd className={k === 'Numéro RPPS' || k === 'SIREN' ? 'font-mono text-fg' : 'text-fg'}>{v}</dd>
                </div>
              ))}
            </dl>
          </Tuile>
          <Tuile>
            <TitreTuile
              i={Building2}
              droite={
                fiche.lieux.length > 1 && (
                  <Link href={chemin(`/espace-pro/lieux/?fiche=${encodeURIComponent(fiche.slug)}`)} className="text-sm text-fg underline-offset-4 hover:underline">
                    Choisir les lieux gérés
                  </Link>
                )
              }
            >
              {espace.labo ? 'Établissements' : 'Lieux d’exercice'}
            </TitreTuile>
            <ul className="mt-4 divide-y divide-line">
              {fiche.lieux.map((l) => (
                <li key={l.id} className="flex items-start gap-2 py-3 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                  <span>
                    <span className="block text-fg">{adresseDe(l) ?? 'Adresse inconnue'}</span>
                    <span className="block text-xs text-fg-2">
                      {l.principal ? (espace.labo ? 'Siège' : 'Lieu principal') : espace.labo ? 'Établissement secondaire' : 'Second lieu'}
                      {fiche.lieux.length > 1 && (geres.size === 0 || geres.has(l.id) ? ' · géré' : ' · non géré')}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Tuile>
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={ShieldCheck}>Une erreur ?</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">
              Ces données viennent {fiche.rpps ? 'du répertoire partagé des professionnels de santé. La mise à jour se fait auprès de l’Ordre' : 'de la base Sirene. La mise à jour se fait auprès de l’INSEE'} ; DentalMap la reprend à la synchronisation suivante.
            </p>
            <Link href={chemin('/contact/?objet=erreur-fiche')} className="mt-4 inline-flex text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
              Signaler un écart
            </Link>
          </Tuile>
          <Tuile>
            <TitreTuile i={Lock}>Retirer la fiche</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">C’est votre droit : la fiche disparaît du site après vérification de votre identité, annulable trente jours.</p>
            <Link href={chemin(espace.labo ? '/contact/' : `${REVENDIQUER}/${encodeURIComponent(fiche.slug)}/retrait/`)} className="mt-4 inline-flex text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
              Retirer ma fiche de DentalMap
            </Link>
          </Tuile>
        </aside>
      </div>
    </CoqueEspace>
  )
}
