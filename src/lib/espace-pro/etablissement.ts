import { z } from 'zod'
import type { DiplomeEcole } from '@/lib/formation/faculte'
import { LIBELLE_PALIER, palierDe, type Force } from './force'

/**
 * Le couloir « École ou organisme » : ce qui se calcule sans base ni réseau.
 *
 * L'établissement vit dans WordPress (type de contenu `formation`) ; ce que
 * l'établissement déclare vit dans `fiches_etablissement`, un document JSON
 * par établissement. Fonctions pures, testées : domaine reconnu, numéro UAI,
 * formations préremplies, force de la page et sections.
 */

export type TypeEtablissement = 'ecole_prothese' | 'faculte'

/** Le courriel de la demande de partenariat, gardé dix minutes pour l'accusé (O3b). */
export const COOKIE_PARTENARIAT = 'dm_partenariat'

/**
 * Les spécialités proposées sur la liste d'attente de la formation continue
 * (W1) : la liste unique des thèmes de formation. « Prothèse » est devenu
 * « Prothèse et CFAO » le 13 octobre 2026.
 */
export { THEMES_FORMATION as SPECIALITES } from '@/lib/formation/themes'

export const LIBELLE_TYPE: Record<TypeEtablissement, string> = {
  ecole_prothese: 'École de prothèse',
  faculte: 'Faculté',
}

/* ------------------------------------------------------------------ */
/* Numéro UAI                                                           */
/* ------------------------------------------------------------------ */

/** Lettres de clé du numéro UAI : l'alphabet sans I, O ni Q. */
const LETTRES_UAI = 'ABCDEFGHJKLMNPRSTUVWXYZ'

export function nettoyerUai(v: string): string {
  return v.replace(/\s+/g, '').toUpperCase()
}

/**
 * Sept chiffres et une lettre, la lettre étant la clé des chiffres (reste de
 * la division par 23). « 0340042L » est valide, « 0340042K » ne l'est pas.
 */
export function controlerUai(v: string): { ok: true; uai: string } | { ok: false; erreur: string } {
  const uai = nettoyerUai(v)
  if (!/^\d{7}[A-Z]$/.test(uai)) return { ok: false, erreur: 'Le numéro UAI compte 7 chiffres et 1 lettre.' }
  if (LETTRES_UAI[Number(uai.slice(0, 7)) % 23] !== uai[7]) return { ok: false, erreur: 'La lettre ne correspond pas aux chiffres. Vérifiez le numéro sur les documents du rectorat.' }
  return { ok: true, uai }
}

/* ------------------------------------------------------------------ */
/* Domaine de l'établissement                                           */
/* ------------------------------------------------------------------ */

/** Messageries grand public : jamais un domaine d'établissement. */
const MESSAGERIES = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr', 'live.fr', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.fr', 'icloud.com', 'me.com', 'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'neuf.fr', 'laposte.net',
  'bbox.fr', 'aol.com', 'gmx.fr', 'gmx.com', 'protonmail.com', 'proton.me',
])

/** Domaines partagés par tout un réseau : seule l'adresse exacte de l'établissement compte. */
const PARTAGE = /^ac-[a-z-]+\.fr$/

function domaineEnregistre(hote: string): string {
  const parties = hote.toLowerCase().replace(/^www\./, '').split('.').filter(Boolean)
  if (parties.length <= 2) return parties.join('.')
  const deuxieme = parties[parties.length - 2]!
  const n = ['gouv', 'asso', 'com', 'co', 'ac'].includes(deuxieme) && parties[parties.length - 1]!.length === 2 ? 3 : 2
  return parties.slice(-n).join('.')
}

export type Domaines = { domaines: string[]; adresses: string[] }

/**
 * Les domaines d'un établissement, d'après ses adresses publiées et son site.
 * Un domaine académique (`ac-toulouse.fr`) ou une messagerie ne valent que
 * pour l'adresse exacte.
 */
export function domainesDe(source: { emails: string[]; siteWeb: string | null }): Domaines {
  const domaines = new Set<string>()
  const adresses = new Set<string>()
  for (const e of source.emails) {
    const adresse = e.trim().toLowerCase()
    const hote = adresse.split('@')[1]
    if (!hote) continue
    adresses.add(adresse)
    if (MESSAGERIES.has(hote) || PARTAGE.test(hote)) continue
    domaines.add(domaineEnregistre(hote))
  }
  if (source.siteWeb) {
    try {
      const hote = new URL(source.siteWeb).hostname
      const d = domaineEnregistre(hote)
      if (!PARTAGE.test(d) && !MESSAGERIES.has(d) && !/(^|\.)mon-ent-|\.ent\.|wordpress\.com$|wixsite\.com$|free\.fr$/.test(hote)) domaines.add(d)
    } catch {
      // Site mal saisi dans le CMS : on s'en passe.
    }
  }
  return { domaines: [...domaines], adresses: [...adresses] }
}

