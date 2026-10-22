/**
 * Le profil candidat, partie pure : situations, qualifications, critères de
 * recherche, formation, étapes du parcours de bienvenue (SE1 à SE5) et
 * aperçu du profil tel qu'un recruteur le voit. Importé par les pages, les
 * actions et les tests.
 */
import { z } from 'zod'
import { CODES_CONTRAT, LIBELLE_CONTRAT, type CodeContrat, type CodeMetier } from './metiers'

export const SITUATIONS = [
  { cle: 'assistant', libelle: 'Assistant(e) dentaire', detail: 'Au fauteuil, stérilisation, accueil', metier: 'assistant_dentaire' },
  { cle: 'secretaire', libelle: 'Secrétaire ou assistant(e) de gestion', detail: 'Accueil, agenda, facturation', metier: 'secretaire' },
  { cle: 'prothesiste', libelle: 'Prothésiste salarié(e)', detail: 'En laboratoire', metier: 'prothesiste' },
  { cle: 'aide', libelle: 'Aide dentaire', detail: 'Hygiène, stérilisation, préparation', metier: 'aide_dentaire' },
  { cle: 'etudiant', libelle: 'Étudiant(e)', detail: 'Alternance, stage, job étudiant', metier: null },
] as const satisfies readonly { cle: string; libelle: string; detail: string; metier: CodeMetier | null }[]

export type Situation = (typeof SITUATIONS)[number]['cle']
export const CODES_SITUATION = SITUATIONS.map((s) => s.cle) as [Situation, ...Situation[]]

export function situationDe(cle: string | null | undefined) {
  return SITUATIONS.find((s) => s.cle === cle) ?? null
}

/** SE3 : titre ou diplôme du métier, en formation, ou autre parcours. */
export const QUALIFICATIONS = ['titre', 'formation', 'autre'] as const
export type Qualification = (typeof QUALIFICATIONS)[number]

const TITRE: Record<Exclude<Situation, 'etudiant'>, { choix: string; qualifie: string }> = {
  assistant: { choix: 'Titre d’assistant(e) dentaire', qualifie: 'Assistant(e) dentaire qualifié(e)' },
  secretaire: { choix: 'Diplôme de secrétaire médical(e) ou d’assistant(e) de gestion', qualifie: 'Secrétaire ou assistant(e) de gestion diplômé(e)' },
  prothesiste: { choix: 'Diplôme de prothésiste dentaire', qualifie: 'Prothésiste dentaire diplômé(e)' },
  aide: { choix: 'Expérience d’aide dentaire', qualifie: 'Aide dentaire' },
}

/** Le libellé d'un choix de qualification, à l'étape SE3. */
export function libelleChoixQualification(situation: Situation, q: Qualification): string {
  if (q === 'formation') return 'En formation'
  if (q === 'autre') return 'Autre parcours'
  return situation === 'etudiant' ? 'En formation' : TITRE[situation].choix
}

/** Ce que le recruteur lit sous le nom : « Assistant(e) dentaire qualifié(e) », « Étudiant(e) en BTS… ». */
export function libelleQualification(p: { situation: Situation; qualification: string | null; formation?: Formation | null }): string {
  const s = situationDe(p.situation)
  if (p.situation === 'etudiant') return p.formation?.cursus ? `Étudiant(e), ${p.formation.cursus}${p.formation.annee ? `, ${p.formation.annee}` : ''}` : 'Étudiant(e)'
  if (p.qualification === 'titre') return TITRE[p.situation].qualifie
  if (p.qualification === 'formation') return `${s?.libelle ?? 'Candidat(e)'}, en formation`
  return s?.libelle ?? 'Candidat(e)'
}

export const DISPONIBILITES = ['Dès maintenant', 'Sous un mois', 'Préavis d’un mois', 'Préavis de deux ou trois mois', 'Plus tard dans l’année'] as const
export const RAYONS_CANDIDAT = [5, 10, 15, 20, 30, 50] as const
export const CONTRATS_CANDIDAT: CodeContrat[] = ['cdi', 'cdd', 'remplacement', 'alternance', 'stage']

