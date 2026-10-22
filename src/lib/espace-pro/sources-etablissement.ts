/**
 * Les sources d'une page d'établissement, nommées et rangées par ce qu'elles
 * renseignent, au lieu d'une liste d'adresses. Les règles portent sur
 * l'adresse seule : une source inconnue garde son domaine pour nom.
 */

export type RubriqueSource = 'L’établissement' | 'Accès et places' | 'Soins' | 'Textes officiels' | 'Actualités' | 'Diplômes'

export type SourceNommee = { url: string; libelle: string; domaine: string; rubrique: RubriqueSource; nature: 'page' | 'pdf' | 'texte' | 'registre' | 'article' }

export const ORDRE_RUBRIQUES: RubriqueSource[] = ['L’établissement', 'Accès et places', 'Soins', 'Textes officiels', 'Diplômes', 'Actualités']

const domaineDe = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] ?? url
  }
}

/**
 * L'année d'un document : une période quand deux années se suivent ou
 * bornent un plan (« 2026_27 », « 2022-2026 »), sinon la première année
 * citée, ou `null`. Le dossier de dépôt d'un site (« /2025/10/ ») ne compte
 * pas : c'est la date de mise en ligne, pas celle du document.
 */
export function anneeDe(url: string): string | null {
  const t = decodeURIComponent(url).replace(/\/20\d{2}\/\d{2}\//g, '/')
  const deux = /(20\d{2})[-_ ](20)?(\d{2})(?!\d)/g
  for (let m = deux.exec(t); m; m = deux.exec(t)) {
    const ecart = Number(`20${m[3]}`) - Number(m[1])
    if (ecart >= 1 && ecart <= 6) return `${m[1]}-20${m[3]}`
  }
  return /(?<!\d)(20\d{2})(?!\d)/.exec(t)?.[1] ?? null
}

const PRESSE = /information-dentaire\.fr|hippocast\.fr|lequotidiendumedecin|letudiant\.fr/

export function nommerSource(url: string): SourceNommee {
  const domaine = domaineDe(url)
  const u = decodeURIComponent(url).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const chemin_ = u.replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '')
  const pdf = /\.pdf($|\?)/.test(u)
  const a = anneeDe(url)
  const avecAnnee = (t: string) => (a ? `${t} ${a}` : t)
  const s = (libelle: string, rubrique: RubriqueSource, nature: SourceNommee['nature']): SourceNommee => ({ url, libelle, domaine, rubrique, nature })

  if (domaine.endsWith('legifrance.gouv.fr')) return s('Texte au Journal officiel', 'Textes officiels', 'texte')
  if (domaine.endsWith('enseignementsup-recherche.gouv.fr') && /\/bo\//.test(chemin_)) return s('Bulletin officiel de l’enseignement supérieur', 'Textes officiels', 'texte')
  if (domaine.endsWith('francecompetences.fr')) return s('France compétences (RNCP)', 'Diplômes', 'registre')
  if (PRESSE.test(domaine)) return s('Article de presse', 'Actualités', 'article')
  if (/(^|\.)ars\.sante\.fr$/.test(domaine)) return s('Communiqué de l’agence régionale de santé', 'Actualités', 'article')
  if (/numerus|apertus/.test(u)) return s(avecAnnee('Numerus apertus'), 'Accès et places', pdf ? 'pdf' : 'page')
  if (/capacit|capa[_-]|places-offertes/.test(u)) return s(avecAnnee(/places-offertes/.test(u) ? 'Places offertes' : 'Capacités d’accueil'), 'Accès et places', pdf ? 'pdf' : 'page')
  if (/passerelle/.test(u)) return s(avecAnnee('Admission par passerelle'), 'Accès et places', pdf ? 'pdf' : 'page')
  if (/acces-sante|acces-aux-etudes|acces_aux_etudes|access-health|pass-?las|projections/.test(u)) return s(avecAnnee('Accès aux études de santé'), 'Accès et places', pdf ? 'pdf' : 'page')
  if (/(^|\.)chr?u-|aphp\.fr|hopital|hospitalier/.test(domaine)) return s('Service hospitalier du CHU', 'Soins', 'page')
  if (/actualites?\/|articles?\/|\/news\//.test(chemin_)) return s('Actualité de l’université', 'Actualités', 'article')
  if (/contact|scolarite/.test(chemin_)) return s('Contact de la scolarité', 'L’établissement', 'page')
  if (/organisation|composantes-de-formation/.test(chemin_)) return s('La faculté sur le site de l’université', 'L’établissement', 'page')
  if (chemin_ === '' || chemin_ === '/') return s('Site de la faculté', 'L’établissement', 'page')
  return s(pdf ? 'Document de la faculté' : 'Page de la faculté', 'L’établissement', pdf ? 'pdf' : 'page')
}

/**
 * Les sources rangées par rubrique, dans l'ordre de `ORDRE_RUBRIQUES`, sans
 * doublon ; dans une rubrique, l'année la plus récente d'abord.
 */
export function rangerSources(urls: string[]): { rubrique: RubriqueSource; sources: SourceNommee[] }[] {
  const vues = new Set<string>()
  const nommees = urls.filter((u) => !vues.has(u) && vues.add(u)).map(nommerSource)
  return ORDRE_RUBRIQUES.map((rubrique) => ({
    rubrique,
    sources: nommees.filter((n) => n.rubrique === rubrique).sort((a, b) => b.libelle.localeCompare(a.libelle, 'fr')),
  })).filter((g) => g.sources.length)
}

/** Les registres lus pour une école : sans liens propres, les référentiels nationaux. */
export const REGISTRES_ECOLE: SourceNommee[] = [
  { url: 'https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/', libelle: 'Référentiel UAI de l’Éducation nationale', domaine: 'data.education.gouv.fr', rubrique: 'L’établissement', nature: 'registre' },
  { url: 'https://annuaire-entreprises.data.gouv.fr/', libelle: 'Répertoire Sirene de l’Insee', domaine: 'annuaire-entreprises.data.gouv.fr', rubrique: 'L’établissement', nature: 'registre' },
  { url: 'https://www.francecompetences.fr/', libelle: 'France compétences (RNCP)', domaine: 'francecompetences.fr', rubrique: 'Diplômes', nature: 'registre' },
]
