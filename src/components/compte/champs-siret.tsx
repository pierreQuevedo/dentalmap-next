'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { Building2, CircleCheck, FlaskConical, Loader2, TriangleAlert } from 'lucide-react'
import type { Etablissement } from '@/lib/espace-pro/sirene'
import { pastille, saisie } from './ui'

/** NAF 32.50A : fabrication de matériel médico-chirurgical et dentaire, l'activité d'un laboratoire de prothèse. */
const NAF_LABO = '32.50A'

/**
 * LA1 : le SIRET, puis la raison sociale. Dès les quatorze chiffres saisis,
 * Sirene donne l'établissement : la raison sociale se préremplit, l'adresse
 * s'affiche, et une activité qui n'est pas la prothèse dentaire est signalée
 * avant l'envoi. Sans réponse de Sirene, la saisie reste libre.
 */
export function ChampsSiret({ siretInitial }: { siretInitial: string }) {
  const [siret, setSiret] = useState(siretInitial)
  const [raison, setRaison] = useState('')
  const [etat, setEtat] = useState<'repos' | 'cherche' | 'introuvable' | Etablissement>('repos')
  // Le laboratoire est déjà dans l'annuaire : il se revendique, il ne s'ajoute pas.
  const [existante, setExistante] = useState<string | null>(null)
  const demande = useRef(0)

  // La recherche part de la saisie, à quatorze chiffres ; une réponse arrivée après une autre saisie est ignorée.
  const saisir = (valeur: string) => {
    setSiret(valeur)
    const chiffres = valeur.replace(/\D/g, '')
    const n = ++demande.current
    if (chiffres.length !== 14) {
      setEtat('repos')
      setExistante(null)
      return
    }
    setEtat('cherche')
    fetch(`/api/espace-pro/sirene/?siret=${chiffres}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((r: (Partial<Etablissement> & { fiche?: string | null }) | null) => {
        if (n !== demande.current) return
        setExistante(r?.fiche ?? null)
        const e = r?.siret ? (r as Etablissement) : null
        setEtat(e ?? 'introuvable')
        if (e) setRaison((x) => x || e.nom)
      })
      .catch(() => n === demande.current && setEtat('introuvable'))
  }

  const e = typeof etat === 'object' ? etat : null
  return (
    <div className="mb-4 space-y-4">
      <div>
        <label htmlFor="ajout-siret" className="mb-1.5 block text-sm font-medium text-fg">
          SIRET
        </label>
        <div className={pastille}>
          <Building2 className="size-4 shrink-0 text-fg-2" aria-hidden />
          <input id="ajout-siret" name="siret" required inputMode="numeric" value={siret} onChange={(x) => saisir(x.target.value)} placeholder="912 004 118 00015" className={`${saisie} font-mono`} />
          {etat === 'cherche' && <Loader2 className="size-4 shrink-0 animate-spin text-fg-2" aria-label="Recherche dans Sirene" />}
        </div>
        {e && (
          <div className={`squircle-xl mt-2 flex gap-2.5 p-3 text-xs ${!e.actif || e.naf !== NAF_LABO ? 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200' : 'bg-teal/10 text-fg'}`} role="status">
            {!e.actif || e.naf !== NAF_LABO ? <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden /> : <CircleCheck className="mt-px size-4 shrink-0 text-teal" aria-hidden />}
            <span>
              <b className="font-semibold">{e.nom}</b>, {e.adresse}, {e.codePostal} {e.ville}.
              {!e.actif
                ? ' Cet établissement est fermé dans Sirene : vérifiez le numéro.'
                : e.naf !== NAF_LABO
                  ? ` Activité déclarée : ${e.naf ?? 'inconnue'}, pas la fabrication de prothèses dentaires (32.50A). La demande sera examinée de près.`
                  : ' Trouvé dans Sirene, activité de prothèse dentaire.'}
            </span>
          </div>
        )}
        {existante && (
          <p className="squircle-xl mt-2 bg-bg-soft p-3 text-xs text-fg">
            Ce laboratoire est déjà dans l’annuaire : inutile de l’ajouter.{' '}
            <Link href={chemin(`/espace-pro/laboratoire/revendiquer/${existante}/`)} className="font-semibold underline underline-offset-2">
              Le revendiquer
            </Link>
          </p>
        )}
        {etat === 'introuvable' && !existante && <p className="mt-1.5 text-xs text-fg-2">Sirene ne retrouve pas ce SIRET pour l’instant : indiquez la raison sociale, l’équipe vérifiera.</p>}
      </div>
      <div>
        <label htmlFor="ajout-raison" className="mb-1.5 block text-sm font-medium text-fg">
          Raison sociale
        </label>
        <div className={pastille}>
          <FlaskConical className="size-4 shrink-0 text-fg-2" aria-hidden />
          <input id="ajout-raison" name="raison" required minLength={2} value={raison} onChange={(x) => setRaison(x.target.value)} placeholder="Atelier Prothèse Garonne" className={saisie} />
        </div>
      </div>
    </div>
  )
}
