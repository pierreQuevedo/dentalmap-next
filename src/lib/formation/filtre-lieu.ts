import { getCodesDepartementsDeRegion, getCommuneParCode, getDepartement, getRegion } from '@/lib/annuaire/queries'
import type { FormationResume } from '@/lib/wp/queries'
import { enRegion } from '@/lib/annuaire/libelles'
import { memeVille } from './types'

/**
 * Le lieu demandé à une page de formation, tel qu'il arrive de la barre de
 * recherche ou du champ de l'accueil : un code INSEE ou un nom de commune en
 * `lieu`, un slug de département en `departement`, un slug de région en
 * `region`. Résolu contre la base des territoires, il devient un libellé et
 * une règle de filtrage sur la ville et le département des formations.
 */
export type LieuFormation = {
  libelle: string
  /** Le lieu dans une phrase : « à Lyon », « en Gironde », « en Île-de-France ». */
  dans: string
  /** Codes de département acceptés, ou `null` pour ne filtrer que sur la ville. */
  departements: string[] | null
  /** Nom de commune à rapprocher de la ville, quand le lieu est une commune ou un texte. */
  ville: string | null
}

export async function resoudreLieu(params: { lieu?: string; departement?: string; region?: string }): Promise<LieuFormation | null> {
  if (params.region) {
    const r = await getRegion(params.region)
    if (!r) return null
    return { libelle: r.nom, dans: enRegion(r.slug, r.nom), departements: await getCodesDepartementsDeRegion(r.code), ville: null }
  }
  if (params.departement) {
    const d = await getDepartement(params.departement)
    return d ? { libelle: d.nom, dans: `en ${d.nom}`, departements: [d.code], ville: null } : null
  }
  const lieu = params.lieu?.trim()
  if (!lieu) return null
  if (/^(\d{5}|2[abAB]\d{3})$/.test(lieu)) {
    const c = await getCommuneParCode(lieu.toUpperCase())
    return c ? { libelle: c.nom, dans: `à ${c.nom}`, departements: [c.departementCode], ville: c.nom } : null
  }
  return { libelle: lieu, dans: `à ${lieu}`, departements: null, ville: lieu }
}

/**
 * Une formation répond à un lieu si sa ville est celle demandée, ou, à défaut
 * de ville reconnue, si son département est dans ceux du lieu.
 */
export function repondAuLieu(f: FormationResume, lieu: LieuFormation): boolean {
  if (lieu.ville && memeVille(f.ville, lieu.ville)) return true
  if (lieu.departements && f.departement && lieu.departements.includes(f.departement)) return true
  return false
}
