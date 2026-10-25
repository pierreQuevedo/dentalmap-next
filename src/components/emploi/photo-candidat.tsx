'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { upload } from '@vercel/blob/client'
import { RotateCcw, Trash2, Upload } from 'lucide-react'
import { recadrer } from '@/components/espace/saisie-photo'

/**
 * La photo du profil candidat : par défaut celle de la fiche du compte, ou une
 * autre, propre au profil. Recadrée en portrait et ré-encodée par le
 * navigateur (sans métadonnées), comme la photo de la fiche. Le formulaire
 * envoie `photoSource` (« compte » ou « perso ») et l'adresse de la photo.
 */
export function PhotoCandidat({ compte, perso, initiales, direct }: { compte: string | null; perso: string | null; initiales: string; direct: boolean }) {
  const entree = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(perso ?? '')
  const [apercu, setApercu] = useState<string | null>(perso)
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'erreur'>('repos')
  const affichee = apercu ?? compte

  const choisir = async (f: File | undefined) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return setEtat('erreur')
    setEtat('envoi')
    try {
      const jpeg = await recadrer(f)
      setApercu(URL.createObjectURL(jpeg))
      if (direct) {
        const blob = await upload('candidats/photo.jpg', jpeg, { access: 'public', handleUploadUrl: '/api/espace-pro/photo/televerser/', contentType: 'image/jpeg' })
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
      setApercu(perso)
      setEtat('erreur')
    }
  }

  const revenir = () => {
    setUrl('')
    setApercu(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input type="hidden" name="photoSource" value={url ? 'perso' : 'compte'} />
      <input type="hidden" name="photo" value={url} />
      <span className="squircle-xl relative grid size-20 shrink-0 place-items-center overflow-hidden bg-bg-soft text-lg font-bold text-fg ring-1 ring-line">
        {affichee ? <Image src={affichee} alt="Photo de votre profil" fill sizes="80px" className="object-cover" unoptimized={affichee.startsWith('blob:')} /> : initiales}
      </span>
      <div className="min-w-0 space-y-2">
        <p className="text-xs text-fg-2">
          {url ? 'Photo propre à votre profil emploi.' : compte ? 'La photo de profil de votre fiche.' : 'Pas encore de photo.'} Elle n’apparaît qu’aux recruteurs des offres auxquelles vous postulez.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button type="button" onClick={() => entree.current?.click()} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 font-medium text-fg hover:border-line-strong">
            <Upload className="size-4" aria-hidden /> {affichee ? 'Changer la photo' : 'Ajouter une photo'}
          </button>
          {url && (
            <button type="button" onClick={revenir} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 font-medium text-fg hover:border-line-strong">
              {compte ? <RotateCcw className="size-4" aria-hidden /> : <Trash2 className="size-4" aria-hidden />} {compte ? 'Reprendre la photo de ma fiche' : 'Retirer'}
            </button>
          )}
          {etat === 'envoi' && <span className="text-fg-2">Préparation…</span>}
          {etat === 'erreur' && <span className="text-destructive">La photo n’a pas pu être préparée. Essayez un autre fichier.</span>}
        </div>
      </div>
      <input ref={entree} type="file" accept="image/*" className="sr-only" onChange={(e) => choisir(e.target.files?.[0])} aria-label="Photo de votre profil" />
    </div>
  )
}
