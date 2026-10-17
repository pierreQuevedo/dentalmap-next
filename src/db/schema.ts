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
  /**
   * Retrait demandé par le praticien lui-même, identité vérifiée. La fiche
   * est aussi marquée supprimée ; ce marqueur dit à la synchronisation de ne
   * pas la recréer. Annulable trente jours.
   */
  retireLe: timestamp('retire_le', { withTimezone: true }),
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
  methode: text('methode', { enum: ['manuelle', 'pro_sante_connect', 'justificatif', 'invitation'] }).notNull().default('manuelle'),
  /**
   * Ce que la demande vise : la gestion de la fiche, ou son retrait (droit de
   * retrait, appliqué une fois l'identité vérifiée).
   */
  objet: text('objet', { enum: ['revendication', 'retrait'] }).notNull().default('revendication'),
  /**
   * Justificatif déposé (méthode `justificatif`) : chemin dans le stockage
   * privé, jamais une URL publique. Vu par l'équipe seule, supprimé trente
   * jours après la décision.
   */
  justificatifChemin: text('justificatif_chemin'),
  justificatifNom: text('justificatif_nom'),
  justificatifTaille: integer('justificatif_taille'),
  /** Refus : motif pris dans une liste fermée, et commentaire libre de l'équipe. */
  motifRefus: text('motif_refus'),
  commentaireRefus: text('commentaire_refus'),
  /** Laboratoire : le rôle déclaré (L2). Le salarié mandaté joint un mandat et l'adresse du gérant (MAN). */
  roleLabo: text('role_labo', { enum: ['gerant', 'mandate', 'salarie'] }),
  mandatChemin: text('mandat_chemin'),
  mandatNom: text('mandat_nom'),
  gerantEmail: text('gerant_email'),
  /** Lieux d'exercice que le compte choisit de gérer (M1). Vide : tous. */
  lieuxGeres: text('lieux_geres').array().notNull().default(sql`'{}'::text[]`),
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
  /** Orientations d'exercice déclarées, codes de `ORIENTATIONS` dans le même module. */
  orientations: text('orientations').array().notNull().default([]),
  /** Conventionnement : secteur 1, secteur 2 (dépassements possibles), ou non conventionné. */
  secteur: text('secteur', { enum: ['secteur_1', 'secteur_2', 'non_conventionne'] }),
  /**
   * Accès des personnes à mobilité réduite : oui, partiel ou non. C'est la
   * réponse qui compte, pas le oui ; « oui » ajoute aussi `pmr` à `accessibilite`
   * pour le filtre de la recherche.
   */
  accesPmr: text('acces_pmr', { enum: ['oui', 'partiel', 'non'] }),
  /** Âge minimum des patients reçus, en années ; 0 : tous âges. */
  ageMinimum: integer('age_minimum'),
  /** Présentation du cabinet, 200 à 800 caractères pour compter. */
  presentation: text('presentation'),
  /** Photo du cabinet : URL publique du stockage, paysage 16:9. */
  photoUrl: text('photo_url'),
  /** Liens du cabinet, sans intermédiaire : site, prise de rendez-vous en ligne. */
  siteWeb: text('site_web'),
  rdvEnLigne: text('rdv_en_ligne'),
  /** Dernière confirmation de chaque bloc : la fraîcheur se calcule à partir d'elles. */
  horairesConfirmesLe: timestamp('horaires_confirmes_le', { withTimezone: true }),
  conventionnementConfirmeLe: timestamp('conventionnement_confirme_le', { withTimezone: true }),
  accueilConfirmeLe: timestamp('accueil_confirme_le', { withTimezone: true }),
  presentationConfirmeeLe: timestamp('presentation_confirmee_le', { withTimezone: true }),
  photoConfirmeeLe: timestamp('photo_confirmee_le', { withTimezone: true }),
  /** Publication de la fiche à la fin de l'onboarding (B7). */
  publieeLe: timestamp('publiee_le', { withTimezone: true }),
  /*
   * Laboratoire de prothèse (LO1 à LO4 et missions) : ce que les cabinets
   * cherchent pour choisir un laboratoire. Codes des listes fermées de
   * `src/lib/espace-pro/labo.ts`.
   */
  techniques: text('techniques').array().notNull().default(sql`'{}'::text[]`),
  materiaux: text('materiaux').array().notNull().default(sql`'{}'::text[]`),
  /** Usinage CFAO sur place, empreintes numériques (STL) acceptées, impression 3D. */
  usinage: boolean('usinage').notNull().default(false),
  empreintesStl: boolean('empreintes_stl').notNull().default(false),
  impression3d: boolean('impression_3d').notNull().default(false),
  /** Délais moyens en jours ouvrés, par type de pièce : `{ couronne_unitaire: 5, … }`. */
  delais: jsonb('delais').$type<Record<string, number>>(),
  /** Rayon desservi en km, ramassage des empreintes au cabinet et ses jours, envoi au-delà. */
  rayonKm: integer('rayon_km'),
  ramassage: boolean('ramassage'),
  joursRamassage: text('jours_ramassage').array().notNull().default(sql`'{}'::text[]`),
  transporteur: boolean('transporteur'),
  /** Réalisations : photos publiques, une à huit, avec légende ; crédit commun. */
  realisations: jsonb('realisations').$type<{ url: string; legende: string }[]>(),
  creditPhotos: text('credit_photos'),
  /** Déclaration de fabricant de dispositifs sur mesure auprès de l'ANSM. */
  ansmNumero: text('ansm_numero'),
  ansmDeclareLe: timestamp('ansm_declare_le', { withTimezone: true }),
  savoirFaireConfirmeLe: timestamp('savoir_faire_confirme_le', { withTimezone: true }),
  delaisConfirmesLe: timestamp('delais_confirmes_le', { withTimezone: true }),
  zoneConfirmeeLe: timestamp('zone_confirmee_le', { withTimezone: true }),
  realisationsConfirmeesLe: timestamp('realisations_confirmees_le', { withTimezone: true }),
  /** Laboratoire intégré à un cabinet : la fiche du praticien liée (LK1). Les deux fiches restent distinctes. */
  praticienLieId: text('praticien_lie_id').references(() => praticiens.id, { onDelete: 'set null' }),
  /** Dernière étape du parcours d'accueil enregistrée, de 0 à 5. */
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
  /** Justificatif joint (Kbis d'un laboratoire, LA1) : chemin en stockage privé. */
  justificatifChemin: text('justificatif_chemin'),
  justificatifNom: text('justificatif_nom'),
  /** Fiche créée à partir de la demande, une fois acceptée. */
  praticienId: text('praticien_id').references(() => praticiens.id, { onDelete: 'set null' }),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  traiteLe: timestamp('traite_le', { withTimezone: true }),
}, (t) => [
  index('demandes_creation_statut').on(t.statut, t.demandeLe),
  index('demandes_creation_compte').on(t.userId),
])

