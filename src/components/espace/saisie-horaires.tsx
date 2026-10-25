'use client'

import { useEffect, useState } from 'react'
import { EVENEMENT_APERCU } from './valeur-en-direct'
import { JOURS, LIBELLE_JOUR, type Horaires, type Jour } from '@/lib/espace-pro/fiche-completee'

/**
 * B1 : la semaine, jour par jour.
 *
 * Un interrupteur par jour ; un jour ouvert a une plage, ou deux avec la
 * pause de midi. Les heures se saisissent directement. « Copier le lundi sur
 * les jours ouvrés » reporte le lundi du mardi au vendredi. Le formulaire
 * reçoit la semaine en JSON, validée côté serveur.
 */
type Jour_ = { ouvert: boolean; plages: { debut: string; fin: string }[] }
type Semaine = Record<Jour, Jour_>

const OUVRES: Jour[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']

function depart(h: Horaires | null): Semaine {
  const vide = !h || !JOURS.some((j) => (h[j]?.length ?? 0) > 0)
  return Object.fromEntries(
    JOURS.map((j) => {
      if (!vide) return [j, { ouvert: (h?.[j]?.length ?? 0) > 0, plages: h?.[j]?.length ? h[j]!.map((p) => ({ ...p })) : [{ debut: '09:00', fin: '18:00' }] }]
      // Une semaine type pour commencer : à ajuster, rien n'est publié sans validation.
      return [j, { ouvert: OUVRES.includes(j), plages: [{ debut: '08:30', fin: '12:30' }, { debut: '14:00', fin: '19:00' }] }]
    }),
  ) as Semaine
}

const champ =
  'squircle-lg h-9 w-[4.6rem] border border-line bg-bg px-2 text-center font-mono text-[13px] text-fg shadow-pill outline-none focus:border-fg [&::-webkit-calendar-picker-indicator]:hidden'

export function SaisieHoraires({ initiales }: { initiales: Horaires | null }) {
  const [semaine, setSemaine] = useState<Semaine>(() => depart(initiales))
  const maj = (j: Jour, f: (d: Jour_) => Jour_) => setSemaine((s) => ({ ...s, [j]: f(s[j]) }))
  const json: Horaires = Object.fromEntries(JOURS.filter((j) => semaine[j].ouvert).map((j) => [j, semaine[j].plages])) as Horaires
  const ouverts = JOURS.filter((j) => semaine[j].ouvert)
  // L'aperçu de l'onboarding : aujourd'hui, comme la carte publique.
  useEffect(() => {
    const jour = JOURS[(new Date().getDay() + 6) % 7] as Jour
    const plages = semaine[jour].ouvert ? semaine[jour].plages : []
    const [hh, mm] = (plages[plages.length - 1]?.fin ?? '').split(':')
    const valeur = !ouverts.length ? null : plages.length ? `Ouvert aujourd’hui jusqu’à ${Number(hh)} h${mm === '00' ? '' : ` ${mm}`}` : 'Fermé aujourd’hui'
    window.dispatchEvent(new CustomEvent(EVENEMENT_APERCU, { detail: { cle: 'horaires', valeur } }))
  }, [semaine, ouverts.length])

  return (
    <div>
      <input type="hidden" name="horaires" value={JSON.stringify(json)} />
      {/* Repère pour le taux en direct (`SaisieEnDirect`) : présent dès qu'un jour est ouvert. */}
      {ouverts.length > 0 && <input type="hidden" name="horaires_ouverts" value={ouverts.length} />}
      <ul className="space-y-2">
        {JOURS.map((j) => {
          const d = semaine[j]
          return (
            <li key={j} className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1.5">
              <label className="flex w-28 cursor-pointer items-center gap-2.5 text-sm text-fg">
                <input
                  type="checkbox"
                  checked={d.ouvert}
                  onChange={() => maj(j, (x) => ({ ...x, ouvert: !x.ouvert }))}
                  className="peer sr-only"
                  aria-label={`${LIBELLE_JOUR[j]} ouvert`}
                />
                <span
                  aria-hidden
                  className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
                />
                {LIBELLE_JOUR[j]}
              </label>
              {d.ouvert ? (
                <span className="flex flex-wrap items-center gap-1.5">
                  {d.plages.map((p, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="w-1" />}
                      <input type="time" aria-label={`${LIBELLE_JOUR[j]}, début de la plage ${i + 1}`} value={p.debut} onChange={(e) => maj(j, (x) => ({ ...x, plages: x.plages.map((q, k) => (k === i ? { ...q, debut: e.target.value } : q)) }))} className={champ} />
                      <span className="text-fg-2">–</span>
                      <input type="time" aria-label={`${LIBELLE_JOUR[j]}, fin de la plage ${i + 1}`} value={p.fin} onChange={(e) => maj(j, (x) => ({ ...x, plages: x.plages.map((q, k) => (k === i ? { ...q, fin: e.target.value } : q)) }))} className={champ} />
                    </span>
                  ))}
                  {d.plages.length === 1 ? (
                    <button type="button" onClick={() => maj(j, (x) => ({ ...x, plages: [{ ...x.plages[0], fin: '12:30' }, { debut: '14:00', fin: x.plages[0].fin > '14:00' ? x.plages[0].fin : '19:00' }] }))} className="ml-1 cursor-pointer text-xs text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                      + pause
                    </button>
                  ) : (
                    <button type="button" onClick={() => maj(j, (x) => ({ ...x, plages: [{ debut: x.plages[0].debut, fin: x.plages[1].fin }] }))} className="ml-1 cursor-pointer text-xs text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                      sans pause
                    </button>
                  )}
                </span>
              ) : (
                <span className="text-sm text-fg-2">Fermé</span>
              )}
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={() => setSemaine((s) => ({ ...s, ...Object.fromEntries(OUVRES.slice(1).map((j) => [j, { ouvert: s.lundi.ouvert, plages: s.lundi.plages.map((p) => ({ ...p })) }])) }))}
        className="mt-4 cursor-pointer text-sm font-medium text-fg underline underline-offset-4 hover:no-underline"
      >
        Copier le lundi sur les jours ouvrés
      </button>
    </div>
  )
}
