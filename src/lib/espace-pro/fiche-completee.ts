import { z } from 'zod'
import { JOURS, type Horaires, type Jour, type Plage } from '@/db/schema'
import { estPersonne, type Profession } from '@/lib/annuaire/types'

/**
 * Vocabulaire et validation de ce que le praticien complète sur sa fiche.
 *
 * Partagé entre le formulaire, la Server Action qui enregistre et la fiche
 * publique qui affiche : un code qui n'est pas ici n'existe pas, et un libellé
 * n'est écrit qu'une fois.
 */

export { JOURS }
export type { Horaires, Jour, Plage }

export const LIBELLE_JOUR: Record<Jour, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
}

/**
 * Langues proposées, codes ISO 639-1.
 *
 * La liste couvre les langues les plus parlées en France d'après l'INSEE, plus
 * la langue des signes française, qui n'a pas de code ISO 639-1 et porte le
 * code à trois lettres. Le français est présent pour que la liste soit
 * complète, pas parce qu'il serait en doute.
 */
export const LANGUES = [
  { code: 'fr', libelle: 'Français' },
  { code: 'en', libelle: 'Anglais' },
  { code: 'es', libelle: 'Espagnol' },
  { code: 'de', libelle: 'Allemand' },
  { code: 'it', libelle: 'Italien' },
  { code: 'pt', libelle: 'Portugais' },
  { code: 'ar', libelle: 'Arabe' },
  { code: 'tr', libelle: 'Turc' },
  { code: 'ro', libelle: 'Roumain' },
  { code: 'pl', libelle: 'Polonais' },
  { code: 'ru', libelle: 'Russe' },
  { code: 'zh', libelle: 'Chinois' },
  { code: 'vi', libelle: 'Vietnamien' },
  { code: 'nl', libelle: 'Néerlandais' },
  { code: 'sfs', libelle: 'Langue des signes française' },
] as const
export type CodeLangue = (typeof LANGUES)[number]['code']

export const ACCESSIBILITE = [
  { code: 'pmr', libelle: 'Accessible aux personnes à mobilité réduite' },
  { code: 'plain_pied', libelle: 'Cabinet de plain-pied' },
  { code: 'ascenseur', libelle: 'Ascenseur' },
  { code: 'parking', libelle: 'Stationnement à proximité' },
  { code: 'transports', libelle: 'Desservi par les transports en commun' },
  { code: 'boucle_magnetique', libelle: 'Boucle magnétique pour malentendants' },
] as const
export type CodeAccessibilite = (typeof ACCESSIBILITE)[number]['code']

export const PAIEMENTS = [
  { code: 'carte', libelle: 'Carte bancaire' },
  { code: 'especes', libelle: 'Espèces' },
  { code: 'cheque', libelle: 'Chèque' },
  { code: 'virement', libelle: 'Virement' },
] as const
export type CodePaiement = (typeof PAIEMENTS)[number]['code']

export const TIERS_PAYANT = [
  { code: 'aucun', libelle: 'Pas de tiers payant' },
  { code: 'securite_sociale', libelle: 'Tiers payant sur la part Sécurité sociale' },
  { code: 'securite_sociale_et_mutuelle', libelle: 'Tiers payant intégral, Sécurité sociale et mutuelle' },
] as const
export type CodeTiersPayant = (typeof TIERS_PAYANT)[number]['code']

/**
 * Orientations d'exercice, déclarées par le praticien.
 *
 * Rien de tout cela n'est une spécialité au sens de l'Ordre : implantologie,
 * endodontie ou rhinologie n'ont pas de code au RPPS, où le praticien reste
 * omnipraticien ou spécialiste de sa discipline. Seul le praticien peut les
 * dire, sur une fiche revendiquée, dans une liste fermée pour qu'elles
 * servent de filtre. Liste d'usage par profession, voir
 * `docs/Spécialités des praticiens.md`. Un code partagé entre professions,
 * l'implantologie par exemple, n'est écrit qu'une fois.
 *
 * `libelle` est la forme longue, pour la fiche ; `court` tient dans une
 * pastille de filtre.
 */
