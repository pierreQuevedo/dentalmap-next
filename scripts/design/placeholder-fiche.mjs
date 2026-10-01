/**
 * Génère le visuel de remplacement des fiches sans photo.
 *
 * Aucune fiche de l'annuaire n'a de photo : elles viennent de registres, pas
 * d'inscriptions. Tant que les praticiens n'ont pas revendiqué leur fiche, la
 * carte affiche donc ce fond. Il est volontairement muet, sans silhouette ni
 * pictogramme : une grille de vingt silhouettes identiques crie l'absence,
 * alors qu'une surface neutre laisse le monogramme et le nom porter la carte.
 *
 * Écrit à la main plutôt que dessiné dans un outil : une dégradé vertical de
 * deux cents lignes se décrit en dix lignes de code et pèse trois kilo-octets,
 * là où un export d'image en pèserait cent.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const LARGEUR = 600
const HAUTEUR = 800

// Du gris acier en haut vers le fond de page en bas : c'est le sens d'une
// photo de portrait, dont le sujet occupe le haut du cadre, et c'est ce qui
// donne au flou progressif de quoi mordre. Un dégradé partant du fond de page
// rendrait l'effet invisible en thème clair.
const HAUT = [0xc4, 0xce, 0xd6]
const BAS = [0xea, 0xed, 0xef]

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const octet of buf) c = crcTable[(c ^ octet) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function morceau(type, donnees) {
  const corps = Buffer.concat([Buffer.from(type, 'ascii'), donnees])
  const taille = Buffer.alloc(4)
  taille.writeUInt32BE(donnees.length)
  const controle = Buffer.alloc(4)
  controle.writeUInt32BE(crc32(corps))
  return Buffer.concat([taille, corps, controle])
}

const brut = Buffer.alloc((LARGEUR * 3 + 1) * HAUTEUR)
let o = 0
for (let y = 0; y < HAUTEUR; y++) {
  brut[o++] = 0 // filtre « aucun »
  const t = y / (HAUTEUR - 1)
  // Courbe douce : le dégradé ne doit pas se lire comme une bande.
  const f = t * t * (3 - 2 * t)
  for (let x = 0; x < LARGEUR; x++) {
    // Très légère dérive horizontale, pour qu'une grille de cartes ne donne
    // pas l'impression d'un aplat photocopié.
    const g = f + (x / LARGEUR - 0.5) * 0.06
    for (let c = 0; c < 3; c++) {
      brut[o++] = Math.max(0, Math.min(255, Math.round(HAUT[c] + (BAS[c] - HAUT[c]) * g)))
    }
  }
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(LARGEUR, 0)
ihdr.writeUInt32BE(HAUTEUR, 4)
ihdr[8] = 8 // 8 bits par canal
ihdr[9] = 2 // couleur vraie, sans alpha
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  morceau('IHDR', ihdr),
  morceau('IDAT', deflateSync(brut, { level: 9 })),
  morceau('IEND', Buffer.alloc(0)),
])

mkdirSync('public/images', { recursive: true })
writeFileSync('public/images/fiche-sans-photo.png', png)
console.log(`public/images/fiche-sans-photo.png : ${LARGEUR}x${HAUTEUR}, ${(png.length / 1024).toFixed(1)} ko`)
