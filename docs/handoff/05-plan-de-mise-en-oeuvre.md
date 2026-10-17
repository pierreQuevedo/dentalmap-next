# 05 · Plan de mise en œuvre

Prérequis : phase 0 du socle terminée (`../reference/setup-socle-phase-0.md`), header et footer en place. Une branche par phase (`feat/espace-pro-<phase>`), PR vers `dev`, CI verte.

| Phase | Périmètre (IDs d'écrans) | Critères d'acceptation |
|---|---|---|
| **A. Fondations** | Composants `TunnelHeader`, `ActionBar`, `OptionCard`, `Field`, `StatusBadge`, `StrengthRing`, `Achievement` ; gabarit desktop/mobile ; schéma Drizzle de 04 §1 | Rendu fidèle aux frames Figma à 1440 et 390 ; navigation clavier sur `OptionCard` ; migrations passent sur une branche Neon |
| **B. Connexion** | CX1, CX1-E, CX2, CX2-E, CX3, CX4, CX5, CX6, T3, P1, P2 | Un seul email contenant lien et code ; lien 5 min usage unique, code 10 min 5 essais ; consentements horodatés ; `next` respecté ; T3 posé une fois ; P2 révèle le numéro sans cache de la fiche |
| **C. Revendication manuelle santé** | S0 (sans PSC actif), S1, H1, S1-0, S2, S3a, S3b, JD1, K, L, C1, R1, R2, REMP, M1 | Unicité du titulaire en base ; justificatif vérifié automatiquement en quelques minutes et jamais stocké (ni Blob ni base, supprimé après vérification) ; retrait : 410, sitemap, non recréé par la synchro ; contestation avec échéance 7 j |
| **D. Back-office équipe** | Non maquetté : cas douteux de la vérification automatique (sans conservation du document), Kbis, attestations, contestations, demandes d'ajout | Décision avec motif en liste fermée ; email automatique au demandeur ; journal des décisions |
| **E. Pro Santé Connect** | PSC1, PSC-ANS, PSC2, PSC-E, PSC-0, bouton PSC de CX1 | Fonctionne sur le bac à sable ANS ; liaison au compte existant (pas de doublon) ; RPPS sans fiche → revendication en attente appliquée à la synchro suivante |
| **F. Onboarding et gamification** | B0, B0S, B1 à B7, J, DASH | `calculerForce` testée unitairement (Vitest) sur les 3 barèmes ; aucune colonne de score ; filtres patients branchés sur les données ; anti-superlatif en direct ; célébration sans animation si `prefers-reduced-motion` |
| **G. Laboratoire** | L1, LE1, LA1, L2, MAN, LINFO, L3, LCODE, LC1, KL, LREF, LK1, LO0 à LO4, U | Multi-établissements par SIREN ; mandat obligatoire pour un salarié avec notification au gérant ; liaison labo et praticien sans fusion |
| **H. Organisme** | O1, O2a, OA1, OAT, O3a, OEND, W1, O2b, O3b | Vérification par domaine email ; écriture du CPT `formation` via WordPress (authentification applicative) ; partenariat sans création de compte pro |
| **J. Emploi** | SE1 à SE5, SE3E, CAND-*, ETU-*, D-EMPLOI, D-CAND, L-EMPLOI, L-CAND, OUV-PD-*, OUV-PL-*, OUV-C-* | Rubrique Emploi dans la barre des pros ; rémunération en fourchette obligatoire ; offres triées par distance ; coordonnées jamais montrées sans échange accepté ; profil discret invisible des recruteurs ; structures masquées respectées ; purge des candidatures à l’échéance |
| **I. Fraîcheur et notifications** | Jobs n8n de 04 §6, emails Resend | Plafond hebdomadaire respecté ; reconfirmation en un clic depuis l'email |

## Tests de bout en bout (Playwright)

Un scénario par couloir, desktop et mobile : patient depuis une fiche ; dentiste via email du registre ; dentiste via justificatif validé automatiquement ; dentiste via justificatif refusé puis Pro Santé Connect ; salarié de l’inscription à la candidature, puis échange accepté ; étudiant rattaché à son école ; conflit ; retrait puis annulation ; laboratoire salarié mandaté ; établissement hors domaine ; partenariat.

## Manques connus (à concevoir avant ou pendant)

1. Back-office de l'équipe (phase D) : aucune maquette.
2. Gabarits des emails transactionnels (lien + code, courrier au siège pour les laboratoires, décisions, rappels, alertes emploi, candidatures).
3. Desktop de l'espace laboratoire : dérivé provisoire du tableau de bord dentiste.
4. Mode sombre non relu écran par écran.
5. Icônes Lucide de la barre latérale.
6. Prestataire d'envoi postal du code pour les laboratoires (choix et contrat).
8. Service de vérification automatique des justificatifs (lecture du document, comparaison au RPPS, aucune conservation) : choix technique et cas douteux.
9. Pages publiques de l’emploi sur le site (liste des offres, page d’une offre) : à concevoir.
7. Raccordement PSC : démarche administrative à lancer tôt, délai indépendant du développement.