/** L'adresse du compte est-elle sur le domaine de l'établissement ? */
export function adresseReconnue(email: string, d: Domaines): boolean {
  const adresse = email.trim().toLowerCase()
  if (d.adresses.includes(adresse)) return true
  const hote = adresse.split('@')[1]
  if (!hote || MESSAGERIES.has(hote) || PARTAGE.test(hote)) return false
  return d.domaines.some((dom) => hote === dom || hote.endsWith(`.${dom}`))
}

/** Le domaine à montrer à la personne (OAT) : celui qui marcherait. */
export function domaineAttendu(d: Domaines): string | null {
  return d.domaines[0] ?? d.adresses[0]?.split('@')[1] ?? null
}

/* ------------------------------------------------------------------ */
/* Ce que l'établissement déclare                                       */
/* ------------------------------------------------------------------ */

export const VOIES = [
  { code: 'initiale', libelle: 'Formation initiale' },
  { code: 'apprentissage', libelle: 'Apprentissage' },
  { code: 'continue', libelle: 'Formation continue' },
] as const
export type Voie = (typeof VOIES)[number]['code']

/** Niveau du diplôme, tel que les candidats le lisent. */
export const NIVEAUX = ['CAP', 'Bac', 'Bac + 2', 'Bac + 3', 'Bac + 5', 'Bac + 6'] as const

export const SOINS_CENTRE = [
  'Soins courants',
  'Prothèses',
  'Orthodontie',
  'Chirurgie orale',
  'Parodontologie',
  'Enfants',
  'Patients en situation de handicap',
  'Urgences',
] as const

export const JOURS_CENTRE = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const

const texte = (max: number) => z.string().trim().max(max)
const ident = z.string().trim().min(1).max(40)

/** L'intitulé d'un diplôme tel qu'on l'affiche : « Bac+3 » devient « Bac + 3 », comme le niveau. */
export function intituleDiplome(intitule: string): string {
  return intitule.replace(/\b(bac)\s*\+\s*(\d)/gi, (_, bac: string, n: string) => `${bac} + ${n}`)
}

export const FormationDeclaree = z.object({
  id: ident,
  intitule: texte(140).min(2).transform(intituleDiplome),
  niveau: texte(20).nullable().default(null),
  duree: texte(40).nullable().default(null),
  voies: z.array(z.enum(['initiale', 'apprentissage', 'continue'])).max(3).default([]),
  /** Conditions d'accès : niveau d'entrée et prérequis. */
  acces: texte(200).nullable().default(null),
  places: z.number().int().min(1).max(2000).nullable().default(null),
  active: z.boolean().default(true),
})
export type FormationDeclaree = z.infer<typeof FormationDeclaree>

export const VoieAcces = z.object({ id: ident, titre: texte(120).min(2), detail: texte(300).default(''), quand: texte(60).default('') })
export const Cycle = z.object({ id: ident, titre: texte(80).min(1), annees: texte(60).default(''), detail: texte(300).default('') })
export const CentreSoins = z.object({
  id: ident,
  nom: texte(140).min(2),
  adresse: texte(200).default(''),
  telephone: texte(20).default(''),
  jours: z.array(z.enum(JOURS_CENTRE)).default([]),
  horaires: texte(60).default(''),
  delai: texte(60).default(''),
  soins: z.array(z.enum(SOINS_CENTRE)).default([]),
})
export type CentreSoins = z.infer<typeof CentreSoins>

/** Une photo déjà téléversée : stockage public, ou dossier local en développement. */
export const Photo = z.object({
  url: z
    .string()
    .max(500)
    .regex(/^(https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\/|\/uploads\/|\/photos\/[0-9a-f-]{36}\.jpg$)/),
  legende: texte(120).default(''),
})

