'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Lock, Share2, Sparkles, Trophy, X } from 'lucide-react'
import { ICONE_GAIN } from './icones-gain'
import { chemin } from '@/lib/navigation'
import { BAREME, OU_GAGNER, PALIERS, progressionDe, resteAFaire, type CleGain, type Palier, type Points } from '@/lib/espace-pro/progression'
import { FondCarte } from './fond-carte'
import { CarteFixe } from './carte-fixe'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'

const TITRE_GAIN: Record<CleGain, string> = {
  fiche: 'Fiche complétée',
  google: 'Lien vérifié sur Google',
  badge: 'Badge du site actif',
  partage: 'Partage sur les réseaux',
  parrainage: 'Parrainage réussi',
  a_jour: 'Fiche à jour',
}

/** Les couleurs de la charte, pour les confettis. */
const CHARTE = ['#0B8484', '#2BB5A8', '#BFE3D6', '#134E4A', '#1F6B64', '#EEF1F3', '#FFFFFF']

const ANIMATIONS = `
@keyframes dm-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
@keyframes dm-monte { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes dm-pluie { 0% { transform: translate3d(0,-10vh,0) rotate(0) } 100% { transform: translate3d(var(--dx),110vh,0) rotate(var(--r)) } }
@keyframes dm-jet { 0% { transform: translate3d(0,0,0) rotate(0); opacity: 1 } 70% { opacity: 1 } 100% { transform: translate3d(var(--dx),var(--dy),0) rotate(var(--r)); opacity: 0 } }
@keyframes dm-eclat { 0% { transform: scale(.97); filter: brightness(1.35) } 45% { transform: scale(1.04); filter: brightness(1.15) } 100% { transform: scale(1); filter: none } }
@keyframes dm-brille { 0%,100% { box-shadow: 0 0 0 0 rgba(191,227,214,0) } 50% { box-shadow: 0 0 0 14px rgba(191,227,214,.16) } }
@media (prefers-reduced-motion: reduce) { [data-anime] { animation: none !important } [data-confetti] { display: none } }
`

/** Les animations de la progression, une fois par page. */
export function StylesProgression() {
  return <style>{ANIMATIONS}</style>
}

