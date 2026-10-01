import { sql } from 'drizzle-orm'
import { pgTable, text, boolean, integer, real, timestamp, jsonb, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { point4326 } from './columns'
import { user } from './auth-schema'

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
  profession: text('profession', { enum: ['dentiste', 'prothesiste', 'maxillo_facial', 'stomatologue', 'orl'] }).notNull(),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  raisonSociale: text('raison_sociale'),
  rpps: text('rpps').unique(),
  adeli: text('adeli'),
  siren: text('siren'),
  siret: text('siret'),
  statutVerification: text('statut_verification', { enum: ['verifie', 'partiel', 'non_verifie'] }).notNull().default('non_verifie'),
  /**
   * Civilité au registre, reprise telle quelle de la colonne « Code civilité »
   * de l'extraction ANS : `M` ou `MME`.
   *
   * Elle sert à choisir le visuel de remplacement des fiches sans photo. C'est
   * une donnée du registre, pas une déduction faite sur le prénom : un annuaire
   * qui devine le genre de ses praticiens se trompe, et se trompe visiblement.
   * Nulle pour les laboratoires, qui sont des structures et non des personnes.
   */
  civilite: text('civilite', { enum: ['M', 'MME'] }),
  /**
   * Trois informations de l'Annuaire Santé que l'import laissait tomber, et qui
   * sont les seules du fichier à décrire l'exercice plutôt que l'identité.
   *
   * - `specialite` : spécialité ordinale, sur 7 % des dentistes. C'est
   *   exactement ce qu'un patient cherche quand elle existe : un orthodontiste
   *   n'est pas un omnipraticien.
   * - `modeExercice` : libéral, salarié ou bénévole, sur 81 %.
   * - `categorieProfessionnelle` : « Civil », « Étudiant » ou « Agent public ».
   *   Le cas étudiant compte, une fiche ne doit pas laisser croire à un
   *   praticien installé.
   */
  specialite: text('specialite'),
  modeExercice: text('mode_exercice'),
  categorieProfessionnelle: text('categorie_professionnelle'),
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
  /** Numéro FINESS du site, présent quand le lieu dépend d'un établissement. */
  finess: text('finess'),
  principal: boolean('principal').notNull().default(false),
  /** Vrai quand la position vient du centroïde de la commune, faute d'adresse géocodable. */
  positionApproximative: boolean('position_approximative').notNull().default(false),
  /**
   * Ce que la position désigne réellement, repris du `result_type` de l'API
   * Adresse.
   *
   * Le score seul ne dit rien de la précision : la BAN rend volontiers 0,95
   * pour un centroïde de voie quand le numéro demandé n'existe pas dans sa
   * base. Un cabinet se retrouvait alors au milieu de sa rue, parfois à cent
   * mètres, et la fiche l'affichait comme une adresse exacte.
   *
   * - `numero` : la position est celle du numéro dans la voie ;
   * - `voie` : centroïde de la voie, le numéro est inconnu de la BAN ;
   * - `lieu_dit` : centroïde d'un lieu-dit ;
   * - `commune` : centroïde de la commune, la position est décorative.
   */
  precisionPosition: text('precision_position', { enum: ['numero', 'voie', 'lieu_dit', 'commune'] }),
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

/**
 * Demandes de revendication d'une fiche par un professionnel.
 *
 * Revendiquer ne donne pas la main sur l'identité : le nom, le numéro RPPS et
 * l'adresse restent ceux du registre, et aucune modification ne peut les
 * contredire. La revendication ouvre le droit d'ajouter ce que le registre ne
 * porte pas, horaires, langues parlées, accessibilité du cabinet.
 *
 * Une demande par praticien et par compte : la contrainte d'unicité évite
 * qu'un clic répété n'empile des demandes identiques à traiter.
 *
 * La validation elle-même reste manuelle en phase 4. Cette table n'enregistre
 * que la demande, elle ne l'accorde pas.
 */
export const revendications = pgTable('revendications', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  /**
   * Compte Better Auth à l'origine de la demande.
   *
   * En `uuid` et non en `text` : Better Auth génère des UUID, et une colonne de
   * type texte rendait toute jointure avec la table des comptes impossible,
   * Postgres refusant l'égalité entre `uuid` et `text`.
   */
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  statut: text('statut', { enum: ['en_attente', 'acceptee', 'refusee'] }).notNull().default('en_attente'),
  /**
   * Comment la qualité du demandeur a été, ou doit être, établie.
   *
   * - `manuelle` : le demandeur explique, et quelqu'un vérifie à la main.
   * - `pro_sante_connect` : le demandeur s'est authentifié avec sa carte CPS ou
   *   son e-CPS auprès de l'Agence du Numérique en Santé, qui nous a renvoyé
   *   son numéro RPPS. La demande est alors acceptée sans intervention, le
   *   registre lui-même ayant répondu.
   */
  methode: text('methode', { enum: ['manuelle', 'pro_sante_connect'] }).notNull().default('manuelle'),
  /** Identifiant national renvoyé par Pro Santé Connect, préfixe de type compris. */
  identifiantPsc: text('identifiant_psc'),
  /** Numéro RPPS certifié par Pro Santé Connect, tel que comparé à la fiche. */
  rppsVerifie: text('rpps_verifie'),
  /** Ce que le demandeur écrit pour justifier sa qualité. */
  message: text('message'),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  traiteLe: timestamp('traite_le', { withTimezone: true }),
}, (t) => [
  uniqueIndex('revendications_praticien_compte').on(t.praticienId, t.userId),
  index('revendications_statut').on(t.statut, t.demandeLe),
])