export const Donnees = z.object({
  formations: z.array(FormationDeclaree).max(20).default([]),
  /** Date ISO des prochaines portes ouvertes, ou `aucune` : les deux comptent. */
  portesOuvertes: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  aucunePorteOuverte: z.boolean().default(false),
  accroche: texte(160).nullable().default(null),
  presentation: texte(800).nullable().default(null),
  galerie: z.array(Photo).max(24).default([]),
  credit: texte(120).nullable().default(null),
  droitsAttestes: z.boolean().default(false),
  /** Faculté. */
  voiesAcces: z.array(VoieAcces).max(10).default([]),
  cycles: z.array(Cycle).max(6).default([]),
  autresDiplomes: z.array(texte(140).min(2)).max(20).default([]),
  centres: z.array(CentreSoins).max(8).default([]),
  /** Dernière confirmation de chaque bloc, pour la fraîcheur. */
  confirmeLe: z.record(z.string(), z.string()).default({}),
})
export type Donnees = z.infer<typeof Donnees>

export const DONNEES_VIDES: Donnees = Donnees.parse({})

/** Lit le document stocké ; un document abîmé redevient vide plutôt que de casser la page. */
export function lireDonnees(brut: unknown): Donnees {
  const r = Donnees.safeParse(brut ?? {})
  return r.success ? r.data : DONNEES_VIDES
}

/** Les champs de fraîcheur, par bloc. */
export type Bloc = 'formations' | 'portesOuvertes' | 'presentation' | 'galerie' | 'voiesAcces' | 'cursus' | 'centres'

/* ------------------------------------------------------------------ */
/* Préremplissage                                                       */
/* ------------------------------------------------------------------ */

const NIVEAU_PAR_DIPLOME: [RegExp, string, string][] = [
  [/^bts\b/i, 'Bac + 2', 'Après le bac'],
  [/^btms\b/i, 'Bac + 2', 'Après un BTM ou un bac pro, en activité'],
  [/^btm\b/i, 'Bac', 'Après un CAP ou une seconde'],
  [/^bac pro/i, 'Bac', 'Après la troisième'],
  [/^cap\b/i, 'CAP', 'Après la troisième'],
]

const VOIES_PAR_MOT: [RegExp, Voie][] = [
  [/initiale/, 'initiale'],
  [/apprentissage|alternance/, 'apprentissage'],
  [/continue/, 'continue'],
]

function idDe(intitule: string, k: number): string {
  return (
    intitule
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || `formation-${k + 1}`
  )
}

/** Les formations d'une école telles que le contenu éditorial les liste : le point de départ d'O3a. */
export function formationsDepuisDiplomes(diplomes: DiplomeEcole[]): FormationDeclaree[] {
  const vus = new Set<string>()
  return diplomes.slice(0, 20).flatMap((d, k) => {
    let id = idDe(d.intitule, k)
    if (vus.has(id)) id = `${id}-${k + 1}`
    vus.add(id)
    const repere = NIVEAU_PAR_DIPLOME.find(([re]) => re.test(d.intitule.trim()))
    const modalite = (d.modalite ?? '').toLowerCase()
    const voies = VOIES_PAR_MOT.filter(([re]) => re.test(modalite)).map(([, v]) => v)
    const niveau = d.niveau?.trim() ? d.niveau.trim().replace(/\s*\+\s*/, ' + ') : (repere?.[1] ?? null)
    return [{ id, intitule: intituleDiplome(d.intitule.trim()).slice(0, 140), niveau, duree: d.duree?.replace(/\s*\(.*\)$/, '') || null, voies, acces: repere?.[2] ?? null, places: null, active: true }]
  })
}

/** Le diplôme d'État pour une faculté : sa seule formation initiale. */
export function formationsFaculte(diplome: string | null, duree: string | null): FormationDeclaree[] {
  return [
    {
      id: 'diplome-etat',
      intitule: diplome?.trim() || 'Diplôme d’État de docteur en chirurgie dentaire',
      niveau: 'Bac + 6',
      duree: duree?.trim() || '6 ans',
      voies: ['initiale'],
      acces: 'Après une première année de santé (PASS ou L.AS)',
      places: null,
      active: true,
    },
  ]
}

/** Les trois cycles du diplôme d'État, proposés tels quels à une faculté. */
export const CYCLES_DEFAUT: Donnees['cycles'] = [
  { id: 'dfgso', titre: 'DFGSO', annees: '2e et 3e années', detail: 'Diplôme de formation générale en sciences odontologiques' },
  { id: 'dfaso', titre: 'DFASO', annees: '4e et 5e années', detail: 'Diplôme de formation approfondie, premiers soins en centre de soins' },
  { id: 'sixieme', titre: 'Diplôme d’État', annees: '6e année', detail: 'Stage actif et soutenance de thèse' },
]

