'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { envoyerMessageContact, type EtatContact } from '@/app/(public)/contact/actions'
import { OBJETS, type Objet } from '@/lib/contact/objets'

/**
 * Le formulaire de la page contact.
 *
 * Même mécanique que la demande de partenariat de l'accueil : une action
 * serveur, un état de retour affiché sous le bouton, aucune donnée stockée.
 * L'objet peut arriver présélectionné par l'URL, depuis le pied de page ou
 * l'une des cartes de la page ; quand il s'agit d'une erreur sur une fiche,
 * un champ demande le lien de la fiche, ce qui évite d'avoir à la retrouver.
 */
const LIBELLES = Object.fromEntries(OBJETS) as Record<Objet, string>

export function FormulaireContact({ objetInitial }: { objetInitial?: Objet }) {
  const [etat, soumettre, enCours] = useActionState<EtatContact, FormData>(envoyerMessageContact, null)
  const [objet, setObjet] = useState<Objet | null>(objetInitial ?? null)

  return (
    <form action={soumettre} className="grid grid-cols-2 gap-x-4 gap-y-6">
      <Groupe className="col-span-2 sm:col-span-1">
        <Label htmlFor="contact-prenom">Prénom</Label>
        <Input id="contact-prenom" name="prenom" type="text" autoComplete="given-name" required />
      </Groupe>
      <Groupe className="col-span-2 sm:col-span-1">
        <Label htmlFor="contact-nom">Nom</Label>
        <Input id="contact-nom" name="nom" type="text" autoComplete="family-name" required />
      </Groupe>
      <Groupe className="col-span-2">
        <Label htmlFor="contact-email">Adresse électronique</Label>
        <Input id="contact-email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" required />
      </Groupe>
      <Groupe className="col-span-2">
        <Label htmlFor="contact-telephone">
          Téléphone <span className="font-normal text-muted-foreground">(facultatif)</span>
        </Label>
        <Input id="contact-telephone" name="telephone" type="tel" autoComplete="tel" placeholder="06 00 00 00 00" />
      </Groupe>
      <Groupe className="col-span-2">
        <Label htmlFor="contact-objet">Objet</Label>
        {/* `items` : sans lui, le déclencheur afficherait la valeur brute et non le libellé. */}
        <Select name="objet" items={LIBELLES} value={objet} onValueChange={(v) => setObjet(v as Objet)} required>
          <SelectTrigger id="contact-objet" aria-label="Objet" className="w-full">
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {OBJETS.map(([valeur, libelle]) => (
              <SelectItem key={valeur} value={valeur}>
                {libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Groupe>
      {objet === 'erreur-fiche' && (
        <Groupe className="col-span-2">
          <Label htmlFor="contact-fiche">
            Lien de la fiche concernée <span className="font-normal text-muted-foreground">(facultatif)</span>
          </Label>
          <Input id="contact-fiche" name="fiche" type="url" inputMode="url" placeholder="https://dentalmap.fr/dentistes/…" />
        </Groupe>
      )}
      <Groupe className="col-span-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Ce que vous avez constaté, ou ce que vous souhaitez nous demander."
          // Hauteur fixe : la zone défile au lieu de grandir, le bloc ne bouge pas.
          className="h-36 field-sizing-fixed resize-none overflow-y-auto"
          required
        />
      </Groupe>
      <label className="col-span-2 flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="consentement" required className="mt-0.5 size-4 shrink-0 accent-teal" />
        <span>
          J’accepte que ces informations servent à traiter ma demande, comme le décrit la{' '}
          <Link href="/confidentialite" className="font-medium text-foreground underline-offset-2 hover:underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <Button type="submit" size="lg" className="col-span-2 rounded-full bg-teal text-white hover:bg-teal" disabled={enCours}>
        {enCours ? 'Envoi en cours…' : 'Envoyer le message'} <ArrowRight />
      </Button>
      {etat && (
        <p role="status" className={`col-span-2 text-sm ${etat.ok ? 'text-foreground' : 'text-destructive'}`}>
          {etat.message}
        </p>
      )}
    </form>
  )
}

function Groupe({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-2 ${className ?? ''}`}>{children}</div>
}
