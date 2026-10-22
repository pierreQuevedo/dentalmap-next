'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { upload } from '@vercel/blob/client'
import { ImagePlus, Trash2 } from 'lucide-react'
import { REALISATIONS_MAX } from '@/lib/espace-pro/labo'

/**
 * Les réalisations d'un laboratoire : une à huit photos de pièces, chacune
 * recadrée (4:3), réduite et ré-encodée dans le navigateur (métadonnées
 * retirées), puis téléversée en stockage public. Une légende par photo ;
 * la première est la grande. Le formulaire reçoit la liste en JSON.
 */
type Photo = { url: string; legende: string; apercu?: string }

async function preparer(fichier: File): Promise<Blob> {
  const image = await createImageBitmap(fichier)
  const ratio = 4 / 3
  let sw = image.width
  let sh = sw / ratio
  if (sh > image.height) {
    sh = image.height
    sw = sh * ratio
  }
  const largeur = Math.min(1400, Math.round(sw))
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = Math.round(largeur / ratio)
  canvas.getContext('2d')!.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height)
  return new Promise((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('Encodage impossible'))), 'image/jpeg', 0.85))
}

export function SaisieRealisations({
  initiales,
  direct,
  max = REALISATIONS_MAX,
  nom = 'realisations',
  mot = 'réalisation',
  mention = 'La première est la grande photo de la fiche. Aucun patient reconnaissable.',
  apres,
}: {
  initiales: { url: string; legende: string }[]
  direct: boolean
  /** Nombre de photos au plus : huit réalisations, vingt-quatre pour la galerie d'un établissement. */
  max?: number
  /** Nom du champ caché qui porte la liste. */
  nom?: string
  mot?: string
  mention?: string
  /** Sous les photos, une fois la première ajoutée : crédit, droits, enregistrement. */
  apres?: React.ReactNode
}) {
  const entree = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>(initiales)
  const [envoi, setEnvoi] = useState(0)
  const [erreur, setErreur] = useState(false)

  const ajouter = async (fichiers: FileList | null) => {
    if (!fichiers) return
    const place = max - photos.length
    for (const f of [...fichiers].slice(0, place)) {
      if (!f.type.startsWith('image/')) continue
      setEnvoi((n) => n + 1)
      try {
        const jpeg = await preparer(f)
        let url: string
        if (direct) {
          url = (await upload('cabinets/realisation.jpg', jpeg, { access: 'public', handleUploadUrl: '/api/espace-pro/photo/televerser/', contentType: 'image/jpeg' })).url
        } else {
          const corps = new FormData()
          corps.set('photo', new File([jpeg], 'realisation.jpg', { type: 'image/jpeg' }))
          const r = await fetch('/api/espace-pro/photo/local/', { method: 'POST', body: corps })
          if (!r.ok) throw new Error()
          url = ((await r.json()) as { url: string }).url
        }
        setPhotos((p) => [...p, { url, legende: '', apercu: URL.createObjectURL(jpeg) }].slice(0, max))
      } catch {
        setErreur(true)
      } finally {
        setEnvoi((n) => n - 1)
      }
    }
  }

  const deposer = (e: React.DragEvent) => {
    e.preventDefault()
    ajouter(e.dataTransfer.files)
  }

  return (
    <div>
      <input type="hidden" name={nom} value={JSON.stringify(photos.map(({ url, legende }) => ({ url, legende })))} />
      {photos.length === 0 && (
        // Sans photo, une grande zone de dépôt sur toute la largeur.
        <button
          type="button"
          onClick={() => entree.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={deposer}
          className="squircle-2xl grid h-56 w-full cursor-pointer place-items-center border-2 border-dashed border-line text-center text-sm text-fg-2 hover:border-line-strong hover:text-fg"
        >
          <span>
            <ImagePlus className="mx-auto size-8" aria-hidden />
            <span className="mt-3 block text-base font-medium text-fg">{envoi ? 'Préparation…' : 'Glissez vos photos ici ou choisissez-les'}</span>
            <span className="mt-1 block text-xs">JPEG, PNG ou HEIC · {max} au plus</span>
          </span>
        </button>
      )}
      <ol className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${photos.length === 0 ? 'hidden' : ''}`}>
        {photos.map((p, i) => (
          <li key={p.url} className="squircle-xl overflow-hidden border border-line bg-bg">
            <div className="relative aspect-[4/3] bg-bg-soft">
              <Image src={p.apercu ?? p.url} alt={p.legende || `${mot} ${i + 1}`} fill sizes="20vw" className="object-cover" unoptimized={!!p.apercu} />
              {i === 0 && <span className="squircle-full absolute left-2 top-2 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#0e1317]">Grande photo</span>}
              <button type="button" onClick={() => setPhotos((x) => x.filter((_, k) => k !== i))} aria-label={`Retirer la ${mot} ${i + 1}`} className="absolute right-2 top-2 grid size-7 cursor-pointer place-items-center rounded-full bg-black/55 text-white hover:bg-black/70">
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
            <input
              value={p.legende}
              onChange={(e) => setPhotos((x) => x.map((q, k) => (k === i ? { ...q, legende: e.target.value } : q)))}
              placeholder="Ajouter une légende"
              aria-label={`Légende de la ${mot} ${i + 1}`}
              maxLength={120}
              className="w-full bg-transparent p-2.5 text-xs text-fg outline-none placeholder:text-amber-700"
            />
          </li>
        ))}
        {photos.length < max && (
          <li>
            <button type="button" onClick={() => entree.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={deposer} className="squircle-xl grid aspect-[4/3] w-full cursor-pointer place-items-center border-2 border-dashed border-line text-center text-sm text-fg-2 hover:border-line-strong hover:text-fg">
              <span>
                <ImagePlus className="mx-auto size-6" aria-hidden />
                <span className="mt-2 block">{envoi ? 'Préparation…' : 'Ajouter des photos'}</span>
                <span className="text-xs">
                  {photos.length} sur {max}
                </span>
              </span>
            </button>
          </li>
        )}
      </ol>
      <input ref={entree} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => ajouter(e.target.files)} aria-label="Ajouter des photos" />
      {erreur && <p className="mt-2 text-sm text-destructive">Une photo n’a pas pu être préparée. Essayez un autre fichier.</p>}
      <p className="mt-3 text-xs text-fg-2">{mention}</p>
      {apres && photos.length > 0 && <div className="mt-4">{apres}</div>}
    </div>
  )
}
