/**
 * Le type réel d'un fichier reçu, lu dans ses premiers octets : le type
 * déclaré par le navigateur se falsifie (audit du 2026-10-26). Un « PDF »
 * qui n'en est pas un est refusé avant d'être rangé.
 */
export type TypeReel = 'pdf' | 'jpeg' | 'png'

const SIGNATURES: Record<TypeReel, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
}

export async function typeReel(fichier: Blob): Promise<TypeReel | null> {
  const tete = new Uint8Array(await fichier.slice(0, 8).arrayBuffer())
  for (const [type, octets] of Object.entries(SIGNATURES) as [TypeReel, number[]][]) {
    if (octets.every((o, i) => tete[i] === o)) return type
  }
  return null
}

/** Le fichier est-il vraiment de l'un de ces types ? */
export async function contenuConforme(fichier: Blob, types: readonly TypeReel[]): Promise<boolean> {
  const t = await typeReel(fichier)
  return t !== null && types.includes(t)
}
