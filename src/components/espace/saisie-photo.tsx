'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useFormStatus } from 'react-dom'
import { upload } from '@vercel/blob/client'
import { Check, CheckCircle2, Crop, ImagePlus, Move, Trash2, Upload, ZoomIn } from 'lucide-react'
import { EVENEMENT_PHOTO } from './carte-fixe'

/**
 * MIS-1 : la photo de profil, au format de la carte de résultat (portrait
 * 4:5, celui de l'aperçu public).
 *
 * Le praticien cadre lui-même : il glisse la photo dans le cadre 4:5 et
 * zoome. Le navigateur découpe ce cadre, le réduit à 1200 pixels de large et
 * le ré-encode en JPEG : les métadonnées (lieu, appareil) ne partent jamais.
 * La photo est ensuite téléversée en stockage public, et le formulaire
 * n'envoie que son adresse ; l'aperçu de la page la montre aussitôt.
 */
const LARGEUR = 1200

/** Une zone de l'image d'origine, en pixels : celle que le praticien a cadrée. */
type Zone = { x: number; y: number; l: number; h: number }

export async function recadrer(fichier: File, zone?: Zone): Promise<Blob> {
  const image = await createImageBitmap(fichier)
  const ratio = 4 / 5
  let sw = image.width
  let sh = sw / ratio
  if (sh > image.height) {
    sh = image.height
    sw = sh * ratio
  }
  // Sans cadrage choisi, le centre.
  let sx = (image.width - sw) / 2
  let sy = (image.height - sh) / 2
  if (zone) ({ x: sx, y: sy, l: sw, h: sh } = zone)
  const largeur = Math.min(LARGEUR, Math.round(sw))
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = Math.round(largeur / ratio)
  canvas.getContext('2d')!.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return new Promise((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('Encodage impossible'))), 'image/jpeg', 0.85))
}

export function SaisiePhoto({
  initiale,
  direct,
  droits = !!initiale,
}: {
  initiale: string | null
  direct: boolean
  /** La case des droits : cochée si la photo est déjà publiée, ou si elle l'était dans la saisie gardée. */
  droits?: boolean
}) {
  const entree = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(initiale ?? '')
  const [apercu, setApercu] = useState<string | null>(initiale)
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'erreur'>('repos')
  const [cadrage, setCadrage] = useState<{ fichier: File; src: string; l: number; h: number } | null>(null)

  // L'aperçu de la page suit la photo enregistrable : son adresse une fois téléversée, rien si retirée.
  const annoncer = (u: string | null) => window.dispatchEvent(new CustomEvent(EVENEMENT_PHOTO, { detail: u }))

  const choisir = async (f: File | undefined) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return setEtat('erreur')
    try {
      const image = await createImageBitmap(f)
      setCadrage({ fichier: f, src: URL.createObjectURL(f), l: image.width, h: image.height })
      setEtat('repos')
    } catch {
      setEtat('erreur')
    }
  }

  const envoyer = async (f: File, zone: Zone) => {
    setCadrage(null)
    setEtat('envoi')
    try {
      const jpeg = await recadrer(f, zone)
      setApercu(URL.createObjectURL(jpeg))
      if (direct) {
        const blob = await upload(`cabinets/photo.jpg`, jpeg, { access: 'public', handleUploadUrl: '/api/espace-pro/photo/televerser/', contentType: 'image/jpeg' })
        setUrl(blob.url)
        annoncer(blob.url)
      } else {
        const corps = new FormData()
        corps.set('photo', new File([jpeg], 'photo.jpg', { type: 'image/jpeg' }))
        const r = await fetch('/api/espace-pro/photo/local/', { method: 'POST', body: corps })
        if (!r.ok) throw new Error()
        const u = ((await r.json()) as { url: string }).url
        setUrl(u)
        annoncer(u)
      }
      setEtat('repos')
    } catch {
      setEtat('erreur')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <input type="hidden" name="photo" value={url} />
      <div>
        <div className="squircle-2xl relative aspect-[4/5] w-full max-w-[19.25rem] overflow-hidden border border-line bg-bg-soft">
          {cadrage ? (
            <Cadreur cadrage={cadrage} annuler={() => setCadrage(null)} valider={(zone) => envoyer(cadrage.fichier, zone)} />
          ) : apercu ? (
            <>
              <Image src={apercu} alt="Photo de profil" fill sizes="50vw" className="object-cover" unoptimized={apercu.startsWith('blob:')} />
              <span className="squircle-full absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/60 px-3 py-1 text-xs text-white">
                <Crop className="size-3.5" aria-hidden /> Format portrait de la fiche
              </span>
            </>
          ) : (
            <button type="button" onClick={() => entree.current?.click()} className="grid size-full cursor-pointer place-items-center text-center text-sm text-fg-2 hover:text-fg">
              <span>
                <ImagePlus className="mx-auto size-7" aria-hidden />
                <span className="mt-2 block font-medium">Choisir une photo</span>
                <span className="text-xs">JPG, PNG ou HEIC, au format portrait</span>
              </span>
            </button>
          )}
        </div>
        <input ref={entree} type="file" accept="image/*" className="sr-only" onChange={(e) => choisir(e.target.files?.[0])} aria-label="Photo de profil" />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button type="button" onClick={() => entree.current?.click()} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 font-medium text-fg hover:border-line-strong">
            <Upload className="size-4" aria-hidden /> {apercu ? 'Remplacer' : 'Choisir'}
          </button>
          {apercu && !cadrage && (
            <button
              type="button"
              onClick={() => {
                setUrl('')
                setApercu(null)
                annoncer(null)
              }}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/30 px-4 text-destructive hover:border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="size-4" aria-hidden /> Retirer
            </button>
          )}
          {etat === 'envoi' && <span className="text-fg-2">Préparation…</span>}
          {etat === 'erreur' && <span className="text-destructive">La photo n’a pas pu être préparée. Essayez un autre fichier.</span>}
        </div>
      </div>
      <div className="space-y-4 text-sm">
        <p className="font-semibold text-fg">Ce qui fonctionne</p>
        <ul className="space-y-2 text-fg-2">
          {['Vous, de face, le visage dégagé', 'De la lumière naturelle', 'Un fond sobre ou votre cabinet', 'Pas de texte ni de logo ajouté'].map((c) => (
            <li key={c} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {c}
            </li>
          ))}
        </ul>
        <label className="squircle-xl flex cursor-pointer items-start gap-3 bg-bg-soft p-3 text-fg-2">
          <input type="checkbox" name="droits" defaultChecked={droits} className="mt-0.5 size-4 accent-teal" />
          Je détiens les droits de cette photo.
        </label>
        <Bloque envoi={etat === 'envoi'} />
      </div>
    </div>
  )
}

