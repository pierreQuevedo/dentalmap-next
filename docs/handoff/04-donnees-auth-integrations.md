# 04 · Données, authentification, intégrations

Complète la section 5 de `../reference/architecture-v2-nextjs-headless.md`. Si une table existe déjà dans `src/db/schema.ts`, **fusionner** plutôt que dupliquer. Les API de bibliothèques (Better Auth, Drizzle, Vercel Blob) évoluent : vérifier chaque appel avec la documentation à jour (Context7) avant d'écrire le code.

## 1. Schéma Drizzle à ajouter

Fichier proposé : `src/db/schema-espace-pro.ts`, exporté avec le reste dans `src/db/index.ts` et ajouté à `drizzle.config.ts`.

```ts
import { pgTable, pgEnum, text, boolean, integer, smallint, timestamp, jsonb, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { praticiens, lieuxExercice } from './schema'
import { user } from './auth-schema'

export const profilEnum = pgEnum('profil', ['patient', 'sante', 'labo', 'organisme', 'salarie'])
export const methodeEnum = pgEnum('methode_verification', ['psc', 'email_pro', 'courrier_code', 'document', 'domaine_email', 'attestation'])
// courrier_code : laboratoire uniquement (courrier au siège). Le courrier au cabinet des praticiens est abandonné (11 octobre 2026).
export const statutRevEnum = pgEnum('statut_revendication', ['en_cours', 'en_examen', 'validee', 'refusee', 'en_attente_fiche', 'contestee', 'annulee'])
export const roleLaboEnum = pgEnum('role_labo', ['gerant', 'salarie_mandate'])
export const secteurEnum = pgEnum('secteur', ['secteur_1', 'secteur_2', 'non_conventionne'])
export const triEnum = pgEnum('tri_etat', ['oui', 'partiel', 'non'])
export const statutFicheEnum = pgEnum('statut_fiche', ['brouillon', 'publiee'])

// Profil et préférences : champs additionnels Better Auth (voir §2), pas de table dédiée.

export const consentements = pgTable('consentements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['cgu', 'rappels'] }).notNull(),
  version: text('version').notNull(),
  accepteLe: timestamp('accepte_le', { withTimezone: true }).defaultNow().notNull(),
  retireLe: timestamp('retire_le', { withTimezone: true }),
})

export const revendications = pgTable('revendications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  praticienId: text('praticien_id').references(() => praticiens.id),     // null si en_attente_fiche
  identifiantAttendu: text('identifiant_attendu'),                         // RPPS ou SIREN quand la fiche n'existe pas encore (PSC-0, S1-0)
  methode: methodeEnum('methode').notNull(),
  statut: statutRevEnum('statut').notNull().default('en_cours'),
  roleLabo: roleLaboEnum('role_labo'),
  codeHash: text('code_hash'),                                             // courrier au siège (labo) : jamais le code en clair
  essais: smallint('essais').notNull().default(0),
  expireLe: timestamp('expire_le', { withTimezone: true }),
  documentBlobKeys: text('document_blob_keys').array(),                    // Kbis (labo) seulement : Blob privé, purge 30 j après décision.
                                                                           // Justificatif santé : jamais stocké, lu en mémoire par la vérification automatique puis supprimé
  motifRefus: text('motif_refus'),
  commentaireEquipe: text('commentaire_equipe'),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
  valideeLe: timestamp('validee_le', { withTimezone: true }),
}, (t) => [index('rev_praticien').on(t.praticienId), index('rev_user').on(t.userId)])

// Une fiche n'a qu'un titulaire : contrainte d'unicité partielle à écrire en SQL (drizzle-kit generate --custom)
// CREATE UNIQUE INDEX rev_titulaire_unique ON revendications (praticien_id) WHERE statut = 'validee';

export const revendicationLieux = pgTable('revendication_lieux', {
  revendicationId: text('revendication_id').notNull().references(() => revendications.id, { onDelete: 'cascade' }),
  lieuId: text('lieu_id').notNull().references(() => lieuxExercice.id),
}, (t) => [primaryKey({ columns: [t.revendicationId, t.lieuId] })])

export const courriers = pgTable('courriers', {                           // laboratoire (courrier au siège) ; limite : 3 par fiche et par mois
  id: text('id').primaryKey(),
  revendicationId: text('revendication_id').notNull().references(() => revendications.id),
  envoyeLe: timestamp('envoye_le', { withTimezone: true }).defaultNow().notNull(),
  prestataireRef: text('prestataire_ref'),
})

export const contestations = pgTable('contestations', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id),
  demandeurUserId: text('demandeur_user_id').notNull().references(() => user.id),
  titulaireUserId: text('titulaire_user_id').notNull().references(() => user.id),
  revendicationId: text('revendication_id').references(() => revendications.id),
  statut: text('statut', { enum: ['ouverte', 'transferee', 'rejetee'] }).notNull().default('ouverte'),
  echeanceReponse: timestamp('echeance_reponse', { withTimezone: true }).notNull(), // +7 jours
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
})

export const retraits = pgTable('retraits', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id),
  userId: text('user_id').notNull().references(() => user.id),
  statut: text('statut', { enum: ['en_attente', 'effectif', 'annule'] }).notNull().default('en_attente'),
  demandeLe: timestamp('demande_le', { withTimezone: true }).defaultNow().notNull(),
  effectifLe: timestamp('effectif_le', { withTimezone: true }),
})
// + colonne praticiens.retire_le (timestamp) : respectée par sync-ans (la fiche n'est pas recréée), page en 410.

export const alertesRegistre = pgTable('alertes_registre', {              // PSC-0, S1-0, LA1, OA1
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  registre: text('registre', { enum: ['rpps', 'sirene', 'uai'] }).notNull(),
  identifiant: text('identifiant').notNull(),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
  notifieLe: timestamp('notifie_le', { withTimezone: true }),
})

export const listesInteret = pgTable('listes_interet', {                  // REMP, LINFO, W1
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  motif: text('motif', { enum: ['remplacant', 'prothesiste_salarie', 'formation_continue'] }).notNull(),
  donnees: jsonb('donnees'),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
})

// fiches_completees (architecture §5.3) : colonnes à ajouter
//   statut statut_fiche default 'brouillon', publiee_le timestamptz,
//   secteur secteur, tiers_payant tri_etat, age_min smallint, acces_pmr tri_etat (remplace le boolean),
//   horaires_confirmes_le timestamptz, photo_confirmee_le, presentation_confirmee_le timestamptz

export const fichesLabo = pgTable('fiches_labo', {
  praticienId: text('praticien_id').primaryKey().references(() => praticiens.id, { onDelete: 'cascade' }),
  statut: statutFicheEnum('statut').notNull().default('brouillon'),
  techniques: text('techniques').array(),
  materiaux: text('materiaux').array(),
  delais: jsonb('delais').$type<Record<string, number>>(),                // jours ouvrés par type de pièce
  delaisConfirmesLe: timestamp('delais_confirmes_le', { withTimezone: true }),
  rayonKm: smallint('rayon_km'),
  ramassage: boolean('ramassage'),
  declareAnsm: boolean('declare_ansm'),
  photosBlobUrls: text('photos_blob_urls').array(),
  presentation: text('presentation'),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const liaisonsLaboPraticien = pgTable('liaisons_labo_praticien', {
  laboId: text('labo_id').notNull().references(() => praticiens.id),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id),
}, (t) => [primaryKey({ columns: [t.laboId, t.praticienId] })])

export const distinctions = pgTable('distinctions', {
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  obtenueLe: timestamp('obtenue_le', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.praticienId, t.code] })])

export const demandesAjout = pgTable('demandes_ajout', {                  // LA1, OA1, CX6 (labo, établissement)
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  type: text('type', { enum: ['laboratoire', 'etablissement', 'changement_email'] }).notNull(),
  donnees: jsonb('donnees').notNull(),
  documentBlobKeys: text('document_blob_keys').array(),
  statut: text('statut', { enum: ['recue', 'acceptee', 'refusee'] }).notNull().default('recue'),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
})
```

