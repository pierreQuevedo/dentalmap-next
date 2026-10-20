import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { lireCriteres, lireExperiences, lireFormation, lireVisibilite, situationDe, type Criteres, type Experience, type Formation, type Situation, type Visibilite } from './profil-candidat'

/** Le profil candidat d'un compte, lu directement : l'espace candidat n'est jamais mis en cache. */
export type ProfilCandidat = {
  situation: Situation
  qualification: string | null
  titreVerifie: boolean
  criteres: Criteres
  formation: Formation | null
  experiences: Experience[]
  competences: string[]
  visibilite: Visibilite
  structuresMasquees: { slug: string; nom: string }[]
  cv: { nom: string; taille: number | null } | null
  termine: boolean
}

export async function getProfilCandidat(userId: string): Promise<ProfilCandidat | null> {
  const { rows } = await db.execute<{
    situation: string
    qualification: string | null
    titre_verifie: boolean
    criteres: unknown
    formation: unknown
    experiences: unknown
    competences: string[] | null
    visibilite: string
    structures_masquees: string[] | null
    cv_chemin: string | null
    cv_nom: string | null
    cv_taille: number | null
    termine_le: string | null
  }>(sql`
    SELECT situation, qualification, titre_verifie, criteres, formation, experiences, competences, visibilite,
           structures_masquees, cv_chemin, cv_nom, cv_taille, termine_le
    FROM candidats WHERE user_id = ${userId}::uuid
  `)
  const r = rows[0]
  if (!r || !situationDe(r.situation)) return null
  const masquees = r.structures_masquees ?? []
  const noms = masquees.length
    ? (
        await db.execute<{ slug: string; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null }>(sql`
          SELECT slug, profession, nom, prenom, raison_sociale FROM praticiens WHERE slug IN (${sql.join(masquees.map((s) => sql`${s}`), sql`, `)})
        `)
      ).rows
    : []
  return {
    situation: r.situation as Situation,
    qualification: r.qualification,
    titreVerifie: r.titre_verifie,
    criteres: lireCriteres(r.criteres),
    formation: lireFormation(r.formation),
    experiences: lireExperiences(r.experiences),
    competences: r.competences ?? [],
    visibilite: lireVisibilite(r.visibilite),
    structuresMasquees: masquees.map((slug) => {
      const n = noms.find((x) => x.slug === slug)
      return { slug, nom: n ? nomAffiche({ profession: n.profession, nom: n.nom, prenom: n.prenom, raisonSociale: n.raison_sociale }) : slug }
    }),
    cv: r.cv_chemin ? { nom: r.cv_nom ?? 'CV.pdf', taille: r.cv_taille } : null,
    termine: Boolean(r.termine_le),
  }
}
