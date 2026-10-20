import type { Metadata } from 'next'
import Link from 'next/link'
import { sql } from 'drizzle-orm'
import { BadgeCheck, Briefcase, Check, MapPin, MessageSquare, Search, Users } from 'lucide-react'
import { db } from '@/db'
import { FilAriane } from '@/components/annuaire/primitives'
import { ChampCommune } from '@/components/emploi/champ-commune'
import { FormulaireEchangeProfil } from '@/components/emploi/formulaire-echange-profil'
import { nomVuParRecruteur } from '@/components/emploi/apercu-candidat'
import { chemin } from '@/lib/navigation'
import { getCommuneParCode } from '@/lib/annuaire/queries'
import { initiales } from '@/lib/emploi/candidature'
import { EMPLOI } from '@/lib/emploi/chemins'
import { CODES_CONTRAT, LIBELLE_CONTRAT } from '@/lib/emploi/metiers'
import { CODES_SITUATION, SITUATIONS, pucesCriteres, type Situation } from '@/lib/emploi/profil-candidat'
import { getProfilsDisponibles } from '@/lib/emploi/profils-disponibles'
import { getEspace } from '@/lib/espace-pro/espace'
import { getCompte } from '@/lib/tunnel/compte'

export const metadata: Metadata = {
  title: 'Profils disponibles : assistant(e)s, secrétaires, prothésistes',
  description: 'Les personnes qui cherchent un poste en cabinet dentaire ou en laboratoire et ont choisi d’être visibles des recruteurs vérifiés.',
  // Des personnes, même sans nom : jamais dans les moteurs de recherche.
  robots: { index: false, follow: true },
}
export const instant = false

const RAYONS = [10, 20, 30, 50, 100] as const
const ICI = '/emploi/profils/'

/** Le recruteur vérifié qui regarde, s'il y en a un : sa fiche, son lieu principal, ses offres en ligne. */
async function recruteurQuiRegarde() {
  const compte = await getCompte()
  if (!compte || (compte.role !== 'dentiste' && compte.role !== 'prothesiste')) return { compte, recruteur: null }
  const espace = await getEspace(compte, null)
  if (!espace || !espace.ctx.identiteVerifiee || espace.fiche.demande?.statut !== 'acceptee') return { compte, recruteur: null }
  const { rows } = await db.execute<{ id: string; titre: string }>(sql`
    SELECT id, titre FROM offres WHERE praticien_id = ${espace.fiche.id} AND statut = 'en_ligne' AND (expire_le IS NULL OR expire_le > now()) ORDER BY publiee_le DESC
  `)
  const lieu = espace.fiche.lieux.find((l) => l.principal && l.lon != null) ?? espace.fiche.lieux.find((l) => l.lon != null)
  return { compte, recruteur: { slug: espace.fiche.slug, offres: rows, centre: lieu?.lon != null && lieu.lat != null ? { lon: lieu.lon, lat: lieu.lat, ville: lieu.communeNom } : null } }
}

/**
 * Les profils disponibles, dans l'Emploi du site : les candidats visibles ou
 * anonymisés, par distance au lieu de la recherche (le cabinet du recruteur
 * connecté par défaut). Le nom n'apparaît, réduit au prénom et à l'initiale,
 * qu'à un recruteur vérifié et pour un profil « visible » ; sinon, les
 * initiales. « Proposer un échange » : recruteur vérifié, une offre en ligne.
 */
