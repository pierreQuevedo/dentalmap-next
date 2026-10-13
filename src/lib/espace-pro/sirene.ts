import { nettoyerNumero } from './labo'

/**
 * L'état d'un établissement dans Sirene, par l'API publique « Recherche
 * d'entreprises » de l'État (sans clé). Sert à contrôler une demande d'ajout
 * de laboratoire (LA1) : établissement actif, activité, adresse.
 *
 * `null` si l'établissement est introuvable ou si l'API ne répond pas : la
 * demande est alors examinée à la main, sans contrôle automatique.
 */
export type Etablissement = {
  siret: string
  nom: string
  actif: boolean
  /** Code NAF ; 32.50A est la fabrication de matériel médico-chirurgical et dentaire. */
  naf: string | null
  adresse: string
  codePostal: string
  ville: string
}

export async function consulterSiret(siret: string): Promise<Etablissement | null> {
  const n = nettoyerNumero(siret)
  try {
    const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${n}&per_page=1`, { signal: AbortSignal.timeout(6000), cache: 'no-store' })
    if (!r.ok) return null
    const d = (await r.json()) as {
      results?: {
        nom_complet: string
        matching_etablissements?: { siret: string; etat_administratif: string; adresse: string; code_postal: string; libelle_commune: string; activite_principale: string | null }[]
      }[]
    }
    const entreprise = d.results?.[0]
    const e = entreprise?.matching_etablissements?.find((x) => x.siret === n)
    if (!entreprise || !e) return null
    return {
      siret: n,
      nom: entreprise.nom_complet,
      actif: e.etat_administratif === 'A',
      naf: e.activite_principale,
      adresse: e.adresse.replace(new RegExp(`\\s*${e.code_postal}.*$`), '').trim() || e.adresse,
      codePostal: e.code_postal,
      ville: e.libelle_commune,
    }
  } catch {
    return null
  }
}

/**
 * Une entreprise par son SIREN (organisme de formation) : son nom et si elle
 * est active. `introuvable` quand l'API répond sans résultat ; `null` quand
 * elle ne répond pas, et la demande passe alors sans contrôle automatique.
 */
export async function consulterSiren(siren: string): Promise<{ nom: string; actif: boolean } | 'introuvable' | null> {
  const n = nettoyerNumero(siren)
  try {
    const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${n}&per_page=1`, { signal: AbortSignal.timeout(6000), cache: 'no-store' })
    if (!r.ok) return null
    const d = (await r.json()) as { results?: { siren: string; nom_complet: string; etat_administratif?: string }[] }
    const e = d.results?.find((x) => x.siren === n)
    if (!e) return 'introuvable'
    return { nom: e.nom_complet, actif: e.etat_administratif !== 'C' }
  } catch {
    return null
  }
}
