import type { PraticienProche } from './queries'

/**
 * Emprise de carte : les types, les constantes et les fonctions pures.
 *
 * Ce module est importé par la carte et par la liste, donc par du code client.
 * Il ne doit jamais toucher à la base : un seul `import { db }` ici suffirait à
 * tirer Drizzle et le pilote Neon dans le paquet du navigateur, où la chaîne de
 * connexion n'existe pas. La requête correspondante vit dans `queries.ts`.
 */
export type Emprise = { ouest: number; sud: number; est: number; nord: number }

/**
 * Point d'où la distance est mesurée pour classer la liste. Par défaut le
 * centre de l'emprise ; le lieu choisi sur la carte quand une fiche est ouverte,
 * pour que la personne choisie vienne en tête de la colonne.
 */
export type Origine = { lon: number; lat: number }

export type PageResultats = {
  total: number
  page: number
  pages: number
  /** Vrai quand le plafond de lecture est atteint : le total affiché est un minimum. */
  plafonne: boolean
  resultats: PraticienProche[]
}

/** Vingt fiches par page, soit dix lignes sur deux colonnes dans la demi-largeur de la recherche. */
export const PAR_PAGE_CARTE = 20

/** Emprise carrée autour d'un point, en degrés, pour un rayon donné en mètres. */
export function empriseAutour(lon: number, lat: number, rayonMetres: number): Emprise {
  const degresLat = rayonMetres / 111_320
  // Un degré de longitude rétrécit avec la latitude : sans ce cosinus, la boîte
  // serait deux fois trop large à Dunkerque et la carte partirait trop loin.
  const degresLon = degresLat / Math.max(0.2, Math.cos((lat * Math.PI) / 180))
  return { ouest: lon - degresLon, sud: lat - degresLat, est: lon + degresLon, nord: lat + degresLat }
}

/** Emprise agrandie d'une fraction de chaque côté : 0.1 ajoute dix pour cent de marge. */
export function elargir(e: Emprise, fraction: number): Emprise {
  const dx = (e.est - e.ouest) * fraction
  const dy = (e.nord - e.sud) * fraction
  return { ouest: e.ouest - dx, sud: e.sud - dy, est: e.est + dx, nord: e.nord + dy }
}

/** Plus petite emprise contenant les deux. */
export function reunir(a: Emprise, b: Emprise): Emprise {
  return {
    ouest: Math.min(a.ouest, b.ouest),
    sud: Math.min(a.sud, b.sud),
    est: Math.max(a.est, b.est),
    nord: Math.max(a.nord, b.nord),
  }
}

/** Emprise par défaut : la France métropolitaine. */
export const EMPRISE_FRANCE: Emprise = { ouest: -5.2, sud: 41.3, est: 9.6, nord: 51.1 }

/**
 * Plafond de lecture.
 *
 * Une emprise nationale contient des dizaines de milliers de fiches, qu'aucun
 * utilisateur ne parcourra page par page. On s'arrête à ce nombre, et
 * l'interface dit clairement qu'il faut resserrer la carte. Le tri par
 * distance au centre reste donc exact sur tout ce qui est rendu.
 */
export const PLAFOND = 600

/**
 * Clé d'une position, partagée par la carte et les cartes de résultat.
 *
 * Le survol se synchronise par le lieu et non par le praticien : plusieurs
 * professionnels partagent souvent la même adresse, et c'est bien le même
 * point qui doit s'allumer pour chacun d'eux. Cinq décimales valent un mètre,
 * largement sous la précision d'un géocodage d'adresse.
 */
export function clePosition(lon: number | null, lat: number | null): string | null {
  if (lon == null || lat == null) return null
  return `${lon.toFixed(5)},${lat.toFixed(5)}`
}

/**
 * Régimes des tuiles de praticiens, partagés entre la route qui les produit
 * et la carte qui les dessine.
 *
 * En dessous de `SEUIL_POINTS`, la base agrège sur une grille de
 * `CELLULES_PAR_TUILE` cellules de côté par tuile, et chaque grappe est
 * placée de sorte que son cercle tienne entièrement dans sa cellule : deux
 * grappes voisines ne peuvent donc jamais se chevaucher. `rayonGrappe` est
 * le rayon du cercle selon l'effectif, en pixels, le même dans le style de la
 * carte et dans le calcul de placement côté base.
 */
export const SEUIL_POINTS = 14
export const CELLULES_PAR_TUILE = 6
/** Côté d'une tuile vectorielle à l'écran, en pixels CSS. */
export const PIXELS_PAR_TUILE = 512

export function rayonGrappe(n: number): number {
  if (n >= 50) return 22
  if (n >= 10) return 18
  return 14
}
