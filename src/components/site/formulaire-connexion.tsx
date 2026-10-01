'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth-client'

/**
 * Connexion par lien envoyé en courriel.
 *
 * Pas de mot de passe à créer ni à retenir : un professionnel qui vient
 * revendiquer sa fiche ne reviendra qu'une fois par an, et un mot de passe
 * oublié est un compte perdu. Le lien vaut cinq minutes.
 *
 * `retour` est le chemin d'où vient l'utilisateur, pour le ramener là après
 * la connexion. Il est vérifié côté page : seul un chemin interne est accepté,
 * sans quoi le paramètre servirait de tremplin vers un autre site.
 */
export function FormulaireConnexion({ retour }: { retour: string }) {
  const [courriel, setCourriel] = useState('')
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'envoye' | 'erreur'>('saisie')

  if (etat === 'envoye') {
    return (
      <div className="squircle-xl border border-line bg-bg-soft p-5">
        <h2 className="font-semibold text-fg">Vérifiez votre boîte de réception</h2>
        <p className="mt-2 text-sm text-fg-2">
          Un lien de connexion vient d’être envoyé à <span className="font-medium text-fg">{courriel}</span>. Il est
          valable cinq minutes. Pensez à regarder vos indésirables.
        </p>
        <button
          type="button"
          onClick={() => setEtat('saisie')}
          className="mt-4 text-sm text-fg underline hover:no-underline"
        >
          Utiliser une autre adresse
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setEtat('envoi')
        const { error } = await signIn.magicLink({ email: courriel, callbackURL: retour })
        setEtat(error ? 'erreur' : 'envoye')
      }}
    >
      <label htmlFor="courriel" className="block text-sm font-medium text-fg">
        Votre adresse électronique
      </label>
      <input
        id="courriel"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={courriel}
        onChange={(e) => setCourriel(e.target.value)}
        placeholder="prenom.nom@exemple.fr"
        className="squircle-md mt-2 w-full border border-line-strong px-3 py-2.5 text-fg outline-none focus:border-fg"
      />

      <button
        type="submit"
        disabled={etat === 'envoi'}
        className="squircle-full mt-4 w-full bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover disabled:opacity-60"
      >
        {etat === 'envoi' ? 'Envoi en cours…' : 'Recevoir mon lien de connexion'}
      </button>

      {etat === 'erreur' && (
        <p className="mt-3 text-sm text-destructive">
          Le lien n’a pas pu être envoyé. Vérifiez l’adresse saisie et réessayez.
        </p>
      )}

      <p className="mt-4 text-sm text-fg-2">
        Aucun mot de passe à créer. Nous n’utilisons votre adresse que pour vous connecter et vous répondre.
      </p>
    </form>
  )
}
