/** MAQUETTE. Écrans communs aux profils : vue d'ensemble générique et galerie avec crédit photo. */
import Image from 'next/image'
import { ArrowRight, Camera, CheckCircle2, ChevronRight, CircleDashed, Clock, Copyright, Eye, GripVertical, ImagePlus, Pencil, RefreshCw, Sparkles, Upload } from 'lucide-react'
import { Coque, Tuile, TitreTuile, type Profil } from './_coque'

export type Mission = { t: string; d: string; gain: string; reco?: boolean }
export type Fraicheur = { k: string; v: string; p: number; alerte?: boolean }

/** Tuile sombre de la vue d'ensemble : anneau, chiffres, prochaine action. */
export function TuileSombre({ etiquette, titre, texte, pct, legende, chiffres, action }: {
  etiquette: string; titre: string; texte: string; pct: number; legende: string
  chiffres: [string, string][]; action: { meta: string; t: string; i: typeof Clock }
}) {
  return (
    <section className="dark squircle-2xl relative overflow-hidden bg-background p-6 text-fg sm:p-8">
      <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:gap-8">
        <div className="max-w-md">
          <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/15 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
            <CheckCircle2 className="size-3.5" aria-hidden /> {etiquette}
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{titre}</h2>
          <p className="mt-3 text-white/70">{texte}</p>
        </div>
        <div className="relative grid size-32 shrink-0 place-items-center sm:size-40">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" className="text-white/10" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${pct * 2.765} 276.5`} className="text-teal" />
          </svg>
          <div className="text-center">
            <p className="text-4xl font-semibold tracking-tight text-white">{pct} %</p>
            <p className="text-xs text-white/60">{legende}</p>
          </div>
        </div>
      </div>
      <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {chiffres.map(([v, l]) => (
          <div key={l} className="border-l border-white/10 pl-4 first:border-0 first:pl-0">
            <dt className="text-2xl font-semibold text-white">{v}</dt>
            <dd className="mt-1 text-xs text-white/60">{l}</dd>
          </div>
        ))}
      </dl>
      <div className="squircle-xl mt-10 flex flex-wrap items-center gap-4 bg-white/5 p-4 ring-1 ring-white/10">
        <span className="squircle-lg grid size-10 place-items-center bg-amber-100 text-amber-700">
          <action.i className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">Prochaine action · {action.meta}</p>
          <p className="font-semibold text-white">{action.t}</p>
        </div>
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          Commencer <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </section>
  )
}

export function Apercu({ onglets, children }: { onglets: [string, string]; children: React.ReactNode }) {
  return (
    <Tuile>
      <TitreTuile
        i={Eye}
        droite={
          <span className="squircle-full flex bg-bg-soft p-0.5 text-xs">
            <span className="squircle-full bg-fg px-2.5 py-1 text-bg">{onglets[0]}</span>
            <span className="px-2.5 py-1 text-fg-2">{onglets[1]}</span>
          </span>
        }
      >
        Aperçu public
      </TitreTuile>
      <div className="mt-4">{children}</div>
      <p className="mt-3 text-center text-xs text-fg-2">Mis à jour en direct à chaque modification.</p>
    </Tuile>
  )
}

