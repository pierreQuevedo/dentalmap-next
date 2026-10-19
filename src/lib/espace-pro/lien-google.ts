/**
 * La vérification du lien posé dans la fiche Google, sans appel à Google :
 * le lien `/p/<slug>/g/` compte les clics qui en viennent. Le premier valide,
 * chaque clic renouvelle, et sans clic venu de Google pendant
 * `VALIDITE_LIEN_GOOGLE_JOURS` jours la vérification expire : le lien a
 * sans doute été retiré de la fiche Google.
 */
export const VALIDITE_LIEN_GOOGLE_JOURS = 30

export type EtatLienGoogle = { etat: 'attente' } | { etat: 'actif'; dernier: Date; clics: number } | { etat: 'expire'; dernier: Date }

export function etatLienGoogle(f: { lienGoogleDernierLe: string | null; lienGoogleClics: number } | null, maintenant = new Date()): EtatLienGoogle {
  if (!f?.lienGoogleDernierLe) return { etat: 'attente' }
  const dernier = new Date(f.lienGoogleDernierLe)
  const jours = (maintenant.getTime() - dernier.getTime()) / 86_400_000
  return jours > VALIDITE_LIEN_GOOGLE_JOURS ? { etat: 'expire', dernier } : { etat: 'actif', dernier, clics: f.lienGoogleClics }
}

/**
 * Un visiteur arrive-t-il de Google ? La recherche (google.fr, google.com…) et
 * l'application Maps ou Google sur Android, d'après l'adresse de provenance.
 * Aucun appel à Google : on lit seulement l'en-tête que le navigateur envoie.
 */
export function vientDeGoogle(provenance: string | null): boolean {
  if (!provenance) return false
  return (
    /^https?:\/\/([a-z0-9-]+\.)*google\.[a-z.]{2,6}(\/|$)/i.test(provenance) ||
    /^android-app:\/\/com\.google\.android\.(apps\.maps|googlequicksearchbox)/i.test(provenance)
  )
}
