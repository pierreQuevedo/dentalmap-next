import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, BookmarkX, MapPin } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { illustration } from '@/lib/annuaire/illustration'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { BASE_URL, cheminPraticien, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { BadgeGeree, FilAriane, Verification } from '@/components/annuaire/primitives'
import { basculerFavori } from '@/lib/tunnel/actions'
import { exigerConnexion, getFavoris, type Favori } from '@/lib/tunnel/compte'

export const metadata: Metadata = { title: 'Mes favoris', robots: { index: false, follow: false } }
export const instant = false

/**
 * Les fiches mises de côté par le compte.
 *
 * Une liste, pas une grille de cartes : on y revient pour retrouver quelqu'un,
 * pas pour comparer. Chaque ligne reprend ce qui identifie la fiche dans les
 * résultats, visuel, nom, profession, adresse et vérification, et le bouton
 * qui la retire. Les fiches sont groupées par profession quand il y en a
 * plusieurs, les plus récentes d'abord dans chaque groupe.
 */
export default async function Page() {
  const compte = await exigerConnexion('/favoris/')
  const favoris = await getFavoris(compte.id)
  const groupes = grouper(favoris)

  return (
    <main className="container pb-20 pt-8">
      <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: 'Mes favoris' }]} />

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">Mes favoris</h1>
          <p className="mt-3 max-w-2xl text-fg-2">
            {favoris.length === 0
              ? 'Les fiches que vous mettez de côté se retrouvent ici, sur tous vos appareils.'
              : `${favoris.length} ${favoris.length > 1 ? 'fiches mises de côté' : 'fiche mise de côté'}, les plus récentes en premier.`}
          </p>
        </div>
      </header>

      {favoris.length === 0 ? (
        <div className="squircle-2xl mt-10 flex flex-col items-start gap-4 border border-dashed border-line p-8">
          <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-teal">
            <Bookmark className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-fg">Aucune fiche pour le moment</h2>
            <p className="mt-1 max-w-xl text-sm text-fg-2">
              Sur la fiche d’un professionnel, le bouton « Mettre de côté » l’ajoute ici. Pratique pour comparer plusieurs
              cabinets avant d’appeler.
            </p>
          </div>
          <Link
            href={chemin('/recherche/')}
            className="hover-lift inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover"
          >
            Chercher un professionnel
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {groupes.map(([profession, fiches]) => (
            <section key={profession} aria-labelledby={`favoris-${profession}`}>
              {groupes.length > 1 && (
                <h2 id={`favoris-${profession}`} className="mb-4 text-xl font-semibold tracking-tight text-fg">
                  {majuscule(fiches.length > 1 ? LIBELLE[profession].pluriel : LIBELLE[profession].singulier)}
                  <span className="ml-2 text-base font-normal text-fg-2">{fiches.length}</span>
                </h2>
              )}
              <ol className="grid gap-3">
                {fiches.map((f) => (
                  <Ligne key={f.slug} favori={f} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Par profession, dans l'ordre d'apparition : la première fiche mise de côté donne le premier groupe. */
function grouper(favoris: Favori[]): [Profession, Favori[]][] {
  const groupes = new Map<Profession, Favori[]>()
  for (const f of favoris) groupes.set(f.profession, [...(groupes.get(f.profession) ?? []), f])
  return [...groupes.entries()]
}

function Ligne({ favori: f }: { favori: Favori }) {
  const nom = nomAffiche(f)
  const lien = f.communeSlug && f.departementSlug ? cheminPraticien(BASE_URL[f.profession], f.departementSlug, f.communeSlug, f.slug) : null
  const date = new Date(f.ajouteLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <li className="squircle-2xl hover-lift group relative flex items-center gap-4 border border-line bg-bg p-3 [--lift:3px] hover:shadow-pop sm:gap-5 sm:p-4">
      <Image
        src={illustration(f.profession, f.civilite)}
        alt=""
        width={96}
        height={120}
        className="squircle-xl h-[7.5rem] w-24 shrink-0 border border-line object-cover object-[center_26%] dark:brightness-[0.42]"
      />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-2">
          <span className="inline-flex rounded-full bg-teal/10 px-2 py-0.5 font-medium text-teal ring-1 ring-inset ring-teal/30">
            {majuscule(LIBELLE[f.profession].singulier)}
          </span>
          {f.specialite && <span>{f.specialite}</span>}
        </p>
        <h3 className="mt-1.5 truncate text-lg font-semibold leading-tight text-fg">
          {lien ? (
            <Link href={chemin(lien)} className="after:absolute after:inset-0 focus-visible:outline-none">
              {nom}
            </Link>
          ) : (
            nom
          )}
        </h3>
        {(f.adresseLigne || f.communeNom) && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-fg-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden />
            <span className="truncate">
              {f.adresseLigne && <>{formaterAdresse(f.adresseLigne)}, </>}
              {f.codePostal} {f.communeNom}
            </span>
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Verification statut={f.statutVerification} />
          {f.revendiquee && <BadgeGeree profession={f.profession} className="ring-1 ring-inset ring-line" />}
          <span className="text-xs text-fg-2">Mise de côté le {date}</span>
        </div>
      </div>
      {/* Au-dessus du lien qui couvre la ligne : le bouton reste cliquable. */}
      <form action={basculerFavori} className="relative z-10 shrink-0 self-start sm:self-center">
        <input type="hidden" name="slug" value={f.slug} />
        <input type="hidden" name="retour" value="/favoris/" />
        <button
          type="submit"
          aria-label={`Retirer ${nom} des favoris`}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-bg px-3 text-sm font-medium text-fg hover:border-fg sm:px-4"
        >
          <BookmarkX className="size-4" aria-hidden />
          <span className="hidden sm:inline">Retirer</span>
        </button>
      </form>
    </li>
  )
}
