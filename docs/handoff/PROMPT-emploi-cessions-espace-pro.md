# Prompt · Emploi et cessions dans l’espace pro

À coller dans la session qui code l’espace pro de `dentalmap-next`.

---

Tu codes la partie Emploi et la partie Cessions de l’espace pro de DentalMap. Les pages publiques, les tables et les requêtes de lecture sont déjà faites sur la branche `feat/vitrine` (dossier `dentalmap-next-vitrine`). Commence par récupérer cette branche dans la tienne (`git merge feat/vitrine`, conflits éventuels sur `src/db/schema.ts` et les migrations : garde les deux séries de tables, puis régénère avec `pnpm db:generate` si la numérotation se chevauche).

Lis ensuite `AGENTS.md`, `CLAUDE.md`, `docs/handoff/README.md`, puis dans `docs/handoff/00-contexte-et-decisions.md` les lignes « Pages emploi du site », « Emploi » et « Décisions diverses (13 octobre 2026) », et dans `04-donnees-auth-integrations.md` le §1 (tables), le §4 (routes) et le §6 (jobs). Le code existant fait foi. pnpm uniquement, jamais de push sur `main`, jamais de secret commité. Français, vouvoiement, aucun tiret cadratin ni demi-cadratin, apostrophes ’. N’écris jamais que le service est gratuit ni qu’il n’y aura pas de mise en avant payante.

La base de `.env.local` du dépôt principal est la production : migrations et données d’exemple uniquement sur une branche Neon de développement.

## Tables déjà en place (migration 0018)
`offres`, `candidats`, `candidatures`, `alertesEmploi`, `annoncesCession`, `conversations`, `messages`, `alertesCession`, dans `src/db/schema.ts`. Lis leurs commentaires : ils portent les règles (rémunération obligatoire, offres datées, secteur flou, contact avec compte). N’ajoute pas de colonne de score : la force de fiche et les distinctions restent calculées, jamais stockées, jamais utilisées pour trier.

## A. Emploi, côté recruteur (cabinet, centre de santé, laboratoire)
Écrans maquettés dans Figma, page « Parcours · step by step » : D-EMPLOI, D-CAND, L-EMPLOI, L-CAND, et les états ouverts OUV-PD-OFFRE, OUV-PD-PUBLIEE, OUV-PD-ECHANGE, OUV-PD-POURVUE, OUV-PL-OFFRE. Ids dans `docs/handoff/parcours.json` ; maquettes React dans `src/app/(maquettes)/maquettes/espace/` (`_emploi.tsx`, `_ouverts.tsx`).
- `publierOffre` : professionnel à la fiche vérifiée, pour l’un de ses lieux d’exercice. Poste, contrat, temps, début, rémunération obligatoire (fourchette brute mensuelle, ou pourcentage pour rétrocession et redevance). Recopie la position du lieu dans `offres.position`, et la commune et le département. Slug unique lisible. Publiée 30 jours.
- **Offres datées (décision du 13 octobre)** : le recruteur confirme son offre tous les 15 jours (`confirmeeLe`), d’un clic depuis l’espace pro ou depuis l’email de rappel ; sans confirmation, l’offre est retirée.
- Candidatures reçues : liste, passage en « vue », proposition d’échange avec créneaux, retenue ou non retenue. Les coordonnées du candidat ne passent au recruteur qu’une fois l’échange accepté.
- « Offre pourvue » clôt l’offre (`clotureeLe`).
- À chaque changement : `updateTag('emploi')`, `updateTag('emploi:offre:{slug}')` et `updateTag('praticien:{slug}')` (le badge Recrute de l’annuaire en dépend).

## B. Emploi, côté salarié et étudiant
Écrans SE1 à SE5 et SE3E (bienvenue), CAND-VUE, CAND-OFFRES, CAND-OFFRE, CAND-CANDID, CAND-PROFIL, CAND-ALERTES, CAND-VISI, ETU-VUE à ETU-FORM, et les états ouverts OUV-C-POSTULER, OUV-C-ENVOYEE, OUV-C-ALERTE, OUV-C-ECHANGE, OUV-C-MASQUER. Routes : `(pro)/espace-candidat/…` et non `(pro)/emploi/…` : `/emploi/` et ses sous-pages sont les pages publiques déjà codées (voir 04 §4).
- `postuler(offreId, message, cv?)` : compte connecté obligatoire, CV facultatif dans le stockage privé, notification au recruteur. Le bouton « Postuler » des pages publiques mène à `/connexion/?retour=…` : fais en sorte qu’il ramène sur l’offre avec le tiroir de candidature ouvert.
- Visibilité « discret », structures masquées, alertes avec critères.
- Vérification du titre ou de la scolarité : automatique, document jamais conservé.

## C. Cessions de cabinet
Décisions du 13 octobre 2026 : dépôt par un praticien à la fiche vérifiée, relecture par l’équipe avant publication, en ligne 90 jours puis renouvelable d’un clic, avec un rappel à J-7 ; contact du cédant avec un compte, par la messagerie de l’espace pro ; secteur flou calculé automatiquement (`rayonSecteur` dans `src/lib/cessions/`), jamais d’adresse.
- Écran « Déposer une annonce » dans la coque de l’espace pro (champs de la page publique : type, titre, description, commune, secteur, fauteuils, chiffre d’affaires, prix ou « sur demande », surface, disponibilité, équipements, conditions, locaux, photos). Statut `en_relecture` à l’envoi. Remplace la constante `ROUTE_DEPOT_CESSION` des pages publiques par la vraie route.
- « Mes annonces » : état, date d’expiration, prolonger de 90 jours, retirer.
- Messagerie : liste des conversations, fil, réponse, non-lus ; email à l’autre partie à chaque nouveau message, sans jamais exposer d’adresse.
- Modération : dans `src/app/(pro)/espace-pro/moderation/page.tsx`, une file « Annonces de cession » (accepter, refuser avec motif) ; à l’acceptation, `publieeLe` et `expireLe` à +90 jours, puis `updateTag('cessions')`.

## D. Jobs (`/api/cron/…`, `CRON_SECRET`)
Ajoute-les au tableau du §6 de 04 :
- `offres-echeance` : rappel de confirmation à J+15, retrait des offres non confirmées ou arrivées à 30 jours, email au recruteur.
- `alertes-emploi` et `alertes-cession` : nouvelles offres ou annonces correspondant aux alertes confirmées, un email par semaine au plus, seulement s’il y a du nouveau.
- `cessions-echeance` : rappel à J-7, passage en `expiree` à échéance.
- `purge-candidatures` : candidatures et CV supprimés 6 mois après la clôture de l’offre.

## Vérification attendue
- `pnpm lint`, `npx tsc --noEmit` et `pnpm test` sans nouvelle erreur.
- Parcours testés en local sur une branche Neon de développement, avec les scripts de données d’exemple `scripts/demo-emploi.ts` et `scripts/demo-cessions.ts` (ils refusent de tourner sur la production) : publier une offre, la confirmer, recevoir une candidature, proposer un échange ; déposer une annonce, la valider en modération, écrire au cédant depuis un autre compte. Captures à 1440 et 390 px.
- `docs/handoff/AVANCEMENT.md` à jour, et la liste des fichiers modifiés, routes, jobs et décisions restantes.
