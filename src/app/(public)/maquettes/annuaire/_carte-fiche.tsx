/**
 * MAQUETTE. Copie de la carte de résultat dentiste
 * (`src/components/recherche/carte-fiche.tsx`, `CarteDentiste`), sans les
 * rappels de survol vers la carte, avec la pastille « Recrute ».
 *
 * La pastille rejoint « Gérée par le praticien » en haut à gauche, même
 * gabarit : seul un professionnel qui gère sa fiche peut publier une offre.
 * Elle reste dans le lien de la carte, sans lien propre : un second lien
 * dans la carte doublerait l'ordre de tabulation.
 *
 * Neutralité : la pastille est purement informative. Elle ne change ni le
 * rang de la carte dans la liste (distance puis ordre alphabétique) ni sa
 * taille, ni sa mise en avant.
 */
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { Adresse, BadgeGeree, Verification } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { illustration } from '@/lib/annuaire/illustration'
import { nomAffiche } from '@/lib/annuaire/types'
import type { PraticienMaquette } from './_donnees'

function distance(metres: number): string {
  if (metres < 1000) return `${metres} m`
  return `${(metres / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`
}

/** Pastille « Recrute », même famille que `BadgeGeree`. */
export function BadgeRecrute({ className = '' }: { className?: string }) {
  return (
    <span
      title="Ce cabinet a au moins une offre d’emploi en ligne"
      className={`inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur ${className}`}
    >
      <Briefcase className="size-3.5 text-teal" aria-hidden strokeWidth={2} /> Recrute
    </span>
  )
}

export function CarteFicheMaquette({ praticien: p, reference = 'du centre de la carte' }: { praticien: PraticienMaquette; reference?: string }) {
  const nom = nomAffiche({ profession: 'dentiste', nom: p.nom, prenom: p.prenom, raisonSociale: p.raisonSociale })
  const fond = illustration('dentiste', p.civilite)
  return (
    <li
      data-actif="false"
      className="squircle-2xl hover-lift group relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden border border-line bg-bg-soft [--lift:5px] hover:shadow-pop has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action xl:min-h-[25rem] min-[1600px]:min-h-[28rem]"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden transition-[height] duration-slow ease-lift group-hover:h-[62%] motion-reduce:transition-none">
        <Image src={fond} alt="" fill sizes="(min-width: 1280px) 24rem, 90vw" className="object-cover object-[center_26%] dark:brightness-[0.42]" />
        <Image
          src={fond}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1280px) 24rem, 90vw"
          className="hidden scale-110 object-cover object-[center_26%] blur-lg brightness-[0.42] [mask-image:linear-gradient(to_top,black_42%,transparent_80%)] dark:block"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-bg-soft from-30% via-bg-soft/88 via-56% to-transparent transition-[height] duration-slow ease-lift group-hover:h-[30%] motion-reduce:transition-none dark:from-25% dark:via-bg-soft/45 dark:via-62%" />
      </div>

      {(p.revendiquee || p.recrute) && (
        <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap gap-1.5">
          {p.revendiquee && <BadgeGeree profession="dentiste" />}
          {p.recrute && <BadgeRecrute />}
        </div>
      )}

      <div className="p-4">
        <h2 className="text-base font-semibold leading-tight text-fg">
          <Link href={chemin(`/dentistes/${p.departementSlug}/${p.communeSlug}/${p.slug}/`)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {nom}
          </Link>
        </h2>
        <div className="mt-2">
          <Verification statut={p.statutVerification} />
        </div>
        <div className="mt-2 text-sm">
          <Adresse ligne={p.adresseLigne} codePostal={p.codePostal} commune={p.communeNom} precision={p.precisionPosition} />
        </div>
        <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-slow ease-lift group-hover:grid-rows-[1fr] group-hover:opacity-100 motion-reduce:transition-none">
          <p className="min-h-0 overflow-hidden text-sm text-fg-2">
            <span className="block pt-2">
              À {distance(p.metres)} {reference}
            </span>
          </p>
        </div>
      </div>
    </li>
  )
}
