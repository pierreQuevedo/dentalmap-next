/**
 * Garde-fou des suppressions.
 *
 * Un run qui ferait disparaître plus de 5 % de l'effectif n'applique rien et
 * s'arrête en statut `bloque`. C'est la protection contre un fichier source
 * tronqué ou un changement de format silencieux : le scénario qui viderait
 * l'annuaire et détruirait son référencement en une nuit.
 *
 * Le seuil ne s'applique qu'aux imports de fichier complet. En synchronisation
 * incrémentale, l'API ne renvoie que des modifications et une absence ne
 * signifie pas une radiation.
 */
export const SEUIL_SUPPRESSION = 0.05

export function doitBloquer(enBase: number, disparus: number, seuil = SEUIL_SUPPRESSION): boolean {
  if (enBase === 0) return false
  return disparus / enBase > seuil
}
