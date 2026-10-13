import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FlaskConical, MapPin } from 'lucide-react'
import { Etapes, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { CoquilleParcours, adresseDe, ficheOu404, garde, nomDe } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Vos établissements', robots: { index: false, follow: false } }
export const instant = false

/**
 * LE1 : un laboratoire à plusieurs lieux d'exercice. On choisit ceux que l'on
 * gère ; le choix suit la demande, et devient les lieux gérés une fois la
 * fiche attribuée.
 */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${LABO}/${slug}/etablissements/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  return (
    <CoquilleParcours fiche={fiche} etiquette={`${fiche.lieux.length} établissements`} lieux={fiche.lieux.slice(1)} retour={`${LABO}/`} libelleRetour="Retour">
      <Etapes etape={1} libelle="Laboratoire" />
      <h1 className={titre}>Ce laboratoire a {fiche.lieux.length} établissements</h1>
      <p className="mt-2 text-sm text-fg-2">Choisissez ceux que vous gérez.</p>
      <form method="get" action={chemin(versLabo(fiche.slug))} className="mt-6">
        <div className="grid gap-2.5">
          {fiche.lieux.map((l) => (
            <label
              key={l.id}
              className="group squircle-xl flex cursor-pointer items-center gap-3.5 border border-line bg-bg px-[18px] py-4 transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:checked]:ring-[0.5px] has-[:checked]:ring-fg"
            >
              <input type="checkbox" name="lieu" value={l.id} defaultChecked className="sr-only" />
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg-soft text-fg-2">
                <FlaskConical className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-fg">{nomDe(fiche)}</span>
                <span className="mt-0.5 flex items-start gap-1 text-xs text-fg-2">
                  <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
                  {adresseDe(l) ?? 'Adresse inconnue'}
                </span>
                {l.principal && <span className="mt-0.5 block text-[11px] text-fg-2">Siège</span>}
              </span>
              <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-md border border-line-strong bg-bg group-has-[:checked]:border-fg group-has-[:checked]:bg-fg" />
            </label>
          ))}
        </div>
        <button type="submit" className={`${principal} mt-4`}>
          Gérer la sélection
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
      <Link href={chemin(`${LABO}/`)} className={`${discret} mt-1`}>
        Retour
      </Link>
    </CoquilleParcours>
  )
}
