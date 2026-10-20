'use client'

import { useEffect, useRef, useState } from 'react'
import { AtSign, Award, Check, Download, Link2, Loader2, Share, Sticker } from 'lucide-react'
import { toBlob } from 'html-to-image'
import QRCode from 'qrcode'
import { CarteFixe } from './carte-fixe'
import { FondCarte, VOILE_MARQUE } from './fond-carte'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'

/** Le compte Instagram de DentalMap, à mentionner dans la story. */
export const COMPTE_INSTAGRAM = '@dentalmap.fr'

export type Format = 'story' | 'carre'
export type Message = 'fiche' | 'palier'

/**
 * Chaque format : sa taille, l'échelle de la carte de résultat, où elle se pose
 * et où tombe le repère (le lieu du cabinet) sur le plan. La story laisse
 * libres les bandeaux d'Instagram, en haut et en bas.
 */
const FORMATS = {
  story: { l: 1080, h: 1920, echelle: 2, carte: { x: 232, y: 610 }, repere: { x: 540, y: 1450 }, apercu: 15 },
  carre: { l: 1080, h: 1080, echelle: 1.32, carte: { x: 612, y: 150 }, repere: { x: 815, y: 720 }, apercu: 20 },
} as const

/**
 * Les visuels pour les réseaux : la carte de résultat telle que la recherche
 * la montre (le même composant, la même fiche, donc chaque évolution du profil
 * se partage), posée sur le plan autour du cabinet, sous un voile aux couleurs
 * de la marque. La composition est rendue dans la page, prévisualisée réduite,
 * puis exportée en PNG à sa taille réelle dans le navigateur.
 *
 * « Partager en story » ouvre la feuille de partage du téléphone avec l'image
 * (Instagram, puis « Story ») et copie le lien de la fiche au même geste :
 * ni Instagram ni Facebook ne laissent un site pré-remplir le sticker lien ou
 * la mention. Sans partage de fichiers (ordinateur), le bouton télécharge.
 */
