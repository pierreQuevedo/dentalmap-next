import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { Check, EyeOff, Search, X } from 'lucide-react'
import { db } from '@/db'
import { CoqueEspace } from '@/components/espace/coque'
import { EncartChoix, ICONES_VISIBILITE } from '@/components/emploi/encart-choix'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { chemin } from '@/lib/navigation'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { enregistrerVisibilite, masquerStructure } from '@/lib/emploi/actions-candidat'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { VISIBILITES } from '@/lib/emploi/profil-candidat'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Visibilité', robots: { index: false, follow: false } }
export const instant = false

const MESSAGES: Record<string, string> = {
  visibilite: 'Visibilité enregistrée.',
  masquee: 'Structure masquée : elle ne verra plus votre profil.',
  retiree: 'Structure retirée de la liste.',
}

/** Les fiches vérifiées dont le nom correspond, pour OUV-C-MASQUER. */
async function chercherStructures(q: string) {
  const mots = q.trim().toLowerCase()
  if (mots.length < 2) return []
  const { rows } = await db.execute<{ slug: string; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null; commune: string | null }>(sql`
    SELECT p.slug, p.profession, p.nom, p.prenom, p.raison_sociale,
           (SELECT c.nom FROM lieux_exercice l JOIN communes c ON c.code_insee = l.code_insee WHERE l.praticien_id = p.id ORDER BY l.principal DESC LIMIT 1) AS commune
    FROM praticiens p
    WHERE p.deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee' AND v.objet = 'revendication')
      AND (lower(coalesce(p.raison_sociale, '')) LIKE ${`%${mots}%`} OR lower(concat_ws(' ', p.prenom, p.nom)) LIKE ${`%${mots}%`})
    ORDER BY p.nom
    LIMIT 8
  `)
  return rows.map((r) => ({ slug: r.slug, nom: nomAffiche({ profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale }), commune: r.commune }))
}

/**
 * CAND-VISI : qui peut trouver le profil (visible, anonymisé, discret), et
 * les structures masquées (OUV-C-MASQUER), cherchées parmi les fiches
 * vérifiées. Sans JavaScript : des formulaires simples.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; fait?: string; q?: string }> }) {
  const sp = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi('visibilite', sp.fiche)
  const profil = await getProfilCandidat(compte.id)
  if (!profil) redirect(chemin('/espace-pro/emploi/bienvenue/situation/'))
  const resultats = sp.q ? await chercherStructures(sp.q) : []
  const masquees = new Set(profil.structuresMasquees.map((s) => s.slug))

  return (
    <CoqueEspace c={coque} actif="emploi" titre="Emploi" sousTitre="Visibilité de votre profil : qui peut vous trouver et vous inviter à postuler" sansLienFlottant>
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      <SousOngletsCandidat actif="visibilite" q={q} />
      {sp.fait && MESSAGES[sp.fait] && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {MESSAGES[sp.fait]}
        </p>
      )}
      {/* Les choix en encarts sur toute la largeur, les structures masquées dessous. */}
      <div className="grid gap-4">
        <form action={enregistrerVisibilite} className="squircle-2xl border border-line bg-bg p-5 sm:p-6">
          <h2 className="text-base font-semibold text-fg">Votre profil</h2>
          <fieldset className="mt-4 grid gap-3 sm:grid-cols-3">
            <legend className="sr-only">Visibilité du profil</legend>
            {VISIBILITES.map((v) => (
              <EncartChoix key={v.cle} nom="visibilite" valeur={v.cle} coche={profil.visibilite === v.cle} icone={ICONES_VISIBILITE[v.cle]} libelle={v.libelle} detail={v.detail} />
            ))}
          </fieldset>
          <p className="mt-4 text-xs text-fg-2">Vos coordonnées ne sont transmises qu’au recruteur de l’offre à laquelle vous postulez, quel que soit ce choix.</p>
          <button type="submit" className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Enregistrer
          </button>
        </form>

        <section className="squircle-2xl border border-line bg-bg p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <EyeOff className="size-4 text-fg-2" aria-hidden /> Structures masquées
          </h2>
          <p className="mt-1 text-sm text-fg-2">Votre employeur actuel par exemple : elle ne voit plus votre profil, et ses offres ne vous sont plus proposées. Elle n’en est pas prévenue.</p>
          {profil.structuresMasquees.length > 0 ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {profil.structuresMasquees.map((s) => (
                <li key={s.slug} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate text-sm text-fg">{s.nom}</span>
                  <form action={masquerStructure}>
                    <input type="hidden" name="structure" value={s.slug} />
                    <input type="hidden" name="geste" value="retirer" />
                    <button type="submit" className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg">
                      <X className="size-3.5" aria-hidden /> Retirer
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-fg-2">Aucune structure masquée.</p>
          )}
          <form method="get" className="mt-5 flex gap-2">
            {sp.fiche && <input type="hidden" name="fiche" value={sp.fiche} />}
            <label className="squircle-xl flex h-11 min-w-0 flex-1 items-center gap-2 border border-line bg-bg px-3.5 focus-within:border-line-strong">
              <Search className="size-4 shrink-0 text-fg-2" aria-hidden />
              <input name="q" defaultValue={sp.q ?? ''} placeholder="Cabinet ou laboratoire" aria-label="Cabinet ou laboratoire" className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-2" />
            </label>
            <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong">
              Chercher
            </button>
          </form>
          {sp.q && (
            <ul className="mt-3 space-y-1">
              {resultats.length === 0 && <li className="text-sm text-fg-2">Aucune fiche vérifiée ne correspond.</li>}
              {resultats.map((r) => (
                <li key={r.slug} className="squircle-xl flex items-center justify-between gap-3 px-3 py-2 hover:bg-bg-soft">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{r.nom}</span>
                    <span className="block text-xs text-fg-2">{[r.commune, 'fiche vérifiée'].filter(Boolean).join(' · ')}</span>
                  </span>
                  {masquees.has(r.slug) ? (
                    <span className="text-xs text-fg-2">Masquée</span>
                  ) : (
                    <form action={masquerStructure}>
                      <input type="hidden" name="structure" value={r.slug} />
                      <button type="submit" className="inline-flex h-9 cursor-pointer items-center rounded-full bg-fg px-3.5 text-xs font-semibold text-bg">
                        Masquer
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </CoqueEspace>
  )
}
