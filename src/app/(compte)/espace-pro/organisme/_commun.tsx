import { notFound, redirect } from 'next/navigation'
import { Coquille } from '@/components/compte/coquille'
import { Marque } from '@/components/compte/ui'
import { VignetteCarte, VoletCarte, type EncartCarte } from '@/components/compte/volet-carte'
import { CarteEtablissement, type LigneCarte } from '@/components/espace/etablissement'
import { chemin } from '@/lib/navigation'
import { ORGANISME, getGestions, getSourceEtablissement, positionDe, type Gestion, type SourceEtablissement } from '@/lib/espace-pro/etablissement-donnees'
import { exigerConnexion, type Compte } from '@/lib/tunnel/compte'

/**
 * Ce que partagent les pages du couloir « École ou organisme ».
 *
 * Toutes exigent une session ; un compte sans profil passe par « Qui
 * êtes-vous ? », le profil organisme présélectionné, et revient ici.
 */
export async function gardeOrganisme(ici: string): Promise<Compte> {
  const compte = await exigerConnexion(ici)
  if (!compte.role) redirect(chemin(`/inscription/profil/?role=organisme&retour=${encodeURIComponent(ici)}`))
  return compte
}

/** L'établissement désigné par `?fiche=`, et ce que ce compte en gère ; 404 s'il n'existe pas. */
export async function etablissementOu404(slug: string | undefined, compte: Compte): Promise<{ source: SourceEtablissement; gestion: Gestion | null }> {
  const source = slug ? await getSourceEtablissement(decodeURIComponent(slug)) : null
  if (!source) notFound()
  const gestion = (await getGestions(compte.id)).find((g) => g.slug === source.slug && g.statut !== 'refusee') ?? null
  return { source, gestion }
}

/** Les diplômes affichés sur la carte : ceux d'O3a s'ils sont déclarés, sinon ceux du contenu. */
export function lignesDe(formations: { intitule: string; duree: string | null; active: boolean }[]): LigneCarte[] {
  return formations.map((f) => ({ nom: f.intitule, duree: f.duree?.split(/\s*\(/)[0] ?? null, desactivee: !f.active }))
}

/**
 * La coquille du couloir : à gauche le plan avec la carte de l'établissement
 * posée sur son point (sans pastille de recherche : la recherche se fait à droite), ou la France pointillée et une accroche ; à droite le
 * formulaire.
 */
export async function CoquilleOrganisme({
  source,
  lignes,
  etiquette,
  encart,
  accroche,
  retour = '/',
  libelleRetour,
  children,
}: {
  source?: SourceEtablissement | null
  lignes?: LigneCarte[]
  etiquette?: string
  encart?: EncartCarte
  /** Sans établissement ni plan : la France pointillée et cette accroche (W1, O2b, O3b). */
  accroche?: { titre: string; texte: string }
  retour?: string
  libelleRetour?: string
  children: React.ReactNode
}) {
  if (accroche) {
    return (
      <Coquille retour={retour} libelleRetour={libelleRetour} accroche={accroche}>
        <Marque />
        <div className="animate-fiche-entree">{children}</div>
      </Coquille>
    )
  }
  const position = source ? await positionDe(source) : null
  return (
    <Coquille
      retour={retour}
      libelleRetour={libelleRetour}
      volet={
        <VoletCarte
          position={position}
          contenu={
            source ? (
              <CarteEtablissement
                titre={source.titre}
                type={source.type}
                extrait={source.extrait}
                image={source.image}
                lignes={lignes ?? lignesDe(source.formationsInitiales)}
                ville={source.ville}
              />
            ) : undefined
          }
          etiquette={etiquette}
          encart={encart}
        />
      }
    >
      {position ? <VignetteCarte praticien={position} /> : <Marque />}
      <div className="animate-fiche-entree">{children}</div>
    </Coquille>
  )
}

export { ORGANISME }

/** Le volet des pages de partenariat (O2b, O3b). */
export const ACCROCHE_PARTENARIAT = {
  titre: 'Un annuaire sans logo acheté.',
  texte: 'Une demande de partenariat ne crée ni compte professionnel ni affichage.',
}
