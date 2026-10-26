import { redirect } from 'next/navigation'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { situationDe } from '@/lib/emploi/profil-candidat'
import type { CleNav, InfosCoque } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { getEspace, type Espace } from '@/lib/espace-pro/espace'
import { pointsDeLEspace } from '@/lib/espace-pro/progression-donnees'
import { progressionDe, type Points } from '@/lib/espace-pro/progression'
import { estModerateur, getCompte, type Compte } from '@/lib/tunnel/compte'
import { CHEMIN_ETAPE, ESPACE_CANDIDAT, etapeDe } from '@/lib/tunnel/etapes'
import { nomDe, pageFiche } from '../../(compte)/espace-pro/revendiquer/_commun'

/**
 * Le chargement commun des pages du tableau de bord.
 *
 * Sans session : la connexion, avec retour ici. Sans profil : « Qui
 * êtes-vous ? ». Un patient rejoint ses favoris. Sans fiche : la
 * revendication. Une fiche dont l'onboarding n'est pas fini : l'onboarding.
 */
export type Tableau = { compte: Compte; espace: Espace; coque: InfosCoque; q: string; points: Points }

export async function chargerTableau(page: CleNav, slug?: string, sousPage?: string): Promise<Tableau> {
  const ici = `/espace-pro/${page === 'vue' ? '' : `${page}/`}${sousPage ? `${sousPage}/` : ''}${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(ici)}`))
  const etape = etapeDe(compte.etat)
  if (etape === 'profil') redirect(chemin(CHEMIN_ETAPE.profil))
  if (compte.role === 'patient') redirect(chemin('/favoris/'))
  // Un étudiant ou un salarié a son espace Emploi.
  if (compte.role === 'candidat') redirect(chemin(ESPACE_CANDIDAT))
  // Une école ou une faculté a son propre tableau de bord.
  if (compte.role === 'organisme') redirect(chemin(`/espace-pro/etablissement/${page === 'vue' ? '' : page === 'compte' ? 'compte/' : ''}${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`))
  const espace = await getEspace(compte, slug)
  if (!espace) redirect(chemin(compte.role === 'prothesiste' ? '/espace-pro/laboratoire/revendiquer/' : '/espace-pro/revendiquer/'))
  if (!espace.completee?.termineLe && espace.fiche.demande?.statut !== 'refusee') {
    redirect(chemin(`/espace-pro/${espace.labo ? 'laboratoire/' : ''}onboarding/?fiche=${encodeURIComponent(espace.fiche.slug)}`))
  }

  const { fiche, completee } = espace
  const mots = espace.labo ? (fiche.raisonSociale ?? fiche.nom).split(/\s+/).filter((m) => m.length > 2 && !/^(LABORATOIRE|LABO|DE|DU|DES|LA|LE|LES)$/i.test(m)) : [fiche.prenom, fiche.nom].filter((m): m is string => !!m)
  const initiales = mots.map((m) => m.trim().charAt(0).toUpperCase()).join('').slice(0, 2) || 'DM'
  const plusieursFiches = espace.autres.length > 0
  const points = await pointsDeLEspace(espace)
  // L'aperçu de la carte, partout dans l'espace, porte le palier tenu comme dans les résultats publics.
  fiche.resume.palier = progressionDe(points.total, points.verifiee, points.detail.fiche).actuel?.niveau ?? null
  const coque: InfosCoque = {
    mono: initiales,
    photo: completee?.photoUrl ?? null,
    nom: nomDe(fiche),
    ligne2: `${espace.labo ? 'Laboratoire · ' : ''}${fiche.resume.communeNom ?? (espace.labo ? '' : 'Cabinet')}`,
    pagePublique: pageFiche(fiche) === '/' ? null : pageFiche(fiche),
    enLigne: espace.ctx.identiteVerifiee && !!completee?.publieeLe,
    enVerification: !espace.ctx.identiteVerifiee,
    missionsRestantes: espace.missions.filter((m) => !m.faite).length,
    aReconfirmer: espace.fraicheur.filter((f) => f.etat !== 'a_jour').length,
    moderateur: estModerateur(compte.email),
    slug: fiche.slug,
    plusieursFiches,
    labo: espace.labo,
    delaisAReconfirmer: espace.fraicheur.some((f) => f.cle === 'delais' && f.etat !== 'a_jour'),
    progression: { points, lon: fiche.resume.lon, lat: fiche.resume.lat, carte: { praticien: { ...fiche.resume, revendiquee: true }, profession: fiche.profession, photo: espace.completee?.photoUrl ?? null } },
  }
  return { compte, espace, coque, q: plusieursFiches ? `?fiche=${encodeURIComponent(fiche.slug)}` : '', points }
}

/** « lundi 12 octobre » : la date du jour, en tête de page. */
export function aujourdhui(): string {
  const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
  return d.charAt(0).toUpperCase() + d.slice(1)
}

/** « 6 oct. », « hier », « il y a 3 jours ». */
export function quand(date: string | Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  // En jours du calendrier de Paris : publiée hier soir, c'est « Hier », même moins de 24 heures après.
  const jour = (x: Date) => Date.parse(x.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }))
  const jours = Math.round((jour(new Date()) - jour(d)) / 86_400_000)
  if (jours <= 0) return 'Aujourd’hui'
  if (jours === 1) return 'Hier'
  if (jours < 7) return `Il y a ${jours} jours`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })
}

/**
 * Les pages candidat de l'Emploi (candidatures envoyées, profil candidat,
 * visibilité, bienvenue, recherche) : ouvertes à tout compte connecté, avec
 * ou sans fiche. Une fiche prête donne l'espace complet ; sinon, un espace
 * réduit à l'Emploi, sans revendication ni onboarding imposés.
 */
export type TableauEmploi = { compte: Compte; espace: Espace | null; coque: InfosCoque; q: string }

export async function chargerEmploi(sousPage: string, slug?: string): Promise<TableauEmploi> {
  const ici = `/espace-pro/emploi/${sousPage}/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(ici)}`))
  const espace = compte.role === 'dentiste' || compte.role === 'prothesiste' ? await getEspace(compte, slug) : null
  if (espace && (espace.completee?.termineLe || espace.fiche.demande?.statut === 'refusee')) {
    const t = await chargerTableau('emploi', slug, sousPage)
    return { compte: t.compte, espace: t.espace, coque: t.coque, q: t.q }
  }
  const mots = (compte.nom ?? '').split(/\s+/).filter(Boolean)
  // La carte du menu dit la situation déclarée (étudiant, assistant…), jamais « candidat ».
  const situation = situationDe((await getProfilCandidat(compte.id))?.situation)
  const coque: InfosCoque = {
    mono: ((mots[0]?.[0] ?? '') + (mots.length > 1 ? mots[mots.length - 1][0] : '')).toUpperCase() || 'DM',
    nom: compte.nom || compte.email,
    ligne2: situation?.libelle ?? 'Emploi',
    pagePublique: null,
    enLigne: false,
    missionsRestantes: 0,
    aReconfirmer: 0,
    moderateur: estModerateur(compte.email),
    slug: '',
    plusieursFiches: false,
    labo: false,
    delaisAReconfirmer: false,
    candidat: true,
  }
  return { compte, espace: null, coque, q: '' }
}
