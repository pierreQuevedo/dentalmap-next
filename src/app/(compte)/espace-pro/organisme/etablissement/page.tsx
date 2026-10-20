import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { Encart, Etapes, discret, pastille, principal, saisie, titre } from '@/components/compte/ui'
import { ResumeEtablissement } from '@/components/espace/etablissement'
import { chemin } from '@/lib/navigation'
import { choisirEtablissement } from '@/lib/espace-pro/actions-etablissement'
import { chercherEtablissements, getSourceEtablissement } from '@/lib/espace-pro/etablissement-donnees'
import { CoquilleOrganisme, ORGANISME, gardeOrganisme } from '../_commun'

export const metadata: Metadata = { title: 'Retrouvons votre établissement', robots: { index: false, follow: false } }

/**
 * O2a : retrouver l'établissement parmi les écoles de prothèse et les
 * facultés publiées, par son nom, sa ville ou son numéro UAI. Le formulaire
 * part en GET vers cette page ; le choix part à l'action, qui décide entre
 * l'adresse sur le domaine (O3a) et l'attestation (OAT).
 */
type Params = { q?: string; fiche?: string; erreur?: string }

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  // Arrivé depuis la page publique de l'établissement : la recherche est faite, elle pointe sur lui.
  const designe = sp.fiche ? await getSourceEtablissement(sp.fiche) : null
  const q = (designe?.titre ?? sp.q ?? '').trim()
  const ici = `${ORGANISME}/etablissement/${designe ? `?fiche=${encodeURIComponent(designe.slug)}` : q ? `?q=${encodeURIComponent(q)}` : ''}`
  await gardeOrganisme(ici)
  const trouves = q.length >= 2 ? await chercherEtablissements(q) : []
  const resultats = designe ? trouves.filter((r) => r.slug === designe.slug).concat(trouves.some((r) => r.slug === designe.slug) ? [] : [{ slug: designe.slug, titre: designe.titre, ville: designe.ville, uai: designe.uai, type: designe.type, gere: false }]) : trouves
  const premier = designe ?? (resultats[0] ? await getSourceEtablissement(resultats[0].slug) : null)

  return (
    <CoquilleOrganisme
      source={premier}
      encart={q && !resultats.length ? { icone: 'recherche', ton: 'attention', titre: 'Aucun établissement', texte: 'Vous pouvez demander son ajout : nous vérifions le numéro UAI.' } : undefined}
      retour={`${ORGANISME}/`}
      libelleRetour="Retour au site"
    >
      <Etapes etape={2} total={3} libelle="Établissement" />
      <h1 className={titre}>Retrouvons votre établissement</h1>
      <p className="mt-2 text-sm text-fg-2">Par nom, ville ou numéro UAI.</p>

      <form method="get" action={chemin(`${ORGANISME}/etablissement/`)} className="mt-6">
        <label htmlFor="etab-q" className="mb-1.5 block text-sm font-medium text-fg">
          Nom, ville ou UAI
        </label>
        <div className={pastille}>
          <Search className="size-4 shrink-0 text-fg-2" aria-hidden />
          <input id="etab-q" name="q" required minLength={2} autoFocus={!q} defaultValue={q} placeholder="prothèse Bordeaux" autoComplete="off" className={saisie} />
        </div>
        {!resultats.length && (
          <button type="submit" className={`${principal} mt-4`}>
            <Search className="size-4" aria-hidden />
            Rechercher
          </button>
        )}
      </form>

      {sp.erreur && (
        <Encart ton="erreur" className="mt-4">
          {sp.erreur}
        </Encart>
      )}

      {q && !resultats.length && (
        <Encart titre="Aucun établissement ne correspond" className="mt-4">
          Essayez la ville seule, ou le numéro UAI qui figure sur les documents du rectorat.
        </Encart>
      )}

      {resultats.length > 0 && (
        <form action={choisirEtablissement} className="mt-4">
          <input type="hidden" name="q" value={q} />
          <fieldset>
            <legend className="sr-only">Votre établissement</legend>
            <div className="grid gap-2.5">
              {resultats.map((r, i) => (
                <label
                  key={r.slug}
                  className="group squircle-xl flex cursor-pointer items-center border border-line bg-bg px-[18px] py-4 transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:checked]:ring-[0.5px] has-[:checked]:ring-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action"
                >
                  <input type="radio" name="etablissement" value={r.slug} defaultChecked={i === 0} required className="sr-only" />
                  <ResumeEtablissement titre={r.titre} type={r.type} adresse={r.ville} uai={r.uai} ligne={r.gere ? 'Déjà géré par une personne de l’établissement' : undefined}>
                    <span aria-hidden className="size-5 shrink-0 rounded-full border border-line-strong bg-bg transition-[border-width,border-color] group-has-[:checked]:border-[6px] group-has-[:checked]:border-fg" />
                  </ResumeEtablissement>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className={`${principal} mt-4`}>
            C’est mon établissement
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </form>
      )}

      <Link href={chemin(`${ORGANISME}/etablissement/ajout/`)} className={`${discret} mt-1`}>
        Mon établissement n’est pas listé
      </Link>
    </CoquilleOrganisme>
  )
}