export const ORIENTATIONS: readonly { code: string; libelle: string; court: string; professions: readonly Profession[] }[] = [
  // Chirurgiens-dentistes
  { code: 'implantologie', libelle: 'Implantologie', court: 'Implantologie', professions: ['dentiste', 'stomatologue'] },
  { code: 'chirurgie_pre_implantaire', libelle: 'Chirurgie pré-implantaire (greffes osseuses, sinus lift)', court: 'Chirurgie pré-implantaire', professions: ['dentiste'] },
  { code: 'parodontologie', libelle: 'Parodontologie', court: 'Parodontologie', professions: ['dentiste'] },
  { code: 'endodontie', libelle: 'Endodontie', court: 'Endodontie', professions: ['dentiste'] },
  { code: 'prothese', libelle: 'Prothèse fixe et amovible, réhabilitation complète', court: 'Prothèses', professions: ['dentiste'] },
  { code: 'esthetique', libelle: 'Dentisterie esthétique (facettes, blanchiment)', court: 'Esthétique', professions: ['dentiste'] },
  { code: 'pedodontie', libelle: 'Pédodontie', court: 'Pédodontie', professions: ['dentiste'] },
  { code: 'occlusodontie', libelle: 'Occlusodontie et dysfonctions de l’ATM', court: 'Occlusodontie et ATM', professions: ['dentiste'] },
  { code: 'aligneurs', libelle: 'Orthodontie par aligneurs', court: 'Aligneurs', professions: ['dentiste'] },
  { code: 'gerodontologie', libelle: 'Gérodontologie', court: 'Gérodontologie', professions: ['dentiste'] },
  { code: 'sommeil', libelle: 'Sommeil et apnée (orthèses d’avancée mandibulaire)', court: 'Sommeil et apnée', professions: ['dentiste', 'orl'] },
  { code: 'sedation', libelle: 'Sédation, hypnose, soins aux patients handicapés', court: 'Sédation et hypnose', professions: ['dentiste'] },
  // Chirurgiens maxillo-faciaux
  { code: 'orthognathique', libelle: 'Chirurgie orthognathique', court: 'Orthognathique', professions: ['maxillo_facial'] },
  { code: 'implantologie_complexe', libelle: 'Implantologie complexe (implants zygomatiques, reconstructions osseuses)', court: 'Implantologie complexe', professions: ['maxillo_facial'] },
  { code: 'traumatologie_faciale', libelle: 'Traumatologie faciale', court: 'Traumatologie faciale', professions: ['maxillo_facial'] },
  { code: 'cancerologie_face', libelle: 'Cancérologie et chirurgie reconstructrice de la face', court: 'Cancérologie et reconstruction', professions: ['maxillo_facial'] },
  { code: 'plastique_face', libelle: 'Chirurgie plastique et esthétique de la face', court: 'Plastique de la face', professions: ['maxillo_facial', 'orl'] },
  { code: 'malformations', libelle: 'Malformations : fentes labio-palatines, chirurgie craniofaciale', court: 'Malformations', professions: ['maxillo_facial'] },
  { code: 'atm', libelle: 'Chirurgie de l’ATM', court: 'ATM', professions: ['maxillo_facial'] },
  // Stomatologues
  { code: 'chirurgie_buccale', libelle: 'Chirurgie buccale (dents de sagesse, kystes)', court: 'Chirurgie buccale', professions: ['stomatologue'] },
  { code: 'muqueuse_buccale', libelle: 'Pathologie de la muqueuse buccale', court: 'Muqueuse buccale', professions: ['stomatologue'] },
  { code: 'odf', libelle: 'Orthopédie dento-faciale', court: 'Orthopédie dento-faciale', professions: ['stomatologue'] },
  // ORL
  { code: 'otologie', libelle: 'Otologie (oreille, implants cochléaires)', court: 'Otologie', professions: ['orl'] },
  { code: 'audiologie', libelle: 'Audiologie', court: 'Audiologie', professions: ['orl'] },
  { code: 'rhinologie', libelle: 'Rhinologie (nez, sinus)', court: 'Rhinologie', professions: ['orl'] },
  { code: 'laryngologie', libelle: 'Laryngologie', court: 'Laryngologie', professions: ['orl'] },
  { code: 'phoniatrie', libelle: 'Phoniatrie (voix, déglutition)', court: 'Phoniatrie', professions: ['orl'] },
  { code: 'cervico_faciale', libelle: 'Chirurgie cervico-faciale (thyroïde, glandes salivaires)', court: 'Cervico-faciale', professions: ['orl'] },
  { code: 'cancerologie_tete_cou', libelle: 'Cancérologie de la tête et du cou', court: 'Cancérologie tête et cou', professions: ['orl'] },
  { code: 'orl_pediatrique', libelle: 'ORL pédiatrique', court: 'ORL pédiatrique', professions: ['orl'] },
]
export type CodeOrientation = (typeof ORIENTATIONS)[number]['code']

