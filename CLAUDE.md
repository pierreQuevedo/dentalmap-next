@AGENTS.md


## Espace pro (chantier en cours)

- Référence : `docs/handoff/` (lire `README.md` d'abord). Parcours écran par écran : `docs/handoff/02-parcours-espace-pro.md` et `parcours.json`.
- Maquettes : Figma `oxe3W5vGaT9QEYH6ur6Z3p`, page « Parcours · step by step ». Node IDs desktop et mobile par écran dans `parcours.json`.
- Avancement : `docs/handoff/AVANCEMENT.md`, à tenir à jour écran par écran.
- Le code existant fait foi : quand il diverge de la transmission (connexion par adresse et mot de passe, schéma, routes), on le garde et c'est Figma qu'on aligne sur le site.
- Données de registre en lecture seule ; données déclaratives dans `fiches_completees` et `fiches_labo`, affichées « renseigné par le praticien ».
- Force de fiche : fonction pure `calculerForce()`, jamais stockée, jamais utilisée pour trier. Tri des résultats : distance puis alphabétique.
- Les bandeaux « SIMULER » des maquettes ne sont pas des éléments d'interface.
