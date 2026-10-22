'use client'

import { useEffect, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { Download, Loader2, Printer, Share, Star } from 'lucide-react'

/**
 * Les visuels pour recueillir des avis : une affiche A4 à imprimer (salle,
 * ateliers, centre de soins), une publication carrée et une story pour les
 * réseaux. Chacun porte le code QR du formulaire d'avis. La composition est
 * rendue dans la page à taille réelle, prévisualisée réduite, puis exportée
 * en PNG dans le navigateur, comme les visuels des soignants.
 */

export type FormatAvis = 'affiche' | 'carre' | 'story'

const FORMATS: Record<FormatAvis, { l: number; h: number; libelle: string; ratio: number }> = {
  // A4 à 150 points par pouce, exporté au double : 2480 × 3508, soit 300 points par pouce.
  affiche: { l: 1240, h: 1754, libelle: 'Affiche A4', ratio: 2 },
  carre: { l: 1080, h: 1080, libelle: 'Publication', ratio: 1 },
  story: { l: 1080, h: 1920, libelle: 'Story', ratio: 1 },
}

type Props = {
  nom: string
  faculte: boolean
  /** Le code QR du formulaire d'avis, en PNG (data URL), fabriqué côté serveur. */
  qr: string
  /** L'adresse lisible du formulaire. */
  adresse: string
  photo: string | null
  note: { moyenne: number; nombre: number } | null
}

export function VisuelsAvis(props: Props) {
  const [format, setFormat] = useState<FormatAvis>('affiche')
  const [fichier, setFichier] = useState<{ format: FormatAvis; f: File } | null>(null)
  const pret = fichier?.format === format ? fichier.f : null
  const f = FORMATS[format]
  const largeurApercu = format === 'story' ? 260 : format === 'carre' ? 340 : 320
  const echelle = largeurApercu / f.l

  const telecharger = () => {
    if (!pret) return
    const url = URL.createObjectURL(pret)
    const a = Object.assign(document.createElement('a'), { href: url, download: pret.name })
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  const partager = async () => {
    if (!pret) return
    if (navigator.canShare?.({ files: [pret] })) await navigator.share({ files: [pret], title: `Avis sur ${props.nom}` }).catch(() => {})
    else telecharger()
  }
  // L'impression ouvre l'affiche seule, à la taille d'une page A4, puis la boîte d'impression.
  const imprimer = () => {
    if (!pret) return
    const url = URL.createObjectURL(pret)
    const w = window.open('', '_blank')
    if (!w) return telecharger()
    w.document.write(
      `<!doctype html><title>Affiche avis</title><style>@page{size:A4;margin:0}html,body{margin:0}img{width:210mm;height:297mm;display:block}</style><img src="${url}" onload="setTimeout(()=>{print()},150)">`,
    )
    w.document.close()
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
      <div className="mx-auto">
        <div role="tablist" aria-label="Format du visuel" className="squircle-full mb-4 inline-flex bg-bg-soft p-1 text-sm">
          {(Object.keys(FORMATS) as FormatAvis[]).map((cle) => (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={format === cle}
              onClick={() => setFormat(cle)}
              className={`squircle-full cursor-pointer px-4 py-1.5 font-medium ${format === cle ? 'bg-bg text-fg shadow-sm' : 'text-fg-2 hover:text-fg'}`}
            >
              {FORMATS[cle].libelle}
            </button>
          ))}
        </div>
        <div className="squircle-xl overflow-hidden shadow-pop ring-1 ring-line" style={{ width: largeurApercu, height: f.h * echelle }}>
          <div style={{ transform: `scale(${echelle})`, transformOrigin: 'top left', width: f.l, height: f.h }}>
            <Composition key={format} format={format} {...props} onPret={(fi) => setFichier({ format, f: fi })} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="font-semibold text-fg">{format === 'affiche' ? 'À imprimer et afficher' : format === 'carre' ? 'Pour LinkedIn, Instagram et Facebook' : 'Pour les stories Instagram et Facebook'}</p>
          <p className="mt-1 text-sm text-fg-2">
            {format === 'affiche'
              ? `En salle de cours, dans les ateliers${props.faculte ? ', au centre de soins' : ''}, à l’accueil ou sur un panneau. Format A4, prêt pour l’impression.`
              : format === 'carre'
                ? 'Publiez-le avec le lien du formulaire en légende. Le code QR sert à ceux qui le voient sur un autre écran.'
                : 'Ajoutez un sticker lien vers le formulaire : sur une story, il se touche du doigt.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {format === 'affiche' && (
            <button type="button" onClick={imprimer} disabled={!pret} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
              <Printer className="size-4" aria-hidden /> Imprimer
            </button>
          )}
          <button
            type="button"
            onClick={telecharger}
            disabled={!pret}
            className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold disabled:opacity-60 ${format === 'affiche' ? 'border border-line text-fg hover:border-line-strong' : 'bg-action text-action-foreground hover:bg-action-hover'}`}
          >
            {pret ? <Download className="size-4" aria-hidden /> : <Loader2 className="size-4 animate-spin" aria-hidden />} Télécharger
          </button>
          {format !== 'affiche' && (
            <button type="button" onClick={partager} disabled={!pret} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-fg hover:border-line-strong disabled:opacity-60">
              <Share className="size-4" aria-hidden /> Partager
            </button>
          )}
        </div>
        <p className="text-xs text-fg-2">{props.photo ? 'La photo vient de votre galerie : la première, celle de la page.' : 'Ajoutez une photo à votre galerie : elle illustrera ces visuels.'}</p>
      </div>
    </div>
  )
}

/** Le visuel à taille réelle ; exporté en PNG dès que tout est chargé. */
function Composition({ format, nom, faculte, qr, adresse, photo, note, onPret }: Props & { format: FormatAvis; onPret: (f: File) => void }) {
  const racine = useRef<HTMLDivElement>(null)
  const pret = useRef(onPret)
  useEffect(() => {
    pret.current = onPret
  })
  const f = FORMATS[format]
  const affiche = format === 'affiche'
  const story = format === 'story'

  useEffect(() => {
    const noeud = racine.current
    if (!noeud) return
    let annule = false
    ;(async () => {
      await document.fonts.ready
      const images = [...noeud.querySelectorAll('img')].filter((i) => !i.complete)
      await Promise.race([Promise.all(images.map((i) => new Promise((ok) => (i.addEventListener('load', ok, { once: true }), i.addEventListener('error', ok, { once: true }))))), new Promise((ok) => setTimeout(ok, 4000))])
      const options = { width: f.l, height: f.h, pixelRatio: f.ratio, style: { transform: 'none' } }
      // Une première passe charge les ressources, la seconde les dessine : contournement connu de Safari.
      await toBlob(noeud, options).catch(() => null)
      const blob = await toBlob(noeud, options)
      if (!annule && blob) pret.current(new File([blob], `dentalmap-avis-${format}.png`, { type: 'image/png' }))
    })().catch((e) => console.error('[visuel avis] export impossible', e))
    return () => {
      annule = true
    }
  }, [f, format])

  // Les mesures de chaque format : hauteur de la photo, marges, tailles de texte.
  const m = affiche
    ? { photo: 700, marge: 96, titre: 104, sous: 38, qr: 300, logo: 56 }
    : story
      ? { photo: 700, marge: 90, titre: 104, sous: 38, qr: 300, logo: 52 }
      : { photo: 0, marge: 72, titre: 76, sous: 30, qr: 250, logo: 46 }
  const titre = faculte ? 'Vous y avez étudié, ou été soigné ?' : 'Vous y avez étudié ?'

  return (
    <div ref={racine} className="relative overflow-hidden bg-[#0B1F1D] font-sans text-white" style={{ width: f.l, height: f.h }}>
      {/* Le fond : la photo de l'établissement en haut (affiche, story), en plein sous un voile (publication). */}
      {photo && (
        <div className="absolute inset-x-0 top-0" style={{ height: m.photo || f.h }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- exporté par html-to-image, qui lit des balises simples */}
          <img src={photo} alt="" className="size-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: m.photo ? 'linear-gradient(180deg, rgba(11,31,29,0.55) 0%, rgba(11,31,29,0.15) 40%, #0B1F1D 100%)' : 'linear-gradient(90deg, #0B1F1D 0%, rgba(11,31,29,0.92) 55%, rgba(11,31,29,0.55) 100%)' }}
          />
        </div>
      )}
      {!photo && <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 10%, rgba(11,132,132,0.45), transparent 55%)' }} />}

      <div className="absolute flex items-center justify-between" style={{ top: m.marge * 0.8, left: m.marge, right: m.marge }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- exporté par html-to-image */}
        <img src="/images/marque/logo-dentalmap-blanc.png" alt="DentalMap" style={{ height: m.logo, width: Math.round(m.logo * (442 / 96)) }} />
        <span className="font-mono tracking-[0.18em] text-[#BFE3D6]" style={{ fontSize: m.sous * 0.6 }}>
          AVIS · {faculte ? 'FACULTÉ' : 'ÉCOLE'}
        </span>
      </div>

      <div className="absolute flex flex-col" style={{ left: m.marge, right: format === 'carre' ? 430 : m.marge, top: m.photo ? m.photo - (story ? 120 : 160) : 220 }}>
        <p className="font-semibold text-[#BFE3D6]" style={{ fontSize: m.sous }}>
          {nom}
        </p>
        <p className="mt-4 font-extrabold tracking-[-0.03em]" style={{ fontSize: m.titre, lineHeight: 1 }}>
          {titre}
        </p>
        <p className="mt-6 text-white/80" style={{ fontSize: m.sous, lineHeight: 1.3 }}>
          Donnez votre avis en deux minutes : il aide les futurs étudiants à choisir.
        </p>
        {note && note.nombre > 0 && (
          <span className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-white/10 px-6 py-3 font-semibold" style={{ fontSize: m.sous * 0.8 }}>
            <Star className="text-amber-400" fill="currentColor" strokeWidth={0} style={{ width: m.sous, height: m.sous }} aria-hidden />
            {note.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · {note.nombre} avis sur DentalMap
          </span>
        )}
      </div>

      {/* Le code QR, sur une carte blanche : en bas, ou à droite sur la publication. */}
      <div
        className="absolute flex flex-col items-center rounded-[40px] bg-white text-[#0B1F1D]"
        style={
          format === 'carre'
            ? { right: m.marge, top: (f.h - m.qr - 150) / 2, width: m.qr + 64, padding: 32 }
            : { left: (f.l - m.qr - 80) / 2, bottom: affiche ? m.marge : 220, width: m.qr + 80, padding: 40 }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- code QR en data URL */}
        <img src={qr} alt="" style={{ width: m.qr, height: m.qr }} />
        <span className="mt-5 text-center font-bold" style={{ fontSize: m.sous * 0.75 }}>
          Scannez pour donner votre avis
        </span>
        <span className="mt-1 text-center font-mono text-[#0B1F1D]/60" style={{ fontSize: m.sous * 0.5 }}>
          {adresse}
        </span>
      </div>

      {affiche && (
        <p className="absolute text-center text-white/55" style={{ left: m.marge, right: m.marge, bottom: m.marge * 0.5, fontSize: 20 }}>
          Avis publiés sur dentalmap.fr, sans contrepartie. Un avis par personne, positif ou non.
        </p>
      )}
    </div>
  )
}
