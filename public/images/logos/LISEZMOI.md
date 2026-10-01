# Logos partenaires

Les logos de ce dossier sont affichés dans la bande du hero de l'accueil,
déclarés un par un dans `src/components/home/HomeHero.tsx`.

Règles :

- Nom de fichier en minuscules, sans accent ni espace, avec la vraie
  extension : plusieurs fichiers reçus en `.svg` étaient des WebP et ont été
  renommés.
- Fond transparent. Les logos sont passés en blanc par filtre CSS, ce qui
  rend blanc tout pixel opaque : un fond blanc opaque deviendrait un pavé.
  Le logo de Strasbourg, livré ainsi, a été détouré en PNG transparent.
- Une trentaine de pixels de haut à l'affichage : inutile de déposer des
  fichiers de plusieurs milliers de pixels.

Le block hero140 limite la bande à vingt logos ; les suivants ne sont pas
rendus.