/** Les orientations qu'une profession peut déclarer, dans l'ordre de la liste. Aucune pour un laboratoire. */
export function orientationsDe(profession: Profession) {
  return ORIENTATIONS.filter((o) => o.professions.includes(profession))
}

/**
 * Nombre d'étapes du parcours d'accueil : quatre pour tous, cinq pour les
 * personnes, qui déclarent en plus leurs orientations.
 */
export const NB_ETAPES = 5
export function nombreEtapes(profession: Profession): number {
  return estPersonne(profession) ? NB_ETAPES : NB_ETAPES - 1
}
export const ETAPES = [
  { numero: 1, titre: 'Horaires', resume: 'Vos jours et heures d’ouverture' },
  { numero: 2, titre: 'Langues', resume: 'Les langues parlées au cabinet' },
  { numero: 3, titre: 'Accessibilité', resume: 'L’accès à vos locaux' },
  { numero: 4, titre: 'Paiement', resume: 'Modes de paiement et tiers payant' },
  { numero: 5, titre: 'Orientations', resume: 'Ce que vous pratiquez le plus, au-delà de votre spécialité' },
] as const

const heure = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Heure attendue au format HH:MM')

const plage = z
  .object({ debut: heure, fin: heure })
  .refine((p) => p.debut < p.fin, { message: 'L’heure de fin doit suivre l’heure de début' })

const plagesDuJour = z
  .array(plage)
  .max(2, 'Deux plages par jour au plus')
  .refine((plages) => plages.length < 2 || plages[0].fin <= plages[1].debut, {
    message: 'Les deux plages ne peuvent pas se chevaucher',
  })

// Strict : un jour inconnu est une erreur, pas une clé à ignorer en silence.
export const schemaHoraires = z
  .object(
    Object.fromEntries(JOURS.map((j) => [j, plagesDuJour.optional()])) as Record<Jour, z.ZodOptional<typeof plagesDuJour>>,
  )
  .strict()

const codesParmi = <T extends string>(codes: readonly T[]) =>
  z.array(z.enum(codes as unknown as [T, ...T[]])).max(codes.length)

export const schemaLangues = z.object({
  langues: codesParmi(LANGUES.map((l) => l.code)),
})

export const schemaAccessibilite = z.object({
  accessibilite: codesParmi(ACCESSIBILITE.map((a) => a.code)),
  commentaire: z.string().trim().max(300, 'Trois cents caractères au plus').optional().default(''),
})

export const schemaPaiement = z.object({
  paiements: codesParmi(PAIEMENTS.map((p) => p.code)),
  tiersPayant: z.enum(TIERS_PAYANT.map((t) => t.code) as unknown as [CodeTiersPayant, ...CodeTiersPayant[]]).nullable(),
})

/** Les orientations d'une profession, et d'elle seule : un ORL ne déclare pas d'endodontie. */
export function schemaOrientations(profession: Profession) {
  const codes = orientationsDe(profession).map((o) => o.code)
  return z.object({
    orientations: codes.length ? codesParmi(codes) : z.array(z.never()).max(0),
  })
}

export type DonneesHoraires = z.infer<typeof schemaHoraires>
export type DonneesLangues = z.infer<typeof schemaLangues>
export type DonneesAccessibilite = z.infer<typeof schemaAccessibilite>
export type DonneesPaiement = z.infer<typeof schemaPaiement>

/** Tout ce qu'un praticien a complété, tel que lu en base et affiché. */
export type FicheCompletee = {
  horaires: Horaires | null
  langues: string[]
  accessibilite: string[]
  accessibiliteCommentaire: string | null
  paiements: string[]
  tiersPayant: CodeTiersPayant | null
  /** Codes d'orientation, voir `ORIENTATIONS`. */
  orientations: string[]
  etape: number
  termineLe: string | null
  majLe: string
}

/** Vrai si au moins une information a été renseignée, quel que soit l'avancement du parcours. */
export function aDuContenu(f: FicheCompletee | null): f is FicheCompletee {
  if (!f) return false
  const horaires = f.horaires ? Object.values(f.horaires).some((p) => p && p.length > 0) : false
  return horaires || f.langues.length > 0 || f.accessibilite.length > 0 || f.paiements.length > 0 || f.tiersPayant !== null || f.orientations.length > 0
}

export function libelle<T extends string>(liste: readonly { code: T; libelle: string }[], code: string): string {
  return liste.find((e) => e.code === code)?.libelle ?? code
}
