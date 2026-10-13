/** MAQUETTE. États d'ouverture : panneau latéral, fenêtre et bandeau de confirmation posés sur un écran. */
import { Check, CheckCircle2, ChevronDown, ImagePlus, Lock, Plus, Search, X } from 'lucide-react'

export type Champ =
  | { type: 'texte'; l: string; v?: string; vide?: string; aide?: string; alerte?: string; mono?: boolean }
  | { type: 'zone'; l: string; v?: string; vide?: string; aide?: string; compteur?: string }
  | { type: 'puces'; l: string; options: [string, boolean][]; aide?: string }
  | { type: 'choix'; l: string; options: [string, boolean][]; aide?: string }
  | { type: 'interrupteur'; l: string; d?: string; on: boolean }
  | { type: 'liste'; l: string; v: string; aide?: string }
  | { type: 'lecture'; l: string; v: string; source: string }
  | { type: 'depot'; l: string; d: string }
  | { type: 'recherche'; l: string; v: string; aide?: string; resultats?: [string, string][] }
  | { type: 'horaires'; jours: [string, string[]][] }
  | { type: 'compteur'; l: string; v: string }
  | { type: 'note'; v: string; ton?: 'info' | 'alerte' }
  | { type: 'deux'; a: Champ; b: Champ }

function Libelle({ children, aide }: { children: React.ReactNode; aide?: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-fg">{children}</p>
      {aide && <p className="mt-0.5 text-xs text-fg-2">{aide}</p>}
    </div>
  )
}

export function RenduChamp({ c }: { c: Champ }) {
  switch (c.type) {
    case 'texte':
      return (
        <div className="space-y-1.5">
          <Libelle aide={c.aide}>{c.l}</Libelle>
          <span className={`squircle-lg flex h-11 items-center border px-3 text-sm ${c.alerte ? 'border-amber-300 bg-amber-50' : 'border-line bg-bg'} ${c.v ? 'text-fg' : 'text-fg-2'} ${c.mono ? 'font-mono' : ''}`}>{c.v || c.vide}</span>
          {c.alerte && <p className="text-xs text-amber-700">{c.alerte}</p>}
        </div>
      )
    case 'zone':
      return (
        <div className="space-y-1.5">
          <Libelle aide={c.aide}>{c.l}</Libelle>
          <span className={`squircle-lg block min-h-28 border border-line bg-bg p-3 text-sm leading-relaxed ${c.v ? 'text-fg' : 'text-fg-2'}`}>{c.v || c.vide}</span>
          {c.compteur && <p className="text-right text-xs tabular-nums text-fg-2">{c.compteur}</p>}
        </div>
      )
    case 'puces':
    case 'choix':
      return (
        <div className="space-y-2">
          <Libelle aide={c.aide}>{c.l}</Libelle>
          <div className="flex flex-wrap gap-2">
            {c.options.map(([o, on]) => (
              <span key={o} className={`squircle-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ring-1 ring-inset ${on ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg-2 ring-line'}`}>
                {on && <Check className="size-3.5" aria-hidden />} {o}
              </span>
            ))}
          </div>
        </div>
      )
    case 'interrupteur':
      return (
        <div className="flex items-center justify-between gap-4">
          <Libelle aide={c.d}>{c.l}</Libelle>
          <span className={`relative h-6 w-10 shrink-0 rounded-full ${c.on ? 'bg-teal' : 'bg-line'}`}>
            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${c.on ? 'right-0.5' : 'left-0.5'}`} />
          </span>
        </div>
      )
    case 'liste':
      return (
        <div className="space-y-1.5">
          <Libelle aide={c.aide}>{c.l}</Libelle>
          <span className="squircle-lg flex h-11 items-center justify-between border border-line bg-bg px-3 text-sm text-fg">
            {c.v} <ChevronDown className="size-4 text-fg-2" aria-hidden />
          </span>
        </div>
      )
    case 'lecture':
      return (
        <div className="squircle-xl flex items-start justify-between gap-4 bg-bg-soft p-3">
          <div>
            <p className="text-xs text-fg-2">{c.l}</p>
            <p className="text-sm text-fg">{c.v}</p>
          </div>
          <span className="squircle-full inline-flex shrink-0 items-center gap-1 bg-bg px-2 py-0.5 text-[11px] text-fg-2 ring-1 ring-inset ring-line">
            <Lock className="size-3" aria-hidden /> {c.source}
          </span>
        </div>
      )
    case 'depot':
      return (
        <div className="space-y-1.5">
          <Libelle>{c.l}</Libelle>
          <span className="squircle-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-line p-6 text-center text-sm text-fg-2">
            <ImagePlus className="size-6" aria-hidden /> {c.d}
          </span>
        </div>
      )
    case 'recherche':
      return (
        <div className="space-y-1.5">
          <Libelle aide={c.aide}>{c.l}</Libelle>
          <span className="squircle-lg flex h-11 items-center gap-2 border border-fg bg-bg px-3 text-sm text-fg">
            <Search className="size-4 text-fg-2" aria-hidden /> {c.v}
          </span>
          {c.resultats && (
            <ul className="squircle-xl divide-y divide-line border border-line bg-bg text-sm shadow-sm">
              {c.resultats.map(([a, b], i) => (
                <li key={a} className={`flex items-center justify-between gap-3 px-3 py-2.5 ${i === 0 ? 'bg-bg-soft' : ''}`}>
                  <span className="text-fg">{a}</span>
                  <span className="text-xs text-fg-2">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )
    case 'horaires':
      return (
        <ul className="divide-y divide-line">
          {c.jours.map(([j, plages]) => (
            <li key={j} className="flex items-center gap-3 py-2.5">
              <span className={`relative h-5 w-8 shrink-0 rounded-full ${plages.length ? 'bg-teal' : 'bg-line'}`}>
                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow ${plages.length ? 'right-0.5' : 'left-0.5'}`} />
              </span>
              <span className="w-20 text-sm font-medium text-fg">{j}</span>
              <span className="flex flex-1 flex-wrap gap-2">
                {plages.length ? (
                  plages.map((p) => (
                    <span key={p} className="squircle-lg border border-line px-2.5 py-1 text-sm tabular-nums text-fg">
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-fg-2">Fermé</span>
                )}
              </span>
              {plages.length > 0 && plages.length < 2 && <Plus className="size-4 text-fg-2" aria-hidden />}
            </li>
          ))}
        </ul>
      )
    case 'compteur':
      return (
        <div className="flex items-center justify-between gap-4">
          <Libelle>{c.l}</Libelle>
          <span className="squircle-full flex items-center gap-1 border border-line p-1">
            <span className="grid size-7 place-items-center rounded-full bg-bg-soft text-fg">−</span>
            <span className="w-24 text-center text-sm font-semibold tabular-nums text-fg">{c.v}</span>
            <span className="grid size-7 place-items-center rounded-full bg-bg-soft text-fg">+</span>
          </span>
        </div>
      )
    case 'note':
      return <p className={`squircle-xl p-3 text-xs leading-relaxed ${c.ton === 'alerte' ? 'bg-amber-50 text-amber-800' : 'bg-bg-soft text-fg-2'}`}>{c.v}</p>
    case 'deux':
      return (
        <div className="grid grid-cols-2 gap-3">
          <RenduChamp c={c.a} />
          <RenduChamp c={c.b} />
        </div>
      )
  }
}