export function PartageReseaux(props: {
  praticien: PraticienProche
  profession: Profession
  photo: string | null
  /** Le lien affiché, celui du code QR et celui à coller dans le sticker : chacun marqué pour les statistiques. */
  liens: { affiche: string; qr: string; story: string }
  labo: boolean
  ouvert: boolean
  /** Le palier tenu : à partir du troisième, les visuels en portent le nom. */
  palier: { niveau: number; nom: string } | null
  /** Pourquoi le partage est fermé, s'il l'est. */
  ferme?: string
  /** Le message ouvert d'abord : la fiche, ou le palier atteint (depuis le passage de palier). */
  message?: Message
}) {
  const [format, setFormat] = useState<Format>('story')
  // L'avancement se partage dès le palier 2.
  const avecPalier = (props.palier?.niveau ?? 0) >= 2
  const [message, setMessage] = useState<Message>(avecPalier && props.message === 'palier' ? 'palier' : 'fiche')
  const [image, setImage] = useState<{ format: Format; message: Message; fichier: File } | null>(null)
  const [etat, setEtat] = useState<'repos' | 'partage' | 'fait' | 'telecharge'>('repos')
  const fichier = image?.format === format && image.message === message ? image.fichier : null

  const telecharger = () => {
    if (!fichier) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(fichier)
    a.download = fichier.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    setEtat('telecharge')
  }

  const partager = async () => {
    if (!fichier) return
    // Le lien d'abord, pour le coller dans le sticker lien.
    navigator.clipboard?.writeText(props.liens.story).catch(() => {})
    if (navigator.canShare?.({ files: [fichier] })) {
      setEtat('partage')
      try {
        await navigator.share({ files: [fichier] })
        setEtat('fait')
      } catch {
        setEtat('repos')
      }
    } else telecharger()
  }

  const f = FORMATS[format]
  const echelleApercu = (f.apercu * 16) / f.l

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-3">
        <div className="squircle-full inline-flex bg-bg-soft p-1 text-sm" role="tablist" aria-label="Format du visuel">
          {(
            [
              ['story', 'Story'],
              ['carre', 'Publication'],
            ] as const
          ).map(([cle, libelle]) => (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={format === cle}
              onClick={() => {
                setFormat(cle)
                setEtat('repos')
              }}
              className={`squircle-full cursor-pointer px-4 py-1.5 font-medium ${format === cle ? 'bg-bg text-fg shadow-sm' : 'text-fg-2 hover:text-fg'}`}
            >
              {libelle}
            </button>
          ))}
        </div>
        {avecPalier && (
          <div className="squircle-full inline-flex bg-bg-soft p-1 text-xs" role="tablist" aria-label="Message du visuel">
            {(
              [
                ['fiche', 'Ma fiche'],
                ['palier', `Mon palier · ${props.palier?.nom}`],
              ] as const
            ).map(([cle, libelle]) => (
              <button
                key={cle}
                type="button"
                role="tab"
                aria-selected={message === cle}
                onClick={() => {
                  setMessage(cle)
                  setEtat('repos')
                }}
                className={`squircle-full cursor-pointer px-3 py-1 font-medium ${message === cle ? 'bg-bg text-fg shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                {libelle}
              </button>
            ))}
          </div>
        )}
        <div className="squircle-2xl relative overflow-hidden shadow-pop ring-1 ring-line" style={{ width: f.l * echelleApercu, height: f.h * echelleApercu }}>
          <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${echelleApercu})` }}>
            <Composition key={`${format}-${message}`} format={format} message={message} {...props} onPret={(fichier) => setImage({ format, message, fichier })} />
          </div>
          {!fichier && (
            <span className="squircle-full absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 bg-black/60 px-3 py-1 text-xs text-white">
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> Préparation de l’image
            </span>
          )}
        </div>
      </div>
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-fg-2">Votre carte de résultat, telle que les patients la voient, posée sur le plan autour de votre cabinet. Elle suit votre fiche : chaque nouveauté se partage.</p>
        {props.ouvert ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={partager}
                disabled={!fichier}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:cursor-default disabled:opacity-60"
              >
                {etat === 'partage' || !fichier ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Share className="size-4" aria-hidden />}
                {format === 'story' ? 'Partager en story' : 'Partager'}
              </button>
              <button
                type="button"
                onClick={telecharger}
                disabled={!fichier}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:cursor-default disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden /> Télécharger
              </button>
            </div>
            <ol className="squircle-xl space-y-2.5 bg-bg-soft p-4 text-sm">
              <li className="flex gap-3">
                <Share className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <span className="text-fg">Sur votre téléphone, choisissez Instagram puis « Story » : l’image est prête.</span>
              </li>
              <li className="flex gap-3">
                <Sticker className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <span className="text-fg">
                  Ajoutez le sticker « Lien » et collez : le lien de votre fiche est déjà copié.
                  {etat !== 'repos' && (
                    <span className="ml-1 inline-flex items-center gap-1 text-teal">
                      <Check className="size-3.5" aria-hidden /> Copié
                    </span>
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <AtSign className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <span className="text-fg">Ajoutez la mention {COMPTE_INSTAGRAM}, pour que nous puissions la repartager.</span>
              </li>
            </ol>
            {etat === 'telecharge' && (
              <p className="flex items-center gap-2 text-xs text-fg-2">
                <Link2 className="size-3.5" aria-hidden /> Image téléchargée. Sur ordinateur, envoyez-la sur votre téléphone pour la publier en story.
              </p>
            )}
          </>
        ) : (
          <p className="squircle-xl bg-bg-soft px-4 py-3 text-sm text-fg-2">{props.ferme ?? 'Le partage s’ouvre dès que votre identité est vérifiée : le visuel annonce une fiche vérifiée.'}</p>
        )}
      </div>
    </div>
  )
}

/** La composition à taille réelle : plan, voile, titre, carte de résultat, repère, lien. Exportée une fois prête. */
/** Les propriétés d'un visuel : celles du partage, le format et le message. */
export type ProprietesVisuel = Pick<Parameters<typeof PartageReseaux>[0], 'praticien' | 'profession' | 'photo' | 'liens' | 'labo' | 'palier'> & {
  format: Format
  message: Message
  /** Une capture du plan déjà faite (maquette, comparaison) : pas de carte à rendre, pas d'export. */
  fond?: string
  onPret?: (f: File) => void
}

/** Un visuel à taille réelle, sans réduction : la maquette les compare palier par palier. */
export function VisuelPartage(props: ProprietesVisuel) {
  return <Composition {...props} />
}

/** La taille réelle d'un format, pour réduire un visuel à l'écran. */
export function tailleVisuel(format: Format): { l: number; h: number } {
  return { l: FORMATS[format].l, h: FORMATS[format].h }
}

/** Le décalage du repère dans un format, pour capturer le plan au bon cadrage. */
export function cadrageVisuel(format: Format): { zoom: number; decalage: { x: number; y: number } } {
  const f = FORMATS[format]
  return { zoom: format === 'story' ? 14.2 : 13.6, decalage: { x: f.repere.x - f.l / 2, y: f.repere.y - f.h / 2 } }
}

function Composition({ format, message, praticien, profession, photo, liens, labo, palier, fond, onPret }: ProprietesVisuel) {
  const f = FORMATS[format]
  const story = format === 'story'
  // Palier 3 et plus : les couleurs du palier sur le visuel.
  const distingue = !!palier && palier.niveau >= 3
  const annonce = message === 'palier' && !!palier
  const racine = useRef<HTMLDivElement>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [planPret, setPlanPret] = useState(!!fond)
  const pret = useRef(onPret)
  useEffect(() => {
    pret.current = onPret
  })

  useEffect(() => {
    QRCode.toDataURL(liens.qr, { margin: 1, width: 360, color: { dark: '#0e1317', light: '#ffffff' } }).then(setQr, () => {})
  }, [liens.qr])

  // Tout est posé (plan, code QR, images, polices) : l'image se fabrique à taille réelle.
  useEffect(() => {
    if (fond || !planPret || !qr || !racine.current) return
    let annule = false
    const noeud = racine.current
    ;(async () => {
      await document.fonts.ready
      // Les images affichées seulement : la carte en garde une masquée pour le thème sombre, qui ne se charge jamais. Quatre secondes au plus.
      const images = [...noeud.querySelectorAll('img')].filter((i) => !i.complete && i.offsetParent !== null)
      await Promise.race([Promise.all(images.map((i) => new Promise((ok) => (i.addEventListener('load', ok, { once: true }), i.addEventListener('error', ok, { once: true }))))), new Promise((ok) => setTimeout(ok, 4000))])
      // Une première passe charge les ressources, la seconde les dessine : contournement connu de Safari.
      // Les guides de pose (emplacements des stickers) restent dans l'aperçu, jamais dans l'image.
      const options = { width: f.l, height: f.h, pixelRatio: 1, style: { transform: 'none' }, filter: (n: Node) => !(n instanceof HTMLElement && n.dataset.guide !== undefined) }
      await toBlob(noeud, options).catch(() => null)
      const blob = await toBlob(noeud, options)
      if (!annule && blob) pret.current?.(new File([blob], `dentalmap-${format}.png`, { type: 'image/png' }))
    })().catch((e) => console.error('[visuel] export impossible', e))
    return () => {
      annule = true
    }
  }, [fond, planPret, qr, f, format])

  return (
    <div ref={racine} className="relative overflow-hidden bg-[#0B1F1D] font-sans text-white" style={{ width: f.l, height: f.h }}>
      {fond ? (
        <div aria-hidden className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- capture du plan en data URL */}
          <img src={fond} alt="" className="size-full" />
          <div className="absolute inset-0" style={{ background: VOILE_MARQUE }} />
        </div>
      ) : (
        <FondCarte {...cadrageVisuel(format)} lon={praticien.lon} lat={praticien.lat} largeur={f.l} hauteur={f.h} exporter onPret={() => setPlanPret(true)} />
      )}
      <div className="absolute rounded-full" style={{ left: f.repere.x - 220, top: f.repere.y - 220, width: 440, height: 440, background: 'radial-gradient(circle, rgba(11,132,132,0.55), transparent 70%)' }} />

      <div className="absolute flex items-center justify-between" style={{ top: story ? 150 : 64, left: story ? 90 : 72, right: story ? 90 : 72 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- exporté par html-to-image, qui lit des balises simples */}
        <img src="/images/marque/logo-dentalmap-blanc.png" alt="DentalMap" style={{ height: 48, width: Math.round(48 * (442 / 96)) }} />
        <span className="font-mono text-[22px] tracking-[0.18em] text-[#BFE3D6]" style={annonce && !story ? { visibility: 'hidden' } : undefined}>{distingue ? `${palier.nom.toUpperCase()} · PALIER ${palier.niveau}` : 'FICHE VÉRIFIÉE · RPPS'}</span>
      </div>

      <div className={`absolute flex flex-col ${story ? 'items-center text-center' : ''}`} style={{ top: story ? 290 : 210, left: story ? 90 : 72, width: story ? 900 : 520 }}>
        {annonce ? (
          <>
            <p className="font-extrabold tracking-[-0.03em]" style={{ fontSize: story ? 96 : 64, lineHeight: 0.98 }}>
              {labo ? 'Notre fiche passe' : 'Ma fiche passe'}
              <br />
              <span className="text-[#BFE3D6]">{palier.nom}</span>
            </p>
          </>
        ) : (
          <p className="font-extrabold tracking-[-0.03em]" style={{ fontSize: story ? 104 : 70, lineHeight: 0.98 }}>
            {labo ? 'Retrouvez-nous' : 'Retrouvez-moi'}
            <br />
            <span className="text-[#BFE3D6]">sur DentalMap</span>
          </p>
        )}
        {distingue && !annonce && (
          <span className="mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-[#BFE3D6] px-6 py-2.5 font-bold text-[#0B1F1D]" style={{ fontSize: story ? 30 : 22 }}>
            <Award style={{ width: story ? 32 : 24, height: story ? 32 : 24 }} aria-hidden /> {palier.nom}
          </span>
        )}
        {/* En story, la pastille du palier prend la place de la phrase : elle passerait sous la carte. */}
        {!annonce && !(story && distingue) && (
          <p className={`${distingue ? 'mt-5' : 'mt-7'} font-medium text-white/80`} style={{ fontSize: story ? 36 : 28, lineHeight: 1.3 }}>
            {labo ? 'Délais, savoir-faire, réalisations : à jour.' : 'Horaires, conventionnement, accueil : à jour.'}
          </p>
        )}
      </div>

      {/*
        La carte de résultat, le composant même de la recherche. Safari ignore
        les coins arrondis et les ombres de la carte quand il fabrique l'image :
        le cadre extérieur porte ici le liseré et le halo du palier, le cadre
        intérieur découpe les coins (masque pour Safari), et la carte, dedans,
        perd ses propres effets.
      */}
      <div className="absolute origin-top-left" style={{ left: f.carte.x, top: f.carte.y, transform: `scale(${f.echelle})` }}>
        <CadreCarte niveau={palier?.niveau}>
          <ul className="w-[19.25rem] text-fg [&_li]:min-h-[24rem] [&_li]:!rounded-none [&_li]:!border-0 [&_li]:!shadow-none [&_li]:!ring-0">
            <CarteFixe praticien={praticien} profession={profession} photo={photo} palier={palier?.niveau} pastillesEmpilees={annonce} />
          </ul>
        </CadreCarte>
      </div>

      {/* Le palier atteint : un sceau posé en coin de la carte, comme un cachet. */}
      {annonce && <Sceau niveau={palier.niveau} nom={palier.nom} taille={story ? 230 : 170} x={story ? 760 : 900} y={story ? 520 : 76} />}

      {/* Le repère du cabinet sur le plan : deux disques plutôt qu'une bordure, que l'export rend mal */}
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: f.repere.x - 26, top: f.repere.y - 26, width: 52, height: 52, boxShadow: '0 0 0 14px rgba(11,132,132,0.35), 0 10px 24px rgba(0,0,0,0.4)' }}>
        <div className="rounded-full" style={{ width: 34, height: 34, background: '#0B8484' }} />
      </div>

      {story ? (
        /*
         * La story ne porte ni code QR ni adresse : Instagram rend le sticker lien
         * cliquable. Deux emplacements en pointillés guident la pose du sticker et de
         * la mention dans l'aperçu ; ils sont retirés de l'image exportée.
         */
        <div data-guide className="absolute flex flex-col items-center gap-5" style={{ left: 90, bottom: 190, width: 900 }}>
          <span className="flex items-center justify-center gap-3 rounded-[28px] border-[3px] border-dashed border-[#BFE3D6]/70 font-semibold text-[#BFE3D6]" style={{ width: 560, height: 110, fontSize: 30 }}>
            <Link2 style={{ width: 34, height: 34 }} aria-hidden /> Sticker lien vers ma fiche
          </span>
          <span className="flex items-center justify-center gap-2 rounded-[24px] border-[3px] border-dashed border-[#BFE3D6]/50 font-semibold text-[#BFE3D6]/90" style={{ width: 380, height: 84, fontSize: 28 }}>
            <AtSign style={{ width: 30, height: 30 }} aria-hidden /> {COMPTE_INSTAGRAM.slice(1)}
          </span>
        </div>
      ) : (
        <div className="absolute flex items-center gap-6 rounded-[32px] border border-[#BFE3D6]/35 bg-[#0B1F1D]/70 p-5" style={{ left: 72, bottom: 64, width: 560 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- code QR en data URL */}
          {qr && <img src={qr} alt="" className="rounded-2xl" style={{ width: 124, height: 124 }} />}
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[20px] tracking-[0.16em] text-[#BFE3D6]">SCANNEZ, C’EST MA FICHE</span>
            <span className="mt-2 truncate font-bold" style={{ fontSize: 22 }}>
              {liens.affiche.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Le sceau du palier : le nom en couronne, le numéro au centre, légèrement incliné. */
function Sceau({ niveau, nom, taille, x, y }: { niveau: number; nom: string; taille: number; x: number; y: number }) {
  const r = 50
  const texte = `${nom.toUpperCase()} · DENTALMAP · `
  return (
    <svg width={taille} height={taille} viewBox="0 0 120 120" className="absolute" style={{ left: x, top: y, transform: 'rotate(-12deg)', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))' }} aria-hidden>
      <defs>
        <path id={`sceau-${niveau}`} d={`M60,60 m-${r - 7},0 a${r - 7},${r - 7} 0 1,1 ${2 * (r - 7)},0 a${r - 7},${r - 7} 0 1,1 -${2 * (r - 7)},0`} />
      </defs>
      <circle cx="60" cy="60" r={r + 8} fill="#BFE3D6" />
      <circle cx="60" cy="60" r={r - 14} fill="#134E4A" />
      <circle cx="60" cy="60" r={r + 4} fill="none" stroke="#0B1F1D" strokeOpacity="0.25" strokeWidth="0.8" strokeDasharray="1.5 2" />
      <text fill="#0B1F1D" fontSize="8.4" fontWeight="700" letterSpacing="1.6" fontFamily="inherit">
        <textPath href={`#sceau-${niveau}`} textLength={2 * Math.PI * (r - 7) - 4} lengthAdjust="spacing">
          {texte}
        </textPath>
      </text>
      <text x="60" y="56" textAnchor="middle" fill="#BFE3D6" fontSize="8" fontWeight="600" letterSpacing="1.5" fontFamily="inherit">
        PALIER
      </text>
      <text x="60" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="800" fontFamily="inherit">
        {niveau}
      </text>
    </svg>
  )
}

/**
 * Le cadre de la carte dans un visuel, en couches pleines plutôt qu'en ombres
 * (que Safari rend carrées à l'export) : le halo du palier, le liseré, puis la
 * découpe des coins, masquée pour que Safari la respecte.
 */
function CadreCarte({ niveau = 0, children }: { niveau?: number; children: React.ReactNode }) {
  const halo = niveau >= 5 ? { epaisseur: 8, couleur: 'rgba(191,227,214,0.28)' } : niveau === 4 ? { epaisseur: 6, couleur: 'rgba(43,181,168,0.22)' } : null
  const lisere = niveau >= 5 ? { epaisseur: 3, couleur: '#BFE3D6' } : niveau === 4 ? { epaisseur: 2, couleur: '#2BB5A8' } : niveau === 3 ? { epaisseur: 2, couleur: '#0B8484' } : null
  const decoupe = 22
  const carte = (
    <div className="overflow-hidden" style={{ borderRadius: decoupe, WebkitMaskImage: '-webkit-radial-gradient(white, black)', isolation: 'isolate' }}>
      {children}
    </div>
  )
  const avecLisere = lisere ? (
    <div style={{ padding: lisere.epaisseur, background: lisere.couleur, borderRadius: decoupe + lisere.epaisseur }}>{carte}</div>
  ) : (
    carte
  )
  if (!halo) return avecLisere
  return <div style={{ padding: halo.epaisseur, background: halo.couleur, borderRadius: decoupe + (lisere?.epaisseur ?? 0) + halo.epaisseur, margin: -halo.epaisseur }}>{avecLisere}</div>
}
