import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleCheck, Landmark, MapPin, Send, ShieldCheck } from 'lucide-react'
import { Encart, Etapes, Pictogramme, discret, pastille, pastilleInvalide, principal, saisie, secondaire, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { demanderAjoutEtablissement } from '@/lib/espace-pro/actions-etablissement'
import { CoquilleOrganisme, ORGANISME, gardeOrganisme } from '../../_commun'

export const metadata: Metadata = { title: 'Ajouter votre établissement', robots: { index: false, follow: false } }

/**
 * OA1 : un établissement absent de l'annuaire. Nom, numéro UAI (sept chiffres
 * et une lettre de clé, contrôlée) et ville ; rien n'est publié avant que
 * l'équipe ait vérifié le numéro au référentiel de l'Éducation nationale.
 */
type Params = { nom?: string; uai?: string; ville?: string; erreur?: string; champ?: string; envoye?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const ici = `${ORGANISME}/etablissement/ajout/`
  await gardeOrganisme(ici)
  const encart = { icone: 'recherche' as const, ton: 'attention' as const, titre: 'UAI à vérifier', texte: 'Aucune publication avant contrôle.' }

  if (sp.envoye) {
    return (
      <CoquilleOrganisme encart={{ ...encart, ton: 'teal', titre: 'Demande envoyée', texte: 'Nous vérifions le numéro UAI au référentiel.' }} retour={`${ORGANISME}/etablissement/`} libelleRetour="Retour">
        <Pictogramme icone={CircleCheck} ton="succes" />
        <h1 className={titre}>Demande envoyée</h1>
        <p className="mt-2 text-sm text-fg-2">
          Nous vérifions le numéro UAI auprès du référentiel de l’Éducation nationale, puis nous créons la page. Un email vous prévient : vous pourrez alors
          compléter vos formations.
        </p>
        <Link href={chemin('/')} className={`${principal} mt-6`}>
          Retour à l’accueil
        </Link>
        <Link href={chemin(`${ORGANISME}/etablissement/`)} className={`${secondaire} mt-3`}>
          Chercher un autre établissement
        </Link>
      </CoquilleOrganisme>
    )
  }

  const uaiFaux = sp.champ === 'uai'
  return (
    <CoquilleOrganisme recherche={sp.uai ?? ''} invite="Numéro UAI" encart={encart} retour={`${ORGANISME}/etablissement/`} libelleRetour="Retour">
      <Etapes etape={2} total={3} libelle="Établissement" />
      <h1 className={titre}>Ajouter votre établissement</h1>
      <p className="mt-2 text-sm text-fg-2">Nous vérifions le numéro UAI avant toute publication.</p>
      {sp.erreur && !uaiFaux && (
        <Encart ton="erreur" className="mt-5">
          {sp.erreur}
        </Encart>
      )}
      <form action={demanderAjoutEtablissement} className="mt-6 space-y-4">
        <div>
          <label htmlFor="ajout-nom" className="mb-1.5 block text-sm font-medium text-fg">
            Nom de l’établissement
          </label>
          <div className={pastille}>
            <Landmark className="size-4 shrink-0 text-fg-2" aria-hidden />
            <input id="ajout-nom" name="nom" required minLength={3} maxLength={200} defaultValue={sp.nom} placeholder="Institut de formation en prothèse dentaire" autoComplete="organization" className={saisie} />
          </div>
        </div>
        <div>
          <label htmlFor="ajout-uai" className="mb-1.5 block text-sm font-medium text-fg">
            Numéro UAI
          </label>
          <div className={uaiFaux ? pastilleInvalide : pastille}>
            <ShieldCheck className="size-4 shrink-0 text-fg-2" aria-hidden />
            <input
              id="ajout-uai"
              name="uai"
              required
              defaultValue={sp.uai}
              placeholder="0332045K"
              pattern="\s*\d{7}\s*[A-Za-z]\s*"
              maxLength={12}
              autoComplete="off"
              aria-invalid={uaiFaux || undefined}
              aria-describedby="ajout-uai-aide"
              className={`${saisie} font-mono uppercase`}
            />
          </div>
          <p id="ajout-uai-aide" className={`mt-1.5 text-xs ${uaiFaux ? 'text-destructive' : 'text-fg-2'}`}>
            {uaiFaux ? sp.erreur : '7 chiffres et 1 lettre, sur les documents du rectorat.'}
          </p>
        </div>
        <div>
          <label htmlFor="ajout-ville" className="mb-1.5 block text-sm font-medium text-fg">
            Ville
          </label>
          <div className={pastille}>
            <MapPin className="size-4 shrink-0 text-fg-2" aria-hidden />
            <input id="ajout-ville" name="ville" required minLength={2} maxLength={120} defaultValue={sp.ville} placeholder="Talence (33400)" autoComplete="address-level2" className={saisie} />
          </div>
        </div>
        <button type="submit" className={`${principal} !mt-5`}>
          <Send className="size-4" aria-hidden />
          Envoyer la demande
        </button>
      </form>
      <Link href={chemin(`${ORGANISME}/etablissement/`)} className={`${discret} mt-1`}>
        Retour
      </Link>
    </CoquilleOrganisme>
  )
}
