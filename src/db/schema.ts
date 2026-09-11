import { sql } from 'drizzle-orm'
import { pgTable, text, boolean, integer, real, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { point4326 } from './columns'

export const regions = pgTable('regions', {
  code: text('code').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull().unique(),
})

export const departements = pgTable('departements', {
  code: text('code').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull().unique(),
  regionCode: text('region_code').notNull().references(() => regions.code),
})

export const communes = pgTable('communes', {
  codeInsee: text('code_insee').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull(),
  departementCode: text('departement_code').notNull().references(() => departements.code),
  codesPostaux: text('codes_postaux').array().notNull().default([]),
  population: integer('population'),
  centre: point4326('centre'),
  /**
   * Les arrondissements municipaux de Paris, Lyon et Marseille sont stockés ici
   * au même titre que les communes : c'est leur code que l'ANS porte dans les
   * adresses d'exercice (75116, 13208...), et non celui de la commune mère.
   * Sans eux, plusieurs milliers de lieux d'exercice auraient une clé étrangère
   * orpheline. L'API géo ne les renvoie pas dans la liste générale, il faut la
   * requête `?type=arrondissement-municipal`.
   */
  type: text('type', { enum: ['commune', 'arrondissement'] }).notNull().default('commune'),
  /** Commune mère d'un arrondissement, nulle pour une commune ordinaire. */
  communeParenteCode: text('commune_parente_code'),
  /**
   * Nom réduit à sa forme cherchable : minuscules, sans accents ni ponctuation.
   *
   * Permet une autocomplétion tolérante aux fautes et aux accents manquants
   * (« bordeau », « chalon sur saone ») avec un index trigramme. L'alternative
   * aurait été l'extension `unaccent`, dont la fonction n'est pas immuable et
   * ne peut donc pas être indexée sans contournement.
   *
   * Calculée par `sync-geo`, jamais saisie.
   */
  nomRecherche: text('nom_recherche'),
}, (t) => [
  uniqueIndex('communes_dep_slug').on(t.departementCode, t.slug),
  index('communes_parente').on(t.communeParenteCode),
  index('communes_nom_trgm').using('gin', t.nom.op('gin_trgm_ops')),
  index('communes_recherche_trgm').using('gin', t.nomRecherche.op('gin_trgm_ops')),
])


/**
 * Empreinte du fichier ou de la réponse d'API qui a alimenté un run.
 *
 * Sert à deux choses : ne pas relancer un import si la source publiée n'a pas
 * changé, et pouvoir rejouer exactement un run passé quand une suppression
 * paraît douteuse.
 */
export const sourceSnapshots = pgTable('source_snapshots', {
  id: text('id').primaryKey(),
  registre: text('registre', { enum: ['ans', 'sirene', 'geo', 'ban', 'import'] }).notNull(),
  url: text('url'),
  publieLe: timestamp('publie_le', { withTimezone: true }),
  tailleOctets: integer('taille_octets'),
  sha256: text('sha256'),
  telechargeLe: timestamp('telecharge_le', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('source_snapshots_registre').on(t.registre, t.telechargeLe),
])

export const praticiens = pgTable('praticiens', {
  id: text('id').primaryKey(),
  profession: text('profession', { enum: ['dentiste', 'prothesiste'] }).notNull(),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  raisonSociale: text('raison_sociale'),
  rpps: text('rpps').unique(),
  adeli: text('adeli'),
  siren: text('siren'),
  siret: text('siret'),
  statutVerification: text('statut_verification', { enum: ['verifie', 'partiel', 'non_verifie'] }).notNull().default('non_verifie'),
  /** Snapshot de la source qui a produit ou mis à jour cette ligne. */
  sourceSnapshotId: text('source_snapshot_id').references(() => sourceSnapshots.id, { onDelete: 'set null' }),
  /**
   * Fiche indexable par les moteurs : présente dans les sitemaps, sans balise
   * noindex. Calculée par les jobs de synchronisation, jamais saisie à la main.
   * Fausse notamment pour un praticien sans adresse exploitable et pour un
   * laboratoire dont l'identité n'est pas confirmée par un registre.
   */
  indexable: boolean('indexable').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [
  index('praticiens_profession').on(t.profession),
  // Sert les sitemaps et les listes : on filtre toujours par profession et par
  // indexabilité, sur les seules fiches vivantes.
  index('praticiens_indexables').on(t.profession, t.indexable).where(sql`${t.deletedAt} is null`),
])

export const lieuxExercice = pgTable('lieux_exercice', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  adresseLigne: text('adresse_ligne'),
  codePostal: text('code_postal'),
  codeInsee: text('code_insee').references(() => communes.codeInsee),
  position: point4326('position'),
  telephoneOfficiel: text('telephone_officiel'),
  principal: boolean('principal').notNull().default(false),
  /** Vrai quand la position vient du centroïde de la commune, faute d'adresse géocodable. */
  positionApproximative: boolean('position_approximative').notNull().default(false),
  /** Score de confiance renvoyé par l'API Adresse, entre 0 et 1. */
  scoreGeocodage: real('score_geocodage'),
}, (t) => [
  index('lieux_position_gist').using('gist', t.position),
  index('lieux_commune').on(t.codeInsee),
])

/**
 * Une ligne par exécution de job de synchronisation.
 *
 * Le statut `bloque` matérialise le garde-fou de l'architecture : un run qui
 * supprimerait plus de 5 % de l'effectif n'applique rien et attend une
 * validation manuelle. C'est la protection contre un fichier source tronqué.
 */
export const syncRuns = pgTable('sync_runs', {
  id: text('id').primaryKey(),
  registre: text('registre', { enum: ['ans', 'sirene', 'geo', 'ban', 'import'] }).notNull(),
  sourceSnapshotId: text('source_snapshot_id').references(() => sourceSnapshots.id, { onDelete: 'set null' }),
  statut: text('statut', { enum: ['en_cours', 'termine', 'bloque', 'echec'] }).notNull().default('en_cours'),
  demarreLe: timestamp('demarre_le', { withTimezone: true }).defaultNow().notNull(),
  termineLe: timestamp('termine_le', { withTimezone: true }),
  lignesLues: integer('lignes_lues').notNull().default(0),
  inserees: integer('inserees').notNull().default(0),
  modifiees: integer('modifiees').notNull().default(0),
  supprimees: integer('supprimees').notNull().default(0),
  erreurs: jsonb('erreurs').$type<{ message: string; contexte?: string }[]>(),
}, (t) => [
  index('sync_runs_registre').on(t.registre, t.demarreLe),
])

/**
 * Trace de confrontation d'un praticien à un registre officiel.
 *
 * Une ligne par praticien et par registre, réécrite à chaque vérification.
 * `cesse` vaut pour un laboratoire dont Sirene ne montre plus d'établissement
 * ouvert, `radie` pour un praticien sorti du RPPS.
 */
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  registre: text('registre', { enum: ['rpps', 'adeli', 'sirene'] }).notNull(),
  statut: text('statut', { enum: ['verifie', 'introuvable', 'radie', 'cesse'] }).notNull(),
  verifieLe: timestamp('verifie_le', { withTimezone: true }).defaultNow().notNull(),
  payloadHash: text('payload_hash'),
  syncRunId: text('sync_run_id').references(() => syncRuns.id, { onDelete: 'set null' }),
}, (t) => [
  uniqueIndex('verifications_praticien_registre').on(t.praticienId, t.registre),
  index('verifications_statut').on(t.statut),
])

/**
 * Redirections 301 permanentes, lues par le middleware.
 *
 * Alimentée quand un praticien change de commune : l'ancienne URL hiérarchique
 * doit continuer de mener à la fiche, sans quoi la bascule coûterait des
 * positions acquises.
 */
export const redirections = pgTable('redirections', {
  id: text('id').primaryKey(),
  ancienChemin: text('ancien_chemin').notNull(),
  nouveauChemin: text('nouveau_chemin').notNull(),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('redirections_ancien_chemin').on(t.ancienChemin),
])
