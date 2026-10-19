'use client'

import { useEffect, useRef, useState } from 'react'
import { FondCarte } from '@/components/espace/fond-carte'
import { VisuelPartage, cadrageVisuel, tailleVisuel, type Format, type Message } from '@/components/espace/partage-reseaux'
import type { CarteAMontrer } from '@/components/espace/progression'
import { PALIERS } from '@/lib/espace-pro/progression'

const LIEN = 'https://dentalmap.fr/p/dr-test-dentalmap-0004/'

/** Le plan d'un format, rendu une fois hors écran puis capturé : chaque visuel le reprend sans ouvrir sa propre carte. */
function CapturePlan({ format, lon, lat, onCapture }: { format: Format; lon: number | null; lat: number | null; onCapture: (url: string) => void }) {
  const cadre = useRef<HTMLDivElement>(null)
  const { l, h } = tailleVisuel(format)
  return (
    <div ref={cadre} aria-hidden style={{ position: 'fixed', left: -20000, top: 0, width: l, height: h }}>
      <FondCarte
        {...cadrageVisuel(format)}
        lon={lon}
        lat={lat}
        largeur={l}
        hauteur={h}
        exporter
        voile={false}
        onPret={() => {
          const canvas = cadre.current?.querySelector('canvas')
          if (canvas) onCapture(canvas.toDataURL('image/jpeg', 0.9))
        }}
      />
    </div>
  )
}

/** Un visuel réduit à la largeur voulue. */
function Reduit({ largeur, legende, ...props }: Parameters<typeof VisuelPartage>[0] & { largeur: number; legende: string }) {
  const { l, h } = tailleVisuel(props.format)
  const echelle = largeur / l
  return (
    <figure className="space-y-2">
      <div className="squircle-xl relative overflow-hidden shadow-pop ring-1 ring-line" style={{ width: largeur, height: h * echelle }}>
        <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${echelle})` }}>
          <VisuelPartage {...props} />
        </div>
      </div>
      <figcaption className="text-center text-xs text-fg-2">{legende}</figcaption>
    </figure>
  )
}

/**
 * Tous les visuels de partage, palier par palier : story et publication, avec
 * le message « Ma fiche » et, dès le palier 2, « Mon palier ». La carte de
 * résultat de chaque visuel porte l'habillage de son palier.
 */
export function ComparaisonVisuels({ carte }: { carte: CarteAMontrer }) {
  const [fonds, setFonds] = useState<Partial<Record<Format, string>>>({})
  const [photo, setPhoto] = useState('/uploads/cabinets/f8d734b2-c5e4-47f5-a0f6-88c2712b1ac4.jpg')
  const [labo, setLabo] = useState(false)
  const [visibles, setVisibles] = useState(false)
  // Les visuels ne se montent qu'une fois la section approchée : vingt compositions d'un coup ralentiraient la page.
  const section = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVisibles(true), { rootMargin: '600px' })
    if (section.current) o.observe(section.current)
    return () => o.disconnect()
  }, [])

  const base = { praticien: carte.praticien, profession: carte.profession, photo: photo.trim() || null, liens: { affiche: LIEN, qr: `${LIEN}q/`, story: `${LIEN}st/` }, labo }
  return (
    <div ref={section}>
      <div className="flex flex-wrap items-center gap-4 text-sm text-fg-2">
        <label className="flex items-center gap-2">
          Photo
          <input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="Vide : l’illustration" className="w-96 rounded-full border border-line bg-bg px-3 py-1.5 text-xs text-fg" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={labo} onChange={(e) => setLabo(e.target.checked)} className="accent-teal" /> Textes laboratoire
        </label>
      </div>
      {visibles && (
        <>
          {(['story', 'carre'] as const).map((f) => !fonds[f] && <CapturePlan key={f} format={f} lon={carte.praticien.lon} lat={carte.praticien.lat} onCapture={(url) => setFonds((x) => ({ ...x, [f]: url }))} />)}
          {fonds.story && fonds.carre ? (
            <div className="mt-6 space-y-10">
              {PALIERS.map((p) => (
                <div key={p.niveau}>
                  <p className="font-semibold text-fg">
                    Palier {p.niveau} · {p.nom}
                  </p>
                  <div className="mt-3 flex flex-wrap items-end gap-5">
                    {(['fiche', 'palier'] as Message[])
                      .filter((m) => m === 'fiche' || p.niveau >= 2)
                      .flatMap((m) =>
                        (['story', 'carre'] as const).map((f) => (
                          <Reduit
                            key={`${m}-${f}`}
                            {...base}
                            format={f}
                            message={m}
                            palier={{ niveau: p.niveau, nom: p.nom }}
                            fond={fonds[f]}
                            largeur={f === 'story' ? 250 : 340}
                            legende={`${m === 'fiche' ? 'Ma fiche' : 'Mon palier'} · ${f === 'story' ? 'Story' : 'Publication'}`}
                          />
                        )),
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-fg-2">Préparation du plan…</p>
          )}
        </>
      )}
    </div>
  )
}
