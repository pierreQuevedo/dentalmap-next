import { notFound, redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { Check, CircleX } from 'lucide-react'
import type { CleNav, InfosCoque } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import {
  LIBELLE_TYPE,
  calculerForceEtablissement,
  missionsEtablissement,
  sectionsPage,
  type MissionEtab,
  type Section,
} from '@/lib/espace-pro/etablissement'
import type { Force } from '@/lib/espace-pro/force'
import { detailForce, sourcesEtab } from '@/lib/espace-pro/progression-etablissement'
import {
  ESPACE_ETAB,
  ORGANISME,
  getFicheEtablissement,
  getGestions,
  getSourceEtablissement,
  initialiserFiche,
  type FicheEtablissement,
  type Gestion,
  type SourceEtablissement,
} from '@/lib/espace-pro/etablissement-donnees'
import { estModerateur, getCompte, type Compte } from '@/lib/tunnel/compte'
import { ESPACE_CANDIDAT } from '@/lib/tunnel/etapes'

/**
 * Le chargement commun du tableau de bord d'un établissement.
 *
 * Sans session : la connexion. Un patient : ses favoris. Un soignant : son
 * propre tableau de bord. Sans établissement : « Quel type d'organisme ? ».
 * Des formations jamais enregistrées : O3a d'abord.
 */
export type TableauEtab = {
  compte: Compte
  source: SourceEtablissement
  gestion: Gestion
  fiche: FicheEtablissement
  force: Force
  missions: MissionEtab[]
  sections: Section[]
  coque: InfosCoque
  /** `?fiche=…` quand le compte gère plusieurs établissements. */
  q: string
  /** Chemin de la page courante, pour les formulaires. */
  ici: string
}

const MOTS_VIDES = /^(ecole|école|faculte|faculté|de|du|des|la|le|les|d|l|et|en|lycee|lycée|ufr|cfa|formation|odontologie|prothese|prothèse|dentaire)$/i

export async function chargerEtablissement(page: CleNav, slug?: string): Promise<TableauEtab> {
  const segment = page === 'vue' ? '' : `${page === 'registre' ? 'registres' : page}/`
  const avecFiche = slug ? `?fiche=${encodeURIComponent(slug)}` : ''
  const ici = `${ESPACE_ETAB}/${segment}${avecFiche}`
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(ici)}`))
  if (!compte.role) redirect(chemin(`/inscription/profil/?role=organisme&retour=${encodeURIComponent(ici)}`))
  if (compte.role === 'patient') redirect(chemin('/favoris/'))
  if (compte.role === 'candidat') redirect(chemin(ESPACE_CANDIDAT))

  const gestions = (await getGestions(compte.id)).filter((g) => g.statut !== 'refusee')
  if (!gestions.length) redirect(chemin(compte.role === 'organisme' ? `${ORGANISME}/` : '/espace-pro/'))
  const gestion = gestions.find((g) => g.slug === slug) ?? gestions[0]!
  const source = await getSourceEtablissement(gestion.slug)
  if (!source) notFound()
  let fiche = await getFicheEtablissement(source.slug)
  if (!fiche) {
    await initialiserFiche(source, compte.id)
    fiche = (await getFicheEtablissement(source.slug))!
  }
  // Le parcours d'accueil n'est fini qu'une fois les formations enregistrées (O3a).
  if (!fiche.donnees.confirmeLe.formations) redirect(chemin(`${ORGANISME}/formations/?fiche=${encodeURIComponent(source.slug)}`))

  const verifie = gestion.statut === 'acceptee'
  const force = calculerForceEtablissement(fiche.donnees, source.type, verifie)
  const { rows: sansReponse } = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM avis_etablissement WHERE slug = ${source.slug} AND statut = 'publie' AND reponse IS NULL`)
  const missions = missionsEtablissement(force, source.type)
  const sections = sectionsPage(fiche.donnees, source.type, source.auto)
  const mots = source.titre.replace(/[’']/g, ' ').split(/\s+/).filter((m) => m.length > 1 && !MOTS_VIDES.test(m))
  const plusieurs = gestions.length > 1
  const coque: InfosCoque = {
    mono: mots.map((m) => m.charAt(0).toUpperCase()).join('').slice(0, 3) || 'DM',
    nom: source.titre,
    ligne2: [source.universite ?? LIBELLE_TYPE[source.type], source.ville].filter(Boolean).join(' · '),
    pagePublique: source.lien,
    enLigne: verifie && !!fiche.publieeLe,
    missionsRestantes: sections.filter((s) => s.statut === 'incomplete' || (s.statut === 'vide' && s.href)).length,
    aReconfirmer: 0,
    moderateur: estModerateur(compte.email),
    slug: source.slug,
    plusieursFiches: plusieurs,
    labo: false,
    delaisAReconfirmer: false,
    etablissement: source.type,
    avisSansReponse: sansReponse[0]?.n ?? 0,
    progressionEtab: { total: force.total, detail: detailForce(force), verifiee: verifie, sources: sourcesEtab(force, missions) },
  }
  return { compte, source, gestion, fiche, force, missions, sections, coque, q: plusieurs ? `?fiche=${encodeURIComponent(source.slug)}` : '', ici }
}

/** Ce que des missions rapportent encore, en pour cent : `null` quand aucune ne s'applique à ce type d'établissement. */
export function gainMissions(t: Pick<TableauEtab, 'missions'>, ...cles: string[]): number | null {
  const ms = t.missions.filter((m) => cles.includes(m.cle))
  return ms.length ? ms.reduce((s, m) => s + m.gain, 0) : null
}

/** Le lien d'une sous-page, en gardant l'établissement courant. */
export const versEtab = (t: Pick<TableauEtab, 'q'>, p: string) => {
  const [chemin_, ancre] = p.split('#')
  return `${ESPACE_ETAB}/${chemin_ ? `${chemin_}/` : ''}${t.q}${ancre ? `#${ancre}` : ''}`
}

/** Le retour d'un formulaire : enregistré, ou l'erreur de l'action. */
export function Retour({ enregistre, erreur, bloc }: { enregistre?: string; erreur?: string; bloc: string }) {
  if (erreur) {
    return (
      <p role="alert" className="squircle-xl flex items-center gap-2 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <CircleX className="size-4 shrink-0" aria-hidden /> {erreur}
      </p>
    )
  }
  if (enregistre !== bloc) return null
  return (
    <p role="status" className="squircle-xl flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
      <Check className="size-4 shrink-0" aria-hidden /> Enregistré. La page publique est à jour.
    </p>
  )
}

/** « 6 févr. » ; « Aucune », ou un tiret. */
export function dateCourte(iso: string | null): string {
  if (!iso) return '—'
  return new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })
}