/** Une liste écrite en une phrase (« PASS ; L.AS ; passerelles ») devient des éléments. */
export function decouper(texte: string | null, max = 10): string[] {
  if (!texte) return []
  return texte
    .split(/\s*[;•]\s*|\s*,\s*(?=[A-ZÉ])/)
    .map((x) => x.replace(/\.$/, '').trim())
    .filter((x) => x.length >= 2)
    .slice(0, max)
}

/** Ce qu'une faculté retrouve au premier passage : cursus, voies d'accès et centres lus dans son contenu publié. */
export function donneesFaculte(fac: { diplome: string | null; duree: string | null; voiesAcces: string | null; autresDiplomes: string | null; centresDeSoins: string[] }, nomCentre: (s: string) => string, adresseCentre: (s: string) => string): Partial<Donnees> {
  return {
    formations: formationsFaculte(fac.diplome, fac.duree),
    cycles: CYCLES_DEFAUT,
    voiesAcces: decouper(fac.voiesAcces).map((t, k) => ({ id: `voie-${k + 1}`, titre: t.slice(0, 120), detail: '', quand: '' })),
    autresDiplomes: decouper(fac.autresDiplomes, 20).map((d) => d.slice(0, 140)),
    centres: fac.centresDeSoins.slice(0, 8).map((c, k) => ({ id: `centre-${k + 1}`, nom: nomCentre(c).slice(0, 140), adresse: adresseCentre(c).slice(0, 200), telephone: /0\d(?:[ .]?\d{2}){4}/.exec(c)?.[0] ?? '', jours: [], horaires: '', delai: '', soins: [] })),
  }
}

/* ------------------------------------------------------------------ */
/* Force de la page                                                     */
/* ------------------------------------------------------------------ */

const JOUR_MS = 86_400_000
const ageJours = (iso: string | undefined, maintenant: Date) => (iso ? (maintenant.getTime() - new Date(iso).getTime()) / JOUR_MS : Infinity)

export const actives = (d: Donnees) => d.formations.filter((f) => f.active)

/** Portes ouvertes à jour : une date à venir, ou « aucune cette année ». Une date passée expire. */
export function portesOuvertesAJour(d: Donnees, maintenant = new Date()): boolean {
  if (d.aucunePorteOuverte) return true
  if (!d.portesOuvertes) return false
  return new Date(`${d.portesOuvertes}T23:59:59`).getTime() >= maintenant.getTime()
}

/**
 * La force d'une page d'établissement (annexe 06, 100 points) : identité 30,
 * formations actives 25, conditions d'accès 15, alternance 10, portes
 * ouvertes 10, photo 10. Pour une faculté, l'alternance ne s'applique pas :
 * les centres de soins prennent ses 10 points.
 */
export function calculerForceEtablissement(d: Donnees, type: TypeEtablissement, identiteVerifiee: boolean, maintenant = new Date()): Force {
  const a = actives(d)
  const vieux = (bloc: Bloc, jours: number) => ageJours(d.confirmeLe[bloc], maintenant) >= jours
  const formationsOk = a.length > 0
  const accesOk = type === 'faculte' ? d.voiesAcces.length > 0 : formationsOk && a.every((f) => !!f.acces)
  const alternanceOk = formationsOk && a.every((f) => f.voies.length > 0)
  const centresOk = d.centres.length > 0 && d.centres.every((c) => c.telephone && c.jours.length > 0)
  const items = [
    { cle: 'identite', libelle: 'Identité vérifiée', points: identiteVerifiee ? 30 : 0, max: 30 },
    { cle: 'formations', libelle: 'Formations', points: formationsOk ? 25 : 0, max: 25, aReconfirmer: formationsOk && vieux('formations', 365) },
    { cle: 'acces', libelle: type === 'faculte' ? 'Accès aux études' : 'Conditions d’accès', points: accesOk ? 15 : 0, max: 15 },
    type === 'faculte'
      ? { cle: 'centres', libelle: 'Centres de soins', points: centresOk ? 10 : 0, max: 10 }
      : { cle: 'alternance', libelle: 'Alternance', points: alternanceOk ? 10 : 0, max: 10 },
    { cle: 'portes_ouvertes', libelle: 'Portes ouvertes', points: portesOuvertesAJour(d, maintenant) ? 10 : 0, max: 10, aReconfirmer: !!d.portesOuvertes && !portesOuvertesAJour(d, maintenant) },
    { cle: 'photo', libelle: 'Photo', points: d.galerie.length > 0 ? 10 : 0, max: 10, aReconfirmer: d.galerie.length > 0 && vieux('galerie', 730) },
  ]
  return { total: items.reduce((s, i) => s + i.points, 0), items }
}

