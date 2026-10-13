'use client'

import { useRouter } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { LISTE_CESSIONS, cheminDepartementCession } from '@/lib/cessions/routes'
import { LIBELLE_TYPE, TYPES_CESSION, type DepartementCession, type FiltresCession, type TypeCession } from '@/lib/cessions/types'

/**
 * Les filtres de la liste des cessions, portés par l'URL : département (dans
 * le chemin), type, fauteuils, disponibilité, et la vue. Chaque changement
 * navigue aussitôt vers l'adresse filtrée ; sans JavaScript, le bouton
 * « Appliquer » envoie le formulaire à `/annonces/cession/`, qui redirige
 * vers le département choisi.
 */
export function FiltresCessions({
  idPrefixe,
  departements,
  departementSlug,
  filtres,
  comptes,
  vue,
}: {
  idPrefixe: string
  departements: DepartementCession[]
  departementSlug: string | null
  filtres: FiltresCession
  comptes: Record<TypeCession, number>
  vue: 'liste' | 'carte'
}) {
  const router = useRouter()
  const groupe = 'border-b border-line py-5 first:pt-0'
  const titre = 'text-sm font-semibold text-fg'

  function naviguer(form: HTMLFormElement) {
    const d = new FormData(form)
    const dep = String(d.get('departement') ?? '')
    const q = new URLSearchParams()
    for (const t of d.getAll('type')) q.append('type', String(t))
    for (const k of ['fauteuils', 'dispo', 'vue']) {
      const v = String(d.get(k) ?? '')
      if (v) q.set(k, v)
    }
    const base = dep ? cheminDepartementCession(dep) : LISTE_CESSIONS
    const s = q.toString()
    router.push(chemin(`${base}${s ? `?${s}` : ''}`), { scroll: false })
  }

  const radio = 'peer sr-only'
  const segment = 'block cursor-pointer rounded-full py-1.5 text-fg-2 peer-checked:bg-bg peer-checked:font-medium peer-checked:text-fg peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-fg'

  return (
    <form
      action={LISTE_CESSIONS}
      method="get"
      className="text-sm"
      onChange={(e) => naviguer(e.currentTarget)}
      onSubmit={(e) => {
        e.preventDefault()
        naviguer(e.currentTarget)
      }}
    >
      {vue === 'carte' && <input type="hidden" name="vue" value="carte" />}
      <fieldset className={groupe}>
        <legend className={titre}>Département</legend>
        <label htmlFor={`${idPrefixe}-departement`} className="sr-only">
          Département
        </label>
        <select
          id={`${idPrefixe}-departement`}
          name="departement"
          defaultValue={departementSlug ?? ''}
          className="mt-3 h-10 w-full rounded-lg border border-line bg-bg px-3 text-fg outline-none focus:border-line-strong"
        >
          <option value="">Toute la France</option>
          {departements.map((d) => (
            <option key={d.code} value={d.slug}>
              {d.nom} ({d.code}){d.total ? ` · ${d.total}` : ''}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Type de cession</legend>
        <ul className="mt-3 space-y-2">
          {TYPES_CESSION.map((t) => (
            <li key={t} className="flex items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-fg">
                <input type="checkbox" name="type" value={t} defaultChecked={filtres.types.includes(t)} className="size-4 accent-fg" />
                {LIBELLE_TYPE[t]}
              </label>
              <span className="tabular-nums text-fg-2">{comptes[t]}</span>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Fauteuils</legend>
        <div className="mt-3 grid grid-cols-4 rounded-full bg-bg-soft p-1 text-center text-xs">
          {(
            [
              ['', 'Tous'],
              ['1', '1'],
              ['2', '2'],
              ['3', '3 et +'],
            ] as const
          ).map(([v, l]) => (
            <label key={v || 'tous'}>
              <input type="radio" name="fauteuils" value={v} defaultChecked={String(filtres.fauteuils ?? '') === v} className={radio} />
              <span className={segment}>{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Disponibilité</legend>
        <ul className="mt-3 space-y-2">
          {(
            [
              ['immediate', 'Immédiate'],
              ['six-mois', 'D’ici six mois'],
              ['', 'Toutes dates'],
            ] as const
          ).map(([v, l]) => (
            <li key={v || 'toutes'}>
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-fg">
                <input type="radio" name="dispo" value={v} defaultChecked={(filtres.dispo ?? '') === v} className="size-4 accent-fg" />
                {l}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="mt-5 flex items-center justify-between gap-3">
        <a
          href={departementSlug ? cheminDepartementCession(departementSlug) : LISTE_CESSIONS}
          onClick={(e) => {
            e.preventDefault()
            router.push(chemin(`${departementSlug ? cheminDepartementCession(departementSlug) : LISTE_CESSIONS}${vue === 'carte' ? '?vue=carte' : ''}`), { scroll: false })
          }}
          className="text-sm font-medium text-fg underline underline-offset-4"
        >
          Effacer les filtres
        </a>
        <noscript>
          <button type="submit" className="inline-flex h-9 items-center rounded-full bg-fg px-4 text-sm font-semibold text-bg">
            Appliquer
          </button>
        </noscript>
      </div>
    </form>
  )
}
