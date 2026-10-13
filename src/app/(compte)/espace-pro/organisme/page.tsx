import type { Metadata } from 'next'
import { ArrowRight, GraduationCap, Handshake, Landmark } from 'lucide-react'
import { CarteOption, Etapes, principal, titre } from '@/components/compte/ui'
import { choisirOrganisme } from '@/lib/espace-pro/actions-etablissement'
import { CoquilleOrganisme, ORGANISME, gardeOrganisme } from './_commun'

export const metadata: Metadata = { title: 'Quel type d’organisme ?', robots: { index: false, follow: false } }

/**
 * O1 : aiguiller l'organisme. Une école ou une faculté retrouve sa page ; la
 * formation continue rejoint la liste d'attente ; un ordre, un syndicat ou un
 * éditeur propose un partenariat, sans fiche publiée.
 */
export default async function Page() {
  await gardeOrganisme(`${ORGANISME}/`)
  return (
    <CoquilleOrganisme encart={{ icone: 'diplome', titre: 'Formation initiale', texte: 'Écoles et facultés publiées après vérification.' }}>
      <Etapes etape={1} total={3} libelle="Organisme" />
      <h1 className={titre}>Quel type d’organisme ?</h1>
      <p className="mt-2 text-sm text-fg-2">Pour vous orienter vers le bon parcours.</p>
      <form action={choisirOrganisme} className="mt-6">
        <fieldset className="grid gap-2.5">
          <legend className="sr-only">Type d’organisme</legend>
          <CarteOption name="organisme" value="etablissement" defaultChecked required icone={Landmark} titre="École ou faculté" badge="Fiche publiée" detail="Formation initiale : odontologie, prothèse dentaire." />
          <CarteOption name="organisme" value="continue" icone={GraduationCap} titre="Formation continue" badge="Liste d’attente" detail="Organisme de DPC ou de formation professionnelle." />
          <CarteOption name="organisme" value="partenaire" icone={Handshake} titre="Ordre, syndicat, éditeur" badge="Sur demande" detail="Partenariat, sans fiche publiée." />
        </fieldset>
        <button type="submit" className={`${principal} mt-5`}>
          Continuer
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
    </CoquilleOrganisme>
  )
}