export function libelleForce(total: number): string {
  return `${total} % · ${LIBELLE_PALIER[palierDe(total)]}`
}

/* ------------------------------------------------------------------ */
/* Missions et sections                                                 */
/* ------------------------------------------------------------------ */

export type MissionEtab = { cle: string; titre: string; duree: string; gain: number; href: string; faite: boolean }

/** Les missions, dans l'ordre où elles rapportent le plus pour le moins d'effort. */
export function missionsEtablissement(force: Force, type: TypeEtablissement): MissionEtab[] {
  const p = (cle: string) => force.items.find((i) => i.cle === cle)
  const m = (cle: string, titre: string, duree: string, href: string): MissionEtab => {
    const it = p(cle)!
    return { cle, titre, duree, gain: it.max - it.points, href, faite: it.points === it.max }
  }
  const liste =
    type === 'faculte'
      ? [
          m('acces', 'Décrire l’accès aux études', '3 min', 'acces'),
          m('centres', 'Renseigner les centres de soins', '4 min', 'soins'),
          m('portes_ouvertes', 'Annoncer les portes ouvertes', '1 min', 'page'),
          m('photo', 'Ajouter une photo', '2 min', 'galerie'),
          m('formations', 'Confirmer le cursus', '2 min', 'cursus'),
        ]
      : [
          m('acces', 'Préciser les conditions d’accès', '3 min', 'formations'),
          m('alternance', 'Indiquer les voies de chaque formation', '2 min', 'formations'),
          m('portes_ouvertes', 'Annoncer les portes ouvertes', '1 min', 'page'),
          m('photo', 'Ajouter une photo', '2 min', 'galerie'),
          m('formations', 'Activer au moins une formation', '1 min', 'formations'),
        ]
  return liste.sort((a, b) => Number(a.faite) - Number(b.faite) || b.gain - a.gain)
}

export type StatutSection = 'publiee' | 'incomplete' | 'vide' | 'auto' | 'attente'
/** `automatique` : la section vient d'une source publique ; vide, c'est qu'il n'y a pas encore de données, pas un oubli de l'établissement. */
export type Section = { cle: string; titre: string; detail: string; statut: StatutSection; source: string; href?: string; manque?: string; bientot?: boolean; automatique?: boolean }

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