Tables emploi (11 octobre 2026, à confirmer) :

```ts
export const offres = pgTable('offres', {
  id: text('id').primaryKey(),
  auteurUserId: text('auteur_user_id').notNull().references(() => user.id),
  praticienId: text('praticien_id').references(() => praticiens.id),     // cabinet ou laboratoire recruteur
  lieuId: text('lieu_id').references(() => lieuxExercice.id),
  poste: text('poste').notNull(),
  contrat: text('contrat', { enum: ['cdi', 'cdd', 'remplacement', 'alternance', 'stage'] }).notNull(),
  tempsPlein: boolean('temps_plein').notNull(),
  debut: text('debut'),
  remunerationMin: integer('remuneration_min').notNull(),                  // brut mensuel, obligatoire
  remunerationMax: integer('remuneration_max').notNull(),
  description: text('description').notNull(),
  avantages: text('avantages').array(),
  statut: text('statut', { enum: ['brouillon', 'en_ligne', 'pourvue', 'expiree'] }).notNull().default('brouillon'),
  publieeLe: timestamp('publiee_le', { withTimezone: true }),
  clotureeLe: timestamp('cloturee_le', { withTimezone: true }),
})

export const candidats = pgTable('candidats', {                           // profil salarié ou étudiant
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  situation: text('situation', { enum: ['assistant', 'secretaire', 'prothesiste', 'etudiant'] }).notNull(),
  criteres: jsonb('criteres').notNull(),                                   // contrats, temps, ville, rayon, disponibilité
  qualification: text('qualification'),
  titreVerifie: boolean('titre_verifie').notNull().default(false),         // vérification automatique, document jamais stocké
  formation: jsonb('formation'),                                           // école, diplôme, année (étudiant)
  scolariteVerifiee: boolean('scolarite_verifiee').notNull().default(false),
  visibilite: text('visibilite', { enum: ['visible', 'discret'] }).notNull().default('visible'),
  structuresMasquees: text('structures_masquees').array(),
  cvBlobKey: text('cv_blob_key'),                                          // facultatif, Blob privé
})

export const candidatures = pgTable('candidatures', {
  id: text('id').primaryKey(),
  offreId: text('offre_id').notNull().references(() => offres.id, { onDelete: 'cascade' }),
  candidatUserId: text('candidat_user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  message: text('message'),
  statut: text('statut', { enum: ['nouvelle', 'vue', 'echange_propose', 'echange_accepte', 'retenue', 'non_retenue'] }).notNull().default('nouvelle'),
  creeLe: timestamp('cree_le', { withTimezone: true }).defaultNow().notNull(),
})

export const alertesEmploi = pgTable('alertes_emploi', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  criteres: jsonb('criteres').notNull(),
  frequence: text('frequence', { enum: ['quotidienne', 'hebdomadaire'] }).notNull().default('quotidienne'),
  active: boolean('active').notNull().default(true),
})
```

