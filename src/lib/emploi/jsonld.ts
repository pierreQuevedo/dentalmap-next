/**
 * Données structurées `JobPosting` d'une offre, injectées avec `Balisage`.
 *
 * On ne déclare que ce que la page affiche : titre, description, dates,
 * recruteur et sa fiche, lieu, rémunération. `directApply` est faux : il faut
 * un compte pour postuler. Une rétrocession ou une redevance (pourcentage des
 * honoraires) n'a pas d'équivalent dans `baseSalary` : le champ est omis,
 * comme pour une gratification légale sans montant.
 */
import { url } from '@/lib/seo/site'
import { decouperDescription, lignes, referenceOffre } from './format'
import type { CodeMetier } from './metiers'
import type { OffreDetail } from './types'

/** Classification internationale type des professions (CITP 2008). */
const CITP: Record<CodeMetier, string> = {
  assistant_dentaire: '3251 Assistants dentaires (CITP 2008)',
  assistant_specialise: '3251 Assistants dentaires (CITP 2008)',
  secretaire: '3344 Secrétaires médicaux (CITP 2008)',
  prothesiste: '3214 Techniciens de prothèses médicales et dentaires (CITP 2008)',
  aide_dentaire: '5329 Personnel soignant non classé ailleurs (CITP 2008)',
  chirurgien_dentiste: '2261 Dentistes (CITP 2008)',
}

const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function listeHtml(titre: string, items: string[]): string {
  return items.length ? `<p><strong>${echapper(titre)}</strong></p><ul>${items.map((x) => `<li>${echapper(x)}</li>`).join('')}</ul>` : ''
}

export function typesEmploi(o: Pick<OffreDetail, 'contrat' | 'tempsPlein'>): string | string[] {
  if (o.contrat === 'remplacement' || o.contrat === 'collaboration') return 'CONTRACTOR'
  if (o.contrat === 'stage') return 'INTERN'
  const temps = o.tempsPlein ? 'FULL_TIME' : 'PART_TIME'
  return o.contrat === 'cdd' ? [temps, 'TEMPORARY'] : temps
}

export type DonneesJobPosting = Pick<
  OffreDetail,
  | 'id'
  | 'titre'
  | 'description'
  | 'profil'
  | 'avantages'
  | 'metier'
  | 'contrat'
  | 'tempsPlein'
  | 'mode'
  | 'min'
  | 'max'
  | 'publieeLe'
  | 'expireLe'
  | 'recruteur'
  | 'adresse'
  | 'codePostal'
  | 'commune'
  | 'regionNom'
  | 'lon'
  | 'lat'
> & { praticien: Pick<OffreDetail['praticien'], 'profession' | 'chemin'> }

export function offreJobPosting(o: DonneesJobPosting): Record<string, unknown> {
  const { resume, points } = decouperDescription(o.description)
  const description = [`<p>${echapper(resume)}</p>`, listeHtml('Missions', points), listeHtml('Profil recherché', lignes(o.profil)), listeHtml('Avantages', o.avantages)].join('')
  const salaire = o.mode === 'salaire' || (o.mode === 'gratification' && o.min > 0)

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: o.titre,
    description,
    identifier: { '@type': 'PropertyValue', name: 'DentalMap', value: referenceOffre(o.id) },
    ...(o.publieeLe ? { datePosted: o.publieeLe.slice(0, 10) } : {}),
    ...(o.expireLe ? { validThrough: new Date(o.expireLe).toISOString() } : {}),
    employmentType: typesEmploi(o),
    hiringOrganization: {
      '@type': o.praticien.profession === 'prothesiste' ? 'MedicalBusiness' : 'Dentist',
      name: o.recruteur,
      ...(o.praticien.chemin ? { sameAs: url(o.praticien.chemin) } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(o.adresse ? { streetAddress: o.adresse } : {}),
        ...(o.codePostal ? { postalCode: o.codePostal } : {}),
        addressLocality: o.commune,
        addressRegion: o.regionNom,
        addressCountry: 'FR',
      },
      ...(o.lat != null && o.lon != null ? { geo: { '@type': 'GeoCoordinates', latitude: o.lat, longitude: o.lon } } : {}),
    },
    ...(salaire
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'EUR',
            value: { '@type': 'QuantitativeValue', minValue: o.min, maxValue: Math.max(o.min, o.max), unitText: 'MONTH' },
          },
        }
      : {}),
    occupationalCategory: CITP[o.metier],
    directApply: false,
  }
}