/** La médaille d'un palier : le niveau, sur un disque plein. */
export function Medaille({ niveau, etat = 'atteint', taille = 56 }: { niveau: number; etat?: 'atteint' | 'encours' | 'verrouille'; taille?: number }) {
  const couleurs = etat === 'atteint' ? 'bg-gradient-to-br from-[#1F6B64] to-[#134E4A] text-[#BFE3D6] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]' : etat === 'encours' ? 'bg-bg text-teal ring-2 ring-teal' : 'bg-bg-soft text-fg-2 ring-1 ring-line'
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${couleurs}`} style={{ width: taille, height: taille }}>
      {etat === 'verrouille' ? <Lock style={{ width: taille * 0.34, height: taille * 0.34 }} aria-hidden /> : <span className="font-bold" style={{ fontSize: taille * 0.4 }}>{niveau}</span>}
    </span>
  )
}

export function BarreProgression({ part, epaisse = false, claire = false }: { part: number; epaisse?: boolean; claire?: boolean }) {
  return (
    <span className={`block overflow-hidden rounded-full ${claire ? 'bg-white/15' : 'bg-line'} ${epaisse ? 'h-2.5' : 'h-1.5'}`}>
      <span className={`block h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out ${claire ? 'from-[#2BB5A8] to-[#BFE3D6]' : 'from-[#0B8484] to-[#2BB5A8]'}`} style={{ width: `${Math.max(2, part * 100)}%` }} />
    </span>
  )
}

/** Le lien d'une source de points, avec la fiche courante et l'ancre de l'endroit où on les gagne. */
export function lienDeGain(cle: CleGain, q: string): string {
  const [base, ancre] = OU_GAGNER[cle].split('#')
  return `${base}${q}${ancre ? `#${ancre}` : ''}`
}

/**
 * La carte du bas du menu, en sombre, aux couleurs de la marque : palier,
 * points, ce qu'il reste avant le suivant. Elle mène à Distinctions. Dessous,
 * les points de diffusion : acquis en plein, à gagner en pointillés, chacun
 * menant droit à l'endroit où on les gagne.
 */
export function CarteProgression({ points, distinctions, q }: { points: Points; distinctions: string; q: string }) {
  const p = progressionDe(points.total, points.verifiee, points.detail.fiche)
  const sources = BAREME.filter((b) => b.cle !== 'fiche' && b.cle !== 'a_jour')
  return (
    <div className="squircle-xl overflow-hidden bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] text-white shadow-pop ring-1 ring-white/10">
      <Link href={chemin(distinctions)} className="block p-3 pb-2.5 hover:bg-white/5">
        <div className="flex items-center gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${p.actuel ? 'bg-[#BFE3D6] text-[#0B1F1D]' : 'text-[#BFE3D6] ring-2 ring-[#BFE3D6]'}`}>{p.actuel?.niveau ?? 0}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#BFE3D6]/80">{p.verifiee ? `Palier ${p.actuel?.niveau ?? 0}` : 'En vérification'}</p>
            <p className="line-clamp-2 text-sm font-semibold leading-tight">{p.actuel?.nom ?? (p.verifiee ? 'En route' : 'Fiche en préparation')}</p>
          </div>
          <p className="text-right">
            <span className="block text-base font-bold leading-none">{points.total}</span>
            <span className="text-[10px] text-white/60">pts</span>
          </p>
        </div>
        <div className="mt-3">
          <BarreProgression part={p.part} claire />
          <p className="mt-1.5 text-[11px] text-white/70">
            <b className="text-white">Fiche à {points.detail.fiche} %</b> ·{' '}
            {!p.verifiee ? (
              'publiée et au palier 1 dès la vérification'
            ) : p.suivant ? (
              <>
                plus que <b className="text-white">{resteAFaire(p)}</b> avant {p.suivant.nom}
              </>
            ) : (
              'tous les paliers atteints'
            )}
          </p>
        </div>
      </Link>
      <div className="flex flex-wrap gap-1 px-3 pb-3">
        {sources.map((b) => {
          const I = ICONE_GAIN[b.cle]
          const acquis = points.detail[b.cle]
          const plein = acquis >= b.max
          return (
            <Link
              key={b.cle}
              href={chemin(lienDeGain(b.cle, q))}
              title={plein ? `${b.libelle} : acquis` : `${b.libelle} : ${b.points}`}
              className={`squircle-full inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                acquis ? 'border border-transparent bg-white/10 text-[#BFE3D6] hover:bg-white/20' : 'border border-dashed border-white/30 text-white/55 hover:border-white/60 hover:text-white'
              }`}
            >
              <I className="size-3" aria-hidden />
              {acquis ? `+${acquis}` : `+${b.max === 75 ? 25 : b.max}`}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/** Le retour d'un gain : la coche, les points qui montent, la barre qui avance. Se ferme seul après cinq secondes. */
export function ToastGain({ de, a, titre, fermer, statique = false, verifiee = true, force = 100 }: { de: number; a: number; titre: string; fermer?: () => void; statique?: boolean; verifiee?: boolean; /** Force de fiche actuelle : à partir du palier 3, elle compte autant que les points. */ force?: number }) {
  const [affiche, setAffiche] = useState(statique ? a : de)
  // La fermeture passe par une référence : une fonction neuve à chaque rendu relancerait l'animation.
  const fermeture = useRef(fermer)
  useEffect(() => {
    fermeture.current = fermer
  })
  useEffect(() => {
    if (statique) return
    const debut = performance.now()
    let image = 0
    const pas = (t: number) => {
      const k = Math.min(1, (t - debut) / 900)
      setAffiche(Math.round(de + (a - de) * (1 - (1 - k) ** 3)))
      if (k < 1) image = requestAnimationFrame(pas)
    }
    image = requestAnimationFrame(pas)
    const fin = setTimeout(() => fermeture.current?.(), 5000)
    return () => {
      cancelAnimationFrame(image)
      clearTimeout(fin)
    }
  }, [de, a, statique])
  const p = progressionDe(affiche, verifiee, force)
  const passe = (progressionDe(de, verifiee, force).actuel?.niveau ?? 0) !== (progressionDe(a, verifiee, force).actuel?.niveau ?? 0)
  return (
    <div
      role="status"
      data-anime
      className={`squircle-2xl w-full max-w-sm overflow-hidden border border-line bg-bg shadow-pop ${statique ? '' : 'fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)]'}`}
      style={statique ? undefined : { animation: 'dm-monte .35s ease-out both' }}
    >
      <div className="flex items-start gap-3 p-4">
        <span data-anime className="grid size-11 shrink-0 place-items-center rounded-full bg-teal text-white" style={{ animation: statique ? undefined : 'dm-pop .5s .1s ease-out both' }}>
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg">{titre}</p>
          <p className="mt-0.5 text-sm text-fg-2">
            <span className="font-bold text-teal">+{a - de} pts</span> · {affiche} pts au total
          </p>
        </div>
        {fermer && (
          <button type="button" onClick={fermer} aria-label="Fermer" className="grid size-7 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft">
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="bg-bg-soft px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-[11px] text-fg-2">
          <span>{p.verifiee ? `Palier ${p.actuel?.niveau ?? 0} · ${p.actuel?.nom ?? 'En route'}` : 'Fiche en préparation'}</span>
          <span>{!p.verifiee ? 'Publiée dès la vérification' : p.suivant ? `${resteAFaire(p)} avant ${p.suivant.nom}` : 'Sommet atteint'}</span>
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

/** Un générateur pseudo-aléatoire à graine : les mêmes confettis à chaque rendu. */
function hasard(graine: number) {
  let s = graine
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const CONFETTIS = (() => {
  const h = hasard(42)
  const forme = () => (h() < 0.3 ? 'rounded-full' : h() < 0.6 ? 'rounded-[1px]' : 'rounded-sm')
  // Une pluie sur toute la largeur, et deux jets depuis les coins bas.
  const pluie = Array.from({ length: 90 }, () => ({
    style: { left: `${h() * 100}%`, top: 0, width: 6 + h() * 6, height: 8 + h() * 8, background: CHARTE[Math.floor(h() * CHARTE.length)], ['--dx' as string]: `${(h() - 0.5) * 240}px`, ['--r' as string]: `${(h() - 0.5) * 1440}deg`, animation: `dm-pluie ${2.6 + h() * 2.2}s ${h() * 1.4}s cubic-bezier(.25,.4,.5,1) both` },
    forme: forme(),
  }))
  const jets = Array.from({ length: 70 }, (_, i) => {
    const gauche = i % 2 === 0
    const angle = (gauche ? -1 : 1) * (15 + h() * 50) * (Math.PI / 180)
    const force = 55 + h() * 45
    return {
      style: {
        [gauche ? 'left' : 'right']: 0,
        bottom: 0,
        width: 6 + h() * 6,
        height: 8 + h() * 8,
        background: CHARTE[Math.floor(h() * CHARTE.length)],
        ['--dx' as string]: `${Math.sin(Math.abs(angle)) * force * (gauche ? 1 : -1)}vw`,
        ['--dy' as string]: `${-Math.cos(angle) * force}vh`,
        ['--r' as string]: `${(h() - 0.5) * 1080}deg`,
        animation: `dm-jet ${1.6 + h() * 1.2}s ${0.15 + h() * 0.35}s cubic-bezier(.15,.75,.35,1) both`,
      },
      forme: forme(),
    }
  })
  return [...pluie, ...jets]
})()

/** Les confettis, de partout, aux couleurs de la charte. */
export function Confettis() {
  return (
    <div data-confetti aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {CONFETTIS.map((c, i) => (
        <span key={i} data-anime className={`absolute ${c.forme}`} style={c.style} />
      ))}
    </div>
  )
}

/** La carte de résultat de la fiche, pour la montrer s'améliorer d'un palier à l'autre. */
export type CarteAMontrer = { praticien: PraticienProche; profession: Profession; photo: string | null }

/** Les gains d'un palier dits à un laboratoire : sa fiche est lue par des cabinets, et c'est lui qui la gère. */
export function gainsDuPalier(palier: Palier, labo: boolean): string[] {
  return labo ? palier.gains.map((g) => g.replace('filtres patients', 'filtres cabinets').replace('Gérée par le praticien', 'Gérée par le laboratoire')) : palier.gains
}

/**
 * Le passage de palier, plein écran, une fois par palier, sur le fond des
 * stories : la carte de résultat de la fiche, d'abord telle qu'au palier
 * d'avant, puis habillée du nouveau ; les gains débloqués en une ligne ;
 * l'action qui en tire parti.
 */
export function PassagePalier({ palier, fermer, lon, lat, partager, distinctions, carte }: { palier: Palier; fermer: () => void; lon: number | null; lat: number | null; partager: string; distinctions: string; carte?: CarteAMontrer }) {
  const fermeture = useRef(fermer)
  useEffect(() => {
    fermeture.current = fermer
  })
  useEffect(() => {
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && fermeture.current()
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [])
  // La carte apparaît au palier d'avant, puis passe au nouveau.
  const [niveau, setNiveau] = useState(palier.niveau - 1)
  useEffect(() => {
    const t = setTimeout(() => setNiveau(palier.niveau), 1100)
    return () => clearTimeout(t)
  }, [palier.niveau])
  const ameliore = niveau === palier.niveau

  return (
    <>
      <div role="dialog" aria-modal="true" aria-labelledby="palier-titre" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0B1F1D]/70 px-4 py-6 backdrop-blur-sm" onClick={fermer}>
        <div onClick={(e) => e.stopPropagation()} data-anime className="squircle-2xl relative w-full max-w-md overflow-hidden text-center text-white shadow-pop" style={{ animation: 'dm-pop .45s ease-out both' }}>
          <FondCarte lon={lon} lat={lat} zoom={14} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-[#0B1F1D] via-[#0B1F1D]/45 to-transparent" />
          <div className="relative px-6 pb-7 pt-8 sm:px-8">
            <div className="mx-auto flex w-fit gap-1.5 text-[#BFE3D6]">
              {[0, 1, 2].map((i) => (
                <Sparkles key={i} className="size-4" aria-hidden />
              ))}
            </div>
            <p className="mt-2 font-mono text-xs tracking-[0.2em] text-[#BFE3D6]">PALIER {palier.niveau} ATTEINT</p>
            <h2 id="palier-titre" className="mt-1 text-3xl font-extrabold tracking-tight">
              {palier.nom}
            </h2>

            {carte ? (
              <div className="relative mx-auto mt-6 w-[19.25rem] max-w-full">
                <div
                  key={niveau}
                  data-anime
                  className="pointer-events-none text-left text-fg [&_li]:min-h-[21rem]"
                  style={ameliore ? { animation: 'dm-eclat .7s ease-out both' } : undefined}
                >
                  <ul>
                    <CarteFixe praticien={carte.praticien} profession={carte.profession} photo={carte.photo} palier={niveau} />
                  </ul>
                </div>
                {ameliore && (
                  <span data-anime className="squircle-full absolute -right-2 -top-3 z-20 inline-flex items-center gap-1 bg-[#BFE3D6] px-2.5 py-1 text-xs font-bold text-[#0B1F1D] shadow-pop" style={{ animation: 'dm-pop .5s .2s ease-out both' }}>
                    <Sparkles className="size-3.5" aria-hidden /> Carte améliorée
                  </span>
                )}
              </div>
            ) : (
              <span data-anime className="mx-auto mt-6 block w-fit rounded-full" style={{ animation: 'dm-pop .6s .15s ease-out both, dm-brille 2.4s 1s ease-in-out infinite' }}>
                <Medaille niveau={palier.niveau} taille={112} />
              </span>
            )}

            <ul className="mt-5 flex flex-wrap justify-center gap-1.5 text-xs">
              {gainsDuPalier(palier, carte?.profession === 'prothesiste').map((g, i) => (
                <li key={g} data-anime className="squircle-full inline-flex items-center gap-1.5 bg-[#0B1F1D]/60 px-2.5 py-1 text-white/90 ring-1 ring-white/15 backdrop-blur-sm" style={{ animation: `dm-monte .4s ${1.2 + i * 0.12}s ease-out both` }}>
                  <Check className="size-3 text-[#BFE3D6]" strokeWidth={3} aria-hidden />
                  {g}
                </li>
              ))}
            </ul>

            <Link href={chemin(`${partager}${partager.includes('?') ? '&' : '?'}message=palier#reseaux`)} onClick={fermer} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[#0B1F1D] hover:bg-[#BFE3D6]">
              <Share2 className="size-4" aria-hidden /> Partager mon avancement
            </Link>
            <Link href={chemin(distinctions)} onClick={fermer} className="mt-3 inline-block text-sm font-medium text-white/80 hover:text-white">
              Voir ma progression
            </Link>
          </div>
        </div>
      </div>
      <Confettis />
    </>
  )
}

type Memoire = { total: number; detail: Record<CleGain, number>; niveau: number }

/**
 * Le suivi d'une fiche d'une page à l'autre : les points de la dernière visite
 * sont gardés dans ce navigateur. S'ils ont monté, l'encart de gain ; si un
 * palier est franchi, le plein écran, une seule fois. La première visite ne
 * fait que mémoriser.
 */
export function SuiviProgression({ slug, points, lon, lat, partager, distinctions, carte }: { slug: string; points: Points; lon: number | null; lat: number | null; partager: string; distinctions: string; carte?: CarteAMontrer }) {
  const [gain, setGain] = useState<{ de: number; a: number; titre: string } | null>(null)
  const [palier, setPalier] = useState<Palier | null>(null)
  const niveau = progressionDe(points.total, points.verifiee, points.detail.fiche).actuel?.niveau ?? 0

  // Ce qui reste à montrer, gardé pour l'onglet : un rendu recréé (rechargement, page en flux) ne perd pas la célébration.
  const cleAMontrer = `dm-progression-a-montrer:${slug}`
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
    const cle = `dm-progression:${slug}`
    const minuterie = setTimeout(() => {
      try {
        const avant: Memoire | null = JSON.parse(localStorage.getItem(cle) ?? 'null')
        localStorage.setItem(cle, JSON.stringify({ total: points.total, detail: points.detail, niveau } satisfies Memoire))
        if (avant && points.total > avant.total) {
          const plus = (Object.keys(points.detail) as CleGain[]).sort((x, y) => points.detail[y] - (avant.detail?.[y] ?? 0) - (points.detail[x] - (avant.detail?.[x] ?? 0)))[0]
          sessionStorage.setItem(
            cleAMontrer,
            JSON.stringify({ gain: { de: avant.total, a: points.total, titre: TITRE_GAIN[plus] }, palier: niveau > (avant.niveau ?? 0) ? niveau : undefined }),
          )
        }
        const aMontrer: { gain?: { de: number; a: number; titre: string }; palier?: number } = JSON.parse(sessionStorage.getItem(cleAMontrer) ?? '{}')
        if (aMontrer.gain) setGain(aMontrer.gain)
        if (aMontrer.palier) setPalier(PALIERS.find((p) => p.niveau === aMontrer.palier) ?? null)
      } catch {}
    }, 0)
    return () => clearTimeout(minuterie)
  }, [slug, points.total, points.detail, niveau, cleAMontrer])

  return (
    <>
      {(gain || palier) && <StylesProgression />}
      {gain && <ToastGain de={gain.de} a={gain.a} titre={gain.titre} fermer={() => oublier('gain')} verifiee={points.verifiee} force={points.detail.fiche} />}
      {palier && <PassagePalier palier={palier} fermer={() => oublier('palier')} lon={lon} lat={lat} partager={partager} distinctions={distinctions} carte={carte} />}
    </>
  )
}

/** Le chemin des paliers : atteints, le prochain, les verrouillés, et ce que chacun débloque. */
export function CheminPaliers({ points, verifiee = true, force = 100 }: { points: number; verifiee?: boolean; force?: number }) {
  const progression = progressionDe(points, verifiee, force)
  const prochain = progression.suivant?.niveau
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {PALIERS.map((p) => {
        const etat = verifiee && p.niveau <= (progression.actuel?.niveau ?? 0) ? 'atteint' : prochain === p.niveau ? 'encours' : 'verrouille'
        return (
          <li key={p.niveau} className={`squircle-2xl relative flex flex-col border p-4 ${etat === 'atteint' ? 'border-[#0B8484]/40 bg-bg' : etat === 'encours' ? 'border-teal bg-bg shadow-pop' : 'border-dashed border-line bg-bg-soft'}`}>
            {etat === 'encours' && <span className="squircle-full absolute -top-2.5 left-4 bg-teal px-2 py-0.5 text-[10px] font-semibold text-white">Prochain · {resteAFaire(progression)}</span>}
            <div className="flex items-center gap-3">
              <Medaille niveau={p.niveau} etat={etat} taille={44} />
              <div>
                <p className="font-semibold leading-tight text-fg">{p.nom}</p>
                <p className="font-mono text-[11px] text-fg-2">{p.seuil} pts{p.forceMin ? ` · fiche à ${p.forceMin} %` : ''}</p>
              </div>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-xs">
              {p.gains.map((g) => (
                <li key={g} className="flex gap-2">
                  {etat === 'atteint' ? <Check className="mt-px size-3.5 shrink-0 text-teal" aria-hidden /> : <Lock className="mt-px size-3.5 shrink-0 text-fg-2" aria-hidden />}
                  <span className={etat === 'atteint' ? 'text-fg' : 'text-fg-2'}>{g}</span>
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}
