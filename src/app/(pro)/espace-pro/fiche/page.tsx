import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Lock, Pencil } from 'lucide-react'
import { CoqueEspace, Statut, TitreTuile, Tuile } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { progressionDe } from '@/lib/espace-pro/progression'
import { libelleAge } from '@/lib/espace-pro/fiche-completee'
import { GALERIE_MIN, nomMarque } from '@/lib/espace-pro/marques'
import { resumeAccueil, resumeConventionnement, resumeSemaine, resumeSoins, resumesLabo } from '@/lib/espace-pro/resumes'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Ma fiche', robots: { index: false, follow: false } }
export const instant = false

/** Les blocs de la fiche publique, dans l'ordre où les patients les lisent, chacun avec son état et son action. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque, q, points } = await chargerTableau('fiche', (await props.searchParams).fiche)
  const { fiche, completee: c, force, fraicheur } = espace
  // Les paliers de la progression, comme la vue d'ensemble : pas l'ancien « Intermédiaire, Avancé ».
  const p = progressionDe(points.total, points.verifiee)
  const retour = encodeURIComponent(`/espace-pro/fiche/${q}`)
  const onb = (etape: string) => `/espace-pro/onboarding/${etape}/?fiche=${encodeURIComponent(fiche.slug)}&suite=${retour}`
  const mis = (m: string) => `/espace-pro/missions/${m}/${q}`
  const horairesVieux = fraicheur.some((f) => f.cle === 'horaires' && f.etat !== 'a_jour')
  const rempli = coque.enLigne ? 'publiee' : 'attente'

  type Bloc = { n: string; d: string; s: 'publiee' | 'incomplete' | 'vide' | 'auto' | 'attente'; src: string; href: string }
  const labo = espace.labo
  const r = resumesLabo(c)
  const delaisVieux = fraicheur.some((f) => f.cle === 'delais' && f.etat !== 'a_jour')
  const blocsLabo: Bloc[] = [
    { n: 'Savoir-faire', d: r.savoir_faire ?? 'Trois techniques au moins', s: (c?.techniques.length ?? 0) >= 3 ? rempli : c?.techniques.length ? 'incomplete' : 'vide', src: 'Déclaré', href: `/espace-pro/savoir-faire/${q}` },
    { n: 'Matériaux et CFAO', d: r.materiaux ?? 'Zircone, disilicate, usinage…', s: c?.materiaux.length ? rempli : 'vide', src: 'Déclaré', href: `/espace-pro/savoir-faire/${q}` },
    { n: 'Délais de fabrication', d: r.delais ?? 'Délai moyen par type de pièce', s: !r.delais ? 'vide' : delaisVieux ? 'incomplete' : rempli, src: 'Déclaré', href: `/espace-pro/delais/${q}` },
    { n: 'Zone et logistique', d: r.zone ?? 'Rayon desservi, ramassage', s: r.zone ? rempli : 'vide', src: 'Déclaré', href: `/espace-pro/zone/${q}` },
    { n: 'Réalisations', d: r.realisations ?? 'Une à huit photos de pièces', s: r.realisations ? rempli : 'vide', src: 'Déclaré', href: `/espace-pro/realisations/${q}` },
    { n: 'Déclaration ANSM', d: c?.ansmNumero ? 'Fabricant déclaré' : 'Numéro d’enregistrement', s: c?.ansmNumero ? rempli : 'vide', src: 'Déclaré', href: `/espace-pro/conformite/${q}` },
    { n: 'Présentation', d: c?.presentation ? `${c.presentation.trim().length} caractères` : '200 à 800 caractères', s: c?.presentation ? rempli : 'vide', src: 'Déclaré', href: mis('presentation') },
    { n: 'Établissements', d: [...new Set(fiche.lieux.map((l) => l.communeNom).filter(Boolean))].join(', ') || 'Adresse Sirene', s: 'auto', src: 'Sirene', href: `/espace-pro/registre/${q}` },
    { n: 'Ce que dit le registre', d: 'SIREN, raison sociale, état de l’établissement', s: 'auto', src: 'Sirene', href: `/espace-pro/registre/${q}` },
  ]
  const blocsSoignant: Bloc[] = [
    { n: 'Horaires', d: resumeSemaine(c) ?? 'Jours et heures d’ouverture', s: !resumeSemaine(c) ? 'vide' : horairesVieux ? 'incomplete' : rempli, src: 'Déclaré', href: onb('horaires') },
    { n: 'Conventionnement et tiers payant', d: resumeConventionnement(c) ?? 'Secteur et tiers payant', s: c?.secteur && c.tiersPayant ? rempli : c?.secteur || c?.tiersPayant ? 'incomplete' : 'vide', src: 'Déclaré', href: onb('conventionnement') },
    { n: 'Langues, accès, enfants', d: resumeAccueil(c) ?? (c?.ageMinimum !== null && c?.ageMinimum !== undefined ? libelleAge(c.ageMinimum) : 'Langues, accès PMR, âge minimum'), s: c?.langues.length && c.accesPmr ? rempli : 'vide', src: 'Déclaré', href: onb('accueil') },
    { n: 'Photo de profil', d: c?.photoUrl ? 'Portrait, au format de la carte' : 'Image sur la fiche et dans Google', s: c?.photoUrl ? rempli : 'vide', src: 'Déclaré', href: mis('photo') },
    { n: 'Présentation', d: c?.presentation ? `${c.presentation.trim().length} caractères` : '200 à 800 caractères', s: c?.presentation ? rempli : 'vide', src: 'Déclaré', href: mis('presentation') },
    { n: 'Domaines de soins', d: resumeSoins(c, fiche.profession) ?? 'Au moins deux domaines', s: (c?.orientations.length ?? 0) >= 2 ? rempli : c?.orientations.length ? 'incomplete' : 'vide', src: 'Déclaré', href: mis('soins') },
    {
      n: 'Galerie du cabinet',
      d: c?.realisations.length ? `${c.realisations.length} photo${c.realisations.length > 1 ? 's' : ''} sur 8` : `${GALERIE_MIN} photos au moins : accueil, salle de soins, équipement`,
      s: (c?.realisations.length ?? 0) >= GALERIE_MIN ? rempli : c?.realisations.length ? 'incomplete' : 'vide',
      src: 'Déclaré',
      href: mis('galerie'),
    },
    { n: 'Marques utilisées', d: c?.marques.length ? c.marques.map(nomMarque).filter(Boolean).join(', ') : 'Implants, aligneurs, numérique, matériaux', s: c?.marques.length ? rempli : 'vide', src: 'Déclaré', href: mis('marques') },
    { n: 'Liens du cabinet', d: [c?.siteWeb && 'Site', c?.rdvEnLigne && 'Rendez-vous en ligne'].filter(Boolean).join(', ') || 'Site web, prise de rendez-vous en ligne', s: c?.siteWeb || c?.rdvEnLigne ? rempli : 'vide', src: 'Déclaré', href: mis('liens') },
    { n: 'Lieux d’exercice', d: [...new Set(fiche.lieux.map((l) => l.communeNom).filter(Boolean))].join(', ') || 'Adresse du registre', s: 'auto', src: fiche.rpps ? 'Annuaire Santé' : 'Sirene', href: `/espace-pro/registre/${q}` },
    { n: 'Ce que dit le registre', d: 'RPPS, profession, mode d’exercice', s: 'auto', src: fiche.rpps ? 'Annuaire Santé' : 'Sirene', href: `/espace-pro/registre/${q}` },
  ]
  const blocs = labo ? blocsLabo : blocsSoignant

  return (
    <CoqueEspace c={coque} actif="fiche" titre="Ma fiche" sousTitre={`Les blocs de la fiche publique, dans l’ordre où les ${labo ? 'cabinets' : 'patients'} les lisent`}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ol className="space-y-2">
          {blocs.map((b, k) => (
            <li key={b.n} className={`squircle-2xl flex flex-wrap items-center gap-4 border bg-bg p-4 ${b.s === 'vide' ? 'border-dashed border-line' : 'border-line'}`}>
              <span className="w-8 text-center text-2xl font-light tabular-nums text-fg-2">{String(k + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-0">
                <p className="font-semibold text-fg">{b.n}</p>
                <p className="truncate text-sm text-fg-2">{b.d}</p>
              </div>
              <div className="ml-12 flex flex-wrap items-center gap-3 sm:ml-0">
                <span className="hidden text-xs text-fg-2 md:block">{b.src}</span>
                <Statut s={b.s} />
                {b.s === 'auto' ? (
                  <Link href={chemin(b.href)} className="inline-flex h-9 items-center gap-1.5 px-3 text-sm text-fg-2 hover:text-fg">
                    <Lock className="size-3.5" aria-hidden /> Lecture seule
                  </Link>
                ) : (
                  <Link href={chemin(b.href)} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${b.s === 'vide' ? 'bg-action text-action-foreground hover:bg-action-hover' : 'border border-line text-fg hover:border-line-strong'}`}>
                    <Pencil className="size-3.5" aria-hidden /> {b.s === 'vide' ? 'Remplir' : 'Modifier'}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={CheckCircle2}>Force de la fiche</TitreTuile>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-fg">
              {force.total} %<span className="ml-2 text-base font-normal text-fg-2">· {points.total} pts</span>
            </p>
            <p className="text-sm text-fg-2">
              {!p.verifiee
                ? 'Palier 1 dès la vérification'
                : `${p.actuel ? `Palier ${p.actuel.niveau} · ${p.actuel.nom}` : 'En route'}${p.suivant ? ` · plus que ${p.reste} points avant ${p.suivant.nom}` : ''}`}
            </p>
            <span className="mt-4 block h-2 rounded-full bg-line">
              <span className="block h-full rounded-full bg-teal" style={{ width: `${force.total}%` }} />
            </span>
            <ul className="mt-4 space-y-1.5 text-xs">
              {force.items.map((i) => (
                <li key={i.cle} className="flex justify-between gap-3">
                  <span className="text-fg-2">{i.libelle}</span>
                  <span className={`tabular-nums ${i.points === i.max ? 'text-teal' : 'text-fg-2'}`}>
                    {i.points} / {i.max}
                  </span>
                </li>
              ))}
            </ul>
          </Tuile>
        </aside>
      </div>
    </CoqueEspace>
  )
}
