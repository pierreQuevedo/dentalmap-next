import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { IMAGE_PARTAGE_ALT } from '@/lib/seo/site'

/**
 * Image de partage par défaut (LinkedIn, Facebook, WhatsApp, X).
 *
 * Placée à la racine, elle vaut pour toutes les pages qui n'en déclarent pas
 * une à elles. Celles qui définissent leur propre `openGraph` la reprennent
 * par `IMAGE_PARTAGE`.
 */
export const alt = IMAGE_PARTAGE_ALT
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Les sources vectorielles de l'identité : nettes à toute taille.
  const marque = (fichier: string) => readFile(join(process.cwd(), 'public/images/marque', fichier), 'base64')
  const [pictogramme, texte] = await Promise.all([marque('pictogramme-dentalmap.svg'), marque('logo-dentalmap-texte-blanc.svg')])
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          // Un cran plus sombre que le vert du pictogramme, pour que son carré se détache.
          background: '#0b2f2c',
          color: '#ffffff',
        }}
      >
        {/* Pictogramme 512 × 512 et logotype 395 × 78, à la même hauteur visuelle. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <img src={`data:image/svg+xml;base64,${pictogramme}`} width={136} height={136} alt="" />
          <img src={`data:image/svg+xml;base64,${texte}`} width={466} height={92} alt="" />
        </div>
        <div style={{ marginTop: 56, fontSize: 52, fontWeight: 600, lineHeight: 1.2, maxWidth: 960 }}>
          L’annuaire dentaire vérifié auprès des registres officiels
        </div>
        <div style={{ marginTop: 24, fontSize: 30, opacity: 0.8 }}>
          Dentistes, spécialistes, laboratoires, emploi et formation
        </div>
      </div>
    ),
    size,
  )
}
