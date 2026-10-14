/**
 * Le groupe ACF « Formation, informations détaillées » (`formationDetails`,
 * voir docs/acf/formation-details.json), lu en un objet simple et sérialisable
 * pour les pages d'établissement. Fonctions pures, testées.
 *
 * ACF est en version gratuite, sans répéteur : les listes se saisissent en
 * zone de texte, une ligne par élément, colonnes séparées par « | ». Une ligne
 * illisible est ignorée, jamais affichée de travers.
 *
 * Ordre de priorité sur la page, bloc par bloc : ce que l'établissement
 * revendiqué déclare dans Neon d'abord, puis ces champs, sinon le bloc reste
 * masqué.
 */

/** Le groupe tel que WPGraphQL le renvoie ; tous les champs sont facultatifs. */
export type DetailsBruts = {
  universite?: string | null
  adresse?: string | null
  codePostal?: string | null
  telephone?: string | null
  email?: string | null
  voiesAcces?: string | null
  capaciteAccueil?: number | null
  prerequis?: string | null
  frais?: string | null
  rentree?: string | null
  portesOuvertes?: string | null
  latitude?: number | null
  longitude?: number | null
  sources?: string | null
  dateReleve?: string | null
} | null | undefined

/** Une étape d'admission : « Titre | explication | période ». */
export type EtapeAdmission = { titre: string; detail: string | null; quand: string | null }

/** Un rendez-vous : date ISO, titre, détail (horaire, inscription…). */
export type EvenementEtablissement = { date: string; titre: string; detail: string | null }

export type DetailsFormation = {
  universite: string | null
  /** Rue et numéro, suivis du code postal et de la ville quand ils sont connus. */
  adresse: string | null
  telephone: string | null
  email: string | null
  /** Étapes d'admission, saisies une par ligne. */
  etapes: EtapeAdmission[]
  /** « Ce que l'école attend » : un prérequis par ligne. */
  prerequis: string[]
  capacite: number | null
  /** Frais de scolarité, lus par `lignesFrais`. */
  frais: string | null
  rentree: string | null
  /** Tous les rendez-vous saisis, par date ; les dates passées se filtrent au rendu. */
  evenements: EvenementEtablissement[]
  position: { lon: number; lat: number } | null
  sources: string[]
  /** Date du relevé, `AAAA-MM-JJ`. */
  dateReleve: string | null
}

export const DETAILS_VIDES: DetailsFormation = {
  universite: null,
  adresse: null,
  telephone: null,
  email: null,
  etapes: [],
  prerequis: [],
  capacite: null,
  frais: null,
  rentree: null,
  evenements: [],
  position: null,
  sources: [],
  dateReleve: null,
}

const texte = (s: string | null | undefined): string | null => s?.replace(/\s+/g, ' ').trim() || null

/** Les lignes non vides d'une zone de texte, sans puce ni tiret de tête. */
export function lireLignes(zone: string | null | undefined, max = 20): string[] {
  if (!zone) return []
  return zone
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•·]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
    .slice(0, max)
}

const colonnes = (ligne: string) => ligne.split(/\s*\|\s*/).map((c) => c.trim())

/** Étapes d'admission, « Titre | explication | période », 8 au plus. */
export function lireEtapes(zone: string | null | undefined): EtapeAdmission[] {
  return lireLignes(zone, 8)
    .map(colonnes)
    .filter(([titre]) => !!titre && titre.length > 1)
    .map(([titre, detail, quand]) => ({ titre: titre!, detail: detail || null, quand: quand || null }))
}

const MOIS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']

/** « 2027-02-06 », « 06/02/2027 » ou « samedi 6 février 2027 » en date ISO ; `null` sinon. */
export function lireDate(s: string): string | null {
  const t = s.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  const fr = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t)
  const long = /(\d{1,2})(?:er)?\s+([a-zéèûô]+)\s+(\d{4})/i.exec(t)
  let a: number, m: number, j: number
  if (iso) [a, m, j] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  else if (fr) [a, m, j] = [Number(fr[3]), Number(fr[2]), Number(fr[1])]
  else if (long) {
    const mois = MOIS.indexOf(long[2]!.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))
    if (mois < 0) return null
    ;[a, m, j] = [Number(long[3]), mois + 1, Number(long[1])]
  } else return null
  const d = new Date(Date.UTC(a, m - 1, j))
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== j) return null
  return d.toISOString().slice(0, 10)
}

/**
 * Les rendez-vous du champ « Journées portes ouvertes » : un par ligne ou
 * séparés par « ; », chacun « date | titre | détail ». Une date seule est une
 * journée portes ouvertes. Une date illisible écarte la ligne : sans date, le
 * site ne saurait pas la retirer une fois passée.
 */
export function lireEvenements(zone: string | null | undefined): EvenementEtablissement[] {
  if (!zone) return []
  return zone
    .split(/\s*;\s*|\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(colonnes)
    .map(([date, titre, detail]) => ({ date: lireDate(date ?? ''), titre: titre || 'Journée portes ouvertes', detail: detail || null }))
    .filter((e): e is EvenementEtablissement => !!e.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)
}

/** Aujourd'hui à Paris, `AAAA-MM-JJ`. */
function aujourdhui(maintenant: Date): string {
  return maintenant.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

/** Les rendez-vous à venir, celui du jour compris. */
export function evenementsAVenir(evenements: EvenementEtablissement[], maintenant = new Date()): EvenementEtablissement[] {
  const jour = aujourdhui(maintenant)
  return evenements.filter((e) => e.date >= jour)
}

/** Le prochain rendez-vous qui est une journée portes ouvertes. */
export function prochainePorteOuverteSaisie(evenements: EvenementEtablissement[], maintenant = new Date()): EvenementEtablissement | null {
  return evenementsAVenir(evenements, maintenant).find((e) => /portes?\s+ouvertes?/i.test(e.titre)) ?? null
}

const URL_VALIDE = /^https?:\/\/\S+$/i

/** Le groupe lu ; `ville` vient du groupe Formation d'origine et complète l'adresse. */
export function lireDetails(brut: DetailsBruts, ville?: string | null): DetailsFormation {
  if (!brut) return DETAILS_VIDES
  const rue = texte(brut.adresse)
  const commune = [texte(brut.codePostal), texte(ville)].filter(Boolean).join(' ')
  const lat = brut.latitude
  const lon = brut.longitude
  return {
    universite: texte(brut.universite),
    adresse: rue ? (commune && !rue.includes(commune) ? `${rue}, ${commune}` : rue) : null,
    telephone: texte(brut.telephone),
    email: texte(brut.email),
    etapes: lireEtapes(brut.voiesAcces),
    prerequis: lireLignes(brut.prerequis, 8),
    capacite: typeof brut.capaciteAccueil === 'number' && brut.capaciteAccueil > 0 ? Math.round(brut.capaciteAccueil) : null,
    // Les retours à la ligne séparent les postes : on ne les écrase pas.
    frais: brut.frais?.trim() || null,
    rentree: texte(brut.rentree),
    evenements: lireEvenements(brut.portesOuvertes),
    position: typeof lat === 'number' && typeof lon === 'number' && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat !== 0 || lon !== 0) ? { lon, lat } : null,
    sources: lireLignes(brut.sources, 20).filter((u) => URL_VALIDE.test(u)),
    dateReleve: brut.dateReleve ? lireDate(brut.dateReleve.slice(0, 10)) : null,
  }
}
