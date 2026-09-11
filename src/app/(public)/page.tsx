import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTotalProfession } from '@/lib/annuaire/queries'
import { Balisage, organisation } from '@/lib/seo/jsonld'
import { SITE_DESCRIPTION } from '@/lib/seo/site'
import { chemin } from '@/components/annuaire/primitives'

export const metadata: Metadata = {
  title: 'DentalMap, annuaire dentaire vérifié',
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

async function Chiffres() {
  const [dentistes, prothesistes] = await Promise.all([
    getTotalProfession('dentiste'),
    getTotalProfession('prothesiste'),
  ])
  const cartes = [
    {
      titre: 'Chirurgiens-dentistes',
      total: dentistes.total,
      communes: dentistes.communes,
      href: '/dentistes/',
      source: 'Répertoire partagé des professionnels de santé',
    },
    {
      titre: 'Laboratoires de prothèse',
      total: prothesistes.total,
      communes: prothesistes.communes,
      href: '/prothesistes/',
      source: 'Base Sirene de l’INSEE',
    },
  ]
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2">
      {cartes.map((c) => (
        <Link
          key={c.href}
          href={chemin(c.href)}
          className="rounded-lg border border-slate-200 p-6 transition hover:border-slate-400"
        >
          <h2 className="text-lg font-medium text-slate-900">{c.titre}</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">
            {c.total.toLocaleString('fr-FR')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            dans {c.communes.toLocaleString('fr-FR')} communes
          </p>
          <p className="mt-4 text-xs text-slate-500">Source : {c.source}</p>
        </Link>
      ))}
    </div>
  )
}

function SqueletteChiffres() {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border border-slate-200 p-6">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="mt-3 h-9 w-32 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-40 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

export default function Accueil() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Balisage donnees={organisation()} />
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">DentalMap</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        L&apos;annuaire des chirurgiens-dentistes et des laboratoires de prothèse dentaire en France. Les fiches sont
        construites à partir des registres publics, pas de déclarations.
      </p>

      <Suspense fallback={<SqueletteChiffres />}>
        <Chiffres />
      </Suspense>

      <section className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ce que DentalMap ne fait pas</h2>
        <ul className="mt-3 space-y-2 text-slate-700">
          <li>Aucune mise en avant payante. Le classement est alphabétique ou par distance, rien d&apos;autre.</li>
          <li>Aucun avis, aucune note. Un annuaire de professionnels de santé n&apos;est pas un site d&apos;avis.</li>
          <li>Aucune information déclarative présentée comme officielle.</li>
        </ul>
      </section>
    </main>
  )
}
