import Image from 'next/image'
import Link from 'next/link'
import { Award, MapPin } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { FAMILLES, lienFormation, typeDe } from '@/lib/formation/types'
import type { FormationResume } from '@/lib/wp/queries'

/**
 * Carte d'une formation : la forme « photo en tête » du banc d'essai, avec
 * la liste des diplômes de la forme « riche ». Image quand le CMS en a une,
 * la famille en pastille, le titre, puis chaque diplôme sur sa ligne avec sa
 * durée à droite, et la ville en pied. Une école liste ses diplômes dans son
 * contenu balisé ; à défaut, le diplôme et la durée des champs ACF.
 */
export function CarteFormation({ formation: f }: { formation: FormationResume }) {
  const famille = FAMILLES[typeDe(f)]
  // Sans diplôme renseigné, pas de ligne qui répéterait le titre : la durée
  // rejoint alors la ville, en pied.
  // Sur une carte, la durée tient en deux mots : la précision entre parenthèses reste pour la fiche.
  const diplomes = f.diplomes.length > 0 ? f.diplomes.map((d) => ({ nom: d.intitule, duree: d.duree?.split(/\s*\(/)[0] ?? null })) : f.diplome ? [{ nom: f.diplome, duree: f.duree }] : []
  const pied = [f.ville, diplomes.length === 0 ? f.duree : null].filter(Boolean).join(' · ')
  return (
    <li className="squircle-2xl hover-lift group relative flex flex-col overflow-hidden border border-line bg-bg-soft [--lift:5px] hover:shadow-pop has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action">
      <div className="relative aspect-[16/9] overflow-hidden bg-bg">
        {f.image ? (
          <Image
            src={f.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 22rem, 90vw"
            className="object-cover transition-transform duration-slow ease-lift group-hover:scale-[1.04] motion-reduce:transition-none dark:brightness-[0.42]"
          />
        ) : (
          <Image src="/images/fiche-sans-photo.png" alt="" fill sizes="22rem" className="object-cover dark:brightness-[0.42]" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">
          {famille.pastille}
        </span>
        {f.logo && (
          <span className="squircle-lg absolute bottom-3 right-3 flex h-10 max-w-[9rem] items-center bg-white px-2.5 py-1.5 shadow-pop">
            <Image src={f.logo.url} alt="" width={120} height={28} className="max-h-7 w-auto max-w-full object-contain" />
          </span>
        )}
      </div>

      <div className="p-4 pb-3">
        <h2 className="text-base font-semibold leading-tight text-fg">
          <Link href={chemin(lienFormation(f))} className="after:absolute after:inset-0 focus-visible:outline-none">
            {f.titre}
          </Link>
        </h2>
        {f.extrait && <p className="mt-1.5 line-clamp-2 text-sm text-fg-2">{f.extrait}</p>}
      </div>

      {diplomes.length > 0 && (
        <ul className="divide-y divide-line border-t border-line">
          {diplomes.map((d) => (
            <li key={d.nom} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className="inline-flex min-w-0 items-center gap-2 text-fg">
                <Award className="size-4 shrink-0 text-teal" aria-hidden />
                <span className="truncate">{d.nom}</span>
              </span>
              {d.duree && <span className="shrink-0 text-fg-2">{d.duree}</span>}
            </li>
          ))}
        </ul>
      )}

      {pied && (
        <p className="mt-auto inline-flex items-center gap-1.5 border-t border-line px-4 py-3 text-sm text-fg-2">
          <MapPin className="size-3.5 shrink-0" aria-hidden /> {pied}
        </p>
      )}
    </li>
  )
}
