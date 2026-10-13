'use client'

import Form from 'next/form'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { PRISES_EN_CHARGE, PUBLICS_FORMATION, REGIONS_FORMATION } from '@/lib/formation/privee'
import { CHOIX_FORMAT, TRANCHES_DUREE, type FiltresPrivees } from '@/lib/formation/privee-liste'
import { THEMES_FORMATION } from '@/lib/formation/themes'

/**
 * Les filtres de la liste des formations privées : un formulaire GET, appliqué
 * à chaque changement (et par son bouton sans JavaScript). L'état vit dans
 * l'URL ; le formulaire est remonté à chaque changement d'adresse pour que
 * « Effacer les filtres » décoche aussi les cases.
 */
function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="text-sm font-semibold text-fg">{titre}</legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

function Case({ name, value, coche, children }: { name: string; value: string; coche: boolean; children: React.ReactNode }) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-2.5 text-fg">
        <input type="checkbox" name={name} value={value} defaultChecked={coche} className="peer sr-only" />
        <span className="grid size-4 shrink-0 place-items-center rounded border border-line-strong bg-bg peer-checked:border-fg peer-checked:bg-fg peer-focus-visible:ring-2 peer-focus-visible:ring-teal [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <svg viewBox="0 0 16 16" className="size-3 text-bg" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M3 8.5l3.5 3.5L13 5" />
          </svg>
        </span>
        {children}
      </label>
    </li>
  )
}

export function FiltresFormationsPrivees({ action, filtres, lieu, cle, id }: { action: string; filtres: FiltresPrivees; lieu: Record<string, string>; cle: string; id: string }) {
  return (
    <Form key={cle} action={chemin(action)} scroll={false} replace onChange={(e) => e.currentTarget.requestSubmit()} className="text-sm">
      {Object.entries(lieu).map(([n, v]) => (
        <input key={n} type="hidden" name={n} value={v} />
      ))}
      <Groupe titre="Thème">
        <div className="flex flex-wrap gap-1.5">
          {THEMES_FORMATION.map((t) => (
            <label
              key={t}
              className="cursor-pointer rounded-full px-2.5 py-1 text-xs text-fg ring-1 ring-inset ring-line has-[:checked]:bg-teal/10 has-[:checked]:text-teal has-[:checked]:ring-teal/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal"
            >
              <input type="checkbox" name="theme" value={t} defaultChecked={filtres.themes.includes(t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </Groupe>
      <Groupe titre="Public">
        <ul className="space-y-2">
          {PUBLICS_FORMATION.map((p) => (
            <Case key={p} name="public" value={p} coche={filtres.publics.includes(p)}>
              {p}
            </Case>
          ))}
        </ul>
      </Groupe>
      <Groupe titre="Format">
        <div className="grid grid-cols-4 rounded-full bg-bg-soft p-1 text-center text-xs">
          {[{ cle: '', libelle: 'Tous' }, ...CHOIX_FORMAT].map((c) => (
            <label key={c.cle} className="cursor-pointer rounded-full py-1.5 text-fg-2 has-[:checked]:bg-bg has-[:checked]:font-medium has-[:checked]:text-fg has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal">
              <input type="radio" name="format" value={c.cle} defaultChecked={(filtres.format ?? '') === c.cle} className="sr-only" />
              {c.libelle}
            </label>
          ))}
        </div>
      </Groupe>
      <Groupe titre="Région">
        <label htmlFor={`${id}-zone`} className="sr-only">
          Région
        </label>
        <div className="relative">
          <select
            id={`${id}-zone`}
            name="zone"
            defaultValue={filtres.zone ?? ''}
            className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-bg px-3 pr-9 text-fg outline-none focus:border-line-strong"
          >
            <option value="">Toute la France</option>
            {REGIONS_FORMATION.map((r) => (
              <option key={r.code} value={r.code}>
                {r.nom}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-fg-2" aria-hidden />
        </div>
      </Groupe>
      <Groupe titre="Durée">
        <ul className="space-y-2">
          {TRANCHES_DUREE.map((t) => (
            <Case key={t.cle} name="duree" value={t.cle} coche={filtres.durees.includes(t.cle)}>
              {t.libelle}
            </Case>
          ))}
        </ul>
      </Groupe>
      <Groupe titre="Prise en charge déclarée">
        <ul className="space-y-2">
          {PRISES_EN_CHARGE.map((p) => (
            <Case key={p} name="prise" value={p} coche={filtres.prises.includes(p)}>
              {p}
            </Case>
          ))}
        </ul>
        <p className="mt-2 text-xs text-fg-2">Déclarée par l’organisme, sauf mention « vérifié » avec sa source.</p>
      </Groupe>
      <div className="mt-5 flex items-center gap-4">
        <Link href={chemin(action)} scroll={false} className="text-sm font-medium text-fg underline underline-offset-4">
          Effacer les filtres
        </Link>
        <button type="submit" className="sr-only focus:not-sr-only focus:text-sm focus:font-medium focus:text-fg">
          Appliquer
        </button>
      </div>
    </Form>
  )
}
