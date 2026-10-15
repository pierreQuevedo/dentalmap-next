# 06 · Annexe : informations demandées et poids sur la présence

Liste de toutes les informations que l'espace pro demande, par profil, avec leur poids. Complète le barème de `03-gamification.md`, qui reste la source pour les points.

## Ce que « booster la présence » veut dire ici

Révision du 15 octobre 2026 : la force de la fiche ordonne désormais les résultats, avant la distance au centre de la recherche. Une information renseignée agit en outre de trois façons :

1. **Filtres** : la fiche apparaît quand un patient (ou un cabinet) filtre sur ce critère. Sans l'information, elle en est absente.
2. **Rendu** : la fiche est plus complète à l'écran (photo, « Ouvert jusqu'à 19 h », présentation).
3. **Moteurs** : données structurées plus riches (schema.org `Dentist`), donc un meilleur affichage sur Google.

## Échelle d'importance

| Note | Sens |
|---|---|
| ●●●●● | Indispensable : sans elle, la fiche manque une recherche fréquente ou ne peut rien publier |
| ●●●●○ | Forte : filtre très utilisé ou effet visible dans les résultats |
| ●●●○○ | Utile : filtre ou rendu apprécié, effet plus ciblé |
| ●●○○○ | Complément : améliore la fiche sans ouvrir de filtre important |

L'importance combine les points du barème, l'usage côté patient et l'effet sur la présence. À importance égale, la prochaine action recommandée est celle qui rapporte le plus de points, puis la plus rapide.

## Chirurgien-dentiste ou spécialiste (100 points)

