'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, ExternalLink, Sparkles, Trophy, X } from 'lucide-react'
import { ICONE_SOURCE } from './icones-etablissement'
import { chemin } from '@/lib/navigation'
import { PALIERS_ETAB, TITRE_GAIN_ETAB, blocGagne, progressionEtab, type PalierEtab, type SourceEtab } from '@/lib/espace-pro/progression-etablissement'
import { BarreProgression, Confettis, Medaille, StylesProgression } from './progression'


export type InfosProgressionEtab = { total: number; detail: Record<string, number>; verifiee: boolean; sources: SourceEtab[] }

/** Le lien d'une source, avec l'établissement courant et l'ancre. */
function lienSource(href: string, q: string) {
  const [base, ancre] = href.split('#')
  return `/espace-pro/etablissement/${base}/${q}${ancre ? `#${ancre}` : ''}`
}

/**
 * La carte du bas du menu, comme celle des soignants : palier, taux de page
 * complète, ce qu'il reste avant le suivant. Elle mène à Progression. Dessous,
 * les blocs : acquis en plein, à gagner en pointillés.
 */
export function CarteProgressionEtab({ p: infos, q, pagePublique }: { p: InfosProgressionEtab; q: string; pagePublique: string | null }) {
  const p = progressionEtab(infos.total, infos.verifiee)
  return (
    <div className="squircle-xl overflow-hidden bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] text-white shadow-pop ring-1 ring-white/10">
      <Link href={chemin(`/espace-pro/etablissement/progression/${q}`)} className="block p-3 pb-2.5 hover:bg-white/5">
        <div className="flex items-center gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${p.actuel ? 'bg-[#BFE3D6] text-[#0B1F1D]' : 'text-[#BFE3D6] ring-2 ring-[#BFE3D6]'}`}>{p.actuel?.niveau ?? 0}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#BFE3D6]/80">{`Palier ${p.actuel?.niveau ?? 0}`}{p.verifiee ? '' : ' · en vérification'}</p>
            <p className="line-clamp-2 text-sm font-semibold leading-tight">{p.actuel?.nom ?? 'Page en préparation'}</p>
          </div>
          <p className="text-right">
            <span className="block text-base font-bold leading-none">{infos.total} %</span>
            <span className="text-[10px] text-white/60">complète</span>
          </p>
        </div>
        <div className="mt-3">
          <BarreProgression part={p.part} claire />
          <p className="mt-1.5 text-[11px] text-white/70">
            {p.suivant ? (
              <>
                Plus que <b className="text-white">{p.reste} %</b> avant {p.suivant.nom}
              </>
            ) : (
              'Tous les paliers atteints'
            )}
          </p>
        </div>
      </Link>
      <div className="flex flex-wrap items-center gap-1 px-3 pb-3">
        {infos.sources
          .filter((s) => s.href)
          .map((s) => {
            const I = ICONE_SOURCE[s.cle] ?? Sparkles
            const plein = s.acquis >= s.max
            return (
              <Link
                key={s.cle}
                href={chemin(lienSource(s.href!, q))}
                title={plein ? `${s.libelle} : acquis` : `${s.libelle} : +${s.max - s.acquis} %`}
                className={`squircle-full inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                  plein ? 'border border-transparent bg-white/10 text-[#BFE3D6] hover:bg-white/20' : 'border border-dashed border-white/30 text-white/55 hover:border-white/60 hover:text-white'
                }`}
              >
                <I className="size-3" aria-hidden />
                {plein ? <Check className="size-2.5" strokeWidth={3} aria-hidden /> : `+${s.max - s.acquis}`}
              </Link>
            )
          })}
        {pagePublique && (
          <Link href={chemin(pagePublique)} title="Voir la page publique" className="ml-auto grid size-5 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}

/** L'encart de gain : la coche, le taux qui monte, la barre qui avance. Se ferme seul après cinq secondes. */
export function ToastGainEtab({ de, a, titre, fermer, verifiee }: { de: number; a: number; titre: string; fermer: () => void; verifiee: boolean }) {
  const [affiche, setAffiche] = useState(de)
  const fermeture = useRef(fermer)
  useEffect(() => {
    fermeture.current = fermer
  })
  useEffect(() => {
    const debut = performance.now()
    let image = 0
    const pas = (t: number) => {
      const k = Math.min(1, (t - debut) / 900)
      setAffiche(Math.round(de + (a - de) * (1 - (1 - k) ** 3)))
      if (k < 1) image = requestAnimationFrame(pas)
    }
    image = requestAnimationFrame(pas)
    const fin = setTimeout(() => fermeture.current(), 5000)
    return () => {
      cancelAnimationFrame(image)
      clearTimeout(fin)
    }
  }, [de, a])
  const p = progressionEtab(affiche, verifiee)
  const passe = (progressionEtab(de, verifiee).actuel?.niveau ?? 0) !== (progressionEtab(a, verifiee).actuel?.niveau ?? 0)
  return (
    <div role="status" data-anime className="squircle-2xl fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm overflow-hidden border border-line bg-bg shadow-pop" style={{ animation: 'dm-monte .35s ease-out both' }}>
      <div className="flex items-start gap-3 p-4">
        <span data-anime className="grid size-11 shrink-0 place-items-center rounded-full bg-teal text-white" style={{ animation: 'dm-pop .5s .1s ease-out both' }}>
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg">{titre}</p>
          <p className="mt-0.5 text-sm text-fg-2">
            <span className="font-bold text-teal">+{a - de} %</span> · page complète à {affiche} %
          </p>
        </div>
        <button type="button" onClick={fermer} aria-label="Fermer" className="grid size-7 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="bg-bg-soft px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-[11px] text-fg-2">
          <span>{`Palier ${p.actuel?.niveau ?? 0} · ${p.actuel?.nom ?? 'En route'}`}</span>
          <span>{p.suivant ? `${p.reste} % avant ${p.suivant.nom}` : 'Sommet atteint'}</span>
        </div>
        <div className="mt-2">
          <BarreProgression part={p.part} epaisse />
        </div>
        {passe && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-teal">
            <Trophy className="size-3.5" aria-hidden /> Nouveau palier débloqué
          </p>
        )}
      </div>
    </div>
  )
}

/** Le passage de palier, plein écran, une fois par palier : la médaille, les gains, la page. */
export function PassagePalierEtab({ palier, fermer, progression, pagePublique }: { palier: PalierEtab; fermer: () => void; progression: string; pagePublique: string | null }) {
  const fermeture = useRef(fermer)
  useEffect(() => {
    fermeture.current = fermer
  })
  useEffect(() => {
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && fermeture.current()
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [])
  return (
    <>
      <div role="dialog" aria-modal="true" aria-labelledby="palier-etab-titre" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0B1F1D]/70 px-4 py-6 backdrop-blur-sm" onClick={fermer}>
        <div onClick={(e) => e.stopPropagation()} data-anime className="squircle-2xl relative w-full max-w-md overflow-hidden bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] px-6 pb-7 pt-8 text-center text-white shadow-pop sm:px-8" style={{ animation: 'dm-pop .45s ease-out both' }}>
          <div className="mx-auto flex w-fit gap-1.5 text-[#BFE3D6]">
            {[0, 1, 2].map((i) => (
              <Sparkles key={i} className="size-4" aria-hidden />
            ))}
          </div>
          <p className="mt-2 font-mono text-xs tracking-[0.2em] text-[#BFE3D6]">PALIER {palier.niveau} ATTEINT</p>
          <h2 id="palier-etab-titre" className="mt-1 text-3xl font-extrabold tracking-tight">
            {palier.nom}
          </h2>
          <span data-anime className="mx-auto mt-6 block w-fit rounded-full" style={{ animation: 'dm-pop .6s .15s ease-out both, dm-brille 2.4s 1s ease-in-out infinite' }}>
            <Medaille niveau={palier.niveau} taille={112} />
          </span>
          <ul className="mt-5 flex flex-wrap justify-center gap-1.5 text-xs">
            {palier.gains.map((g, i) => (
              <li key={g} data-anime className="squircle-full inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 text-white/90 ring-1 ring-white/15" style={{ animation: `dm-monte .4s ${0.5 + i * 0.12}s ease-out both` }}>
                <Check className="size-3 text-[#BFE3D6]" strokeWidth={3} aria-hidden />
                {g}
              </li>
            ))}
          </ul>
          {pagePublique && (
            <Link href={chemin(pagePublique)} onClick={fermer} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[#0B1F1D] hover:bg-[#BFE3D6]">
              <ExternalLink className="size-4" aria-hidden /> Voir ma page
            </Link>
          )}
          <Link href={chemin(progression)} onClick={fermer} className="mt-3 inline-block text-sm font-medium text-white/80 hover:text-white">
            Voir ma progression
          </Link>
        </div>
      </div>
      <Confettis />
    </>
  )
}

type Memoire = { total: number; detail: Record<string, number>; niveau: number }

/**
 * Le suivi d'une page d'une visite à l'autre, gardé dans ce navigateur : si
 * le taux a monté, l'encart de gain ; si un palier est franchi, le plein
 * écran, une seule fois. La première visite ne fait que mémoriser.
 */
export function SuiviProgressionEtab({ slug, p, q, pagePublique }: { slug: string; p: InfosProgressionEtab; q: string; pagePublique: string | null }) {
  const [gain, setGain] = useState<{ de: number; a: number; titre: string } | null>(null)
  const [palier, setPalier] = useState<PalierEtab | null>(null)
  const niveau = progressionEtab(p.total, p.verifiee).actuel?.niveau ?? 0
  const cleAMontrer = `dm-etab-a-montrer:${slug}`
  const oublier = (quoi: 'gain' | 'palier') => {
    try {
      const reste = { ...JSON.parse(sessionStorage.getItem(cleAMontrer) ?? '{}'), [quoi]: undefined }
      if (!reste.gain && !reste.palier) sessionStorage.removeItem(cleAMontrer)
      else sessionStorage.setItem(cleAMontrer, JSON.stringify(reste))
    } catch {}
    if (quoi === 'gain') setGain(null)
    else setPalier(null)
  }

  useEffect(() => {
    const cle = `dm-etab:${slug}`
    const minuterie = setTimeout(() => {
      try {
        const avant: Memoire | null = JSON.parse(localStorage.getItem(cle) ?? 'null')
        localStorage.setItem(cle, JSON.stringify({ total: p.total, detail: p.detail, niveau } satisfies Memoire))
        if (avant && p.total > avant.total) {
          const bloc = blocGagne(avant.detail ?? {}, p.detail)
          sessionStorage.setItem(
            cleAMontrer,
            JSON.stringify({ gain: { de: avant.total, a: p.total, titre: (bloc && TITRE_GAIN_ETAB[bloc]) || 'Page complétée' }, palier: niveau > (avant.niveau ?? 0) ? niveau : undefined }),
          )
        }
        const aMontrer: { gain?: { de: number; a: number; titre: string }; palier?: number } = JSON.parse(sessionStorage.getItem(cleAMontrer) ?? '{}')
        if (aMontrer.gain) setGain(aMontrer.gain)
        if (aMontrer.palier) setPalier(PALIERS_ETAB.find((x) => x.niveau === aMontrer.palier) ?? null)
      } catch {}
    }, 0)
    return () => clearTimeout(minuterie)
  }, [slug, p.total, p.detail, niveau, cleAMontrer])

  return (
    <>
      {(gain || palier) && <StylesProgression />}
      {gain && <ToastGainEtab de={gain.de} a={gain.a} titre={gain.titre} fermer={() => oublier('gain')} verifiee={p.verifiee} />}
      {palier && <PassagePalierEtab palier={palier} fermer={() => oublier('palier')} progression={`/espace-pro/etablissement/progression/${q}`} pagePublique={pagePublique} />}
    </>
  )
}
