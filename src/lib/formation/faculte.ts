/**
 * Lecture structurée d'une fiche de faculté d'odontologie.
 *
 * Les facultés sont saisies dans WordPress avec un contenu balisé de façon
 * régulière, produit par le script de publication : un paragraphe de
 * présentation, puis les sections « Identité », « Accès aux études »,
 * « Cursus », « Internat », « Soins et hôpital » et « Sources », faites de
 * lignes « Libellé : valeur ». En attendant que le groupe ACF détaillé soit
 * importé dans le CMS, la fiche lit ces sections pour construire ses modules.
 * Le contenu reste la seule source : une fiche remaniée à la main dans
 * l'éditeur retombe simplement sur l'affichage du contenu brut.
 */

export type InternatFaculte = {
  specialite: string
  /** Postes ouverts au concours pour l'année la plus récente citée. */
  postes: number | null
  annee: string | null
  /** La ligne telle qu'elle est écrite, quand le détail vaut mieux qu'un chiffre. */
  texte: string
}

export type CapaciteFaculte = {
  nombre: number | null
  annee: string | null
  detail: string | null
}

export type Faculte = {
  presentation: string | null
  universite: string | null
  adresse: string | null
  siteWeb: string | null
  telephone: string | null
  email: string | null
  voiesAcces: string | null
  capacite: CapaciteFaculte
  duree: string | null
  diplome: string | null
  autresDiplomes: string | null
  effectif: number | null
  internats: InternatFaculte[]
  chu: string | null
  centresDeSoins: string[]
  sources: string[]
  dateReleve: string | null
}

const ENTITES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
}

/** Décode les entités que WordPress laisse dans le contenu rendu. */
export function decoderEntites(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, nom: string) => ENTITES[nom.toLowerCase()] ?? m)
}

