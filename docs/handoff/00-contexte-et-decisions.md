# 00 · Contexte et décisions

Transmission du chantier « Espace pro » de DentalMap v2, conçu dans le projet Claude « Dental Map » (octobre 2026). Ce document résume ce qui est décidé. Les détails sont dans les fichiers 01 à 05.

## Le produit en une phrase

DentalMap est un annuaire dentaire vérifié par les registres officiels (Annuaire Santé / RPPS via l'ANS, Sirene via l'INSEE). Les fiches existent avant toute inscription. L'espace pro permet de **revendiquer** une fiche, puis de la **compléter** avec des informations déclaratives.

## Règles non négociables

| Règle | Conséquence dans le code |
|---|---|
| La place ne s'achète pas | Tri des résultats : distance, puis ordre alphabétique. Aucune colonne `score`, `boost`, `premium`, `sponsorise`. La force de fiche est calculée à la volée et n'entre jamais dans un `ORDER BY`. |
| Rien de déclaratif sans source | Les données de registre sont en lecture seule. Les données saisies par le pro sont stockées à part (`fiches_completees`, `fiches_labo`) et affichées avec la mention « renseigné par le praticien ». |
| Aucune fiche créée à la demande | Un RPPS ou un SIREN absent déclenche une alerte, pas une création. Seule la synchro registre crée des fiches. |
| Logos institutionnels | Règle « aucun logo sans convention » retirée le 13 octobre 2026 (décision client) : l’accueil peut afficher des logos d’universités et d’écoles. Une demande de partenariat ne crée toujours ni compte pro ni affichage automatique. |
| Données minimales | Un patient ne donne que son email. Aucune donnée de santé demandée nulle part. |
| Copie | Français, vouvoiement, pas de tirets cadratins ni demi-cadratins dans les textes. |

## Décisions prises pendant la conception

