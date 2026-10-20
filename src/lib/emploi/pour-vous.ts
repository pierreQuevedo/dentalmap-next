import { getCommuneParCode } from '@/lib/annuaire/queries'
import type { ProfilCandidat } from './candidat-donnees'
import type { CodeContrat } from './metiers'
import { situationDe } from './profil-candidat'
import { getOffresRayon } from './queries'
import type { OffreResume } from './types'

/**
 * « Offres pour vous » (CAND-OFFRES, ETU-OFFRES) : les offres en ligne autour
 * de la ville du profil, dans son rayon, du métier de la situation et des
 * contrats recherchés, par distance puis par titre. Pour un étudiant :
 * alternance et stage par défaut. Le temps de travail filtre ensuite. Les
 * structures masquées n'y figurent jamais. `null` sans ville au profil.
 */
export async function getOffresPourVous(p: ProfilCandidat): Promise<{ offres: OffreResume[]; ville: string; contrats: CodeContrat[] } | null> {
  if (!p.criteres.commune) return null
  const commune = await getCommuneParCode(p.criteres.commune)
  if (commune?.lon == null || commune.lat == null) return null
  const etudiant = p.situation === 'etudiant'
  const contrats: CodeContrat[] = p.criteres.contrats.length ? p.criteres.contrats : etudiant ? ['alternance', 'stage'] : []
  const toutes = await getOffresRayon({
    metier: situationDe(p.situation)?.metier ?? null,
    lon: commune.lon,
    lat: commune.lat,
    rayonMetres: p.criteres.rayonKm * 1000,
    contrats,
    exclure: p.structuresMasquees.map((s) => s.slug),
  })
  const offres = toutes.filter((o) => p.criteres.temps === 'tous' || (p.criteres.temps === 'plein') === o.tempsPlein)
  return { offres, ville: commune.nom, contrats }
}
