'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useFormStatus } from 'react-dom'
import { upload } from '@vercel/blob/client'
import { CheckCircle2, Crop, ImagePlus, Trash2, Upload } from 'lucide-react'

/**
 * MIS-1 : la photo de profil, au format de la carte de résultat (portrait
 * 4:5, celui de l'aperçu public).
 *
 * Le navigateur recadre l'image au centre en 4:5, la réduit à 1200 pixels de
 * large et la ré-encode en JPEG : les métadonnées (lieu, appareil) ne partent
 * jamais. Elle est ensuite téléversée en stockage public, et le formulaire
 * n'envoie que son adresse.
 */
const LARGEUR = 1200

async function recadrer(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier)
  const ratio = 4 / 5
  let sw = image.width
  let sh = sw / ratio
  if (sh > image.height) {
    sh = image.height
    sw = sh * ratio
  }
  const sx = (image.width - sw) / 2
  const sy = (image.height - sh) / 2
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

  const choisir = async (f: File | undefined) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return setEtat('erreur')
    setEtat('envoi')
    try {
      const jpeg = await recadrer(f)
      setApercu(URL.createObjectURL(jpeg))
      if (direct) {
        const blob = await upload(`cabinets/photo.jpg`, jpeg, { access: 'public', handleUploadUrl: '/api/espace-pro/photo/televerser/', contentType: 'image/jpeg' })
        setUrl(blob.url)
      } else {
        const corps = new FormData()
        corps.set('photo', new File([jpeg], 'photo.jpg', { type: 'image/jpeg' }))
        const r = await fetch('/api/espace-pro/photo/local/', { method: 'POST', body: corps })
        if (!r.ok) throw new Error()
        setUrl(((await r.json()) as { url: string }).url)
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
          {apercu ? (
            <>
              <Image src={apercu} alt="Photo de profil" fill sizes="50vw" className="object-cover" unoptimized={apercu.startsWith('blob:')} />
              <span className="squircle-full absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/60 px-3 py-1 text-xs text-white">
                <Crop className="size-3.5" aria-hidden /> Cadrage portrait au centre
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
          {apercu && (
            <button
              type="button"
              onClick={() => {
                setUrl('')
                setApercu(null)
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

/** Désactive l'envoi tant que la photo se prépare. */
function Bloque({ envoi }: { envoi: boolean }) {
  const { pending } = useFormStatus()
  if (!envoi && !pending) return null
  return <p className="text-xs text-fg-2">{pending ? 'Enregistrement…' : 'Patientez, la photo se prépare.'}</p>
}

