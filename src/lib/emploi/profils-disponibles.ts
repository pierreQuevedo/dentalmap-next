import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { AVIS_COMPTES_MAX, POINTS_AVIS } from '@/lib/formation/avis'
import { lireCriteres, lireExperiences, lireFormation, libelleQualification, type Criteres, type Situation, type Visibilite } from './profil-candidat'

/**
 * Les profils disponibles : les candidats qui ont fini leur profil et
 * choisi d'être visibles (nom réduit au prénom et à l'initiale) ou
 * anonymisés (initiales seulement). Jamais les profils discrets, jamais un
 * profil qui a masqué la structure qui regarde. Ni adresse ni coordonnées :
 * la ville et un rayon. Lecture directe, jamais mise en cache : la liste
 * dépend de qui la regarde.
 *
 * Ordre : les points de mise en avant d'abord (un avis publié sur une école
 * ou une faculté, `pointsAvis`), puis la distance, puis le profil le plus récent.
 */
export type ProfilDisponible = {
  id: string
  nom: string
  visibilite: Exclude<Visibilite, 'discret'>
  situation: Situation
  qualification: string
  titreVerifie: boolean
  experiences: number
  competences: string[]
  criteres: Criteres
  ville: string | null
  /** Distance au centre de la recherche, en kilomètres ; nulle sans centre. */
  km: number | null
}

export async function getProfilsDisponibles(o: {
  situation?: Situation | null
  contrat?: string | null
  centre?: { lon: number; lat: number } | null
  rayonKm?: number
  /** La fiche du recruteur qui regarde : les profils qui l'ont masquée n'apparaissent pas. */
  vuPar?: string | null
  limite?: number
}): Promise<ProfilDisponible[]> {
  const origine = o.centre ? sql`ST_SetSRID(ST_MakePoint(${o.centre.lon}, ${o.centre.lat}), 4326)` : null
  const { rows } = await db.execute<{
    user_id: string
    nom: string
    visibilite: 'visible' | 'anonyme'
    situation: Situation
    qualification: string | null
    titre_verifie: boolean
    formation: unknown
    experiences: unknown
    competences: string[] | null
    criteres: unknown
    ville: string | null
    km: number | null
  }>(sql`
    SELECT k.user_id, u.name AS nom, k.visibilite, k.situation, k.qualification, k.titre_verifie, k.formation, k.experiences, k.competences, k.criteres,
           c.nom AS ville,
           LEAST(${AVIS_COMPTES_MAX}, (SELECT count(*) FROM avis_etablissement a WHERE a.user_id = k.user_id AND a.statut = 'publie'))::int * ${POINTS_AVIS} AS mise_en_avant,
           ${origine ? sql`round((ST_Distance(c.centre::geography, ${origine}::geography) / 1000)::numeric, 1)::float8` : sql`NULL::float8`} AS km
    FROM candidats k
    JOIN "user" u ON u.id = k.user_id
    LEFT JOIN communes c ON c.code_insee = k.criteres->>'commune'
    WHERE k.termine_le IS NOT NULL AND k.visibilite IN ('visible', 'anonyme')
      ${o.vuPar ? sql`AND NOT (${o.vuPar} = ANY(k.structures_masquees))` : sql``}
      ${o.situation ? sql`AND k.situation = ${o.situation}` : sql``}
      ${o.contrat ? sql`AND (k.criteres->'contrats') ? ${o.contrat}` : sql``}
      ${origine ? sql`AND c.centre IS NOT NULL AND ST_DWithin(c.centre::geography, ${origine}::geography, ${(o.rayonKm ?? 30) * 1000})` : sql``}
    ORDER BY mise_en_avant DESC, ${origine ? sql`km, ` : sql``}k.termine_le DESC, k.user_id
    LIMIT ${o.limite ?? 60}
  `)
  return rows.map((r) => {
    const criteres = lireCriteres(r.criteres)
    return {
      id: r.user_id,
      nom: r.nom,
      visibilite: r.visibilite,
      situation: r.situation,
      qualification: libelleQualification({ situation: r.situation, qualification: r.qualification, formation: lireFormation(r.formation) }),
      titreVerifie: r.titre_verifie,
      experiences: lireExperiences(r.experiences).length,
      competences: r.competences ?? [],
      criteres,
      ville: r.ville,
      km: r.km,
    }
  })
}