function texte(html: string): string {
  return decoderEntites(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** Libellé normalisé : minuscules, apostrophe droite, sans accents superflus. */
function cle(libelle: string): string {
  return texte(libelle)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

type Section = { champs: Map<string, string>; items: string[]; paragraphes: string[]; liens: string[] }

function lireSection(html: string): Section {
  const champs = new Map<string, string>()
  const items: string[] = []
  for (const m of html.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
    const li = m[1]!
    const champ = /^\s*<strong>([\s\S]*?)<\/strong>\s*:?\s*([\s\S]*)$/.exec(li)
    if (champ) champs.set(cle(champ[1]!), texte(champ[2]!))
    else {
      const t = texte(li)
      if (t) items.push(t)
    }
  }
  const paragraphes = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => texte(m[1]!)).filter(Boolean)
  const liens = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => decoderEntites(m[1]!))
  return { champs, items, paragraphes, liens }
}


/**
 * « 82 (2026-2027). PASS 35, … » devient un nombre, une année et le détail.
 * Une capacité inconnue est écrite sans nombre : seul le détail reste.
 */
export function lireCapacite(valeur: string | undefined): CapaciteFaculte {
  if (!valeur) return { nombre: null, annee: null, detail: null }
  const nombre = /^\s*(\d+)\b/.exec(valeur)
  const annee = /(\d{4}-\d{4})/.exec(valeur)
  // Le détail est ce qui reste une fois le nombre et l'année retirés, sans
  // les parenthèses ou points qui les entouraient, même mal équilibrés.
  let detail = valeur.replace(/^\s*\d+\b/, '')
  if (annee) detail = detail.replace(annee[1]!, '')
  detail = detail
    .replace(/\(\s*\)/g, ' ')
    .replace(/^[\s.()]+/, '')
    .replace(/[\s()]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
  return { nombre: nombre ? Number(nombre[1]) : null, annee: annee?.[1] ?? null, detail: detail || null }
}

/**
 * Une ligne d'internat : « Chirurgie orale : 2 postes (2026-2027) », ou la
 * forme longue « Orthopédie dento-faciale : 11 (2025-2026), 10 (2026-2027) ».
 * On retient l'année la plus récente.
 */
export function lireInternat(ligne: string): InternatFaculte {
  const [specialite, ...reste] = ligne.split(/\s:\s/)
  const valeur = reste.join(' : ')
  let postes: number | null = null
  let annee: string | null = null
  for (const m of valeur.matchAll(/(\d+)\s*(?:postes?)?\s*\((\d{4}-\d{4})\)/g)) {
    if (annee === null || m[2]! > annee) {
      annee = m[2]!
      postes = Number(m[1])
    }
  }
  if (postes === null) {
    const n = /(\d+)/.exec(valeur)
    postes = n ? Number(n[1]) : null
  }
  return { specialite: (specialite ?? ligne).trim(), postes, annee, texte: ligne }
}

export function lireFaculte(html: string | null | undefined): Faculte | null {
  if (!html || !/<h2>\s*Identit/i.test(html)) return null
  const parties = html.split(/<h2>([\s\S]*?)<\/h2>/)
  const sections = new Map<string, Section>()
  for (let i = 1; i < parties.length; i += 2) sections.set(cle(parties[i]!), lireSection(parties[i + 1] ?? ''))
  const vide: Section = { champs: new Map(), items: [], paragraphes: [], liens: [] }
  const identite = sections.get('identite') ?? vide
  const acces = sections.get('acces aux etudes') ?? vide
  const cursus = sections.get('cursus') ?? vide
  const internat = sections.get('internat') ?? vide
  const soins = sections.get('soins et hopital') ?? vide
  const sources = sections.get('sources') ?? vide

  const scolarite = identite.champs.get('scolarite') ?? ''
  const telephone = /0\d(?:[ .]?\d{2}){4}/.exec(scolarite)?.[0] ?? null
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.exec(scolarite)?.[0] ?? null
  const effectif = cursus.champs.get('effectif etudiant')
  const dateReleve = /relev[ée]e?s? le (.+?) sur/i.exec(sources.paragraphes[0] ?? '')?.[1] ?? null

  return {
    presentation: lireSection(parties[0] ?? '').paragraphes[0] ?? null,
    universite: identite.champs.get('universite') ?? null,
    adresse: identite.champs.get('adresse') ?? null,
    siteWeb: identite.champs.get('site web') ?? null,
    telephone,
    email,
    voiesAcces: acces.champs.get("voies d'acces") ?? null,
    capacite: lireCapacite(acces.champs.get("capacite d'accueil en deuxieme annee")),
    duree: cursus.champs.get('duree') ?? null,
    diplome: cursus.champs.get('diplome') ?? null,
    autresDiplomes: cursus.champs.get('autres diplomes') ?? null,
    effectif: effectif && /^\d+$/.test(effectif) ? Number(effectif) : null,
    internats: internat.items.map(lireInternat),
    chu: soins.champs.get('service hospitalier') ?? null,
    centresDeSoins: soins.items,
    sources: sources.liens,
    dateReleve,
  }
}

/** Total des postes d'internat pour l'année la plus récente citée. */
export function postesInternat(f: Faculte): { total: number; annee: string | null } {
  const annee = f.internats.reduce<string | null>((a, i) => (i.annee && (!a || i.annee > a) ? i.annee : a), null)
  const total = f.internats.filter((i) => !annee || i.annee === annee).reduce((s, i) => s + (i.postes ?? 0), 0)
  return { total, annee }
}

/**
 * Les sites d'une faculté, quand l'adresse en cite plusieurs séparés par un
 * point-virgule : « Site Montrouge, 1 rue … ; site Garancière, 5 rue … ».
 */
export function sitesDe(adresse: string | null, nomParDefaut: string): { nom: string; adresse: string }[] {
  if (!adresse) return []
  return adresse
    .split(/\s*;\s*/)
    .filter(Boolean)
    .map((a) => {
      const m = /^(site\s+[^,]+),\s*(.+)$/i.exec(a)
      return m ? { nom: m[1]![0]!.toUpperCase() + m[1]!.slice(1), adresse: m[2]! } : { nom: nomParDefaut, adresse: a }
    })
}

/**
 * La partie postale d'une désignation libre, pour le géocodeur : sans
 * parenthèses, sans boîte postale ni « Cedex », et réduite à la voie et à la
 * commune quand un numéro de voie est présent.
 */
export function extraireAdresse(s: string): string {
  const nettoye = s
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s*;\s*/)[0]!
    .replace(/\b(?:CS|BP|TSA)\s*\d+\s*,?/gi, ' ')
    .replace(/\bcedex\s*\d*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const voie = /\d{1,4}\s?(?:bis|ter)?\s+(?:rue|avenue|av\.|boulevard|bd|place|chemin|allée|allee|route|cours|quai|impasse|square|promenade|esplanade)\b[^,;:]*,?\s*\d{5}\s+[^,;:]+/i.exec(nettoye)
  return (voie?.[0] ?? nettoye).replace(/\s+,/g, ',').trim()
}

/** Nom court d'un centre de soins : ce qui précède la première virgule, complété s'il est trop court. */
export function nomCourt(designation: string): string {
  const morceaux = designation.split(/\s*[,;:(]\s*/).filter(Boolean)
  let nom = morceaux[0] ?? designation
  if (nom.length < 12 && morceaux[1]) nom = `${nom}, ${morceaux[1]}`
  return nom
}

/* ------------------------------------------------------------------ */
/* Écoles de prothèse dentaire                                          */
/* ------------------------------------------------------------------ */

/**
 * Une école de prothèse est saisie avec le même balisage régulier que les
 * facultés : « Identité », « Diplômes » (une ligne par diplôme, champs
 * séparés par une barre verticale : intitulé, niveau, durée, modalité),
 * « Admission » et « Sources ».
 */
export type DiplomeEcole = { intitule: string; niveau: string | null; duree: string | null; modalite: string | null }

export type Ecole = {
  presentation: string | null
  /** Libellé du type d'établissement, tel qu'écrit dans la fiche. */
  type: string | null
  statut: 'public' | 'prive' | null
  adresse: string | null
  siteWeb: string | null
  telephone: string | null
  email: string | null
  diplomes: DiplomeEcole[]
  /** Places par promotion, quand l'établissement le publie. */
  capacite: number | null
  frais: string | null
  sources: string[]
  dateReleve: string | null
}

export const TYPES_ECOLE: Record<string, string> = {
  lycee_public: 'Lycée public',
  lycee_prive: 'Lycée privé',
  cfa: 'Centre de formation d’apprentis',
  ecole_privee: 'École privée',
  universite: 'Université',
}

export const MODALITES: Record<string, string> = {
  initiale: 'Formation initiale',
  apprentissage: 'Apprentissage',
  mixte: 'Initiale ou apprentissage',
  continue: 'Formation continue',
}

function lireDiplome(ligne: string): DiplomeEcole {
  const [intitule, niveau, duree, modalite] = ligne.split(/\s*\|\s*/).map((s) => s.trim())
  return { intitule: intitule ?? ligne, niveau: niveau || null, duree: duree || null, modalite: modalite || null }
}

/** Les diplômes d'une fiche balisée, ou une liste vide : sert aussi aux cartes de la liste. */
export function lireDiplomes(html: string | null | undefined): DiplomeEcole[] {
  if (!html) return []
  const parties = html.split(/<h2>([\s\S]*?)<\/h2>/)
  for (let i = 1; i < parties.length; i += 2) {
    if (cle(parties[i]!) === 'diplomes') return lireSection(parties[i + 1] ?? '').items.map(lireDiplome)
  }
  return []
}

export function lireEcole(html: string | null | undefined): Ecole | null {
  if (!html || !/<h2>\s*Identit/i.test(html) || !/<h2>\s*Dipl/i.test(html)) return null
  const parties = html.split(/<h2>([\s\S]*?)<\/h2>/)
  const sections = new Map<string, Section>()
  for (let i = 1; i < parties.length; i += 2) sections.set(cle(parties[i]!), lireSection(parties[i + 1] ?? ''))
  const vide: Section = { champs: new Map(), items: [], paragraphes: [], liens: [] }
  const identite = sections.get('identite') ?? vide
  const admission = sections.get('admission') ?? vide
  const sources = sections.get('sources') ?? vide
  const contact = identite.champs.get('contact') ?? ''
  const statut = (identite.champs.get('statut') ?? '').toLowerCase()
  const capacite = /(\d+)/.exec(admission.champs.get('places par promotion') ?? '')?.[1]
  return {
    presentation: lireSection(parties[0] ?? '').paragraphes[0] ?? null,
    type: identite.champs.get('type') ?? null,
    statut: statut.startsWith('pub') ? 'public' : statut.startsWith('pri') ? 'prive' : null,
    adresse: identite.champs.get('adresse') ?? null,
    siteWeb: identite.champs.get('site web') ?? null,
    telephone: /0\d(?:[ .]?\d{2}){4}/.exec(contact)?.[0] ?? null,
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/.exec(contact)?.[0] ?? null,
    diplomes: (sections.get('diplomes') ?? vide).items.map(lireDiplome),
    capacite: capacite ? Number(capacite) : null,
    frais: admission.champs.get('frais de scolarite') ?? null,
    sources: sources.liens,
    dateReleve: /relev[ée]e?s? le (.+?) sur/i.exec(sources.paragraphes[0] ?? '')?.[1] ?? null,
  }
}