/**
 * Le cadrage : la photo couvre le cadre 4:5, on la glisse à la souris ou au
 * doigt, on zoome au curseur. Elle ne laisse jamais de vide dans le cadre.
 */
function Cadreur({ cadrage, annuler, valider }: { cadrage: { src: string; l: number; h: number }; annuler: () => void; valider: (zone: Zone) => void }) {
  const cadre = useRef<HTMLDivElement>(null)
  const [largeur, setLargeur] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [decalage, setDecalage] = useState<{ x: number; y: number } | null>(null)
  const prise = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null)
  useEffect(() => {
    const el = cadre.current
    if (!el) return
    const mesurer = () => setLargeur(el.clientWidth)
    mesurer()
    const suivi = new ResizeObserver(mesurer)
    suivi.observe(el)
    return () => suivi.disconnect()
  }, [])
  const L = largeur
  const H = (largeur * 5) / 4
  // L'échelle qui couvre le cadre, multipliée par le zoom.
  const echelle = L ? Math.max(L / cadrage.l, H / cadrage.h) * zoom : 0
  const dl = cadrage.l * echelle
  const dh = cadrage.h * echelle
  const borner = (x: number, y: number) => ({ x: Math.min(0, Math.max(L - dl, x)), y: Math.min(0, Math.max(H - dh, y)) })
  // Centré à l'arrivée, puis gardé dans le cadre à chaque zoom.
  const pos = borner(decalage?.x ?? (L - dl) / 2, decalage?.y ?? (H - dh) / 2)
  return (
    <div ref={cadre} className="absolute inset-0 select-none">
      {L > 0 && (
        // eslint-disable-next-line @next/next/no-img-element -- image locale du navigateur (blob), hors de l'optimisation de Next
        <img
          src={cadrage.src}
          alt="Photo à cadrer"
          draggable={false}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            prise.current = { x: e.clientX, y: e.clientY, dx: pos.x, dy: pos.y }
          }}
          onPointerMove={(e) => {
            if (!prise.current) return
            setDecalage(borner(prise.current.dx + e.clientX - prise.current.x, prise.current.dy + e.clientY - prise.current.y))
          }}
          onPointerUp={() => (prise.current = null)}
          className="absolute max-w-none cursor-grab touch-none active:cursor-grabbing"
          style={{ width: dl, height: dh, left: pos.x, top: pos.y }}
        />
      )}
      <span className="squircle-full pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 bg-black/60 px-3 py-1 text-xs text-white">
        <Move className="size-3.5" aria-hidden /> Glissez pour cadrer
      </span>
      <div className="absolute inset-x-3 bottom-3 space-y-2 rounded-xl bg-black/60 p-2.5 text-white backdrop-blur">
        <label className="flex items-center gap-2 text-xs">
          <ZoomIn className="size-3.5 shrink-0" aria-hidden />
          <span className="sr-only">Zoom</span>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-white" />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => valider({ x: -pos.x / echelle, y: -pos.y / echelle, l: L / echelle, h: H / echelle })}
            className="inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white text-xs font-semibold text-[#0e1317] hover:bg-[#BFE3D6]"
          >
            <Check className="size-3.5" aria-hidden /> Valider le cadrage
          </button>
          <button type="button" onClick={annuler} className="inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs text-white/80 hover:text-white">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

/** Désactive l'envoi tant que la photo se prépare. */
function Bloque({ envoi }: { envoi: boolean }) {
  const { pending } = useFormStatus()
  if (!envoi && !pending) return null
  return <p className="text-xs text-fg-2">{pending ? 'Enregistrement…' : 'Patientez, la photo se prépare.'}</p>
}

