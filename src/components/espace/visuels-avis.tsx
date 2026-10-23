'use client'

import { useEffect, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { Download, Loader2, Printer, Share } from 'lucide-react'

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
  /** Les points de mise en avant gagnés par un avis. */
  points: number
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

/**
 * Les polices des visuels, embarquées une fois pour toutes : seulement les
 * @font-face de la police du site, fichiers en data URL. Sans elles,
 * html-to-image parcourt toutes les feuilles de style de la page (celle de la
 * carte comprise) à la première exportation, ce qui prend une minute.
 */
let polices: Promise<string> | null = null
function policesEmbarquees(): Promise<string> {
  polices ??= (async () => {
    const regles: CSSFontFaceRule[] = []
    for (const feuille of document.styleSheets) {
      try {
        for (const r of feuille.cssRules) if (r instanceof CSSFontFaceRule && /figtree/i.test(r.style.getPropertyValue('font-family'))) regles.push(r)
      } catch {
        // Feuille d'une autre origine : illisible, et sans la police du site.
      }
    }
    const blocs = await Promise.all(
      regles.map(async (r) => {
        const m = /url\(["']?([^"')]+)["']?\)/.exec(r.style.getPropertyValue('src'))
        if (!m) return ''
        const url = new URL(m[1]!, r.parentStyleSheet?.href ?? location.href).href
        const fichier = await fetch(url).then((x) => x.blob())
        const donnees = await new Promise<string>((ok) => {
          const lecteur = new FileReader()
          lecteur.onload = () => ok(String(lecteur.result))
          lecteur.readAsDataURL(fichier)
        })
        return r.cssText.replace(m[0], `url("${donnees}")`)
      }),
    )
    return blocs.join('\n')
  })()
  return polices
}

/** Le visuel à taille réelle ; exporté en PNG dès que tout est chargé. */
function Composition({ format, nom, faculte, qr, adresse, photo, points, onPret }: Props & { format: FormatAvis; onPret: (f: File) => void }) {
  const racine = useRef<HTMLDivElement>(null)
  const pret = useRef(onPret)
  useEffect(() => {
    pret.current = onPret
  })
  const f = FORMATS[format]
  const affiche = format === 'affiche'
  const story = format === 'story'
  const carre = format === 'carre'

  useEffect(() => {
    const noeud = racine.current
    if (!noeud) return
    let annule = false
    ;(async () => {
      await document.fonts.ready
      const images = [...noeud.querySelectorAll('img')].filter((i) => !i.complete)
      await Promise.race([Promise.all(images.map((i) => new Promise((ok) => (i.addEventListener('load', ok, { once: true }), i.addEventListener('error', ok, { once: true }))))), new Promise((ok) => setTimeout(ok, 4000))])
      const options = { width: f.l, height: f.h, pixelRatio: f.ratio, style: { transform: 'none' }, fontEmbedCSS: await policesEmbarquees() }
      // Safari dessine mal la première passe : une passe à blanc charge les ressources. Ailleurs, une seule suffit.
      if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await toBlob(noeud, options).catch(() => null)
      const blob = await toBlob(noeud, options)
      if (!annule && blob) pret.current(new File([blob], `dentalmap-avis-${format}.png`, { type: 'image/png' }))
    })().catch((e) => console.error('[visuel avis] export impossible', e))
    return () => {
      annule = true
    }
  }, [f, format])

  // Les mesures de chaque format.
  const m = affiche
    ? { photo: 620, marge: 96, titre: 118, sous: 40, qr: 280, logo: 56, sceau: 300 }
    : story
      ? { photo: 600, marge: 90, titre: 112, sous: 40, qr: 280, logo: 52, sceau: 280 }
      : { photo: 0, marge: 72, titre: 84, sous: 30, qr: 230, logo: 46, sceau: 220 }
  // Ce que vise l'étudiant, et qui recrute : l'alternance n'existe qu'en école de prothèse.
  const objectif = faculte ? 'votre stage ou votre job étudiant' : 'votre stage ou votre alternance'
  const recruteurs = faculte ? 'cabinets' : 'laboratoires'
  const etapes = ['Scannez', 'Donnez votre avis', 'Passez devant']

  return (
    <div ref={racine} className="relative overflow-hidden bg-[#0B1F1D] font-sans text-white" style={{ width: f.l, height: f.h }}>
      {photo && (
        <div className="absolute inset-x-0 top-0" style={{ height: m.photo || f.h }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- exporté par html-to-image, qui lit des balises simples */}
          <img src={photo} alt="" className="size-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: m.photo ? 'linear-gradient(180deg, rgba(11,31,29,0.6) 0%, rgba(11,31,29,0.2) 45%, #0B1F1D 100%)' : 'linear-gradient(90deg, #0B1F1D 0%, rgba(11,31,29,0.93) 58%, rgba(11,31,29,0.6) 100%)' }}
          />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 85% 30%, rgba(11,132,132,0.45), transparent 50%)' }} />

      <div className="absolute flex items-center justify-between" style={{ top: m.marge * 0.8, left: m.marge, right: m.marge }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- exporté par html-to-image */}
        <img src="/images/marque/logo-dentalmap-blanc.png" alt="DentalMap" style={{ height: m.logo, width: Math.round(m.logo * (442 / 96)) }} />
        <span className="max-w-[55%] truncate font-semibold text-white/85" style={{ fontSize: m.sous * 0.7 }}>
          {nom}
        </span>
      </div>

      <Sceau points={points} taille={m.sceau} style={carre ? { right: m.marge - 10, top: 150 } : { right: m.marge - 10, top: m.photo - m.sceau * (story ? 0.95 : 0.62) }} />

      <div className="absolute flex flex-col" style={{ left: m.marge, right: carre ? 440 : m.marge + (story ? 0 : 40), top: carre ? 200 : m.photo + (story ? 10 : 20) }}>
        <p className="font-mono tracking-[0.18em] text-[#BFE3D6]" style={{ fontSize: m.sous * 0.6 }}>
          VOUS Y AVEZ ÉTUDIÉ ?
        </p>
        <p className="mt-4 font-extrabold tracking-[-0.035em]" style={{ fontSize: m.titre, lineHeight: 0.98 }}>
          Votre avis vaut <span className="text-[#BFE3D6]">+{points}&nbsp;points.</span>
        </p>
        <p className="mt-6 text-white/85" style={{ fontSize: m.sous, lineHeight: 1.3 }}>
          Racontez {faculte ? 'votre faculté' : 'votre école'} en deux minutes : votre profil passe devant les {recruteurs} qui recrutent pour <b className="text-white">{objectif}</b>.
        </p>
        {!carre && (
          <ol className="mt-10 flex gap-4">
            {etapes.map((e, i) => (
              <li key={e} className="flex flex-1 items-center gap-3 rounded-[28px] bg-white/[0.08] px-5 py-4 font-semibold" style={{ fontSize: m.sous * 0.62 }}>
                <span className="grid shrink-0 place-items-center rounded-full bg-[#BFE3D6] font-extrabold text-[#0B1F1D]" style={{ width: m.sous * 1.1, height: m.sous * 1.1, fontSize: m.sous * 0.6 }}>
                  {i + 1}
                </span>
                {e}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div
        className="absolute flex items-center gap-8 rounded-[40px] bg-white text-[#0B1F1D]"
        style={carre ? { right: m.marge, bottom: m.marge, width: m.qr + 64, padding: 32, flexDirection: 'column', gap: 16 } : { left: m.marge, right: m.marge, bottom: affiche ? m.marge * 1.1 : 230, padding: 36 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- code QR en data URL */}
        <img src={qr} alt="" style={{ width: m.qr, height: m.qr }} />
        <div className={carre ? 'text-center' : ''}>
          <p className="font-extrabold tracking-[-0.02em]" style={{ fontSize: carre ? m.sous * 0.8 : m.sous * 1.2, lineHeight: 1.05 }}>
            {carre ? 'Scannez, c’est parti' : 'Scannez, c’est deux minutes'}
          </p>
          {!carre && (
            <p className="mt-3 text-[#0B1F1D]/70" style={{ fontSize: m.sous * 0.7 }}>
              Votre avis aide les futurs étudiants à choisir. Vos +{points} points vous attendent sur votre profil candidat DentalMap.
            </p>
          )}
          <p className="mt-3 font-mono text-[#0B8484]" style={{ fontSize: carre ? m.sous * 0.5 : m.sous * 0.6 }}>
            {adresse}
          </p>
        </div>
      </div>

      {affiche && (
        <p className="absolute text-center text-white/55" style={{ left: m.marge, right: m.marge, bottom: 40, fontSize: 19 }}>
          Les points sont les mêmes quelle que soit la note. Un avis par personne et par établissement, publié sur dentalmap.fr.
        </p>
      )}
    </div>
  )
}

/** Le sceau « +20 points », légèrement incliné, aux couleurs de la marque. */
function Sceau({ points, taille, style }: { points: number; taille: number; style: React.CSSProperties }) {
  const r = 50
  return (
    <svg width={taille} height={taille} viewBox="0 0 120 120" className="absolute" style={{ ...style, transform: 'rotate(-10deg)', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))' }} aria-hidden>
      <defs>
        <path id="sceau-avis" d={`M60,60 m-${r - 7},0 a${r - 7},${r - 7} 0 1,1 ${2 * (r - 7)},0 a${r - 7},${r - 7} 0 1,1 -${2 * (r - 7)},0`} />
      </defs>
      <circle cx="60" cy="60" r={r + 8} fill="#BFE3D6" />
      <circle cx="60" cy="60" r={r - 14} fill="#0B8484" />
      <text fill="#0B1F1D" fontSize="8.2" fontWeight="700" letterSpacing="1.6" fontFamily="inherit">
        <textPath href="#sceau-avis" textLength={2 * Math.PI * (r - 7) - 4} lengthAdjust="spacing">
          {'MISE EN AVANT · VOTRE AVIS · DENTALMAP · '}
        </textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="800" fontFamily="inherit">
        +{points}
      </text>
      <text x="60" y="80" textAnchor="middle" fill="#BFE3D6" fontSize="8" fontWeight="700" letterSpacing="1.5" fontFamily="inherit">
        POINTS
      </text>
    </svg>
  )
}
