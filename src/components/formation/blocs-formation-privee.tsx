/** Briques des pages Formations privées : étiquettes, mentions, monogramme, carte et ligne de liste. */
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock, Laptop, MapPin, ShieldCheck, Users } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { enLigne, lieuSession, mentions, monogramme, pave, type FormationPriveeVue, type MentionPrise } from '@/lib/formation/privee-liste'

/** Adresse publique d'une formation privée ; `base` change pour la démonstration. */
export const BASE_PRIVEES = '/formation/formations-privees/'
export const lienPrivee = (slug: string, base = BASE_PRIVEES) => chemin(`${base}${slug}/`)

export const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Formation', href: '/formation/' },
  { libelle: 'Formations privées', href: BASE_PRIVEES },
]

export function Etiquette({ children, ton = 'neutre' }: { children: React.ReactNode; ton?: 'neutre' | 'teal' | 'sombre' }) {
  const c = { neutre: 'bg-bg text-fg ring-line', teal: 'bg-teal/10 text-teal ring-teal/30', sombre: 'bg-white/10 text-white ring-white/15' }[ton]
  return <span className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`}>{children}</span>
}

/** Prise en charge ou certification : vérifiée avec sa source, sinon déclarée par l'organisme. */
export function Prise({ p, sombre }: { p: MentionPrise; sombre?: boolean }) {
  return (
    <span
      title={p.source ? `Vérifié, source : ${p.source}` : 'Déclaré par l’organisme'}
      className={`squircle-full inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        p.source ? 'bg-teal/10 text-teal ring-teal/30' : sombre ? 'bg-white/10 text-white/80 ring-white/15' : 'bg-bg-soft text-fg-2 ring-line'
      }`}
    >
      {p.source && <ShieldCheck className="size-3" aria-hidden />}
      {p.nom}
      <span className="font-normal opacity-75">{p.source ? 'vérifié' : 'déclaré'}</span>
    </span>
  )
}

/** L'organisme en initiales : les formations privées n'ont pas de logo. */
export function Monogramme({ organisme, className = 'size-10 text-sm' }: { organisme: string; className?: string }) {
  return (
    <span aria-hidden className={`squircle-lg grid shrink-0 place-items-center bg-white font-bold tracking-tight text-[#0e1317] ring-1 ring-black/5 ${className}`}>
      {monogramme(organisme)}
    </span>
  )
}

/** Visuel d'une formation : la photo de l'article, sinon le fond neutre du site. */
export function Visuel({ f, className = '' }: { f: FormationPriveeVue; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-bg ${className}`}>
      <Image src={f.image?.url ?? '/images/fiche-sans-photo.png'} alt="" fill sizes="(min-width: 1024px) 22rem, 90vw" className="object-cover dark:brightness-[0.42]" />
    </div>
  )
}

/** Carte dans la forme de `CarteFormation` (photo en tête, lignes, pied), pour les autres formations d'une fiche. */
export function CarteFormationPrivee({ f, base }: { f: FormationPriveeVue; base?: string }) {
  const s = f.session
  return (
    <li className="squircle-2xl hover-lift group relative flex flex-col overflow-hidden border border-line bg-bg-soft [--lift:5px] hover:shadow-pop">
      <div className="relative">
        <Visuel f={f} className="aspect-[16/9]" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">Formation continue</span>
        <span className="absolute bottom-3 right-3">
          <Monogramme organisme={f.d.organisme} className="size-10 text-sm shadow-pop" />
        </span>
      </div>
      <div className="p-4 pb-3">
        <h3 className="text-base font-semibold leading-tight text-fg">
          <Link href={lienPrivee(f.slug, base)} className="after:absolute after:inset-0">
            {f.titre}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm text-fg-2">{f.d.organisme}</p>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {(
          [
            ...(s ? [[CalendarDays, `Prochaine session : ${s.dates}`] as const] : []),
            [Users, f.d.publics.join(', ')] as const,
          ] as const
        ).map(([Icone, t]) => (
          <li key={t} className="flex items-center gap-2 px-4 py-2 text-sm text-fg">
            <Icone className="size-4 shrink-0 text-teal" aria-hidden />
            <span className="truncate">{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto inline-flex items-center gap-1.5 border-t border-line px-4 py-3 text-sm text-fg-2">
        <MapPin className="size-3.5 shrink-0" aria-hidden /> {s ? `${lieuSession(s)} · ` : ''}
        {f.d.duree}
      </p>
    </li>
  )
}

/** Une formation dans la liste, forme « ligne » des pages emploi : date en pavé, puis titre, organisme, lieu. */
export function LigneSession({ f, actif, base }: { f: FormationPriveeVue; actif?: boolean; base?: string }) {
  const s = f.session!
  const { jour, mois } = pave(s)
  return (
    <li className={`squircle-2xl hover-lift group relative flex gap-4 border bg-bg p-3 [--lift:3px] hover:shadow-pop sm:p-4 ${actif ? 'border-line-strong shadow-pop' : 'border-line'}`}>
      <div className="squircle-xl grid w-16 shrink-0 place-content-center self-start bg-bg-soft py-3 text-center sm:w-20">
        <span className="text-2xl font-semibold tabular-nums leading-none text-fg sm:text-3xl">{jour}</span>
        <span className="mt-1 text-xs uppercase tracking-wide text-fg-2">{mois}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Etiquette ton="teal">{f.d.theme}</Etiquette>
          <Etiquette>{f.d.format}</Etiquette>
        </div>
        <h3 className="mt-2 text-base font-semibold leading-snug text-fg">
          <Link href={lienPrivee(f.slug, base)} className="after:absolute after:inset-0">
            {f.titre}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-2 text-sm text-fg-2">
          <Monogramme organisme={f.d.organisme} className="size-5 text-[9px]" /> {f.d.organisme}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 text-sm text-fg-2">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              {enLigne(s) ? <Laptop className="size-3.5 text-geo" aria-hidden /> : <MapPin className="size-3.5 text-geo" aria-hidden />} {lieuSession(s)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> {f.d.duree}
            </span>
          </p>
          <p className="ml-auto flex flex-wrap justify-end gap-1">
            {mentions(f.d, f.verifications).map((p) => (
              <Prise key={p.nom} p={p} />
            ))}
          </p>
        </div>
      </div>
    </li>
  )
}