Règle de neutralité à conserver : **aucune** colonne de score. `calculerForce()` (voir 03) lit ces tables et renvoie un objet, rien n'est persisté.

## 2. Better Auth

Plugins : `magicLink`, `emailOTP`, `passkey`, `genericOAuth` (Pro Santé Connect). Champs additionnels sur `user` : `profil`, `sousType`, `onboardingEtape`, `communePreferee`, `professionPreferee`.

```ts
// src/lib/auth.ts (extrait, à vérifier contre la doc Better Auth en vigueur)
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink, emailOTP, genericOAuth } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'          // emplacement selon la version installée
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { envoyerEmailConnexion } from '@/lib/email/connexion'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: false },
  user: {
    additionalFields: {
      profil: { type: 'string', required: false, input: false },
      sousType: { type: 'string', required: false, input: false },
      onboardingEtape: { type: 'string', required: false, input: false },
    },
  },
  plugins: [
    magicLink({ expiresIn: 60 * 5, sendMagicLink: async ({ email, url }) => envoyerEmailConnexion.lien(email, url) }),
    emailOTP({ otpLength: 6, expiresIn: 60 * 10, allowedAttempts: 5, sendVerificationOTP: async ({ email, otp }) => envoyerEmailConnexion.code(email, otp) }),
    passkey({ rpName: 'DentalMap' }),
    genericOAuth({ config: [pscConfig()] }),
    nextCookies(),
  ],
})
```

**Un seul email avec lien et code (CX2).** Les deux plugins envoient chacun leur message. Approche proposée : `envoyerEmailConnexion` met en tampon le lien et le code par adresse (Map en mémoire de requête ou table temporaire, TTL 30 s) et n'envoie qu'une fois les deux reçus, dans le même gabarit Resend. La server action de CX1 déclenche les deux appels en séquence. Alternative si trop fragile : n'utiliser que `emailOTP` et construire soi-même le lien `…/connexion/verifier?email=…&code=…` qui soumet le code automatiquement.

**Contexte d'origine (`next`).** Conserver la page d'origine (fiche consultée, « Revendiquer cette fiche ») dans `callbackURL`. CX3 et T3 en dépendent : arrivée par « Revendiquer cette fiche » = profil santé et fiche présélectionnés, saut vers S2.

**Limites.** 5 envois par heure et par adresse (rate limit Better Auth + vérification applicative). Renvoi après 45 s côté UI.

