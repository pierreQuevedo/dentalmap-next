'use client'

/** Revendication par profil : onglets, l'image et les méthodes changent avec le profil. */
import { useState } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { PROFILS } from './contenu'

export function OngletsProfils() {
  const [actif, setActif] = useState(PROFILS[0]!.cle)
  const p = PROFILS.find((x) => x.cle === actif) ?? PROFILS[0]!
  return (
    <div>
      <div role="tablist" aria-label="Votre profil" className="mx-auto grid w-full max-w-xl grid-cols-2 gap-1 rounded-3xl border border-line bg-bg-soft p-1 sm:flex sm:rounded-full">
        {PROFILS.map((x) => (
          <button
            key={x.cle}
            role="tab"
            type="button"
            aria-selected={x.cle === actif}
            onClick={() => setActif(x.cle)}
            className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors md:px-4 ${
              x.cle === actif ? 'bg-brand text-brand-foreground shadow-sm' : 'text-fg-2 hover:text-fg'
            }`}
          >
            {x.onglet}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8 grid items-center gap-6 md:mt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="squircle-3xl relative aspect-[4/3] overflow-hidden border border-line lg:aspect-[16/11]">
          <Image key={p.image} src={p.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 text-2xl font-semibold tracking-tight text-white md:bottom-8 md:left-8 md:text-4xl">{p.titre}</p>
        </div>
        <div>
          <p className="text-lg leading-relaxed text-fg-2">{p.texte}</p>
          <ul className="mt-6 space-y-2">
            {p.methodes.map((m) => (
              <li key={m.nom} className="squircle-xl flex items-center justify-between gap-4 border border-line bg-bg p-4">
                <span className="flex items-center gap-3 font-medium text-fg">
                  <span className="grid size-7 place-items-center rounded-full bg-teal/10 text-teal">
                    <Check className="size-4" aria-hidden />
                  </span>
                  {m.nom}
                </span>
                {m.delai && <span className="text-sm text-teal">{m.delai}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