export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const
export type Jour = (typeof JOURS)[number]
/** Une plage d'ouverture, heures au format `HH:MM`. */
export type Plage = { debut: string; fin: string }
/** Les plages d'ouverture de chaque jour ; un jour absent ou vide est fermé. */
export type Horaires = Partial<Record<Jour, Plage[]>>

/**
 * Ce que le praticien ajoute lui-même à sa fiche.
 *
 * Une ligne par praticien, jamais par compte : la fiche est une, quel que soit
 * le nombre de comptes qui l'ont revendiquée. Rien ici ne peut contredire le
 * registre, et rien du registre n'y figure : identité, adresse et RPPS restent
 * dans `praticiens` et `lieux_exercice`. Les pages publiques affichent ces
 * données à part, sous une mention qui dit qu'elles sont déclaratives.
 *
 * Écrite uniquement par les Server Actions de l'espace pro, après contrôle
 * d'une revendication acceptée pour le compte qui écrit.
 */
export const fichesCompletees = pgTable('fiches_completees', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().unique().references(() => praticiens.id, { onDelete: 'cascade' }),
  /** Dernier compte à avoir écrit. */
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  horaires: jsonb('horaires').$type<Horaires>(),
  /** Codes de langue ISO 639-1 parlées au cabinet, le français compris. */
  langues: text('langues').array().notNull().default([]),
  /** Codes d'accessibilité, voir `src/lib/espace-pro/fiche-completee.ts`. */
  accessibilite: text('accessibilite').array().notNull().default([]),
  accessibiliteCommentaire: text('accessibilite_commentaire'),
  /** Modes de paiement acceptés, mêmes codes que le module ci-dessus. */
  paiements: text('paiements').array().notNull().default([]),
  tiersPayant: text('tiers_payant', { enum: ['aucun', 'securite_sociale', 'securite_sociale_et_mutuelle'] }),
  /** Dernière étape du parcours d'accueil enregistrée, de 0 à 4. */
  etape: integer('etape').notNull().default(0),
  /** Renseigné quand le parcours d'accueil a été mené jusqu'au bout. */
  termineLe: timestamp('termine_le', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/**
 * Fiches mises de côté par un compte, patient le plus souvent.
 *
 * Une ligne par (compte, fiche), rien d'autre : la fiche reste la source, le
 * favori n'en copie rien. Supprimer la fiche ou le compte supprime le favori.
 */
export const favoris = pgTable('favoris', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  ajouteLe: timestamp('ajoute_le', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('favoris_compte_fiche').on(t.userId, t.praticienId),
  index('favoris_compte').on(t.userId, t.ajouteLe),
])

/**
 * Demandes de création d'une fiche absente des registres.
 *
 * Un praticien tout juste installé, ou un laboratoire que la base Sirene n'a
 * pas encore rattaché à l'activité, ne trouve pas sa fiche à l'étape « Trouvez
 * votre fiche ». Il la décrit ici ; la fiche n'est créée qu'à la main, après
 * vérification, et rattachée par `praticienId` une fois créée.
 */
export const demandesCreationFiche = pgTable('demandes_creation_fiche', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  profession: text('profession', { enum: ['dentiste', 'prothesiste', 'maxillo_facial', 'stomatologue', 'orl'] }).notNull(),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  raisonSociale: text('raison_sociale'),
  rpps: text('rpps'),
  siret: text('siret'),
  adresse: text('adresse').notNull(),
  codePostal: text('code_postal').notNull(),
  ville: text('ville').notNull(),
  telephone: text('telephone'),
  email: text('email'),
  message: text('message'),
  statut: text('statut', { enum: ['en_attente', 'acceptee', 'refusee'] }).notNull().default('en_attente'),
  /** Fiche créée à partir de la demande, une fois acceptée. */
  praticienId: text('praticien_id').references(() => praticiens.id, { onDelete: 'set null' }),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  traiteLe: timestamp('traite_le', { withTimezone: true }),
}, (t) => [
  index('demandes_creation_statut').on(t.statut, t.demandeLe),
  index('demandes_creation_compte').on(t.userId),
])
