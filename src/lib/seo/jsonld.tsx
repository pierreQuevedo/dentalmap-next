/**
 * Données structurées schema.org.
 *
 * Règle de fond : on ne déclare que ce qui vient d'un registre. Pas d'horaires,
 * pas de note, pas d'avis, pas de prix tant que ces informations ne sont pas
 * sourcées. Un balisage qui affirme plus que la page est une cause connue de
 * pénalité, et contredirait la promesse de l'annuaire.
 */
import { formaterAdresse } from '@/lib/annuaire/nom'
import type { Praticien } from '@/lib/annuaire/types'
import { SITE_NOM, SITE_URL, url } from './site'

export function jsonLd(donnees: object): string {
  // Le contenu est inséré dans un <script type="application/ld+json"> ; seule la
  // séquence « </ » peut en sortir prématurément.
  return JSON.stringify(donnees).replace(/</g, '\\u003c')
}

export function filAriane(segments: { nom: string; chemin: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.nom,
      item: url(s.chemin),
    })),
  }
}

export function organisation() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NOM,
    url: SITE_URL,
    description:
      'Annuaire des chirurgiens-dentistes et des laboratoires de prothèse dentaire en France, ' +
      'construit à partir des registres publics et sans mise en avant payante.',
  }
}

/**
 * Fiche d'un professionnel.
 *
 * `Dentist` pour un chirurgien-dentiste, `MedicalBusiness` pour un laboratoire :
 * un laboratoire de prothèse n'est pas un lieu de soin et ne doit pas être
 * balisé comme tel.
 *
 * Le téléphone n'est déclaré que s'il figure au registre. La position n'est
 * déclarée que si elle est précise : annoncer le centre d'une commune comme
 * coordonnées d'un cabinet serait faux.
 */
export function fichePraticien(p: Praticien, chemin: string, nomAffiche: string) {
  const lieu = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': p.profession === 'dentiste' ? 'Dentist' : 'MedicalBusiness',
    name: nomAffiche,
    url: url(chemin),
  }

  if (lieu?.adresseLigne || lieu?.communeNom) {
    base.address = {
      '@type': 'PostalAddress',
      ...(lieu.adresseLigne ? { streetAddress: formaterAdresse(lieu.adresseLigne) } : {}),
      ...(lieu.codePostal ? { postalCode: lieu.codePostal } : {}),
      ...(lieu.communeNom ? { addressLocality: lieu.communeNom } : {}),
      addressCountry: 'FR',
    }
  }
  if (lieu && !lieu.approximative && lieu.lat !== null && lieu.lon !== null) {
    base.geo = { '@type': 'GeoCoordinates', latitude: lieu.lat, longitude: lieu.lon }
  }
  if (lieu?.telephone) base.telephone = lieu.telephone
  if (p.rpps) {
    base.identifier = { '@type': 'PropertyValue', propertyID: 'RPPS', value: p.rpps }
  } else if (p.siren) {
    base.identifier = { '@type': 'PropertyValue', propertyID: 'SIREN', value: p.siren }
  }
  return base
}

export function Balisage({ donnees }: { donnees: object }) {
  return (
    <script
      type="application/ld+json"
      // Le contenu est produit par les fonctions ci-dessus à partir de données
      // de registre, jamais d'une saisie utilisateur.
      dangerouslySetInnerHTML={{ __html: jsonLd(donnees) }}
    />
  )
}
