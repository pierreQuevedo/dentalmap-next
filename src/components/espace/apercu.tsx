import Image from 'next/image'
import { Check, Clock, Euro, FileText, FlaskConical, ImageIcon, MapPin, ShieldCheck, Stethoscope, Truck, Users, Wrench, type LucideIcon } from 'lucide-react'
import type { Profession } from '@/lib/annuaire/types'
import type { FicheCompletee } from '@/lib/espace-pro/fiche-completee'
import { LIBELLE_PALIER, palierDe } from '@/lib/espace-pro/force'
import { resumeAccueil, resumeAujourdhui, resumeConventionnement, resumePresentation, resumeSoins } from '@/lib/espace-pro/resumes'

/**
 * Ce que voient les patients, à côté de la saisie.
 *
 * Une carte de fiche, bloc par bloc : ce qui est renseigné s'affiche tel que
 * les patients le liront, le reste dit « À compléter ». Le bloc en cours de
 * saisie est mis en avant. Sous la carte, la force et son palier.
 */
export type BlocApercu = 'horaires' | 'conventionnement' | 'accueil' | 'presentation' | 'soins'

export function ApercuPatient({
  nom,
  profession,
  libelleProfession,
  adresse,
  completee,
  enCours,
  force,
}: {
  nom: string
  profession: Profession
  libelleProfession: string
  adresse: string | null
  completee: FicheCompletee | null
  enCours?: BlocApercu
  force: number
}) {
  const blocs: { cle: BlocApercu; titre: string; i: LucideIcon; valeur: string | null }[] = [
    { cle: 'horaires', titre: 'Horaires', i: Clock, valeur: resumeAujourdhui(completee) },
    { cle: 'conventionnement', titre: 'Conventionnement', i: Euro, valeur: resumeConventionnement(completee) },
    { cle: 'accueil', titre: 'Accueil', i: Users, valeur: resumeAccueil(completee) },
    { cle: 'presentation', titre: 'Présentation', i: FileText, valeur: resumePresentation(completee) },
    { cle: 'soins', titre: 'Domaines de soins', i: Stethoscope, valeur: resumeSoins(completee, profession) },
  ]
  return (
    <div>
      <div className="squircle-2xl overflow-hidden border border-line bg-bg shadow-pop">
        <div className="relative grid aspect-[16/6] place-items-center bg-bg-soft text-xs text-fg-2">
          {completee?.photoUrl ? (
            <Image src={completee.photoUrl} alt="" fill sizes="28rem" className="object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5">
              <ImageIcon className="size-5" aria-hidden />
              Photo du cabinet · à compléter
            </span>
          )}
        </div>
        <div className="p-4">
          <span className="inline-block rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-medium text-teal">{libelleProfession}</span>
          <p className="mt-1.5 text-lg font-semibold tracking-tight text-fg">{nom}</p>
          {adresse && (
            <p className="mt-0.5 flex items-start gap-1 text-xs text-fg-2">
              <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
              {adresse}
            </p>
          )}
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-medium text-teal">
            <Check className="size-3" aria-hidden /> Vérifié auprès des registres officiels
          </span>
          <ul className="mt-3 space-y-1">
            {blocs.map((b) => {
              const actif = b.cle === enCours
              return (
                <li key={b.cle} className={`squircle-lg flex items-center gap-3 px-2 py-2 ${actif ? 'bg-teal/10 ring-1 ring-teal' : ''}`}>
                  <b.i className={`size-4 shrink-0 ${b.valeur || actif ? 'text-fg' : 'text-fg-2/60'}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-fg-2">{b.titre}</span>
                    <span className={`block truncate text-xs ${b.valeur ? 'text-fg' : 'text-fg-2'}`}>{b.valeur ?? 'À compléter'}</span>
                  </span>
                  {actif ? (
                    <span className="shrink-0 rounded-full bg-teal px-2 py-0.5 text-[10px] font-medium text-white">En cours</span>
                  ) : (
                    b.valeur && <span className="hidden shrink-0 rounded-full bg-bg-soft px-2 py-0.5 text-[10px] text-fg-2 xl:inline">Renseigné par le praticien</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <BandeauForce force={force} className="mt-3" />
    </div>
  )
}

/** « Fiche à 70 % · Avancé », avec l'anneau et la règle de classement. */
export function BandeauForce({ force, className = '' }: { force: number; className?: string }) {
  return (
    <div className={`squircle-2xl flex items-center gap-3 border border-line bg-bg p-3 ${className}`}>
      <Anneau pct={force} taille={44} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg">
          Fiche à {force} % · {LIBELLE_PALIER[palierDe(force)]}
        </p>
      </div>
    </div>
  )
}

/** L'anneau de force, en SVG. */
export function Anneau({ pct, taille = 64, sombre = false, legende }: { pct: number; taille?: number; sombre?: boolean; legende?: string }) {
  const c = 2 * Math.PI * 44
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: taille, height: taille }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className={sombre ? 'text-white/10' : 'text-line'} />
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} className="text-teal" />
      </svg>
      <span className="text-center leading-none">
        <span className={`block font-semibold tracking-tight ${sombre ? 'text-white' : 'text-fg'}`} style={{ fontSize: taille * 0.24 }}>
          {pct} %
        </span>
        {legende && <span className={`mt-1 block text-[10px] ${sombre ? 'text-white/60' : 'text-fg-2'}`}>{legende}</span>}
      </span>
    </span>
  )
}

/**
 * Ce que voient les cabinets d'un laboratoire : savoir-faire, matériaux,
 * délais, zone, réalisations, déclaration ANSM.
 */
export type BlocCabinet = 'savoir_faire' | 'materiaux' | 'delais' | 'zone' | 'realisations' | 'ansm'

export function ApercuCabinet({
  nom,
  adresse,
  lignes,
  enCours = [],
  force,
}: {
  nom: string
  adresse: string | null
  /** Les résumés, calculés par l'appelant : `null` pour « À compléter ». */
  lignes: Record<BlocCabinet, string | null>
  enCours?: BlocCabinet[]
  force: number
}) {
  const blocs: { cle: BlocCabinet; titre: string; i: LucideIcon }[] = [
    { cle: 'savoir_faire', titre: 'Savoir-faire', i: Wrench },
    { cle: 'materiaux', titre: 'Matériaux et CFAO', i: FlaskConical },
    { cle: 'delais', titre: 'Délais', i: Clock },
    { cle: 'zone', titre: 'Zone desservie', i: Truck },
    { cle: 'realisations', titre: 'Réalisations', i: ImageIcon },
    { cle: 'ansm', titre: 'Déclaration ANSM', i: ShieldCheck },
  ]
  return (
    <div>
      <div className="squircle-2xl overflow-hidden border border-line bg-bg p-4 shadow-pop">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-2">
            <FlaskConical className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-bg-soft px-2 py-0.5 text-[10px] font-medium text-fg-2">Laboratoire de prothèse</span>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight text-fg">{nom}</p>
          </div>
        </div>
        {adresse && (
          <p className="mt-2 flex items-start gap-1 text-xs text-fg-2">
            <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
            {adresse}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-medium text-teal">
          <Check className="size-3" aria-hidden /> Vérifié auprès des registres officiels
        </span>
        <ul className="mt-3 space-y-1">
          {blocs.map((b) => {
            const actif = enCours.includes(b.cle)
            const valeur = lignes[b.cle]
            return (
              <li key={b.cle} className={`squircle-lg flex items-center gap-3 px-2 py-2 ${actif ? 'bg-teal/10 ring-1 ring-teal' : ''}`}>
                <b.i className={`size-4 shrink-0 ${valeur || actif ? 'text-fg' : 'text-fg-2/60'}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-fg-2">{b.titre}</span>
                  <span className={`block truncate text-xs ${valeur ? 'text-fg' : 'text-fg-2'}`}>{valeur ?? 'À compléter'}</span>
                </span>
                {actif ? (
                  <span className="shrink-0 rounded-full bg-teal px-2 py-0.5 text-[10px] font-medium text-white">En cours</span>
                ) : (
                  valeur && <span className="hidden shrink-0 rounded-full bg-bg-soft px-2 py-0.5 text-[10px] text-fg-2 xl:inline">Renseigné par le laboratoire</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <BandeauForce force={force} className="mt-3" />
    </div>
  )
}