export type Ouverture = {
  forme: 'tiroir' | 'modale'
  titre: string
  meta?: string
  intro?: string
  champs: Champ[]
  principal?: string
  secondaire?: string
  danger?: boolean
}

/** L'écran de base, assombri, avec le panneau ou la fenêtre par-dessus. */
export function EtatOuvert({ base, o }: { base: React.ReactNode; o: Ouverture }) {
  const corps = (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-line p-6">
        <div>
          {o.meta && <p className="text-xs text-fg-2">{o.meta}</p>}
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-fg">{o.titre}</h2>
          {o.intro && <p className="mt-1.5 text-sm text-fg-2">{o.intro}</p>}
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-fg">
          <X className="size-4" aria-hidden />
        </span>
      </div>
      <div className="flex-1 space-y-5 overflow-hidden p-6">
        {o.champs.map((c, i) => (
          <RenduChamp key={i} c={c} />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line p-5">
        <span className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-fg">{o.secondaire ?? 'Annuler'}</span>
        <span className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ${o.danger ? 'bg-red-600 text-white' : 'bg-action text-action-foreground'}`}>{o.principal ?? 'Enregistrer'}</span>
      </div>
    </>
  )
  return (
    <div className="relative max-lg:h-[844px] max-lg:overflow-hidden">
      {base}
      <div className="absolute inset-0 bg-[#0e1317]/45" />
      {o.forme === 'tiroir' ? (
        <aside className="absolute bottom-0 right-0 top-12 flex w-full flex-col overflow-hidden rounded-t-3xl bg-bg shadow-pop lg:top-0 lg:max-w-[30rem] lg:rounded-none">{corps}</aside>
      ) : (
        <div className="absolute inset-x-0 top-24 flex justify-center px-4">
          <div className="squircle-2xl flex w-full max-w-lg flex-col bg-bg shadow-pop">{corps}</div>
        </div>
      )}
    </div>
  )
}

/** Bandeau de confirmation après une action en un clic. */
export function EtatConfirme({ base, texte }: { base: React.ReactNode; texte: string }) {
  return (
    <div className="relative max-lg:h-[844px] max-lg:overflow-hidden">
      {base}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#0e1317] px-5 py-3 w-max max-w-[calc(100vw-2rem)] text-sm text-white shadow-pop">
        <CheckCircle2 className="size-4 text-teal" aria-hidden /> {texte}
        <span className="ml-2 font-medium text-white/70 underline underline-offset-2">Annuler</span>
      </div>
    </div>
  )
}