/** Les sections de la page publique, dans l'ordre de lecture, avec leur état. */
export function sectionsPage(d: Donnees, type: TypeEtablissement, auto: { registres: boolean; resultats: boolean }, maintenant = new Date()): Section[] {
  const a = actives(d)
  const po = portesOuvertesAJour(d, maintenant)
  const etat = (rempli: boolean, complet: boolean): StatutSection => (!rempli ? 'vide' : complet ? 'publiee' : 'incomplete')
  const heros: Section = {
    cle: 'heros',
    titre: 'Héros',
    detail: 'Nom, statut et adresse lus au référentiel, portes ouvertes déclarées',
    statut: po ? 'publiee' : 'incomplete',
    source: 'Déclaré et registre',
    href: 'page#portes-ouvertes',
    manque: po ? undefined : d.portesOuvertes ? 'Date des portes ouvertes passée' : 'Portes ouvertes à annoncer',
  }
  const presentation: Section = {
    cle: 'presentation',
    titre: 'Présentation',
    detail: d.presentation ? `${d.presentation.length} caractères${d.accroche ? ', avec accroche' : ''}` : 'Accroche et texte de présentation',
    statut: etat(!!d.presentation, !!d.presentation && d.presentation.length >= 200),
    source: 'Déclaré',
    href: 'page#presentation',
    manque: d.presentation && d.presentation.length < 200 ? '200 caractères au moins' : undefined,
  }
  const galerie: Section = {
    cle: 'galerie',
    titre: 'Galerie',
    detail: d.galerie.length ? `${pluriel(d.galerie.length, 'photo')}${d.credit ? ', crédit renseigné' : ''}` : 'Photos des locaux et des ateliers',
    statut: etat(d.galerie.length > 0, d.galerie.length > 0 && d.droitsAttestes),
    source: 'Déclaré',
    href: 'galerie',
    manque: d.galerie.length && !d.droitsAttestes ? 'Droits à attester' : undefined,
  }
  const registres: Section = { cle: 'registres', titre: 'Registres', detail: 'UAI, statut, diplômes au RNCP', statut: auto.registres ? 'auto' : 'vide', source: 'Référentiels publics', automatique: true }
  const bientot = (cle: string, titre: string, detail: string): Section => ({ cle, titre, detail, statut: 'vide', source: 'Déclaré', bientot: true })

  if (type === 'faculte') {
    const centresComplets = d.centres.every((c) => c.telephone && c.jours.length > 0 && c.horaires)
    return [
      heros,
      presentation,
      galerie,
      { cle: 'acces', titre: 'Accès aux études', detail: d.voiesAcces.length ? pluriel(d.voiesAcces.length, 'étape') : 'Voies d’accès et calendrier', statut: etat(d.voiesAcces.length > 0, d.voiesAcces.every((v) => !!v.quand)), source: 'Déclaré', href: 'acces', manque: d.voiesAcces.some((v) => !v.quand) ? 'Période d’une étape' : undefined },
      { cle: 'cursus', titre: 'Cursus', detail: d.cycles.length ? `${pluriel(d.cycles.length, 'cycle')}, ${pluriel(d.autresDiplomes.length, 'autre diplôme')}` : 'Cycles et diplômes', statut: etat(d.cycles.length > 0, d.cycles.length > 0), source: 'Déclaré et RNCP', href: 'cursus' },
      { cle: 'internat', titre: 'Internat', detail: 'Spécialités et postes ouverts', statut: auto.resultats ? 'auto' : 'vide', source: 'Centre national de gestion', automatique: true },
      { cle: 'soins', titre: 'Se faire soigner', detail: d.centres.length ? pluriel(d.centres.length, 'centre de soins') : 'Centres de soins et rendez-vous', statut: etat(d.centres.length > 0, centresComplets), source: 'Déclaré', href: 'soins', manque: d.centres.length && !centresComplets ? 'Horaires ou téléphone d’un centre' : undefined },
      bientot('vie', 'Vie étudiante', 'Logement, restauration, transports'),
      bientot('rendez-vous', 'Rendez-vous', 'Événements datés'),
      registres,
    ]
  }
  const alternance = a.some((f) => f.voies.includes('apprentissage'))
  return [
    heros,
    presentation,
    galerie,
    {
      cle: 'formations',
      titre: 'Formations proposées',
      detail: a.length ? pluriel(a.length, 'diplôme') : 'Diplômes préparés',
      statut: etat(a.length > 0, a.every((f) => f.acces && f.voies.length && f.places)),
      source: 'Déclaré et RNCP',
      href: 'formations',
      manque: a.find((f) => !f.acces) ? 'Conditions d’accès à préciser' : a.find((f) => !f.places) ? 'Places à préciser' : !a.every((f) => f.voies.length) ? 'Voies à préciser' : undefined,
    },
    { cle: 'alternance', titre: 'Alternance', detail: alternance ? 'Au moins une formation en apprentissage' : 'Aucune formation en apprentissage déclarée', statut: etat(a.length > 0, alternance), source: 'Déclaré', href: 'formations' },
    { cle: 'resultats', titre: 'Réussite et insertion', detail: 'Résultats aux examens, InserJeunes', statut: auto.resultats ? 'auto' : 'vide', source: 'Ministère de l’Éducation nationale', automatique: true },
    bientot('admission', 'Admission', 'Étapes de sélection et attentes'),
    bientot('couts', 'Coûts et aides', 'Frais, équipement, aides'),
    registres,
  ]
}

/** Une ligne courte par formation : « Bac + 2 · 2 ans · alternance possible ». */
export function resumeFormation(f: FormationDeclaree): string {
  const voies = f.voies.includes('apprentissage') ? 'alternance possible' : f.voies.length ? VOIES.filter((v) => f.voies.includes(v.code)).map((v) => v.libelle.toLowerCase()).join(', ') : null
  return [f.niveau, f.duree, voies].filter(Boolean).join(' · ')
}

/** « 6 février 2027 ». */
export function dateLongue(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
}

/** Le libellé d'état d'une section, quand il dit mieux que la pastille générique : ce qui manque, ou l'absence de données publiques. */
export function libelleSection(s: Section): string | undefined {
  if (s.automatique && s.statut === 'vide') return 'Pas encore de données'
  if (s.cle === 'formations' && s.statut === 'incomplete') return s.manque
  return undefined
}