## 3. Pro Santé Connect (PSC)

Prérequis administratif : raccordement de DentalMap comme fournisseur de service (demande sur api.gouv.fr, bac à sable obligatoire, puis production). Le fournisseur doit être une personne morale.

```ts
// src/lib/auth/psc.ts (valeurs à confirmer dans la documentation technique PSC, tech.esante.gouv.fr)
export function pscConfig() {
  return {
    providerId: 'psc',
    discoveryUrl: process.env.PSC_DISCOVERY_URL!,     // bac à sable puis production, fournis par l'ANS
    clientId: process.env.PSC_CLIENT_ID!,
    clientSecret: process.env.PSC_CLIENT_SECRET!,
    scopes: ['openid', 'scope_all'],                  // à confirmer
    authorizationUrlParams: { acr_values: 'eidas1' }, // à confirmer
    pkce: true,
    getUserInfo: async (tokens: { accessToken?: string }) => {
      // Lire l'identifiant national (claim SubjectNameID, préfixé pour les RPPS : à confirmer),
      // nom, prénom, profession (SubjectRefPro). Ne rien stocker d'autre.
    },
  }
}
```

Usage dans le parcours :
- **CX1, bouton PSC** : connexion ou création de compte via PSC, puis directement PSC2.
- **S0 → PSC1** : utilisateur déjà connecté par email, il **lie** PSC à son compte (`oauth2.link` côté client) au lieu de créer un second compte.
- **Callback** : rapprochement exact sur le RPPS. Fiche trouvée et libre → revendication `methode='psc'`, `statut='validee'`. Fiche titulaire différente → C1. Pas de fiche → revendication `en_attente_fiche` + alerte (PSC-0). Erreur OIDC → PSC-E, message unique, détail journalisé.
- **C1 et R1** : PSC est accepté comme preuve forte.

Variables d'environnement : `PSC_DISCOVERY_URL`, `PSC_CLIENT_ID`, `PSC_CLIENT_SECRET`.

## 4. Routes

Arborescence cible (détails et état de chaque écran dans `02-parcours-espace-pro.md`) :

```
app/
  (public)/connexion/page.tsx                    CX1, CX1-E
  (public)/connexion/verifier/page.tsx           CX2, CX2-E
  (public)/connexion/expire/page.tsx             CX5
  (public)/connexion/recuperation/page.tsx       CX6
  (pro)/connexion/bienvenue/page.tsx             CX3 (connecté)
  (pro)/connexion/cle-d-acces/page.tsx           CX4
  (pro)/bienvenue/profil/page.tsx                T3
  (pro)/bienvenue/patient/page.tsx               P1
  (pro)/espace-pro/
    page.tsx                                     DASH ou U selon le profil, modale J
    revendiquer/page.tsx                         S0
    revendiquer/psc/page.tsx                     PSC1
    revendiquer/psc/retour/page.tsx              PSC2, PSC-E, PSC-0
    revendiquer/recherche/page.tsx               S1, H1, S1-0
    revendiquer/[praticienId]/page.tsx           S2
    revendiquer/[praticienId]/{email,methode,justificatif,conflit,retrait,remplacant}/page.tsx
    revendiquer/suivi/page.tsx                   K, L, KL, LREF
    lieux/page.tsx                               M1
    onboarding/[etape]/page.tsx                  B0, B0S (specialite), B1 à B7
    emploi/page.tsx                              D-EMPLOI ou L-EMPLOI selon le profil, routes à confirmer
    emploi/[offreId]/candidatures/page.tsx       D-CAND, L-CAND
    laboratoire/...                              L1 à LO4
    organisme/...                                O1 à O3b
  (pro)/espace-candidat/                         ex-(pro)/emploi/ : `/emploi/` est la page publique de l’Emploi, deux routes ne peuvent pas résoudre le même chemin
    bienvenue/[etape]/page.tsx                   SE1 à SE5, SE3E
    page.tsx                                     CAND-VUE ou ETU-VUE
    offres/page.tsx, offres/[offreId]/page.tsx   CAND-OFFRES, CAND-OFFRE (ETU-*)
    candidatures/, profil/, alertes/, visibilite/, formation/
```

Toutes les pages `(pro)` sont dynamiques (session). La page fiche publique révèle le téléphone si session (P2) dans un composant dynamique isolé sous `Suspense`, le reste reste en cache.

## 5. Server actions et règles serveur