/**
 * Les « prévenez-moi » de l'espace pro.
 *
 * - `fiche_creee` : un RPPS valide sans fiche (S1-0, PSC-0). La synchronisation
 *   prévient le compte quand la fiche apparaît.
 * - `remplacant` : remplaçants, collaborateurs et salariés, qui n'ont pas
 *   encore de fiche à leur nom (REMP).
 *
 * Une alerte n'accorde rien : elle n'est pas une revendication.
 */
export const alertesEspacePro = pgTable('alertes_espace_pro', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  motif: text('motif', { enum: ['fiche_creee', 'remplacant', 'prothesiste_salarie'] }).notNull(),
  /** RPPS saisi ou certifié, pour `fiche_creee`. */
  rpps: text('rpps'),
  /** Remplaçant, collaborateur libéral ou salarié d'un centre, pour `remplacant`. */
  exercice: text('exercice', { enum: ['remplacant', 'collaborateur', 'salarie'] }),
  /** Fiche depuis laquelle l'alerte a été posée, le cas échéant. */
  praticienId: text('praticien_id').references(() => praticiens.id, { onDelete: 'set null' }),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
  envoyeeLe: timestamp('envoyee_le', { withTimezone: true }),
}, (t) => [
  uniqueIndex('alertes_compte_motif_rpps').on(t.userId, t.motif, t.rpps),
  index('alertes_rpps').on(t.rpps),
])

/**
 * Les invitations à gérer une fiche (équipe d'un laboratoire, U-COL).
 *
 * Le titulaire invite une adresse ; la personne qui ouvre le lien, connectée
 * avec cette adresse, obtient une revendication acceptée (méthode
 * `invitation`). Jeton aléatoire, comparé sous forme de condensat.
 */
export const invitationsFiche = pgTable('invitations_fiche', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  invitePar: uuid('invite_par').notNull().references(() => user.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  /** Ce que la personne fait au laboratoire : prothésiste, secrétariat… Affiché dans l'équipe. */
  fonction: text('fonction'),
  jetonHash: text('jeton_hash').notNull(),
  statut: text('statut', { enum: ['envoyee', 'acceptee', 'annulee'] }).notNull().default('envoyee'),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
  accepteeLe: timestamp('acceptee_le', { withTimezone: true }),
}, (t) => [
  index('invitations_praticien').on(t.praticienId),
  uniqueIndex('invitations_jeton').on(t.jetonHash),
])

/* ------------------------------------------------------------------ */
/* Établissements de formation (couloir « École ou organisme »)        */
/* ------------------------------------------------------------------ */

/**
 * La demande d'un compte à gérer la page d'un établissement (O2a, OAT).
 *
 * L'établissement vit dans WordPress (type de contenu `formation`) : on le
 * désigne par son slug. Une adresse sur le domaine de l'établissement donne
 * la main tout de suite (méthode `domaine`) ; sinon, une attestation de
 * fonction signée attend la décision de l'équipe (méthode `attestation`).
 */
