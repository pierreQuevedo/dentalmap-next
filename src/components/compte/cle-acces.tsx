'use client'

import { useState, useTransition } from 'react'
import { KeyRound } from 'lucide-react'
import { passkey } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import { Encart, Marque, Pictogramme, discret, principal, titre } from './ui'

/** CX4 : créer la clé, ou passer. Dans les deux cas, on repart là où l'on allait. */
export function CreerCle({ retour }: { retour: string }) {
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()
  const partir = () => window.location.assign(chemin(retour))
  const creer = () => {
    setErreur(null)
    demarrer(async () => {
      const r = await passkey.addPasskey()
      if (r?.error) {
        setErreur('La clé n’a pas été créée : la demande a été annulée ou votre appareil l’a refusée. Vous pouvez réessayer, ou passer.')
        return
      }
      partir()
    })
  }
  return (
    <div>
      <Marque />
      <div className="animate-fiche-entree">
        <Pictogramme icone={KeyRound} />
        <h1 className={titre}>La prochaine fois, d’un geste</h1>
        <p className="mt-2 text-sm text-fg-2">Enregistrez une clé d’accès : vous vous connecterez avec Face ID, Touch ID ou le code de votre appareil.</p>
        <Encart titre="Rien ne quitte votre appareil" className="mt-5">
          La clé est conservée par votre téléphone ou votre gestionnaire de mots de passe. DentalMap n’en voit que la partie publique.
        </Encart>
        {erreur && (
          <Encart ton="erreur" className="mt-3">
            {erreur}
          </Encart>
        )}
        <button type="button" onClick={creer} disabled={enCours} className={`${principal} mt-5`}>
          <KeyRound className="size-4" aria-hidden />
          {enCours ? 'Création…' : 'Créer une clé d’accès'}
        </button>
        <button type="button" onClick={partir} className={`${discret} mt-1`}>
          Plus tard
        </button>
      </div>
    </div>
  )
}
