/**
 * Télécharge une photo par grande ville depuis Wikipédia, avec ses crédits.
 *
 * Pour chaque ville, on lit l'image principale de l'article français, on la
 * redemande en 1200 px de large, on l'enregistre dans `public/images/villes/`
 * et on note l'auteur et la licence dans `CREDITS.md` : ce sont des images
 * Wikimedia Commons, libres mais presque toujours sous attribution.
 *
 * Le script écrit aussi `src/lib/annuaire/images-villes.json`, la liste des
 * villes qui ont une image. Les cartes de l'accueil s'y réfèrent : une ville
 * absente garde l'illustration par défaut du block, rien ne casse.
 *
 *   pnpm tsx scripts/design/images-villes.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const VILLES: { slug: string; article: string }[] = [
  { slug: 'paris', article: 'Paris' },
  { slug: 'marseille', article: 'Marseille' },
  { slug: 'lyon', article: 'Lyon' },
  { slug: 'toulouse', article: 'Toulouse' },
  { slug: 'nice', article: 'Nice' },
  { slug: 'nantes', article: 'Nantes' },
  { slug: 'montpellier', article: 'Montpellier' },
  { slug: 'strasbourg', article: 'Strasbourg' },
  { slug: 'bordeaux', article: 'Bordeaux' },
  { slug: 'lille', article: 'Lille' },
  { slug: 'rennes', article: 'Rennes' },
  { slug: 'toulon', article: 'Toulon' },
  { slug: 'meaux', article: 'Meaux' },
]

const LARGEUR = 960
const DOSSIER = join(process.cwd(), 'public', 'images', 'villes')
const MANIFESTE = join(process.cwd(), 'src', 'lib', 'annuaire', 'images-villes.json')
// Wikimedia exige un User-Agent identifiable.
const ENTETES = { 'user-agent': 'DentalMap/2.0 (https://dentalmap.fr; contact@dentalmap.fr)', accept: 'application/json' }

type Resume = {
  originalimage?: { source: string; width: number }
  thumbnail?: { source: string }
}

type MetaCommons = {
  query?: { pages?: Record<string, { imageinfo?: { thumburl?: string; extmetadata?: Record<string, { value: string }> }[] }> }
}

function sansBalises(html: string | undefined): string {
  return (html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

async function traiter(v: (typeof VILLES)[number]) {
  const res = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(v.article)}`, { headers: ENTETES })
  if (!res.ok) throw new Error(`résumé Wikipédia ${res.status}`)
  const resume = (await res.json()) as Resume
  const original = resume.originalimage?.source
  if (!original) throw new Error('article sans image')

  // Le nom du fichier Commons est le dernier segment de l'URL d'origine.
  // L'URL porte une chaîne de requête de suivi : on ne garde que le chemin.
  // Quand l'image « originale » est déjà une vignette, le nom du fichier
  // Commons est l'avant-dernier segment, le dernier étant « 3840px-… ».
  const segments = new URL(original).pathname.split('/')
  const nomFichier = decodeURIComponent((segments.includes('thumb') ? segments.at(-2) : segments.at(-1)) ?? '')
  const extension = (nomFichier.split('.').pop() ?? '').toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension)) throw new Error(`format ${extension} non pris en charge`)

  // Version réduite : Commons ne sert plus que des largeurs standard, on lui
  // demande donc l'adresse de la vignette de 960 px, avec les métadonnées de
  // licence dans le même appel.
  const meta = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(`File:${nomFichier}`)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${LARGEUR}&format=json`,
    { headers: ENTETES },
  )
  const m = (await meta.json()) as MetaCommons
  const info = Object.values(m.query?.pages ?? {})[0]?.imageinfo?.[0]
  const urlImage = info?.thumburl ?? original
  const image = await fetch(urlImage, { headers: { 'user-agent': ENTETES['user-agent'] } })
  if (!image.ok) throw new Error(`image ${image.status}`)
  const octets = Buffer.from(await image.arrayBuffer())
  const sortie = `${v.slug}.${extension === 'jpeg' ? 'jpg' : extension}`
  writeFileSync(join(DOSSIER, sortie), octets)
  const ext = info?.extmetadata ?? {}
  return {
    slug: v.slug,
    fichier: sortie,
    poidsKo: Math.round(octets.length / 1024),
    source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(nomFichier)}`,
    auteur: sansBalises(ext.Artist?.value) || 'Auteur non renseigné',
    licence: sansBalises(ext.LicenseShortName?.value) || 'Licence non renseignée',
  }
}

async function main() {
  mkdirSync(DOSSIER, { recursive: true })
  const credits: Awaited<ReturnType<typeof traiter>>[] = []
  for (const v of VILLES) {
    try {
      const c = await traiter(v)
      credits.push(c)
      console.log(`✓ ${v.slug} (${c.poidsKo} Ko, ${c.licence})`)
    } catch (e) {
      console.log(`✗ ${v.slug} : ${(e as Error).message}`)
    }
  }

  const lignes = [
    '# Photos des villes',
    '',
    'Téléchargées depuis Wikimedia Commons par `scripts/design/images-villes.ts`.',
    'Chaque image reste sous la licence indiquée, avec attribution à son auteur.',
    '',
    '| Ville | Fichier | Auteur | Licence | Source |',
    '|---|---|---|---|---|',
    ...credits.map((c) => `| ${c.slug} | ${c.fichier} | ${c.auteur} | ${c.licence} | ${c.source} |`),
    '',
  ]
  writeFileSync(join(DOSSIER, 'CREDITS.md'), lignes.join('\n'))
  writeFileSync(
    MANIFESTE,
    JSON.stringify(Object.fromEntries(credits.map((c) => [c.slug, `/images/villes/${c.fichier}`])), null, 2) + '\n',
  )
  console.log(`${credits.length} images, crédits et manifeste écrits`)
}

main()
