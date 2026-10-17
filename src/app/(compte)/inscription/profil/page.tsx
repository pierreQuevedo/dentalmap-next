import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ArrowRight, FlaskConical, GraduationCap, Stethoscope, UserRound } from 'lucide-react'
import { Coquille } from '@/components/compte/coquille'
import { CarteOption, Encart, Marque, lien, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { choisirProfil } from '@/lib/tunnel/actions'
import { enregistrerProfil, getCompte } from '@/lib/tunnel/compte'
import { estRole, prochaineEtape, retourSur, type Role } from '@/lib/tunnel/etapes'

export const metadata: Metadata = { title: 'Qui êtes-vous ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * T3, « Qui êtes-vous ? » : le profil, une seule fois par compte.
 *
 * Quatre cartes, choix unique. « Chirurgien-dentiste ou spécialiste » réunit
 * dentistes et médecins du visage sous le rôle `dentiste` : la profession
 * exacte est demandée plus loin, avec le RPPS. « Je préfère ne pas répondre »
 * envoie le formulaire sans rôle, ce qui vaut parcours patient.

 */
const PROFILS: { role: Role; titre: string; detail: string; icone: typeof UserRound }[] = [
  { role: 'patient', titre: 'Patient ou proche', detail: 'Je cherche un professionnel.', icone: UserRound },
  { role: 'dentiste', titre: 'Chirurgien-dentiste ou spécialiste', detail: 'Dentiste, stomatologue, maxillo-facial ou ORL.', icone: Stethoscope },
  { role: 'prothesiste', titre: 'Prothésiste, laboratoire', detail: 'Je représente un laboratoire de prothèse dentaire.', icone: FlaskConical },
  { role: 'organisme', titre: 'École ou organisme', detail: 'Faculté, école, formation, ordre ou syndicat.', icone: GraduationCap },
]

export default async function Page(props: { searchParams: Promise<{ role?: string; retour?: string; erreur?: string }> }) {
  const { role, retour, erreur } = await props.searchParams
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(`/inscription/profil/${role ? `?role=${role}` : ''}`)}`))
  if (compte.role && !role) redirect(chemin(prochaineEtape(compte.etat, retourSur(retour))))
  /*
   * Un nouveau compte venu du flux de connexion a déjà dit qui il est et
   * comment il s'appelle : le rôle est dans l'URL d'arrivée du lien, le nom
   * a été créé avec le compte. On enregistre et on passe à la suite, sans
   * redemander.
   */
  if (!compte.role && estRole(role) && compte.nom.trim().length >= 2) {
    await enregistrerProfil(role, compte.nom.trim())
    const maj = await getCompte()
    redirect(chemin(prochaineEtape(maj!.etat, retourSur(retour, role === 'patient' ? '/' : '/espace-pro/'))))
  }
  const choisi = estRole(role) ? role : compte.role
  const preselection = choisi === 'medecin' ? 'dentiste' : choisi
  const retourCache = <input type="hidden" name="retour" value={retourSur(retour, '')} />

  return (
    <Coquille>
      <Marque />
      <div className="animate-fiche-entree">
        <h1 className={titre}>Qui êtes-vous ?</h1>
        <p className="mt-2 text-sm text-fg-2">Pour vous proposer le bon parcours. La question n’est posée qu’une fois.</p>
        {erreur && (
          <Encart ton="erreur" className="mt-6">
            {erreur}
          </Encart>
        )}
        <form action={choisirProfil} className="mt-6">
          {retourCache}
          <fieldset>
            <legend className="sr-only">Votre profil</legend>
            <div className="grid gap-2.5">
              {PROFILS.map((p, i) => (
                <CarteOption
                  key={p.role}
                  name="role"
                  value={p.role}
                  titre={p.titre}
                  detail={p.detail}
                  icone={p.icone}
                  required={i === 0}
                  defaultChecked={preselection === p.role}
                />
              ))}
            </div>
          </fieldset>
          <button type="submit" className={`${principal} mt-6`}>
            Continuer
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </form>
        <form action={choisirProfil} className="mt-4 text-center text-sm">
          {retourCache}
          <button type="submit" className={lien}>
            Je préfère ne pas répondre
          </button>
        </form>
      </div>
    </Coquille>
  )
}