| Information | Points | Importance | Effet sur la présence | Où elle est demandée | Fraîcheur |
|---|---|---|---|---|---|
| Identité vérifiée (revendication) | 30 | ●●●●● | Débloque tout le reste. Badge « Gérée par le praticien » sur la carte de recherche. Distinctions « Fiche vérifiée », « Identifié PSC » | S0 à S3b, PSC, JD1 et K (justificatif vérifié automatiquement, jamais conservé) | Vérification registre hebdomadaire |
| Horaires (7 jours, fermetures comprises) | 20 | ●●●●● | Filtre « Ouvert maintenant », mention « Ouvert jusqu'à 19 h », `openingHoursSpecification` | Onboarding B1 | Rappel J+75, 10 points à J+90, 0 point et sortie du filtre à J+180 |
| Secteur de conventionnement | 5 | ●●●●○ | Filtre « Secteur 1 » | Onboarding B2 | Reconfirmation sur changement |
| Tiers payant (oui, partiel, non) | 5 | ●●●●○ | Filtre « Tiers payant » | Onboarding B2 | Reconfirmation sur changement |
| Photo du cabinet (entrée, 16:9) | 12 | ●●●●○ | Image sur la fiche et dans les résultats, `image` | Mission du tableau de bord (ancienne B4) | 2 ans |
| Langues parlées (au moins une réponse) | 5 | ●●●○○ | Filtre par langue, distinction « Bilingue » | Onboarding B3 | 1 an |
| Accessibilité PMR (oui, partiel, non) | 5 | ●●●○○ | Filtre accessibilité, `amenityFeature`, distinction « Cabinet accessible ». La réponse compte, pas le oui | Onboarding B3 | 1 an |
| Présentation (200 à 800 caractères, aucun terme refusé) | 10 | ●●●○○ | Texte de la fiche, meilleure compréhension par les moteurs. 0 point tant qu'un terme refusé est présent | Mission du tableau de bord (ancienne B5) | 1 an |
| Qualification (omnipratique ou spécialité qualifiante) | hors barème | ●●●●○ | Affichée sur la fiche, lue au registre (Annuaire Santé), verrouillée | Onboarding B0S (lecture seule) | Suit le registre |
| Domaines de soins (5 au plus, liste fermée, `fiches_completees.domaines`) | à arbitrer (la mission valait 8) | ●●●○○ | Filtre « Domaine de soins », mention « renseigné par le praticien » | Onboarding B0S (remplace la mission du tableau de bord, ancienne B6) | 1 an |
| Âge minimum des patients | (dans Accueil) | ●●○○○ | Filtre « Enfants » | Onboarding B3 | 1 an |
| Liens du cabinet (site web, prise de rendez-vous en ligne) | hors barème | ●●●●○ | Boutons « Site du cabinet » et « Prendre rendez-vous » sur la fiche, `url` et `potentialAction` dans les données structurées. Le lien sort de DentalMap sans intermédiaire ni suivi | Mission du tableau de bord | 1 an, lien testé chaque semaine (masqué s'il ne répond plus) |
| Modes de paiement | hors barème | ●●○○○ | Bloc « Paiement » de la fiche, déjà affiché. Décision du 10 octobre 2026 : on le garde tel quel, sans points | Onboarding B2 (avec le tiers payant) | 1 an |
| Lieux d'exercice gérés | 0 | ●●○○○ | Chaque lieu complété apparaît dans les filtres de sa commune. Distinction « Multi-lieux » | M1, onglet Registre | Suit le registre |

**Ordre conseillé.** L'onboarding court (B0S puis B1 à B3, quatre questions depuis le 11 octobre 2026) couvre ce que les patients filtrent le plus : 70 points avec l'identité, hors domaines de soins dont le poids reste à arbitrer. Le tableau de bord propose ensuite la photo (+12) et la présentation (+10).

## Laboratoire de prothèse (100 points)

| Information | Points | Importance | Effet sur la présence | Où elle est demandée | Fraîcheur |
|---|---|---|---|---|---|
| Identité vérifiée (Kbis ou code au siège) | 30 | ●●●●● | Débloque la fiche, badge « Gérée par le laboratoire », distinction « Labo vérifié » | L1 à L3, LCODE, KL | Vérification Sirene hebdomadaire |
| Savoir-faire (au moins 3 techniques) | 15 | ●●●●● | Filtres par technique côté cabinets, distinction « Savoir-faire » | Onboarding LO1 | 1 an |
| Matériaux et CFAO | 10 | ●●●●○ | Filtres par matériau et usinage | Onboarding LO1 | 1 an |
| Délais par type de pièce | 10 | ●●●●○ | Comparaison des délais, distinction « Délais à jour » | Onboarding LO2 | Rappel à 5 mois, à reconfirmer à 6, expiré à 12 |
| Zone desservie (rayon, ramassage) | 10 | ●●●●○ | Présence dans les recherches des cabinets de la zone | Onboarding LO2 | 1 an |
| Photos de réalisations (1 à 8) | 10 | ●●●○○ | Galerie sur la fiche | Mission de l'espace laboratoire (ancienne LO3) | 2 ans |
| Jours et secteur de ramassage, envoi par transporteur hors zone | (dans Zone) | ●●●○○ | Mention « Ramassage chaque jour ouvré à… » sur la fiche, filtre « Ramassage » | Écran « Zone et logistique » | 1 an |
| Crédit photo des réalisations et attestation des droits | hors barème | ●●○○○ | Ligne de crédit sous les réalisations | Écran « Réalisations » | Suit les photos |
| Déclaration ANSM | 10 | ●●●○○ | Mention de conformité, distinction « Déclaré ANSM » | Mission de l'espace laboratoire (ancienne LO3) | 1 an |
| Présentation | 5 | ●●○○○ | Texte de la fiche | Mission de l'espace laboratoire | 1 an |

**Ordre conseillé.** Onboarding LO1 et LO2 : 75 points. Missions : réalisations et ANSM (+20), présentation (+5).

## École ou organisme (100 points)

| Information | Points | Importance | Effet sur la présence | Où elle est demandée | Fraîcheur |
|---|---|---|---|---|---|
| Identité vérifiée (domaine email ou attestation) | 30 | ●●●●● | Publication de l'établissement, distinction « Établissement vérifié » | O2a, OAT | Référentiel UAI |
| Formations (au moins une active) | 25 | ●●●●● | Présence dans l'annuaire de la formation, filtres par diplôme | O3a | 1 an |
| Conditions d'accès | 15 | ●●●●○ | Filtres par niveau d'entrée | O3a | 1 an |
| Alternance | 10 | ●●●●○ | Filtre « Alternance » | O3a | 1 an |
| Portes ouvertes (date future ou « aucune ») | 10 | ●●●○○ | Mise en avant de la date sur la fiche, distinction « Calendrier à jour » | O3a | Expire à la date passée |
| Photo | 10 | ●●●○○ | Image de la carte de formation | O3a | 2 ans |

### Page unique de l'établissement : ce qui la construit

Chaque section de la page (maquette Figma, page « Site », section « Page établissement de formation ») ne s'affiche que si ses informations existent. Les données de référentiel sont lues automatiquement et jamais saisies ; les données déclarées viennent de l'espace pro, sous forme de missions après l'onboarding.

| Section | Information | Source | Où elle est collectée | Fraîcheur |
|---|---|---|---|---|
| Héros | Nom, statut (public, privé sous contrat, privé hors contrat), adresse | Référentiel UAI (annuaire de l'Éducation nationale), Sirene | Automatique | Synchronisation hebdomadaire |
| Héros | Prochaines portes ouvertes (date, horaires) | Déclaré | Onboarding O3a (déjà au barème) | Expire à la date passée |
| Héros | Période de candidature et plateforme (Parcoursup, Affelnet, dossier) | Déclaré, contrôlé contre le calendrier public des plateformes | Mission « Calendrier de candidature » | Chaque année |
| Héros | Chiffres clés : diplômes, réussite, places, laboratoires partenaires | Calculés à partir des sections ci-dessous | Aucune saisie | Suit les sources |
| Présentation | Phrase d'accroche (citation) et présentation (200 à 800 caractères) | Déclaré | Mission « Présentation » | 1 an |
| Héros | Logo (carré ou horizontal, fond transparent, SVG ou PNG) | Déclaré | Mission « Logo » ; monogramme affiché tant qu'il manque | Sans limite, remplaçable |
| Galerie | Photos des locaux, ateliers et événements (5 affichées, jusqu'à 24, avec légende) | Déclaré | Onboarding O3a (photo) puis mission « Galerie » | 2 ans par photo |
| Galerie | Crédit photo : auteur ou détenteur des droits, pour toute la galerie ou photo par photo, et attestation des droits | Déclaré | Écran « Galerie » du tableau de bord. Sans crédit, la page affiche « Photos publiées par l'établissement » | Suit les photos |
| Formations | Pour chaque diplôme : intitulé, niveau, durée, prérequis, voies (initiale, apprentissage, continue), places, plateforme de candidature, rentrée | Intitulé, niveau et code RNCP : France compétences. Le reste : déclaré | Onboarding O3a (au moins une formation), mission « Compléter chaque formation » | 1 an |
| Admission | Étapes de sélection avec leur période (dossier, entretien, test) | Déclaré | Mission « Admission » | 1 an |
| Admission | Ce que l'école attend (trois points au plus) | Déclaré | Mission « Admission » | 1 an |
| Alternance | Rythme, aide à la recherche d'employeur, rémunération | Déclaré (rémunération : rappel du barème légal) | Onboarding O3a (alternance, au barème) puis mission « Alternance » | 1 an |
| Alternance | Nombre de laboratoires partenaires | Déclaré | Mission « Alternance » | 1 an |
| Alternance | Carte des laboratoires autour de l'école | Annuaire DentalMap (Sirene) | Automatique | Synchronisation hebdomadaire |
| Résultats | Réussite aux examens par diplôme, insertion à 6 mois, poursuite d'études | Ministère de l'Éducation nationale (résultats aux examens, InserJeunes). Jamais saisi par l'établissement | Automatique | Chaque session, avec l'année affichée |
| Résultats | Débouchés | Fiche métier du diplôme (France compétences), complétée par l'établissement | Mission « Débouchés » | 1 an |
| Plateau technique | Ateliers et équipements (trois au plus, avec description) | Déclaré | Mission « Plateau technique » | 2 ans |
| Vie étudiante | Internat (places), restauration, transports, référent handicap | Déclaré ; transports proposés à partir de l'adresse | Mission « Vie étudiante » | 1 an |
| Coûts et aides | Frais de scolarité, équipement, aides, financement de l'apprentissage | Déclaré | Mission « Coûts » | 1 an |
| Rendez-vous | Événements datés (portes ouvertes, mini-stages, forums) | Déclaré | Mission « Événements » | Expire à la date passée |
| Accès et contacts | Secrétariat, référent handicap, relations entreprises (téléphone, adresse électronique), site web | Déclaré | Mission « Contacts » | 1 an, liens testés chaque semaine |
| Registres | UAI, SIRET, statut, certification Qualiopi, inscription RNCP des diplômes | Référentiel UAI, Sirene, liste publique Qualiopi, France compétences | Automatique | Synchronisation hebdomadaire |
| Autres établissements | Établissements qui préparent les mêmes diplômes, par distance | Annuaire DentalMap | Automatique | Suit l'annuaire |

**Faculté d'odontologie : sections propres.** La page faculté reprend le héros (avec l'université sous le nom), la présentation, la galerie, la vie étudiante, les coûts, les rendez-vous, les contacts et les registres. Elle remplace formations, admission, alternance et résultats par :

| Section | Information | Source | Où elle est collectée | Fraîcheur |
|---|---|---|---|---|
| Accès aux études | Voies d'accès (PASS, L.AS, passerelles) et calendrier | Déclaré, déjà lu dans le contenu WordPress (« Accès aux études ») | Mission « Accès aux études » | 1 an |
| Accès aux études | Places en 2e année, sur cinq ans | Arrêtés annuels fixant les capacités d'accueil | Automatique | Chaque année |
| Cursus | Cycles (DFGSO, DFASO, 6e année), diplôme d'État, autres diplômes (DU, CES) | Diplôme : RNCP. Autres diplômes : déclaré | Mission « Cursus » | 1 an |
| Internat | Spécialités, durée, postes ouverts par an | Arrêté annuel du Centre national de gestion | Automatique | Chaque année |
| Se faire soigner | Centres de soins : nom, adresse, jours, horaires, téléphone de rendez-vous, délai moyen pour obtenir un rendez-vous, soins proposés | Déclaré ; adresses géocodées comme les autres lieux | Mission « Centres de soins » | 1 an, téléphones testés |
| Se faire soigner | CHU de rattachement | Déclaré, déjà lu dans le contenu WordPress (« Soins et hôpital ») | Mission « Centres de soins » | 1 an |

Le barème de 100 points ci-dessus reste inchangé : les nouvelles missions comptent pour la complétude de la page, pas pour la force de fiche. À arbitrer : leur donner des points dans `03-gamification.md`, ou les laisser hors barème comme les liens du cabinet.

## Partager et parrainer (tous profils)

Écran « Partager et parrainer » de l'espace pro (rubrique Visibilité). Le partage ne rapporte pas de points de force : il agit sur la présence hors de DentalMap.

| Action | Importance | Effet sur la présence | Où |
|---|---|---|---|
| Lien court personnel (`dentalmap.fr/p/…`) dans la fiche Google du cabinet (champ « Site web » ou « Lien de prise de rendez-vous ») | ●●●●● | Visites directes depuis Google Maps et la recherche, la source la plus forte | Pas-à-pas dans l'écran |
| Badge « Vérifié sur DentalMap » sur le site du cabinet | ●●●●○ | Backlink vers la fiche sur chaque site qui l'affiche, meilleur référencement de la fiche. Code en HTML simple (`<a href>`), sans script, pour que le lien soit suivi par les moteurs | Code à copier |
| Réseaux sociaux (lien en bio, publication, visuel prêt à poster) | ●●●○○ | Visites directes de patients qui connaissent déjà le cabinet | Visuel généré |
| Parrainage de confrères | ●●○○○ | Aucun effet direct ; plus de fiches revendiquées et complètes dans l'annuaire | Invitation par nom ou RPPS |

Mesure : visites venues du lien et leur source, sans cookie ni donnée patient (seule l'origine du clic est gardée).

Distinctions proposées : « Fiche partagée » (100 visites via le lien), « Ambassadeur » (3 confrères ayant revendiqué leur fiche). À ajouter au tableau de `03-gamification.md` si validées.

**Proposition à arbitrer : bonus de départage.** À distance égale, une fiche partagée passerait avant l'ordre alphabétique. Elle modifie la règle non négociable « la place ne s'achète pas » de `00-contexte-et-decisions.md`, la promesse publique de l'accueil (« Classement transparent… Aucune fiche n'est remontée ») et oblige à publier le critère dans la méthode de classement (Code de la consommation, art. L111-7). Rien n'est modifié tant qu'elle n'est pas validée.

## Salarié ou étudiant : profil candidat (hors barème)

Ajouté le 11 octobre 2026 (parcours SE1 à SE5, espace emploi CAND et ETU). Le profil candidat n'est pas une fiche publique : il n'a ni force ni points, et n'apparaît aux recruteurs que selon la visibilité choisie. Aucune coordonnée n'est transmise sans accord.

| Section | Information | Source | Où elle est collectée | Fraîcheur |
|---|---|---|---|---|
| Situation | Assistant(e) dentaire, secrétaire ou assistant(e) de gestion, prothésiste salarié(e), étudiant(e) | Déclaré | SE1, CAND-PROFIL ou ETU-PROFIL | Modifiable à tout moment |
| Critères | Contrats (CDI, CDD, remplacement, alternance, stage), temps plein ou partiel, ville et rayon (5 à 50 km), disponibilité | Déclaré ; ville par la table communes puis BAN | SE2, CAND-ALERTES | Disponibilité à reconfirmer une fois la date passée (proposition) |
| Qualification | Titre d'assistant(e) dentaire, en formation, autre ; badge « Titre vérifié » | Déclaré ; vérification automatique facultative, document supprimé dès la fin de la vérification | SE3, CAND-PROFIL | Badge sans limite, qualification modifiable |
| Formation (étudiant) | École, formation, année, recherche (alternance, stage, job étudiant) | École : pages établissement vérifiées. Le reste : déclaré ; certificat de scolarité facultatif, supprimé après vérification | SE3E, ETU-FORM | Chaque rentrée (proposition) |
| Visibilité | Visible par les recruteurs vérifiés, anonymisé ou discret | Déclaré | SE4, CAND-VISI | Modifiable à tout moment |
| Structures masquées | Structures qui ne voient pas le profil | Déclaré | SE4, OUV-C-MASQUER, CAND-VISI | Sans limite, retirables |
| Alertes | Critères de l'alerte, envoi par courriel accepté ou non | Déclaré | SE2 (première alerte), SE4, OUV-C-ALERTE | Sans limite |
| CV | Fichier facultatif | Déclaré | CAND-PROFIL, ETU-PROFIL, OUV-C-POSTULER | Remplaçable à tout moment ; durée de conservation à valider |
| Candidatures | Offre, message facultatif, statut, accord d'échange horodaté | Déclaré | OUV-C-POSTULER, OUV-C-ECHANGE | Supprimées 6 mois après la clôture de l'offre (à valider) |

## Offre d'emploi (dentiste et laboratoire, hors barème)

Une offre ne rapporte aucun point de force et ne change pas la place de la fiche. Les offres sont triées par distance, puis par ordre alphabétique.

| Section | Information | Source | Où elle est collectée | Fraîcheur |
|---|---|---|---|---|
| Structure | Nom, adresse, statut vérifié | Fiche revendiquée (registre RPPS ou Sirene) | Automatique | Suit le registre |
| Poste | Intitulé (liste à définir), contrat, temps de travail, date de début | Déclaré | OUV-PD-OFFRE, OUV-PL-OFFRE | Publication 30 jours |
| Rémunération | Brute mensuelle, en fourchette (minimum et maximum), obligatoire | Déclaré | OUV-PD-OFFRE, OUV-PL-OFFRE | Publication 30 jours |
| Lieu | Lieu d'exercice ou établissement, distance calculée | Lieux gérés par le compte, géocodés | OUV-PD-OFFRE, OUV-PL-OFFRE | Suit le registre |
| Description | Description du poste, avantages | Déclaré | OUV-PD-OFFRE, OUV-PL-OFFRE | Publication 30 jours |
| Statut | Brouillon, en ligne, pourvue | Déclaré | D-EMPLOI, L-EMPLOI, OUV-PD-POURVUE | Fin automatique à 30 jours |

## Ce qui ne rapporte rien, volontairement

- **Données du registre** (nom, RPPS, SIREN, adresse) : lecture seule, jamais saisies, donc jamais comptées.
- **Distinctions** : privées, aucun effet sur l'affichage public ni sur l'ordre.
- **Paiement à DentalMap** : aucun lien avec la présence. La copie ne promet pas l'inverse.

## Points à trancher

1. **Âge minimum.** L'écran B3 demande trois réponses (langues, accessibilité, âge) pour 10 points, alors que le barème de `03-gamification.md` n'en compte que deux (langues 5, PMR 5). Il faut soit donner un poids à l'âge minimum, soit le sortir du calcul.
2. **Fraîcheur du conventionnement.** Elle n'est pas définie dans `03-gamification.md`. Proposition : reconfirmation annuelle, comme l'accueil.
3. **Champs existants dans le code.** Tranché le 10 octobre 2026 : `paiements` reste affiché sans points ; `orientations` correspond aux domaines de soins.
4. **Poids des domaines de soins (B0S).** À arbitrer. La mission « Domaines de soins » valait +8 % ; elle est remplacée le 11 octobre 2026 par l'écran B0S de l'onboarding. Les pourcentages existants ne changent pas (arrivée à 70 %) tant que ce poids n'est pas fixé. À trancher aussi : B0S écrit `fiches_completees.domaines` alors que le point 3 rattachait les domaines au champ `orientations`.
5. **Conservation des candidatures.** Proposition : suppression 6 mois après la clôture de l'offre. À valider, ainsi que la durée de conservation du CV.