export default async function Page(props: { searchParams: Promise<{ profil?: string; contrat?: string; commune?: string; rayon?: string; echange?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const { compte, recruteur } = await recruteurQuiRegarde()
  const situation = (CODES_SITUATION as string[]).includes(sp.profil ?? '') ? (sp.profil as Situation) : null
  const contrat = (CODES_CONTRAT as readonly string[]).includes(sp.contrat ?? '') ? sp.contrat! : null
  const rayonKm = RAYONS.find((r) => String(r) === sp.rayon) ?? 30
  const commune = sp.commune && /^[0-9AB]{5}$/.test(sp.commune) ? await getCommuneParCode(sp.commune) : null
  const centre = commune?.lon != null && commune.lat != null ? { lon: commune.lon, lat: commune.lat, ville: commune.nom } : (recruteur?.centre ?? null)
  const profils = await getProfilsDisponibles({ situation, contrat, centre, rayonKm, vuPar: recruteur?.slug ?? null })
  const ouvert = sp.echange ? profils.find((p) => p.id === sp.echange) : undefined
  const params = new URLSearchParams(Object.entries({ profil: sp.profil, contrat: sp.contrat, commune: sp.commune, rayon: sp.rayon }).filter((e): e is [string, string] => Boolean(e[1])))
  const base = `${ICI}${params.toString() ? `?${params}` : ''}`
  const avec = (x: string) => `${base}${params.toString() ? '&' : '?'}${x}`

  return (
    <main>
      <section className="border-b border-line bg-bg-soft">
        <div className="container py-8 md:py-12">
          <FilAriane segments={[{ libelle: 'Emploi', href: EMPLOI }, { libelle: 'Profils disponibles' }]} />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Profils disponibles</h1>
          <p className="mt-2 max-w-3xl text-fg-2">
            Des assistant(e)s, secrétaires, prothésistes et étudiant(e)s qui cherchent un poste et ont choisi d’être visibles des recruteurs vérifiés. Ni adresse ni coordonnées : elles ne sont partagées que si la personne accepte un échange.
          </p>
          <form method="get" className="squircle-2xl mt-6 grid gap-3 border border-line bg-bg p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)_7rem_auto] md:items-end">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Profil</span>
              <select name="profil" defaultValue={situation ?? ''} className="squircle-xl h-11 w-full border border-line bg-bg px-3 text-sm text-fg">
                <option value="">Tous les profils</option>
                {SITUATIONS.map((s) => (
                  <option key={s.cle} value={s.cle}>
                    {s.libelle}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Contrat recherché</span>
              <select name="contrat" defaultValue={contrat ?? ''} className="squircle-xl h-11 w-full border border-line bg-bg px-3 text-sm text-fg">
                <option value="">Tous les contrats</option>
                {CODES_CONTRAT.map((c) => (
                  <option key={c} value={c}>
                    {LIBELLE_CONTRAT[c]}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-fg">Autour de</span>
              <ChampCommune code={commune?.codeInsee ?? null} libelle={commune?.nom ?? ''} cabinet={recruteur?.centre ? `Mon cabinet${recruteur.centre.ville ? `, ${recruteur.centre.ville}` : ''}` : undefined} />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Rayon</span>
              <select name="rayon" defaultValue={String(rayonKm)} className="squircle-xl h-11 w-full border border-line bg-bg px-3 text-sm text-fg">
                {RAYONS.map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-bg">
              <Search className="size-4" aria-hidden /> Rechercher
            </button>
          </form>
        </div>
      </section>

      <div className="container py-8 lg:py-10">
        {sp.fait === 'echange' && (
          <p role="status" className="squircle-xl mb-6 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
            <Check className="size-4 shrink-0" aria-hidden /> Proposition envoyée. Vous la suivez dans les candidatures de votre espace pro.
          </p>
        )}
        {!recruteur && (
          <div className="squircle-2xl mb-6 flex flex-wrap items-center justify-between gap-4 border border-line bg-bg-soft p-5">
            <p className="text-sm text-fg">
              <span className="block font-semibold">Vous recrutez ?</span>
              <span className="text-fg-2">Avec une fiche vérifiée et une offre en ligne, vous proposez un échange aux profils qui vous intéressent.</span>
            </p>
            <Link
              href={chemin(compte ? '/espace-pro/emploi/' : `/connexion/?retour=${encodeURIComponent(ICI)}`)}
              className="inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover"
            >
              {compte ? 'Mon espace pro' : 'Se connecter'}
            </Link>
          </div>
        )}
        <p className="border-b border-line pb-4 text-sm font-semibold text-fg">
          {profils.length} profil{profils.length > 1 ? 's' : ''}
          {centre ? <span className="font-normal text-fg-2"> à {rayonKm} km autour de {centre.ville ?? 'votre cabinet'}, les plus proches d’abord</span> : <span className="font-normal text-fg-2"> en France, les plus récents d’abord</span>}
        </p>
        {profils.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-fg-2">
              <Users className="size-5" aria-hidden />
            </span>
            <p className="mt-3 font-semibold text-fg">Aucun profil disponible ici pour le moment</p>
            <p className="mt-1 max-w-sm text-sm text-fg-2">Élargissez le rayon, ou publiez une offre : les candidats de votre zone en sont prévenus par leurs alertes.</p>
          </div>
        ) : (
          <ul className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profils.map((p) => {
              const nom = recruteur ? nomVuParRecruteur(p.nom, p.visibilite) : initiales(p.nom).split('').join('. ') + '.'
              return (
                <li key={p.id} className="squircle-2xl flex flex-col border border-line bg-bg p-5">
                  <div className="flex items-start gap-3">
                    <span className="squircle-lg grid size-11 shrink-0 place-items-center bg-bg-soft text-xs font-bold text-fg ring-1 ring-line">{initiales(p.nom)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">{nom}</p>
                      <p className="flex flex-wrap items-center gap-x-2 text-sm text-fg">
                        {p.qualification}
                        {p.titreVerifie && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal">
                            <BadgeCheck className="size-3.5" aria-hidden /> Titre vérifié
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-fg-2">
                        <MapPin className="size-3.5 shrink-0" aria-hidden /> {p.ville ?? 'Ville non précisée'}
                        {p.km != null ? ` · à ${p.km.toLocaleString('fr-FR')} km` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[...pucesCriteres(p.criteres), `Mobilité ${p.criteres.rayonKm} km`].map((t) => (
                      <span key={t} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">
                        {t}
                      </span>
                    ))}
                  </div>
                  {p.competences.length > 0 && <p className="mt-3 text-xs text-fg-2">{p.competences.slice(0, 4).join(' · ')}</p>}
                  <span className="block min-h-4 flex-1" aria-hidden />
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-fg-2">
                      <Briefcase className="size-3.5" aria-hidden /> {p.experiences ? `${p.experiences} expérience${p.experiences > 1 ? 's' : ''}` : 'Expériences non renseignées'}
                    </span>
                    {recruteur ? (
                      recruteur.offres.length ? (
                        <Link href={chemin(avec(`echange=${p.id}`))} scroll={false} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-xs font-semibold text-fg hover:border-line-strong">
                          <MessageSquare className="size-3.5" aria-hidden /> Proposer un échange
                        </Link>
                      ) : (
                        <Link href={chemin('/espace-pro/emploi/')} className="text-xs font-medium text-fg-2 underline underline-offset-2 hover:text-fg">
                          Publiez une offre pour proposer un échange
                        </Link>
                      )
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {recruteur && ouvert && recruteur.offres.length > 0 && (
        <FormulaireEchangeProfil fiche={recruteur.slug} profil={ouvert.id} nom={nomVuParRecruteur(ouvert.nom, ouvert.visibilite)} detail={ouvert.qualification} offres={recruteur.offres} fermer={base} />
      )}
    </main>
  )
}
