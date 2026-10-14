<?php
/**
 * Installation WordPress de la vitrine, à lancer par WP-CLI sur le serveur :
 *
 *   wp eval-file installer-vitrine.php <dossier>
 *
 * <dossier> contient les JSON de `docs/acf/` et les photos des fiches métier.
 * Idempotent : chaque étape vérifie ce qui existe avant d'écrire.
 *
 * 1. Ajoute le choix « metiers : Métiers » à la catégorie des conseils.
 * 2. Importe ou met à jour les groupes ACF (fiche métier, modules d'article,
 *    informations détaillées des formations).
 * 3. Range les articles sans catégorie dans leur rubrique.
 * 4. Crée les fiches métier en BROUILLON, avec image à la une : elles se
 *    relisent puis se publient dans WordPress.
 */

if (!defined('WP_CLI')) exit;

$dossier = rtrim($args[0] ?? '', '/');
if (!$dossier || !is_dir($dossier)) WP_CLI::error('Dossier des fichiers manquant.');

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

/* 1. Catégorie « Métiers » */
$champ = acf_get_field('field_dm_conseil_categorie');
if (!$champ) WP_CLI::error('Champ catégorie des conseils introuvable.');
if (!isset($champ['choices']['metiers'])) {
  $champ['choices']['metiers'] = 'Métiers';
  acf_update_field($champ);
  WP_CLI::log('Catégorie : choix « Métiers » ajouté.');
} else {
  WP_CLI::log('Catégorie : « Métiers » existe déjà.');
}

/* 2. Groupes ACF */
foreach (['fiche-metier.json', 'article-modules.json', 'formation-details.json'] as $fichier) {
  $groupes = json_decode(file_get_contents("$dossier/$fichier"), true);
  if (!is_array($groupes)) WP_CLI::error("JSON illisible : $fichier");
  if (isset($groupes['key'])) $groupes = [$groupes];
  foreach ($groupes as $groupe) {
    $existant = acf_get_field_group($groupe['key']);
    if ($existant && !empty($existant['ID'])) $groupe['ID'] = $existant['ID'];
    acf_import_field_group($groupe);
    WP_CLI::log(($existant ? 'Groupe mis à jour : ' : 'Groupe importé : ') . $groupe['title']);
  }
}

/* 3. Rubriques des articles sans catégorie */
$rubriques = [
  'lire-un-devis-de-prothese-dentaire-ligne-par-ligne' => 'patients',
  'sinstaller-en-liberal-les-demarches-dans-lordre' => 'praticiens',
  'marquage-ce-des-dispositifs-sur-mesure-ce-que-dit-le-reglement' => 'prothesistes',
  'secteur-1-secteur-2-conventionnement-ce-que-ca-change-pour-vous' => 'patients',
  'revendiquer-sa-fiche-dentalmap-avec-sa-carte-cps' => 'praticiens',
];
foreach ($rubriques as $slug => $categorie) {
  $post = get_page_by_path($slug, OBJECT, 'conseil');
  if (!$post) { WP_CLI::warning("Article introuvable : $slug"); continue; }
  if (get_field('categorie', $post->ID)) { WP_CLI::log("Rubrique déjà posée : $slug"); continue; }
  update_field('field_dm_conseil_categorie', $categorie, $post->ID);
  WP_CLI::log("Rubrique « $categorie » : $slug");
}

/* 4. Fiches métier en brouillon */
$fiches = json_decode(file_get_contents("$dossier/contenu-metiers.json"), true);
$medias = [];
foreach ($fiches as $f) {
  $existe = get_page_by_path($f['slug'], OBJECT, 'conseil');
  if ($existe) { WP_CLI::log("Fiche déjà présente : {$f['slug']} (id {$existe->ID})"); continue; }

  $id = wp_insert_post([
    'post_type' => 'conseil',
    'post_status' => 'draft',
    'post_name' => $f['slug'],
    'post_title' => $f['titre'],
    'post_excerpt' => $f['extrait'],
  ], true);
  if (is_wp_error($id)) { WP_CLI::warning("{$f['slug']} : " . $id->get_error_message()); continue; }

  update_field('field_dm_conseil_categorie', 'metiers', $id);
  update_field('field_dm_conseil_temps_lecture', (int) $f['tempsLecture'], $id);
  foreach ($f['acf'] as $nom => $valeur) {
    update_field('field_dm_' . $nom, $valeur, $id);
  }

  $photo = basename($f['image']);
  if (!isset($medias[$photo]) && is_file("$dossier/$photo")) {
    $copie = wp_tempnam($photo);
    copy("$dossier/$photo", $copie);
    $media = media_handle_sideload(['name' => $photo, 'tmp_name' => $copie], 0, 'Photo d’illustration (Pexels)');
    $medias[$photo] = is_wp_error($media) ? 0 : $media;
  }
  if (!empty($medias[$photo])) set_post_thumbnail($id, $medias[$photo]);

  WP_CLI::log("Fiche créée en brouillon : {$f['slug']} (id $id)");
}

WP_CLI::success('Installation terminée.');