| Sujet | Décision |
|---|---|
| Connexion | Lien magique **et** code à 6 chiffres dans le même email. Aucun mot de passe. Clé d'accès (passkey) proposée à la 2e connexion. |
| Profils | Cinq : patient, santé (dentiste, stomatologue, maxillo-facial, ORL), laboratoire, organisme, salarié ou étudiant (ajouté le 11 octobre 2026). Question posée une fois (écran T3). |
| Vérification santé | Pro Santé Connect recommandé (immédiat). Sinon : email connu du registre (immédiat) ou justificatif vérifié automatiquement (quelques minutes). Le justificatif n’est jamais conservé : il est lu pour la vérification puis supprimé, validée ou non. Le courrier au cabinet est abandonné (11 octobre 2026). |
| Vérification laboratoire | Sirene ne publie pas d'email : Kbis (48 h) ou courrier au siège. Mandat signé si l'utilisateur est salarié. |
| Vérification établissement | Email sur le domaine de l'établissement (immédiat) ou attestation de fonction (48 h). |
| Onboarding dentiste | Quatre questions : spécialité et domaines de soins (B0S), horaires, conventionnement, accueil. La qualification vient du registre ; les domaines (endodontie, parodontologie…) sont déclarés, 5 au plus. Poids de B0S à arbitrer (voir 06). |
| Emploi | Partie emploi pour les pros (dentiste, laboratoire : publier une offre, recevoir des candidatures, proposer un échange) et pour les salariés et étudiants (offres triées par distance, candidatures, alertes, visibilité). Rémunération en fourchette obligatoire sur chaque offre. Coordonnées d’un candidat transmises seulement s’il accepte l’échange. Profil visible anonymisé ou discret. |
| Pages emploi du site (11 octobre 2026) | Un seul système, en base Neon, alimenté par l’espace pro vérifié. Les Annonces WordPress ne gardent que les cessions de cabinet. Périmètre au lancement : tout (emploi salarié, alternance, stages, remplacements, collaborations). Candidature avec compte uniquement (pas de candidature anonyme ; alerte par email possible). Pages par métier, département et commune dès le lancement. Gratuit pour le moment. Repères de salaire publics, en bloc facultatif affiché seulement avec assez d’offres. Fiches métier dans les Conseils : plus tard. |
| Formations privées (13 octobre 2026) | Tout professionnel peut ajouter une formation, par une demande depuis son espace compte ; l’équipe vérifie avant publication. Liste unique des thèmes (`src/lib/formation/themes.ts`), partagée avec la liste d’attente W1 (« Prothèse » devient « Prothèse et CFAO »). Mentions de prise en charge affichées : DPC, FIF PL, Qualiopi, chacune « déclarée » ou « vérifiée » avec sa source. Alerte email des praticiens sur les nouvelles formations : à construire. Garde-fou : une formation sans type ACF connu n’est publiée nulle part (`aUnType`). Liste en vue unique, sans carte. |
| Fiches métier (13 octobre 2026) | Quatrième rubrique « Métiers » des Ressources (`/conseils/metiers/`), contenu WordPress. Hub des métiers en cartes photo, puis une fiche par métier, en-tête sombre (variante A) : chiffres clés, missions, formation en étapes, salaire moyen par secteur issu d’études, évolutions, appel vers les offres, sources. Six fiches maquettées : assistant(e) dentaire, chirurgien-dentiste, prothésiste, secrétaire ou assistant(e) de gestion, aide dentaire, assistant(e) spécialisé(e). Les faits réglementaires sont relus avant publication. Les pages emploi renvoient vers la fiche du métier. Index des Ressources refait avec quatre rubriques (`maquettes/ressources/`). Maquettes : `src/app/(public)/maquettes/metiers/`, Figma section « Site · Fiches métier ». |
| Rapprochement des registres (13 octobre 2026) | Quotidien. Le site écrit « chaque jour » (À propos, FAQ, pages légales) ; `HomeStats` dit encore « chaque semaine » tant que le job n8n n’est pas passé en quotidien. |
| Décisions diverses (13 octobre 2026) | Gamification : poids de l’écran Spécialité, distinctions « Fiche partagée » et « Ambassadeur », points des missions établissement, acceptés ; le bonus de classement est accepté sur le principe mais contredit la règle de tri (distance puis alphabétique, jamais la force de fiche) : forme à arbitrer avant tout code. Vérification automatique : cas douteux traités plus tard dans un panneau d’administration. Laboratoire : écran après trois codes faux à recréer. Emploi : vraies sources de salaires à citer (14 octobre 2026 : quand la source officielle donne un minimum conventionnel, le site affiche « salaire minimum conventionnel » et non « salaire moyen », sur les fiches métier comme sur les pages Emploi) ; offres datées : la page affiche la date de publication et de dernière confirmation, le recruteur confirme tous les 15 jours, sans confirmation l’offre est retirée. Cessions : propositions acceptées. Partenaires : « Ils nous font confiance » conservé ; avantages concrets retenus pour cinq profils (ordres et syndicats, éditeurs, écoles, organismes de formation, collectivités et ARS), tous à construire, voir `src/components/vitrine/partenaires/commun.tsx` ; aucun partenariat n’achète un rang, un logo sur les fiches ni des données personnelles ; le formulaire accepte les deux nouveaux types. Accueil : avis du bloc partenaires fictifs, signés par des personnes et des organismes inventés (faculté de l’Estuaire, Institut Ardoise…), jamais par une institution réelle ni avec son logo ; fait dans Figma, `HomePartenaire` garde encore de vrais logos et noms d’établissements, à remplacer au moment du code. FAQ : doublon sur le retrait de fiche supprimé. Pages légales : relecture par un juriste. Plan du site : indexation décidée au moment du code. |
| Formation continue | Pas encore recensée : liste d'attente, aucune fiche publiée. |
| Retrait de fiche | Droit exercé à tout moment, après la même vérification d'identité qu'une revendication. Page en 410, hors sitemap, non recréée par la synchro. La page 410 affiche la date du retrait et reste 30 jours, délai pendant lequel le professionnel peut revenir sur sa décision (13 octobre 2026). |
| Onboarding | Une question par écran, « Passer » toujours possible, l'étape passée devient une mission dans l'espace pro. |
| Gamification | Force de fiche sur 100, paliers, distinctions privées, fraîcheur des données. Gains réels : présence dans les filtres patients et meilleur rendu moteur. Jamais de gain de position. Voir 03. |

## Stack (rappel, voir `../reference/architecture-v2-nextjs-headless.md`)

Next.js 16 (App Router, Cache Components) sur Vercel, Neon Postgres + PostGIS avec Drizzle, Better Auth, Vercel Blob, Resend, WordPress 7.1 headless (WPGraphQL) pour l'éditorial et les fiches formation, n8n pour les synchros registres.

## Sources de vérité

| Quoi | Où |
|---|---|
| Maquettes | Figma, fichier `oxe3W5vGaT9QEYH6ur6Z3p` (« Dentalmaps »). Page **« Parcours · step by step »** = référence d'implémentation. Page « Espace pro » = exploration (design system, gamification, arbre de décision). |
| Parcours écran par écran | `02-parcours-espace-pro.md` et `parcours.json` (générés depuis Figma) |
| DA en production | `https://dentalmap-next.vercel.app/` : les tokens Figma ont été alignés dessus |
