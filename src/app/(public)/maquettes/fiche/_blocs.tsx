/** MAQUETTE, à supprimer après arbitrage. Briques communes aux variantes de fiche. */
import Image from 'next/image'
import { CalendarCheck, ExternalLink, Globe, Navigation, Phone } from 'lucide-react'
import { DENTISTE } from './_donnees'

export function Etiquette({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        accent ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg ring-line'
      }`}
    >
      {children}
    </span>
  )
}

/** Pastille « Ouvert · ferme à 19 h ». */
export function Statut({ sombre }: { sombre?: boolean }) {
  const s = DENTISTE.statut
  return (
    <span
      className={`squircle-full inline-flex items-center gap-2 px-3 py-1 text-sm font-medium ${
        sombre ? 'bg-white/10 text-white ring-1 ring-inset ring-white/15' : 'bg-teal/10 text-teal ring-1 ring-inset ring-teal/25'
      }`}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-teal opacity-40" />
        <span className="relative inline-flex size-2 rounded-full bg-teal" />
      </span>
      {s.texte} <span className={sombre ? 'text-white/70' : 'text-fg-2'}>· {s.detail}</span>
    </span>
  )
}

/** Mention de fraîcheur d'une donnée déclarée. */
export function Declare({ le, sombre }: { le: string; sombre?: boolean }) {
  return <p className={`text-xs ${sombre ? 'text-white/60' : 'text-fg-2'}`}>Déclaré par le cabinet, confirmé le {le}</p>
}

export function Actions({ sombre, pleine }: { sombre?: boolean; pleine?: boolean }) {
  const sec = sombre ? 'border-white/20 bg-white/5 text-white hover:bg-white/10' : 'border-line bg-bg text-fg hover:bg-bg-soft'
  // Mobile : « Appeler » en pleine largeur, les deux autres côte à côte.
  return (
    <div className={pleine ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2 sm:flex sm:flex-wrap'}>
      <a className={`hover-lift col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground`}>
        <Phone className="size-4" aria-hidden /> Appeler le cabinet
      </a>
      <a className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium sm:px-5 ${sec}`}>
        <CalendarCheck className="size-4" aria-hidden /> <span className="sm:hidden">Rendez-vous</span>
        <span className="hidden sm:inline">Prendre rendez-vous</span> <ExternalLink className="size-3.5 opacity-60" aria-hidden />
      </a>
      <a className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium sm:px-5 ${sec}`}>
        <Navigation className="size-4" aria-hidden /> Itinéraire
      </a>
    </div>
  )
}

/** Barre d'action fixe en bas d'écran, mobile seulement. */
export function BarreMobile({ titre, detail, secondaire }: { titre: string; detail: string; secondaire?: React.ReactNode }) {
  return (
    <div data-barre-mobile className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pb-6 pt-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{titre}</p>
          <p className="flex items-center gap-1.5 text-xs text-teal">
            <span className="size-1.5 rounded-full bg-teal" /> {detail}
          </p>
        </div>
        <a className="inline-flex size-11 items-center justify-center rounded-full border border-line text-fg">
          {secondaire ?? <CalendarCheck className="size-5" aria-hidden />}
        </a>
        <a className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
          <Phone className="size-4" aria-hidden /> Appeler
        </a>
      </div>
    </div>
  )
}

export function LienSite({ sombre, site = DENTISTE.liens.site }: { sombre?: boolean; site?: string }) {
  return (
    <a className={`inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline ${sombre ? 'text-white' : 'text-fg'}`}>
      <Globe className="size-4 text-teal" aria-hidden /> {site} <ExternalLink className="size-3.5 opacity-60" aria-hidden />
    </a>
  )
}

/** Semaine en sept cases, jour courant cerclé. */
export function Semaine({ compacte }: { compacte?: boolean }) {
  return (
    <ol className={`grid gap-2 ${compacte ? 'grid-cols-7' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'}`}>
      {DENTISTE.horaires.map((j) => {
        const ouvert = j.plages.length > 0
        return (
          <li
            key={j.jour}
            className={`squircle-lg border p-3 text-sm ${ouvert ? 'border-line bg-bg' : 'border-dashed border-line bg-bg-soft text-fg-2'} ${
              j.aujourdhui ? 'ring-2 ring-teal/50' : ''
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-2">{compacte ? j.jour.slice(0, 3) : j.jour}</p>
            {ouvert ? (
              <ul className={`mt-1.5 space-y-0.5 tabular-nums text-fg ${compacte ? 'text-xs' : ''}`}>
                {j.plages.map((p) => (
                  <li key={p}>{compacte ? p.replace(' à ', '–').replace(/h00/g, 'h') : p}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5">Fermé</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Liste verticale des horaires, jour courant en gras. */
export function HorairesListe({ sombre }: { sombre?: boolean }) {
  return (
    <dl className="divide-y divide-line text-sm">
      {DENTISTE.horaires.map((j) => (
        <div key={j.jour} className={`flex justify-between gap-4 py-2 ${j.aujourdhui ? 'font-semibold text-fg' : sombre ? 'text-white/80' : 'text-fg-2'}`}>
          <dt>{j.jour}</dt>
          <dd className="tabular-nums text-right">{j.plages.length ? j.plages.join(' · ') : 'Fermé'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Photo({ src, className = '', alt = '' }: { src: string; className?: string; alt?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
    </div>
  )
}

export function Titre2({ children, sous, sombre }: { children: React.ReactNode; sous?: string; sombre?: boolean }) {
  return (
    <div>
      <h2 className={`text-2xl font-semibold tracking-tight md:text-3xl ${sombre ? 'text-white' : 'text-fg'}`}>{children}</h2>
      {sous && <p className={`mt-2 max-w-2xl ${sombre ? 'text-white/70' : 'text-fg-2'}`}>{sous}</p>}
    </div>
  )
}

export function Registre({ lignes }: { lignes: string[][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      {lignes.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-fg-2">{k}</dt>
          <dd className={/RPPS|SIREN/.test(k) ? 'font-mono text-fg' : 'text-fg'}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Emplacement du logo de l'établissement : carré blanc, logo contenu, monogramme tant qu'il n'est pas fourni. */
export function Logo({ monogramme, taille = 'size-16' }: { monogramme: string; taille?: string }) {
  return (
    <span className={`squircle-xl grid ${taille} shrink-0 place-items-center bg-white text-lg font-bold tracking-tight text-[#0e1317] ring-1 ring-black/5`} title="Logo de l’établissement">
      {monogramme}
    </span>
  )
}

/** Galerie : une grande photo, quatre petites, la dernière ouvre la galerie complète. */
/** `credit` : saisi dans le tableau de bord ; sans crédit, la mention générique `source` s'affiche. */
export function Galerie({ photos, total, source, credit }: { photos: string[]; total: number; source: string; credit?: string }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
        {photos.slice(0, 5).map((p, i) => (
          <div key={p} className={`squircle-2xl relative overflow-hidden border border-line ${i === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square'}`}>
            <Image src={p} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            {i === 4 && (
              <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-semibold text-white">Voir les {total} photos</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-fg-2">{credit ? `Crédit photo : ${credit}` : source}</p>
    </div>
  )
}
