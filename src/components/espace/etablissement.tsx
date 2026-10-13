import Image from 'next/image'
import { Award, Check, Landmark, MapPin } from 'lucide-react'
import { LIBELLE_TYPE, type TypeEtablissement } from '@/lib/espace-pro/etablissement'

/**
 * Les briques d'un établissement de formation dans le parcours : la carte
 * posée sur le plan (O2a à OEND) et le résumé de la colonne de droite.
 */

export type LigneCarte = { nom: string; duree: string | null; desactivee?: boolean }

/** La carte de l'établissement sur le plan : photo, pastille, nom, diplômes, ville. */
export function CarteEtablissement({
  titre,
  type,
  extrait,
  image,
  lignes,
  ville,
}: {
  titre: string
  type: TypeEtablissement
  extrait: string | null
  image: { url: string } | null
  lignes: LigneCarte[]
  ville: string | null
}) {
  return (
    <li className="squircle-2xl relative flex flex-col overflow-hidden border border-line bg-bg-soft shadow-pop">
      <div className="relative aspect-[16/9] overflow-hidden bg-bg">
        <Image src={image?.url ?? '/images/fiche-sans-photo.png'} alt="" fill sizes="15rem" className="object-cover dark:brightness-[0.42]" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-[11px] font-medium text-fg backdrop-blur">{LIBELLE_TYPE[type]}</span>
        <span className="squircle-lg absolute bottom-3 right-3 grid size-8 place-items-center bg-white text-[#0e1317] shadow-pop">
          <Landmark className="size-4" aria-hidden />
        </span>
      </div>
      <div className="p-3.5 pb-2.5">
        <p className="text-sm font-semibold leading-tight text-fg">{titre}</p>
        {extrait && <p className="mt-1 line-clamp-1 text-xs text-fg-2">{extrait}</p>}
      </div>
      {lignes.length > 0 && (
        <ul className="divide-y divide-line border-t border-line">
          {lignes.slice(0, 4).map((l) => (
            <li key={l.nom} className={`flex items-center justify-between gap-3 px-3.5 py-1.5 text-xs ${l.desactivee ? 'text-fg-2' : 'text-fg'}`}>
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Award className={`size-3.5 shrink-0 ${l.desactivee ? 'text-fg-2' : 'text-teal'}`} aria-hidden />
                <span className="truncate">
                  {l.nom}
                  {l.desactivee ? ' (désactivé)' : ''}
                </span>
              </span>
              {l.duree && <span className="shrink-0 text-fg-2">{l.duree}</span>}
            </li>
          ))}
        </ul>
      )}
      {ville && (
        <p className="flex items-center gap-1 border-t border-line px-3.5 py-2 text-xs text-fg-2">
          <MapPin className="size-3.5" aria-hidden /> {ville}
        </p>
      )}
    </li>
  )
}

/** Le résumé de l'établissement : pastille, nom, adresse, UAI, et ce qui suit. */
export function ResumeEtablissement({
  titre,
  type,
  adresse,
  uai,
  ligne,
  verifie,
  children,
}: {
  titre: string
  type: TypeEtablissement
  adresse: string | null
  uai: string | null
  /** « 2 formations actives », sous l'adresse. */
  ligne?: string
  verifie?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="flex w-full items-center gap-3.5">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-2">
        <Landmark className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full bg-bg-soft px-2 py-0.5 text-[10px] font-medium text-fg-2">{LIBELLE_TYPE[type]}</span>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-fg">{titre}</p>
        {adresse && (
          <p className="mt-0.5 flex items-start gap-1 text-xs text-fg-2">
            <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
            {adresse}
          </p>
        )}
        {uai && <p className="mt-0.5 font-mono text-[11px] text-fg-2">UAI {uai}</p>}
        {ligne && <p className="mt-0.5 text-xs text-fg-2">{ligne}</p>}
        {verifie && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-medium text-teal">
            <Check className="size-3" aria-hidden />
            Vérifié auprès des registres officiels
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