export const Criteres = z.object({
  contrats: z.array(z.enum(CODES_CONTRAT)).default([]),
  temps: z.enum(['tous', 'plein', 'partiel']).default('tous'),
  commune: z.string().regex(/^[0-9AB]{5}$/).optional(),
  communeNom: z.string().max(80).optional(),
  rayonKm: z.number().int().min(5).max(50).default(15),
  disponibilite: z.string().max(80).optional(),
})
export type Criteres = z.infer<typeof Criteres>

export function lireCriteres(v: unknown): Criteres {
  const r = Criteres.safeParse(v ?? {})
  return r.success ? r.data : Criteres.parse({})
}

/** SE3E : l'école (fiche établissement), le cursus, l'année, ce qui est recherché. */
export const RECHERCHES_ETUDIANT = [
  { cle: 'alternance', libelle: 'Alternance' },
  { cle: 'stage', libelle: 'Stage' },
  { cle: 'job', libelle: 'Job étudiant' },
] as const
export const ANNEES = ['1re année', '2e année', '3e année', '4e année', '5e année et plus'] as const

export const Formation = z.object({
  ecole: z.string().max(200).optional(),
  ecoleNom: z.string().max(200).optional(),
  cursus: z.string().max(120).optional(),
  annee: z.string().max(40).optional(),
  recherche: z.array(z.enum(['alternance', 'stage', 'job'])).default([]),
})
export type Formation = z.infer<typeof Formation>

export function lireFormation(v: unknown): Formation | null {
  if (!v) return null
  const r = Formation.safeParse(v)
  return r.success ? r.data : null
}

export const Experience = z.object({ poste: z.string().trim().min(1).max(80), structure: z.string().trim().max(120).default(''), periode: z.string().trim().max(60).default('') })
export type Experience = z.infer<typeof Experience>
export const EXPERIENCES_MAX = 5

export function lireExperiences(v: unknown): Experience[] {
  const r = z.array(Experience).safeParse(v ?? [])
  return r.success ? r.data.slice(0, EXPERIENCES_MAX) : []
}

/** Les compétences proposées, selon la situation ; la personne coche les siennes. */
export const COMPETENCES: Record<Situation, string[]> = {
  assistant: ['Assistance au fauteuil', 'Implantologie', 'Stérilisation et traçabilité', 'Radioprotection', 'Accueil et agenda', 'Devis et tiers payant', 'Orthodontie', 'Parodontologie'],
  secretaire: ['Accueil et agenda', 'Devis et tiers payant', 'Facturation', 'Logiciel de gestion du cabinet', 'Relances et impayés', 'Gestion des stocks'],
  prothesiste: ['Prothèse fixe', 'Prothèse amovible', 'Céramique', 'CFAO', 'Implantologie', 'Orthodontie'],
  aide: ['Stérilisation et traçabilité', 'Hygiène des locaux', 'Préparation des plateaux', 'Gestion des stocks'],
  etudiant: ['Coulée et modèles', 'Cire et montage', 'Initiation CFAO', 'Assistance au fauteuil', 'Stérilisation', 'Accueil des patients'],
}

export type Visibilite = 'visible' | 'anonyme' | 'discret'

export const VISIBILITES: { cle: Visibilite; libelle: string; detail: string }[] = [
  { cle: 'visible', libelle: 'Visible des recruteurs vérifiés', detail: 'Ils voient votre prénom, l’initiale de votre nom, votre qualification et vos critères, et peuvent vous inviter à postuler.' },
  { cle: 'anonyme', libelle: 'Anonymisé', detail: 'Ils voient votre qualification et vos critères, sans nom ni photo : seulement vos initiales.' },
  { cle: 'discret', libelle: 'Discret', detail: 'Aucun recruteur ne voit votre profil. Vous postulez vous-même, et seul le recruteur de l’offre voit votre candidature.' },
]

export function lireVisibilite(v: string | null | undefined): Visibilite {
  return v === 'anonyme' || v === 'discret' ? v : 'visible'
}

