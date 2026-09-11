#!/usr/bin/env bash
# Rafraîchit schema.graphql depuis le CMS.
#
# L'introspection publique de WPGraphQL est coupée en production, et une
# introspection HTTP échouerait donc. On passe par `wp graphql
# generate-static-schema`, qui construit le schéma côté serveur sans requête
# GraphQL, puis on rapatrie le fichier.
#
# À lancer après toute modification de CPT ou de groupe de champs ACF, puis
# `pnpm codegen`.
set -euo pipefail

CMS_SSH="${CMS_SSH:-dentalk@ssh.cluster100.hosting.ovh.net}"
CMS_PATH="${CMS_PATH:-cms}"
DEST="${1:-schema.graphql}"
REMOTE_TMP="$CMS_PATH/.schema-pull.graphql"

echo "Génération du schéma sur $CMS_SSH:$CMS_PATH"
ssh -o BatchMode=yes "$CMS_SSH" \
  "export PATH=\$HOME/bin:\$PATH; cd \"\$HOME/$CMS_PATH\" && wp graphql generate-static-schema --output=\"\$HOME/$REMOTE_TMP\"" >/dev/null

scp -q -o BatchMode=yes "$CMS_SSH:$REMOTE_TMP" "$DEST"
ssh -o BatchMode=yes "$CMS_SSH" "rm -f \"\$HOME/$REMOTE_TMP\""

echo "$DEST mis à jour ($(wc -l < "$DEST" | tr -d ' ') lignes)"
