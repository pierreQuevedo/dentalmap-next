'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { upload } from '@vercel/blob/client'
import { ArrowLeft, ArrowRight, Check, Eye, GripVertical, ImagePlus, Maximize2, Trash2 } from 'lucide-react'
import { Galerie } from '@/components/formation/galerie-etablissement'
import { MATERIAUX, REALISATIONS_MAX, libelleDe, libellePiece } from '@/lib/espace-pro/labo'

/**
 * Les réalisations d'un laboratoire : une à huit photos de pièces, chacune
 * recadrée (4:3), réduite et ré-encodée dans le navigateur (métadonnées
 * retirées), puis téléversée en stockage public. Une légende par photo ;
 * la première est la grande. Le formulaire reçoit la liste en JSON. Pour un
 * laboratoire (`choix`), chaque photo dit aussi sa pièce et son matériau,
 * pris dans ses délais et son savoir-faire.
 */
type Photo = { url: string; legende: string; piece?: string; materiau?: string; apercu?: string }

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
  apercu,
  choix,
  conseils,
}: {
  initiales: { url: string; legende: string; piece?: string; materiau?: string }[]
  direct: boolean
  /** Nombre de photos au plus : huit réalisations, vingt-quatre pour la galerie d'un établissement. */
  max?: number
  /** Nom du champ caché qui porte la liste. */
  nom?: string
  mot?: string
  mention?: string
  /** Sous les photos, une fois la première ajoutée : crédit, droits, enregistrement. */
  apres?: React.ReactNode
  /** L'aperçu de la page publique d'un établissement : le haut de page et la mosaïque, à jour à chaque geste. */
  apercu?: { titre: string; type: string; credit: string | null }
  /** Laboratoire : les pièces et matériaux proposés sous chaque photo (codes). */
  choix?: { pieces: string[]; materiaux: string[] }
  /** Sans photo, ce qu'il vaut la peine de montrer. */
  conseils?: string[]
}) {
  const entree = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>(initiales)
  const [envoi, setEnvoi] = useState(0)
  const [erreur, setErreur] = useState(false)
  const [glisse, setGlisse] = useState<number | null>(null)

  /** Déplacer une photo : l'ordre est celui de la page, la première est la grande. */
  const deplacer = (de: number, vers: number) => {
    if (vers < 0 || vers >= photos.length || de === vers) return
    setPhotos((x) => {
      const y = [...x]
      const [p] = y.splice(de, 1)
      y.splice(vers, 0, p)
      return y
    })
  }

  const ajouter = async (fichiers: FileList | null) => {
    if (!fichiers) return
    setErreur(false)
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
      <input type="hidden" name={nom} value={JSON.stringify(photos.map(({ url, legende, piece, materiau }) => ({ url, legende, piece, materiau })))} />
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
      {photos.length === 0 && conseils && (
        <div className="squircle-2xl mt-3 border border-line bg-bg-soft p-4">
          <p className="text-sm font-semibold text-fg">Ce que les cabinets aiment voir</p>
          <ul className="mt-2 space-y-1.5">
            {conseils.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-fg-2">
                <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ol className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${photos.length === 0 ? 'hidden' : ''}`}>
        {photos.map((p, i) => (
          <li
            key={p.url}
            draggable
            onDragStart={() => setGlisse(i)}
            onDragEnd={() => setGlisse(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (glisse !== null) deplacer(glisse, i)
              else ajouter(e.dataTransfer.files)
              setGlisse(null)
            }}
            className={`squircle-xl overflow-hidden border bg-bg ${glisse === i ? 'border-teal opacity-60' : 'border-line'}`}
          >
            <div className="relative aspect-[4/3] cursor-grab bg-bg-soft active:cursor-grabbing">
              <Image src={p.apercu ?? p.url} alt={p.legende || `${mot} ${i + 1}`} fill sizes="20vw" className="object-cover" unoptimized={!!p.apercu} />
              {i === 0 && <span className="squircle-full absolute left-2 top-2 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#0e1317]">Grande photo</span>}
              <button type="button" onClick={() => setPhotos((x) => x.filter((_, k) => k !== i))} aria-label={`Retirer la ${mot} ${i + 1}`} className="absolute right-2 top-2 grid size-7 cursor-pointer place-items-center rounded-full bg-black/55 text-white hover:bg-black/70">
                <Trash2 className="size-3.5" aria-hidden />
              </button>
              <span className="pointer-events-none absolute bottom-2 left-2 grid size-7 place-items-center rounded-full bg-black/55 text-white" aria-hidden>
                <GripVertical className="size-3.5" />
              </span>
              <span className="absolute bottom-2 right-2 flex gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => deplacer(i, 0)} aria-label={`Faire de la ${mot} ${i + 1} la grande photo`} title="Grande photo" className="grid size-7 cursor-pointer place-items-center rounded-full bg-black/55 text-white hover:bg-black/70">
                    <Maximize2 className="size-3.5" aria-hidden />
                  </button>
                )}
                <button type="button" disabled={i === 0} onClick={() => deplacer(i, i - 1)} aria-label={`Avancer la ${mot} ${i + 1}`} className="grid size-7 cursor-pointer place-items-center rounded-full bg-black/55 text-white hover:bg-black/70 disabled:hidden">
                  <ArrowLeft className="size-3.5" aria-hidden />
                </button>
                <button type="button" disabled={i === photos.length - 1} onClick={() => deplacer(i, i + 1)} aria-label={`Reculer la ${mot} ${i + 1}`} className="grid size-7 cursor-pointer place-items-center rounded-full bg-black/55 text-white hover:bg-black/70 disabled:hidden">
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              </span>
            </div>
            {choix && (
              <div className="grid grid-cols-2 gap-1.5 px-2.5 pt-2.5">
                {(
                  [
                    ['piece', 'Pièce', choix.pieces.map((c) => [c, libellePiece(c)])],
                    ['materiau', 'Matériau', choix.materiaux.map((c) => [c, libelleDe(MATERIAUX, c)])],
                  ] as const
                ).map(([cle, libelle, options]) => (
                  <select
                    key={cle}
                    value={p[cle] ?? ''}
                    onChange={(e) => setPhotos((x) => x.map((q, k) => (k === i ? { ...q, [cle]: e.target.value || undefined } : q)))}
                    aria-label={`${libelle} de la ${mot} ${i + 1}`}
                    className={`squircle-lg h-8 min-w-0 cursor-pointer border border-line bg-bg px-2 text-xs outline-none focus:border-line-strong ${p[cle] ? 'text-fg' : 'text-fg-2'}`}
                  >
                    <option value="">{libelle}</option>
                    {options.map(([c, l]) => (
                      <option key={c} value={c}>
                        {l}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
            <input
              value={p.legende}
              onChange={(e) => setPhotos((x) => x.map((q, k) => (k === i ? { ...q, legende: e.target.value } : q)))}
              placeholder={choix ? 'Précision, facultative' : 'Ajouter une légende'}
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
      {apercu && photos.length > 0 && (
        <section className="squircle-2xl mt-6 border border-line p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Eye className="size-4 text-fg-2" aria-hidden /> Sur la page
          </p>
          <p className="mt-1 text-xs text-fg-2">Ce que les candidats verront, dans cet ordre. Glissez les photos, ou utilisez les flèches, pour le changer.</p>
          {/* Le haut de la page : la grande photo à côté du nom. */}
          <div className="squircle-2xl mt-4 grid items-center gap-5 bg-[#0e1317] p-5 text-white sm:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="min-w-0">
              <span className="squircle-full inline-flex border border-white/15 px-2.5 py-0.5 text-[11px]">{apercu.type}</span>
              <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{apercu.titre}</p>
              <p className="mt-2 text-xs text-white/60">Haut de la page</p>
            </div>
            <div className="squircle-2xl relative aspect-[4/3] overflow-hidden border border-white/10">
              <Image src={photos[0].apercu ?? photos[0].url} alt={photos[0].legende} fill sizes="16rem" className="object-cover" unoptimized={!!photos[0].apercu} />
              {apercu.credit && <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">{apercu.credit}</span>}
            </div>
          </div>
          <p className="mb-2 mt-5 text-xs text-fg-2">Galerie de la page</p>
          <Galerie
            photos={photos.map((p) => ({ url: p.apercu ?? p.url, legende: p.legende, local: !!p.apercu }))}
            credit={apercu.credit}
            source={`Photos publiées par l’établissement, ${photos.length} au total.`}
          />
        </section>
      )}
      {apres && photos.length > 0 && <div className="mt-4">{apres}</div>}
    </div>
  )
}