/** Le parcours de bienvenue : la formation remplace la qualification pour un étudiant. */
export function etapesBienvenue(situation: Situation | null): ('situation' | 'recherche' | 'qualification' | 'formation' | 'visibilite' | 'pret')[] {
  return ['situation', 'recherche', situation === 'etudiant' ? 'formation' : 'qualification', 'visibilite', 'pret']
}

export const TITRES_ETAPE: Record<ReturnType<typeof etapesBienvenue>[number], string> = {
  situation: 'Votre situation',
  recherche: 'Ce que vous recherchez',
  qualification: 'Votre qualification',
  formation: 'Votre formation',
  visibilite: 'Visibilité du profil',
  pret: 'Votre profil est prêt',
}

/** Les puces du profil vu par un recruteur : contrats, temps, disponibilité. */
export function pucesCriteres(c: Criteres): string[] {
  return [...c.contrats.map((x) => LIBELLE_CONTRAT[x]), ...(c.temps === 'plein' ? ['Temps plein'] : c.temps === 'partiel' ? ['Temps partiel'] : []), ...(c.disponibilite ? [c.disponibilite] : [])]
}

/** La mobilité, telle qu'on l'affiche : « Bordeaux et 15 km autour ». */
export function mobilite(c: Criteres): string | null {
  return c.communeNom ? `${c.communeNom} et ${c.rayonKm} km autour` : null
}

/* ------------------------------------------------------------------ */
/* Vue d'ensemble : complétude du profil et frise des candidatures     */
/* ------------------------------------------------------------------ */

type PourCompletude = { situation: Situation; qualification: string | null; criteres: Criteres; formation: Formation | null; experiences: Experience[]; competences: string[]; cv: unknown }

/**
 * La complétude du profil, en pour cent, et la prochaine chose à faire, avec
 * ce qu'elle apporte. Calculée, jamais stockée.
 */
export function completudeProfil(p: PourCompletude): { pct: number; prochaine: { titre: string; gain: number; ancre: string } | null } {
  const etudiant = p.situation === 'etudiant'
  const blocs: { fait: boolean; gain: number; titre: string; ancre: string }[] = [
    { fait: true, gain: 15, titre: 'Indiquer votre situation', ancre: '' },
    { fait: Boolean(p.criteres.commune && p.criteres.contrats.length), gain: 25, titre: 'Indiquer votre ville et les contrats recherchés', ancre: '#recherche' },
    {
      fait: etudiant ? Boolean(p.formation?.ecole || p.formation?.cursus) : Boolean(p.qualification),
      gain: 15,
      titre: etudiant ? 'Indiquer votre école et votre formation' : 'Indiquer votre qualification',
      ancre: etudiant ? '#formation' : '',
    },
    { fait: p.experiences.length > 0, gain: 15, titre: etudiant ? 'Ajouter votre parcours' : 'Ajouter vos expériences', ancre: '#experiences' },
    { fait: p.competences.length > 0, gain: 10, titre: 'Cocher vos compétences', ancre: '#competences' },
    { fait: Boolean(p.criteres.disponibilite), gain: 10, titre: 'Indiquer votre disponibilité', ancre: '#recherche' },
    { fait: Boolean(p.cv), gain: 10, titre: 'Joindre votre CV', ancre: '#cv' },
  ]
  const pct = blocs.reduce((t, b) => t + (b.fait ? b.gain : 0), 0)
  const suivant = blocs.find((b) => !b.fait)
  return { pct, prochaine: suivant ? { titre: suivant.titre, gain: suivant.gain, ancre: suivant.ancre } : null }
}

/** La frise d'une candidature, vue du candidat : Envoyée, Vue, puis Retenue ou Non retenue. */
export function etapeFrise(statut: 'nouvelle' | 'vue' | 'retenue' | 'non_retenue'): { etape: number; issue: 'retenue' | 'non' | null } {
  if (statut === 'non_retenue') return { etape: 1, issue: 'non' }
  if (statut === 'retenue') return { etape: 2, issue: 'retenue' }
  return { etape: statut === 'vue' ? 1 : 0, issue: null }
}
