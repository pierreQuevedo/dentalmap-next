@AGENTS.md


## Espace pro (chantier en cours)

- Référence : `docs/handoff/` (lire `README.md` d'abord). Parcours écran par écran : `docs/handoff/02-parcours-espace-pro.md` et `parcours.json`.
- Maquettes : Figma `oxe3W5vGaT9QEYH6ur6Z3p`, page « Parcours · step by step ». Node IDs desktop et mobile par écran dans `parcours.json`.
- Avancement : `docs/handoff/AVANCEMENT.md`, à tenir à jour écran par écran.
- Le code existant fait foi : quand il diverge de la transmission (connexion par adresse et mot de passe, schéma, routes), on le garde et c'est Figma qu'on aligne sur le site.
- Données de registre en lecture seule ; données déclaratives dans `fiches_completees` et `fiches_labo`, affichées « renseigné par le praticien ».
- Force de fiche : fonction pure `calculerForce()`, jamais stockée. Tri des résultats (recherche, région, département, commune) : points de progression de la fiche (`src/lib/espace-pro/progression.ts` : la force, un point par pour cent, plus lien Google, badge, partages, parrainages, fraîcheur), avec le bonus du palier tenu (Ambassadeur +5, Référence locale +10) et celui, temporaire, des parrainages (`src/lib/annuaire/remplissage.ts`), puis distance au centre de la recherche, puis alphabétique. La carte de résultat porte la pastille et l'habillage du palier, et la photo de profil. Le site met en avant, auprès des pros, que plus une fiche est complète, plus elle remonte dans les recherches (décision du 2026-10-25) ; il ne détaille ni le barème ni les bonus, et ne promet ni gratuité ni absence de mise en avant payante.
- Les bandeaux « SIMULER » des maquettes ne sont pas des éléments d'interface.