export const revendicationsEtablissement = pgTable('revendications_etablissement', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  /** Nom de l'établissement au moment de la demande, pour la file de modération. */
  titre: text('titre').notNull(),
  type: text('type', { enum: ['ecole_prothese', 'faculte'] }).notNull(),
  methode: text('methode', { enum: ['domaine', 'attestation'] }).notNull(),
  statut: text('statut', { enum: ['en_attente', 'acceptee', 'refusee'] }).notNull().default('en_attente'),
  justificatifChemin: text('justificatif_chemin'),
  justificatifNom: text('justificatif_nom'),
  justificatifTaille: integer('justificatif_taille'),
  motifRefus: text('motif_refus'),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  traiteLe: timestamp('traite_le', { withTimezone: true }),
}, (t) => [
  uniqueIndex('revendications_etab_compte_slug').on(t.userId, t.slug),
  index('revendications_etab_slug').on(t.slug),
  index('revendications_etab_statut').on(t.statut),
])

/**
 * Ce que l'établissement déclare (O3a, puis le tableau de bord) : formations,
 * portes ouvertes, photo, et pour une faculté accès aux études, cursus et
 * centres de soins. Un document par établissement, partagé entre ses
 * gestionnaires. Affiché « renseigné par l'établissement », à côté du contenu
 * éditorial de WordPress, jamais mélangé avec lui.
 */
export const fichesEtablissement = pgTable('fiches_etablissement', {
  slug: text('slug').primaryKey(),
  type: text('type', { enum: ['ecole_prothese', 'faculte'] }).notNull(),
  donnees: jsonb('donnees').notNull().default(sql`'{}'::jsonb`),
  /** Première publication (OEND) ; null tant que l'établissement n'a pas publié. */
  publieeLe: timestamp('publiee_le', { withTimezone: true }),
  misAJourLe: timestamp('mis_a_jour_le', { withTimezone: true }).defaultNow().notNull(),
  misAJourPar: uuid('mis_a_jour_par').references(() => user.id, { onDelete: 'set null' }),
})

/** Un établissement absent de l'annuaire (OA1) : examiné avant toute publication. */
export const demandesAjoutEtablissement = pgTable('demandes_ajout_etablissement', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  nom: text('nom').notNull(),
  uai: text('uai').notNull(),
  ville: text('ville').notNull(),
  statut: text('statut', { enum: ['en_attente', 'acceptee', 'refusee'] }).notNull().default('en_attente'),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  traiteLe: timestamp('traite_le', { withTimezone: true }),
}, (t) => [index('demandes_ajout_etab_statut').on(t.statut)])

/** La liste d'attente de la formation continue (W1) : aucune donnée publiée. */
export const listeAttenteFormation = pgTable('liste_attente_formation', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  organisme: text('organisme').notNull(),
  specialites: text('specialites').array().notNull(),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex('liste_attente_formation_email').on(t.email)])

/* ------------------------------------------------------------------ */
/* Formations privées (décisions du 13 octobre 2026)                    */
/* ------------------------------------------------------------------ */

/**
 * Une formation proposée par un professionnel depuis son espace compte.
 * Rien n'est publié sans la décision de l'équipe. Le détail déclaré
 * (sessions, programme, public, format, tarif, prise en charge) reste ici et
 * se lit sur la page publique ; WordPress ne porte que l'article minimal,
 * désigné par `wp_slug` une fois créé.
 */
export const demandesFormation = pgTable('demandes_formation', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  /** `acceptee` : validée, en attente de création dans WordPress ; `publiee` : en ligne. */
  statut: text('statut', { enum: ['en_attente', 'acceptee', 'publiee', 'refusee'] }).notNull().default('en_attente'),
  motif: text('motif'),
  donnees: jsonb('donnees').notNull(),
  /** Mentions de prise en charge vérifiées par l'équipe : { DPC: source, … }. */
  verifications: jsonb('verifications').notNull().default(sql`'{}'::jsonb`),
  wpSlug: text('wp_slug'),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  traiteLe: timestamp('traite_le', { withTimezone: true }),
  publieeLe: timestamp('publiee_le', { withTimezone: true }),
}, (t) => [
  index('demandes_formation_statut').on(t.statut),
  index('demandes_formation_compte').on(t.userId),
  uniqueIndex('demandes_formation_wp_slug').on(t.wpSlug),
])

/**
 * L'alerte des praticiens sur les nouvelles formations : sans compte, une
 * adresse confirmée par lien. Le jeton (gardé sous forme de condensat) sert à
 * la confirmation et à la désinscription en un clic. Un email par semaine au
 * plus.
 */
export const alertesFormation = pgTable('alertes_formation', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  themes: text('themes').array().notNull(),
  regions: text('regions').array().notNull(),
  publics: text('publics').array().notNull(),
  jetonHash: text('jeton_hash').notNull(),
  confirmeeLe: timestamp('confirmee_le', { withTimezone: true }),
  dernierEnvoiLe: timestamp('dernier_envoi_le', { withTimezone: true }),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('alertes_formation_email').on(t.email),
  uniqueIndex('alertes_formation_jeton').on(t.jetonHash),
])
