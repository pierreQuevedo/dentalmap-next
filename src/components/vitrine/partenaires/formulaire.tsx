'use client'

/**
 * Formulaire public de partenariat, repris de celui de l'accueil
 * (`src/components/book-a-demo2.tsx`, non exporté là-bas) sans les avis ni les
 * logos. Branché sur l'action `envoyerDemandePartenariat` : sans compte, six
 * champs, mêmes noms, mêmes listes et mêmes exemples que l'accueil.
 */
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { envoyerDemandePartenariat, type EtatDemande } from '@/app/(public)/partenaires/actions'

const ORGANISMES = [
  ['ordre', 'Ordre départemental'],
  ['ecole', 'École ou université'],
  ['syndicat', 'Syndicat ou association'],
  ['editeur', 'Éditeur de logiciel'],
  ['formation', 'Organisme de formation'],
  ['collectivite', 'Collectivité ou ARS'],
  ['autre', 'Autre'],
] as const

const FONCTIONS = [
  ['dentiste', 'Chirurgien-dentiste'],
  ['prothesiste', 'Prothésiste dentaire'],
  ['direction', 'Direction ou administration'],
  ['enseignement', 'Enseignement'],
  ['autre', 'Autre'],
] as const

// `items` des listes : sans lui, le déclencheur afficherait la valeur brute et non le libellé.
const LIBELLES_ORGANISMES = Object.fromEntries(ORGANISMES)
const LIBELLES_FONCTIONS = Object.fromEntries(FONCTIONS)

function Groupe({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>
}

/**
 * `nu` : sans la carte ni le titre, pour le panneau de la page contact, qui
 * porte les siens ; l'origine de la demande suit (`contact`).
 */
export function FormulairePartenariat({ nu = false }: { nu?: boolean } = {}) {
  const [etat, soumettre, enCours] = useActionState<EtatDemande, FormData>(envoyerDemandePartenariat, null)
  const formulaire = useRef<HTMLFormElement>(null)
  // Soumission par `onSubmit` plutôt que par `action` : React viderait le
  // formulaire à chaque retour, y compris sur une erreur de validation. On ne
  // le vide qu'une fois la demande envoyée.
  useEffect(() => {
    if (etat?.ok) formulaire.current?.reset()
  }, [etat])
  return (
    <div id={nu ? undefined : 'formulaire'} className={nu ? '' : 'squircle-3xl scroll-mt-28 border border-line bg-bg p-6 shadow-pop md:p-8'}>
      {!nu && (
        <>
          <p className="text-xl font-semibold tracking-tight text-fg">Proposer un partenariat</p>
          <p className="mt-1 text-sm text-fg-2">Sans compte. Une personne de l’équipe vous répond.</p>
        </>
      )}
      <form
        ref={formulaire}
        onSubmit={(e) => {
          e.preventDefault()
          const donnees = new FormData(e.currentTarget)
          startTransition(() => soumettre(donnees))
        }}
        className={`${nu ? '' : 'mt-6 '}grid grid-cols-2 gap-x-3 gap-y-5`}>
        <input type="hidden" name="origine" value={nu ? 'contact' : 'partenaires'} />
        <Groupe className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-prenom">Prénom</Label>
          <Input id="partenaire-prenom" name="prenom" type="text" autoComplete="given-name" required />
        </Groupe>
        <Groupe className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-nom">Nom</Label>
          <Input id="partenaire-nom" name="nom" type="text" autoComplete="family-name" required />
        </Groupe>
        <Groupe className="col-span-2">
          <Label htmlFor="partenaire-email">Adresse électronique</Label>
          <Input id="partenaire-email" name="email" type="email" autoComplete="email" placeholder="prenom.nom@organisme.fr" required />
        </Groupe>
        <Groupe className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-organisme">Type d’organisme</Label>
          <Select name="organisme" items={LIBELLES_ORGANISMES} required>
            <SelectTrigger id="partenaire-organisme" aria-label="Type d’organisme" className="w-full">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {ORGANISMES.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Groupe>
        <Groupe className="col-span-2 sm:col-span-1">
          <Label htmlFor="partenaire-fonction">Votre fonction</Label>
          <Select name="fonction" items={LIBELLES_FONCTIONS} required>
            <SelectTrigger id="partenaire-fonction" aria-label="Votre fonction" className="w-full">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {FONCTIONS.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Groupe>
        <Groupe className="col-span-2">
          <Label htmlFor="partenaire-message">Votre projet</Label>
          <Textarea
            id="partenaire-message"
            name="message"
            placeholder="Qui vous êtes, ce que vous souhaitez partager ou relayer, et ce que vous attendez de DentalMap."
            className="h-28 field-sizing-fixed resize-none overflow-y-auto"
            required
          />
        </Groupe>
        <Button type="submit" className="col-span-2 bg-teal text-white hover:bg-teal" size="lg" disabled={enCours}>
          {enCours ? 'Envoi en cours…' : 'Envoyer ma demande'} <ArrowRight />
        </Button>
        {etat && (
          <p role="status" className={`col-span-2 text-sm ${etat.ok ? 'text-fg' : 'text-destructive'}`}>
            {etat.message}
          </p>
        )}
      </form>
    </div>
  )
}
