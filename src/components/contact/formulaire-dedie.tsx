'use client'

import { startTransition, useActionState, useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { envoyerMessageContact, type EtatContact } from '@/app/(public)/contact/actions'
import { FORMULAIRES } from '@/lib/contact/formulaires'
import type { Objet } from '@/lib/contact/objets'

/** Rang d'un élément dans la chorégraphie du panneau (voir `.recherche-intro`). */
const rang = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Le formulaire dédié d'une entrée de la page contact : les champs propres à
 * la demande (`src/lib/contact/formulaires.ts`), puis l'identité, le message
 * et le consentement. Soumis par `onSubmit` pour que React ne vide pas les
 * champs sur une erreur ; une fois le message parti, le formulaire laisse la
 * place à la confirmation.
 */
export function FormulaireDedie({ objet, initiales = {} }: { objet: Exclude<Objet, 'partenariat'>; initiales?: Partial<Record<string, string>> }) {
  const f = FORMULAIRES[objet]
  const [etat, soumettre, enCours] = useActionState<EtatContact, FormData>(envoyerMessageContact, null)
  const formulaire = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (etat?.ok) formulaire.current?.reset()
  }, [etat])

  if (etat?.ok) {
    return (
      <div className="recherche-intro squircle-3xl border border-line bg-bg-soft p-6 md:p-8" style={rang(0)}>
        <span className="grid size-11 place-items-center rounded-full bg-teal text-white">
          <Check className="size-5" aria-hidden />
        </span>
        <p className="mt-5 text-xl font-semibold tracking-tight text-fg">Message envoyé</p>
        <p role="status" className="mt-1 text-fg-2">
          {etat.message}
        </p>
      </div>
    )
  }

  let i = 0
  const id = (nom: string) => `contact-${objet}-${nom}`
  return (
    <form
      ref={formulaire}
      onSubmit={(e) => {
        e.preventDefault()
        const donnees = new FormData(e.currentTarget)
        startTransition(() => soumettre(donnees))
      }}
      className="grid grid-cols-2 gap-x-4 gap-y-5"
    >
      <input type="hidden" name="objet" value={objet} />
      {f.champs.map((c) => (
        <div key={c.nom} className="recherche-intro col-span-2 flex flex-col gap-2" style={rang(++i)}>
          <Label htmlFor={id(c.nom)}>
            {c.libelle} {!c.requis && <span className="font-normal text-fg-2">(facultatif)</span>}
          </Label>
          {c.type === 'liste' ? (
            <Select name={c.nom} items={Object.fromEntries(c.options ?? [])} defaultValue={initiales[c.nom] ?? null} required={c.requis}>
              <SelectTrigger id={id(c.nom)} aria-label={c.libelle} className="w-full">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {(c.options ?? []).map(([valeur, libelle]) => (
                  <SelectItem key={valeur} value={valeur}>
                    {libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input id={id(c.nom)} name={c.nom} type="text" defaultValue={initiales[c.nom]} placeholder={c.placeholder} required={c.requis} />
          )}
        </div>
      ))}
      <div className="recherche-intro col-span-2 flex flex-col gap-2" style={rang(++i)}>
        <Label htmlFor={id('message')}>{f.message}</Label>
        <Textarea
          id={id('message')}
          name="message"
          placeholder={f.placeholder}
          // Hauteur fixe : la zone défile au lieu de grandir, le panneau ne bouge pas.
          className="h-28 field-sizing-fixed resize-none overflow-y-auto"
          required
        />
      </div>
      <div className="recherche-intro col-span-2 flex flex-col gap-2 sm:col-span-1" style={rang(++i)}>
        <Label htmlFor={id('prenom')}>Prénom</Label>
        <Input id={id('prenom')} name="prenom" type="text" autoComplete="given-name" required />
      </div>
      <div className="recherche-intro col-span-2 flex flex-col gap-2 sm:col-span-1" style={rang(i)}>
        <Label htmlFor={id('nom')}>Nom</Label>
        <Input id={id('nom')} name="nom" type="text" autoComplete="family-name" required />
      </div>
      <div className={`recherche-intro col-span-2 flex flex-col gap-2 ${f.telephone ? 'sm:col-span-1' : ''}`} style={rang(++i)}>
        <Label htmlFor={id('email')}>Adresse électronique</Label>
        <Input id={id('email')} name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" required />
      </div>
      {f.telephone && (
        <div className="recherche-intro col-span-2 flex flex-col gap-2 sm:col-span-1" style={rang(i)}>
          <Label htmlFor={id('telephone')}>
            Téléphone <span className="font-normal text-fg-2">(facultatif)</span>
          </Label>
          <Input id={id('telephone')} name="telephone" type="tel" autoComplete="tel" placeholder="06 00 00 00 00" />
        </div>
      )}
      <label className="recherche-intro col-span-2 flex items-start gap-3 text-sm text-fg-2" style={rang(++i)}>
        <input type="checkbox" name="consentement" required className="mt-0.5 size-4 shrink-0 accent-teal" />
        <span>
          J’accepte que ces informations servent à traiter ma demande, comme le décrit la{' '}
          <Link href="/confidentialite" className="font-medium text-fg underline-offset-2 hover:underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <div className="recherche-intro col-span-2" style={rang(++i)}>
        <Button type="submit" size="lg" className="w-full rounded-full bg-action text-action-foreground hover:bg-action" disabled={enCours}>
          {enCours ? 'Envoi en cours…' : 'Envoyer'} <ArrowRight />
        </Button>
        {etat && !etat.ok && (
          <p role="status" className="mt-3 text-sm text-destructive">
            {etat.message}
          </p>
        )}
      </div>
    </form>
  )
}