export function Missions({ items }: { items: Mission[] }) {
  return (
    <Tuile>
      <TitreTuile i={Sparkles} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">0 sur {items.length}</span>}>
        Missions
      </TitreTuile>
      <ul className="mt-4 space-y-1">
        {items.map((m) => (
          <li key={m.t} className={`squircle-xl flex items-center gap-3 p-3 ${m.reco ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}>
            <CircleDashed className="size-5 text-fg-2" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-fg">{m.t}</p>
              <p className={`text-xs ${m.reco ? 'text-amber-700' : 'text-fg-2'}`}>
                {m.reco ? 'Recommandée · ' : ''}
                {m.d}
              </p>
            </div>
            <span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">{m.gain}</span>
            <ChevronRight className="size-4 text-fg-2" aria-hidden />
          </li>
        ))}
      </ul>
    </Tuile>
  )
}

export function FraicheurTuile({ items, note }: { items: Fraicheur[]; note?: string }) {
  return (
    <Tuile>
      <TitreTuile i={RefreshCw}>Fraîcheur des informations</TitreTuile>
      <ul className="mt-4 space-y-4 text-sm">
        {items.map((f) => (
          <li key={f.k}>
            <div className="flex justify-between gap-3">
              <span className="text-fg">{f.k}</span>
              <span className={f.alerte ? 'text-amber-700' : 'text-fg-2'}>{f.v}</span>
            </div>
            <span className="mt-2 block h-1 rounded-full bg-line">
              <span className={`block h-full rounded-full ${f.alerte ? 'bg-amber-400' : 'bg-teal'}`} style={{ width: `${f.p * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
      {note && <p className="mt-4 text-xs text-fg-2">{note}</p>}
    </Tuile>
  )
}

export function Activite({ items }: { items: [string, string][] }) {
  return (
    <Tuile>
      <TitreTuile i={Clock} droite={<span className="text-sm text-fg">Tout voir</span>}>
        Activité récente
      </TitreTuile>
      <ul className="mt-2 divide-y divide-line text-sm">
        {items.map(([t, d]) => (
          <li key={t} className="flex justify-between gap-4 py-3">
            <span className="text-fg">{t}</span>
            <span className="shrink-0 text-fg-2">{d}</span>
          </li>
        ))}
      </ul>
    </Tuile>
  )
}

/** Écran Galerie, commun à tous les profils qui publient des photos. */
export function EcranGalerie({ profil, actif, titre, sousTitre, photos, credit, sujet, droits }: {
  profil: Profil; actif: string; titre: string; sousTitre: string
  photos: { src: string; legende: string }[]; credit: string; sujet: string; droits: string
}) {
  return (
    <Coque
      profil={profil}
      actif={actif}
      titre={titre}
      sousTitre={sousTitre}
      action={
        <span className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
          <Upload className="size-4" aria-hidden /> Ajouter des photos
        </span>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <li key={p.src + i} className="squircle-xl overflow-hidden border border-line bg-bg">
                <div className="relative aspect-[4/3]">
                  <Image src={p.src} alt="" fill sizes="20vw" className="object-cover" />
                  <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-black/55 text-white">
                    <GripVertical className="size-4" aria-hidden />
                  </span>
                  {i === 0 && <span className="squircle-full absolute right-2 top-2 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#0e1317]">Grande photo</span>}
                </div>
                <div className="flex items-center gap-2 p-2.5">
                  <p className={`min-w-0 flex-1 truncate text-xs ${p.legende ? 'text-fg' : 'text-amber-700'}`}>{p.legende || 'Ajouter une légende'}</p>
                  <Pencil className="size-3.5 shrink-0 text-fg-2" aria-hidden />
                </div>
              </li>
            ))}
            <li className="squircle-xl grid aspect-[4/3] place-items-center border-2 border-dashed border-line text-center text-sm text-fg-2">
              <span>
                <ImagePlus className="mx-auto size-6" aria-hidden />
                <span className="mt-2 block">Déposer des photos</span>
                <span className="text-xs">JPG ou PNG</span>
              </span>
            </li>
          </ol>
          <p className="mt-3 text-xs text-fg-2">Faites glisser pour changer l’ordre. La première est la grande photo.</p>
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={Copyright}>Crédit photo</TitreTuile>
            <p className="mt-4 text-sm font-medium text-fg">Auteur ou détenteur des droits</p>
            <span className="squircle-lg mt-1.5 flex h-11 items-center border border-line bg-bg px-3 text-sm text-fg">{credit}</span>
            <p className="mt-4 flex items-center justify-between gap-3 text-sm text-fg">
              Afficher le crédit
              <span className="relative h-6 w-10 rounded-full bg-teal">
                <span className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow" />
              </span>
            </p>
            <div className="squircle-xl mt-5 bg-bg-soft p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-2">Sur la {sujet}</p>
              <p className="mt-1 text-xs text-fg-2">Crédit photo : {credit}</p>
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Camera}>Droits</TitreTuile>
            <p className="mt-3 flex items-start gap-3 text-sm text-fg-2">
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded bg-teal text-white">
                <CheckCircle2 className="size-3" aria-hidden />
              </span>
              {droits}
            </p>
          </Tuile>
        </aside>
      </div>
    </Coque>
  )
}
