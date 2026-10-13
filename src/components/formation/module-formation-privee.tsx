import { ArrowUpRight, BadgeCheck, CalendarDays, Clock, ListChecks, MapPin, Users } from 'lucide-react'
import { libellePriseEnCharge, nomRegion, sessionsAVenir } from '@/lib/formation/privee'
import type { FormationPubliee } from '@/lib/formation/privee-donnees'

/**
 * Le détail d'une formation privée, déclaré par l'organisme et vérifié par
 * l'équipe avant publication (lu dans Neon, `demandes_formation`). Les
 * mentions de prise en charge disent « déclarée » ou « vérifiée » avec leur
 * source ; le tarif est « indiqué par l'organisme ».
 */
export function ModuleFormationPrivee({ formation }: { formation: FormationPubliee }) {
  const { d, verifications } = formation
  const avenir = sessionsAVenir(d.sessions)
  return (
    <section id="formation" aria-labelledby="formation-titre" className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="formation-titre" className="text-2xl font-semibold tracking-tight text-fg">
          La formation
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-bg-soft px-2 py-0.5 text-xs font-medium text-fg-2">Renseigné par l’organisme, vérifié par l’équipe</span>
      </div>
      {d.resume && <p className="mt-4 max-w-2xl text-fg-2">{d.resume}</p>}

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            [Users, 'Public', d.publics.join(', ')],
            [MapPin, 'Format', d.format],
            [Clock, 'Durée', d.duree],
            [ListChecks, 'Tarif', d.tarif ? `${d.tarif}, indiqué par l’organisme` : 'Non communiqué'],
          ] as const
        ).map(([I, l, v]) => (
          <div key={l} className="squircle-xl border border-line p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-fg-2">
              <I className="size-3.5" aria-hidden /> {l}
            </dt>
            <dd className="mt-1 text-sm font-medium text-fg">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-8 text-lg font-semibold text-fg">Sessions</h3>
      {avenir.length ? (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {avenir.map((s, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <span className="flex items-center gap-2 text-fg">
                <CalendarDays className="size-4 text-teal" aria-hidden /> {s.dates}
              </span>
              <span className="text-fg-2">
                {s.ville ?? nomRegion(s.region)}
                {s.places ? ` · ${s.places} places` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-fg-2">Aucune session à venir n’est annoncée. Consultez le site de l’organisme.</p>
      )}

      {d.programme.length > 0 && (
        <>
          <h3 className="mt-8 text-lg font-semibold text-fg">Programme</h3>
          <ol className="mt-3 space-y-3">
            {d.programme.map((e, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-teal/10 text-xs font-semibold text-teal">{i + 1}</span>
                <div>
                  <p className="font-medium text-fg">
                    {e.titre}
                    {e.duree && <span className="ml-2 text-sm font-normal text-fg-2">{e.duree}</span>}
                  </p>
                  {e.detail && <p className="text-sm text-fg-2">{e.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {d.prerequis.length > 0 && (
        <>
          <h3 className="mt-8 text-lg font-semibold text-fg">Prérequis</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg">
            {d.prerequis.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {d.priseEnCharge.length > 0 && (
        <>
          <h3 className="mt-8 text-lg font-semibold text-fg">Prise en charge</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {d.priseEnCharge.map((m) => (
              <li key={m} className={`squircle-xl border px-3 py-2 text-sm ${verifications[m] ? 'border-teal/30 bg-teal/10' : 'border-line'}`}>
                <span className="flex items-center gap-1.5 font-medium text-fg">
                  {verifications[m] && <BadgeCheck className="size-4 text-teal" aria-hidden />} {m}
                </span>
                <span className="block text-xs text-fg-2">{libellePriseEnCharge(m, verifications)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <a
        href={d.lienInscription}
        target="_blank"
        rel="noopener nofollow"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover"
      >
        S’inscrire sur le site de l’organisme <ArrowUpRight className="size-4" aria-hidden />
      </a>
      <p className="mt-2 text-xs text-fg-2">L’inscription et le paiement se font chez l’organisme, {d.organisme}.</p>
    </section>
  )
}
