import { notFound, redirect } from 'next/navigation'
import { Coquille } from '@/components/compte/coquille'
import { Marque } from '@/components/compte/ui'
import type { Voie } from '@/components/compte/choix'
import { VignetteCarte, VoletCarte, type EncartCarte } from '@/components/compte/volet-carte'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { chemin } from '@/lib/navigation'
import { getFicheRevendication, type FicheRevendication } from '@/lib/espace-pro/parcours'
import { REVENDIQUER, apresAccord, cheminFiche } from '@/lib/espace-pro/chemins'
import { exigerConnexion, type Compte } from '@/lib/tunnel/compte'
import { rattacherFilleul } from '@/lib/espace-pro/parrainage-donnees'

/**
 * Ce que partagent les pages de la revendication d'un soignant.
 *
 * Toutes exigent une session. Un compte sans profil passe d'abord par
 * « Qui êtes-vous ? », le profil soignant présélectionné, et revient ici.
 */
export async function garde(ici: string, profil: 'dentiste' | 'prothesiste' = 'dentiste'): Promise<Compte> {
  const compte = await exigerConnexion(ici)
  if (!compte.role) redirect(chemin(`/inscription/profil/?role=${profil}&retour=${encodeURIComponent(ici)}`))
  // Arrivé par un lien de parrainage : le compte devient le filleul.
  await rattacherFilleul(compte.id)
  return compte
}

/** La fiche visée par l'adresse, vue par ce compte ; 404 si elle n'existe pas. */
export async function ficheOu404(slug: string, compte: Compte, options?: { retirees?: boolean }): Promise<FicheRevendication> {
  const fiche = await getFicheRevendication(decodeURIComponent(slug), compte.id, options)
  if (!fiche) notFound()
  return fiche
}

/**
 * Où en est déjà ce compte sur cette fiche : une fiche acceptée mène à
 * l'espace pro, une demande en attente à son suivi. Rien : on reste.
 */
export function dejaEngage(fiche: FicheRevendication): string | null {
  const d = fiche.demande
  if (!d || d.objet !== 'revendication') return null
  if (d.statut === 'acceptee') return apresAccord(fiche.slug, d.lieuxGeres.length ? 0 : fiche.lieux.length)
  if (d.statut === 'en_attente' || d.statut === 'refusee') return `${REVENDIQUER}/suivi/?fiche=${encodeURIComponent(fiche.slug)}`
  return null
}

/** « Chirurgien-dentiste », ou la spécialité ordinale quand le registre la porte. */
export function libelleProfession(fiche: { profession: Profession; specialite?: string | null }): string {
  const l = LIBELLE[fiche.profession].singulier
  return l.charAt(0).toUpperCase() + l.slice(1)
}

/** Le mode d'exercice du registre, lisible : l'Annuaire Santé abrège « Lib,indép,artis,com ». */
export function libelleModeExercice(mode: string | null): string {
  if (!mode) return 'Non renseigné'
  if (mode.startsWith('Lib')) return 'Libéral'
  return mode
}

export function adresseDe(l: { adresseLigne: string | null; codePostal: string | null; communeNom: string | null }): string | null {
  const ville = [l.codePostal, l.communeNom].filter(Boolean).join(' ')
  // Le registre écrit l'adresse en capitales : même casse que la carte de la fiche.
  return [l.adresseLigne && formaterAdresse(l.adresseLigne), ville].filter(Boolean).join(', ') || null
}

export function nomDe(fiche: FicheRevendication): string {
  return nomAffiche(fiche)
}

/** La page publique de la fiche, où ramène « Retour au site ». */
export function pageFiche(fiche: FicheRevendication): string {
  const r = fiche.resume
  return r.departementSlug && r.communeSlug ? cheminPraticien(BASE_URL[fiche.profession], r.departementSlug, r.communeSlug, fiche.slug) : '/'
}

/** Les adresses de la fiche, pour les liens des pages. */
/**
 * Les preuves d'identité d'un soignant (S3b, C1, L). Aucun document n'est
 * reçu : Pro Santé Connect (annoncé « Bientôt » tant qu'il n'est pas ouvert,
 * voir `pscOuvert`), ou une demande à l'équipe, qui vérifie à la main sur
 * justificatif PDF.
 */
export function voiesIdentite(fiche: { slug: string; gereeParUnAutre?: boolean }, o: { psc: boolean; retrait?: boolean; boutonPsc?: string; detailPsc?: string }): Voie[] {
  return [
    {
      valeur: 'psc',
      titre: 'Pro Santé Connect',
      detail: o.detailPsc ?? 'Carte CPS ou application e-CPS. Vérifié sur-le-champ.',
      icone: 'carte',
      badge: o.psc ? 'Immédiat' : 'Bientôt',
      desactivee: !o.psc,
      bouton: o.boutonPsc ?? 'Continuer avec Pro Santé Connect',
      href: `${REVENDIQUER}/psc/?fiche=${encodeURIComponent(fiche.slug)}${o.retrait ? '&objet=retrait' : ''}`,
    },
    {
      valeur: 'equipe',
      titre: 'Demander à l’équipe',
      // Une contestation ne se prépare pas : la fiche reste à son titulaire jusqu'à la décision.
      detail: fiche.gereeParUnAutre || o.retrait
        ? 'Sans carte CPS ni e-CPS : un justificatif PDF, vérifié par l’équipe sous 48 heures ouvrées.'
        : 'Sans carte CPS ni e-CPS : un justificatif PDF, vérifié par l’équipe. Vous prenez la main sur votre fiche sans attendre.',
      icone: 'equipe',
      badge: '48 h',
      bouton: 'Demander à l’équipe',
      href: cheminFiche(fiche.slug, `equipe${o.retrait ? '?objet=retrait' : ''}`),
    },
  ]
}

export const versFiche = (fiche: { slug: string }, suite = '') => cheminFiche(fiche.slug, suite)

/**
 * La coquille du parcours : le volet carte à gauche, la vignette sur mobile
 * quand une fiche est désignée, la marque sinon.
 */
export async function CoquilleParcours({
  fiche,
  praticiens,
  etiquette,
  recherche,
  encart,
  retour = '/',
  libelleRetour,
  lieux,
  profession,
  children,
}: {
  fiche?: FicheRevendication | null
  /** Plusieurs fiches à montrer (H1) ; par défaut, la fiche seule. */
  praticiens?: FicheRevendication['resume'][]
  etiquette?: string
  recherche?: string
  encart?: EncartCarte
  retour?: string
  libelleRetour?: string
  lieux?: { lon: number | null; lat: number | null }[]
  /** Sans fiche désignée (L1 et sa liste), le parcours laboratoire le dit : la pastille et la carte sont alors celles d'un laboratoire. */
  profession?: Profession
  children: React.ReactNode
}) {
  const montres = praticiens ?? (fiche ? [fiche.resume] : [])
  return (
    <Coquille
      retour={retour}
      libelleRetour={libelleRetour}
      volet={
        <VoletCarte
          praticiens={montres}
          profession={fiche?.profession ?? profession ?? 'dentiste'}
          etiquette={etiquette}
          recherche={recherche}
          encart={encart}
          lieux={lieux}
        />
      }
    >
      {montres[0] ? <VignetteCarte praticien={montres[0]} /> : <Marque />}
      <div className="animate-fiche-entree">{children}</div>
    </Coquille>
  )
}
