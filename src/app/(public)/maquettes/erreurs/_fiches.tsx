'use client'

/**
 * MAQUETTE. Trois fiches proches pour la page 410, dans la carte de résultat
 * du site (`CarteFiche`), noms et adresses inventés comme les fiches
 * d'exemple de l'accueil. Classées par distance, puis par ordre alphabétique.
 */
import { CarteFiche } from '@/components/recherche/carte-fiche'
import type { PraticienProche } from '@/lib/annuaire/queries'

const rien = () => {}

const BASE: PraticienProche = {
  slug: 'exemple-camille-riviere',
  lieuId: 'exemple-1',
  civilite: 'MME',
  nom: 'RIVIERE',
  prenom: 'CAMILLE',
  raisonSociale: null,
  statutVerification: 'verifie',
  adresseLigne: '14 RUE VITAL CARLES',
  codePostal: '33000',
  aTelephone: true,
  revendiquee: true,
  communeNom: 'Bordeaux',
  communeSlug: 'bordeaux',
  departementSlug: 'gironde',
  precisionPosition: 'numero',
  lon: -0.579,
  lat: 44.838,
  metres: 400,
}

const FICHES: PraticienProche[] = [
  BASE,
  { ...BASE, slug: 'exemple-antoine-bernard', lieuId: 'exemple-2', civilite: 'M', nom: 'BERNARD', prenom: 'ANTOINE', adresseLigne: '3 COURS DE L INTENDANCE', revendiquee: false, metres: 900 },
  { ...BASE, slug: 'exemple-lea-martin', lieuId: 'exemple-3', nom: 'MARTIN', prenom: 'LEA', adresseLigne: '27 RUE SAINTE CATHERINE', revendiquee: false, metres: 1200 },
]

export function FichesProches() {
  return (
    <ol className="grid gap-3 sm:grid-cols-3 max-sm:[&>li]:min-h-[19rem]">
      {FICHES.map((p) => (
        <CarteFiche key={p.slug} praticien={p} base="dentistes" profession="dentiste" actif={false} onSurvol={rien} reference="de l’ancienne adresse" />
      ))}
    </ol>
  )
}
