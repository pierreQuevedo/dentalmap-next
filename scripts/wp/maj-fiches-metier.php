<?php
/**
 * Met à jour les fiches métier déjà créées (brouillons ou publiées) à partir
 * de `docs/acf/contenu-metiers.json` : titre, extrait et champs du groupe
 * « Fiche métier ». Ne publie rien, ne crée rien.
 *
 *   wp eval-file maj-fiches-metier.php <chemin du JSON>
 */
if (!defined('WP_CLI')) exit;
$fiches = json_decode(file_get_contents($args[0] ?? ''), true);
if (!is_array($fiches)) WP_CLI::error('JSON illisible.');
foreach ($fiches as $f) {
  $post = get_page_by_path($f['slug'], OBJECT, 'conseil');
  if (!$post) { WP_CLI::warning("Absente : {$f['slug']}"); continue; }
  wp_update_post(['ID' => $post->ID, 'post_title' => $f['titre'], 'post_excerpt' => $f['extrait']]);
  update_field('field_dm_conseil_temps_lecture', (int) $f['tempsLecture'], $post->ID);
  foreach ($f['acf'] as $nom => $valeur) update_field('field_dm_' . $nom, $valeur, $post->ID);
  WP_CLI::log("Mise à jour : {$f['slug']} ({$post->post_status})");
}
WP_CLI::success('Fiches à jour.');
