import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { FormulaireAvis } from '@/components/formation/avis-client'
import { chemin } from '@/lib/navigation'
import { getGestions, getSourceEtablissement } from '@/lib/espace-pro/etablissement-donnees'
import { POINTS_AVIS, liensPour, recherchePour } from '@/lib/formation/avis'
import { getMonAvis } from '@/lib/formation/avis-donnees'
import { FAMILLES, estFormationType, typeDe } from '@/lib/formation/types'
import { getFormation } from '@/lib/wp/queries'
import { exigerConnexion } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Donner mon avis', robots: { index: false, follow: false } }
export const instant = false

/**
 * Donner, ou modifier, son avis sur une école ou une faculté. Une personne
 * connectée, un avis par établissement ; le lien de partage et le code QR de
 * l'espace établissement mènent ici.
 */
export default async function Page(props: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await props.params
  if (!estFormationType(type)) notFound()
  const [f, source] = await Promise.all([getFormation(slug), getSourceEtablissement(slug)])
  if (!f || !source) notFound()
  if (typeDe(f) !== type) permanentRedirect(chemin(`${source.lien}avis/`))
  const compte = await exigerConnexion(`${source.lien}avis/`)
  const [monAvis, gestions] = await Promise.all([getMonAvis(slug, compte.id), getGestions(compte.id)])
  const gere = gestions.some((g) => g.slug === slug && g.statut !== 'refusee')

  return (
    <main className="container max-w-3xl py-10 md:py-14">
      <FilAriane
        segments={[
          { libelle: 'Formation', href: '/formation/' },
          { libelle: FAMILLES[type].titre, href: `/formation/${type}/` },
          { libelle: f.titre, href: source.lien },
          { libelle: 'Avis' },
        ]}
      />
      <h1 className="mt-8 text-4xl font-semibold tracking-tight text-fg md:text-5xl">
        {monAvis ? 'Modifier mon avis' : 'Votre avis'}
        <span className="block text-fg-2">sur {f.titre}</span>
      </h1>

      {gere ? (
        <div className="squircle-2xl mt-10 border border-line bg-bg-soft p-6">
          <p className="flex items-center gap-2 font-semibold text-fg">
            <ShieldCheck className="size-5 text-teal" aria-hidden /> Vous gérez cette page
          </p>
          <p className="mt-2 text-sm text-fg-2">
            Un établissement ne laisse pas d’avis sur lui-même. Partagez plutôt le lien de cette page avec vos étudiants et vos anciens, et répondez à leurs avis depuis votre espace.
          </p>
          <Link href={chemin('/espace-pro/etablissement/partager/')} className="mt-4 inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Partage et avis
          </Link>
        </div>
      ) : monAvis?.statut === 'retire' ? (
        <p className="squircle-2xl mt-10 border border-line bg-bg-soft p-6 text-sm text-fg-2">
          Votre avis a été retiré par l’équipe DentalMap après un signalement. Pour en savoir plus, écrivez-nous depuis la page contact.
        </p>
      ) : (
        <div className="mt-10">
          <div className="squircle-2xl mb-10 flex items-start gap-4 bg-[#0B1F1D] p-5 text-white sm:p-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#BFE3D6] text-sm font-extrabold text-[#0B1F1D]">+{POINTS_AVIS}</span>
            <div>
              <p className="font-semibold">{monAvis ? 'Vos points de mise en avant sont acquis' : `+${POINTS_AVIS} points de mise en avant pour votre recherche de ${recherchePour(source.type)}`}</p>
              <p className="mt-1 text-sm text-white/70">
                Ils s’ajoutent à votre profil sur DentalMap, même si vous le créez plus tard, et vous font apparaître plus haut auprès des recruteurs. Les mêmes points quelle que soit
                votre note.
              </p>
            </div>
          </div>
          <FormulaireAvis slug={slug} liens={liensPour(source.type)} initial={monAvis} />
        </div>
      )}
    </main>
  )
}