| Action | Règles |
|---|---|
| `demanderConnexion(email, next)` | Validation, normalisation, rate limit, envoi lien + code |
| `enregistrerConsentements(cgu, rappels)` | CGU obligatoire, version courante, horodatage |
| `choisirProfil(profil, sousType?)` | Une seule fois, sauf changement explicite depuis Compte |
| `rechercherFiche(profession, requete)` | RPPS : 11 chiffres et clé ; nom : trigram, 20 résultats max |
| `demarrerRevendication(praticienId)` | Si titulaire validé existant → contestation (C1). Sinon méthode selon registre : email connu → S3a, sinon S3b |
| `envoyerCourrier(revendicationId)` | Laboratoire uniquement (courrier au siège). Code 8 chiffres, hash bcrypt/argon2, expiration 30 j, 3 courriers par fiche et par mois |
| `verifierCode(revendicationId, code)` | Laboratoire (LCODE). 3 essais, comparaison sur hash. Écran au-delà des 3 essais à définir (CE1 supprimé) |
| `deposerJustificatif(fichiers)` | Santé. PDF, JPG, PNG, 10 Mo. Vérification automatique en quelques minutes (lecture, comparaison au RPPS) ; le document n’est jamais écrit dans Blob ni en base, il est supprimé dès la fin de la vérification. Statut `validee` ou `refusee` avec motif en liste fermée. Cas douteux : à définir sans conservation du document |
| `publierOffre(offre)` | Pro vérifié. Poste, contrat, temps, début, fourchette de rémunération brute mensuelle obligatoire, lieu parmi ses lieux d’exercice. Publiée 30 jours |
| `postuler(offreId, message, cv?)` | Candidat connecté. CV facultatif. Notifie le recruteur |
| `proposerEchange(candidatureId, creneaux)` / `accepterEchange(...)` | Coordonnées du candidat partagées seulement après acceptation |
| `enregistrerCriteres(criteres)` | Crée ou met à jour l’alerte emploi par défaut |
| `choisirLieux(lieuIds)` | Au moins un |
| `enregistrerEtapeOnboarding(etape, valeurs)` | Validation par étape (voir règles dans 02), `updateTag('praticien:{slug}')` et `updateTag('commune:{code}')` à la publication |
| `publierFiche()` | `statut='publiee'`, distinctions recalculées, palier comparé à l'ancien pour déclencher J |
| `demanderRetrait()` / `annulerRetrait()` | Effectif après vérification, annulable 30 j |
| `reconfirmer(element)` | Met à jour `*_confirme_le` sans ressaisie |

## 6. Jobs n8n à ajouter

| Job | Fréquence | Action |
|---|---|---|
| `alertes-registre` | après `sync-ans` et `sync-sirene` | Notifier les `alertes_registre` dont l'identifiant vient d'apparaître ; appliquer les revendications `en_attente_fiche` |
| `rappels-fraicheur` | quotidien, `/api/cron/rappels-fraicheur/` (`vercel.json`) | Blocs en rappel ou échus selon `fraicheurDe` et `fraicheurLabo`, un email par fiche et par mois au plus, coupure par lien signé (`src/lib/espace-pro/taches.ts`) |
| `liens` | quotidien par lots, chaque fiche une fois par semaine, `/api/cron/liens/` | Tester site et prise de rendez-vous ; masquer après deux échecs consécutifs et prévenir le professionnel |
| `purge-documents` | quotidien, `/api/cron/purge-documents/` | Supprimer Kbis, mandats et attestations 30 j après décision ; un praticien ne dépose plus de document |
| `purge-candidatures` | quotidien | Supprimer candidatures et CV 6 mois après la clôture de l’offre (durée à valider) |
| `alertes-emploi` | quotidien | Envoyer les nouvelles offres correspondant aux alertes, seulement s’il y a du nouveau |
| `alertes-formation` | à chaque publication (webhook `/api/revalidate` sur `wp:formation`, et mise en ligne depuis la modération), filet quotidien `/api/cron/alertes-formation` (`CRON_SECRET`) | Envoyer aux alertes confirmées les formations privées publiées depuis leur dernier envoi qui correspondent à leurs thèmes, région et public ; un email par semaine au plus (`src/lib/formation/alertes.ts`) |
| `offres-echeance` | quotidien | Retirer les offres publiées depuis 30 jours et prévenir le recruteur |
| `contestations-echeance` | quotidien | Clore les contestations sans réponse à J+7 |
| `courriers` | à la demande | Laboratoire : envoi postal du code au siège (prestataire à choisir : Merci Facteur, Maileva…) |
