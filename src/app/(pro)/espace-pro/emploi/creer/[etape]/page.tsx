import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Check, ChevronLeft, CircleAlert, Pencil } from 'lucide-react'
import { CoqueEspace, Tuile } from '@/components/espace/coque'
import { Encart } from '@/components/compte/ui'
import { EmploiVerrouille, libelleLieu } from '@/components/emploi/espace-offres'
import { FormulaireEtape, type ValeursEtapes } from '@/components/emploi/etapes-offre'
import { chemin } from '@/lib/navigation'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { contratTexte, decouperDescription, periodeTexte, remuneration, tempsTexte } from '@/lib/emploi/format'
import { metierDepuisCode } from '@/lib/emploi/metiers'
import { ETAPES_OFFRE, estEtapeOffre, etapePrecedente, manquesOffre, type EtapeOffre } from '@/lib/emploi/offre-pro'
import { getOffresRecruteur } from '@/lib/emploi/offres-pro'
import { getCabinetRecrutement } from '@/lib/emploi/recruteur'
import { PALIERS, PALIER_EMPLOI, progressionDe } from '@/lib/espace-pro/progression'
import { chargerTableau } from '../../../_commun'

export const metadata: Metadata = { title: 'Créer un poste', robots: { index: false, follow: false } }
export const instant = false

const INTRO: Record<EtapeOffre, string> = {
  cabinet: 'Ces informations valent pour toutes vos offres : saisies une fois, reprises à chaque nouveau poste.',
  poste: 'Ce que vous cherchez : le métier, le contrat, le temps de travail et le lieu.',
  remuneration: 'Affichée sur l’offre. Une offre sans rémunération n’est pas publiée.',
  annonce: 'Ce que les candidats lisent sur la page de l’offre.',
  publication: 'Relisez l’offre avant de la mettre en ligne pour 30 jours.',
}

/**
 * « Créer un poste », en pages enfant : le cabinet (commun à toutes les
 * offres), le poste, la rémunération, l'annonce, la publication. L'offre
 * naît en brouillon à l'étape « Le poste » ; les étapes suivantes la
 * complètent (`?offre=<id>`). Les mêmes pages servent à modifier une offre.
 */
export default async function Page(props: { params: Promise<{ etape: string }>; searchParams: Promise<{ fiche?: string; offre?: string }> }) {
  const { etape } = await props.params
  if (!estEtapeOffre(etape)) notFound()
  const sp = await props.searchParams
  const { espace, coque, q, points } = await chargerTableau('emploi', sp.fiche, `creer/${etape}`)
  const { fiche } = espace
  const verifiee = espace.ctx.identiteVerifiee
  const p = progressionDe(points.total, points.verifiee, points.detail.fiche)
  const peutPublier = verifiee && (p.actuel?.niveau ?? 0) >= PALIER_EMPLOI
  const [offres, cabinet] = await Promise.all([getOffresRecruteur(fiche.id), getCabinetRecrutement(fiche.id)])
  const o = sp.offre ? offres.find((x) => x.id === sp.offre) : undefined
  if (sp.offre && !o) notFound()
  // Sans offre, seule la page du cabinet et celle du poste s'ouvrent.
  if (!o && etape !== 'cabinet' && etape !== 'poste') redirect(chemin(`/espace-pro/emploi/creer/poste/${q}`))
  const enLigne = o?.statut === 'en_ligne'
  if (o && o.statut !== 'brouillon' && !enLigne) redirect(chemin(`/espace-pro/emploi/${o.id}/${q}`))

  const lien = (e: EtapeOffre) => {
    const params = [q.replace(/^\?/, ''), o ? `offre=${o.id}` : ''].filter(Boolean).join('&')
    return `/espace-pro/emploi/creer/${e}/${params ? `?${params}` : ''}`
  }
  const precedente = etapePrecedente(etape)
  const retour = precedente ? lien(precedente) : o ? `/espace-pro/emploi/${o.id}/${q}` : `/espace-pro/emploi/${q}`
  const lieux = fiche.lieux.map((l) => ({ id: l.id, libelle: libelleLieu(l) }))
  const lieuParDefaut = cabinet.lieuId ?? fiche.lieux.find((l) => l.principal)?.id ?? fiche.lieux[0]?.id ?? null
  const { resume, points: missions } = decouperDescription(o?.description ?? '')
  const valeurs: ValeursEtapes = {
    cabinet,
    poste: o
      ? { metier: o.metier, titre: o.titre, contrat: o.contrat, tempsPlein: o.tempsPlein, heuresHebdo: o.heuresHebdo, debut: o.debut, fin: o.fin, lieuId: o.lieuId }
      : { metier: 'assistant_dentaire', titre: 'Assistant(e) dentaire', contrat: 'cdi', tempsPlein: true, heuresHebdo: null, debut: null, fin: null, lieuId: lieuParDefaut },
    remuneration: { min: o?.min ?? null, max: o?.max ?? null },
    annonce: { presentation: resume, missions: missions.join('\n'), profil: o?.profil ?? '', avantages: o?.avantages ?? cabinet.avantages },
  }
  const manques = o ? manquesOffre({ contrat: o.contrat, min: o.min, max: o.max, titre: o.titre, presentation: resume }) : []
  const position = ETAPES_OFFRE.findIndex((e) => e.cle === etape)

  return (
    <CoqueEspace
      sansLienFlottant
      c={coque}
      actif="emploi"
      titre={enLigne ? 'Modifier l’offre' : 'Créer un poste'}
      sousTitre={`Étape ${position + 1} sur ${ETAPES_OFFRE.length}${o ? ` · ${o.titre}` : ''}`}
    >
      <Link href={chemin(o ? `/espace-pro/emploi/${o.id}/${q}` : `/espace-pro/emploi/${q}`)} className="mb-4 inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg">
        <ChevronLeft className="size-4" aria-hidden /> {o ? o.titre : 'Mes offres'}
      </Link>
      {!verifiee && (
        <div className="mb-4">
          <Encart>Créer une offre s’ouvre dès que votre identité est vérifiée.</Encart>
        </div>
      )}
      {verifiee && !peutPublier && (
        <div className="mb-4">
          <EmploiVerrouille reste={Math.max(0, PALIERS[PALIER_EMPLOI - 1].seuil - points.total)} q={q} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Étapes" className="lg:sticky lg:top-28 lg:self-start">
          <ol className="flex flex-wrap gap-1 lg:flex-col">
            {ETAPES_OFFRE.map((e, i) => {
              const actif = e.cle === etape
              const accessible = e.cle === 'cabinet' || e.cle === 'poste' || Boolean(o)
              // Une étape n'est cochée que complète : il lui manque quelque chose, elle porte une pastille d'alerte.
              const manque = manques.some((m) => m.etape === e.cle)
              const faite = !manque && (i < position || (o && e.cle !== 'publication' && i !== position))
              const contenu = (
                <>
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${actif ? 'bg-fg text-bg' : manque ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300' : faite ? 'bg-teal/15 text-teal' : 'bg-bg-soft text-fg-2'}`}>
                    {actif ? i + 1 : manque ? <CircleAlert className="size-3.5" aria-label="À compléter" /> : faite ? <Check className="size-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className={`min-w-0 ${actif ? '' : 'hidden lg:block'}`}>
                    <span className={`block whitespace-nowrap text-sm ${actif ? 'font-semibold text-fg' : 'font-medium text-fg'}`}>{e.titre}</span>
                    <span className="hidden truncate text-xs text-fg-2 lg:block">{e.detail}</span>
                  </span>
                </>
              )
              const classe = `squircle-xl flex shrink-0 items-center gap-3 px-2 py-2 lg:px-3 lg:py-2.5 ${actif ? 'bg-bg shadow-sm ring-1 ring-line' : ''}`
              return (
                <li key={e.cle}>
                  {accessible && !actif ? (
                    <Link href={chemin(lien(e.cle))} className={`${classe} hover:bg-bg`}>
                      {contenu}
                    </Link>
                  ) : (
                    <span aria-current={actif ? 'step' : undefined} className={`${classe} ${accessible ? '' : 'opacity-50'}`}>
                      {contenu}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <Tuile className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-2">
            {etape === 'cabinet' ? 'Commun à toutes vos offres' : o ? metierDepuisCode(o.metier).nom : 'Nouvelle offre'}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">{ETAPES_OFFRE[position].titre}</h2>
          <p className="mt-1 text-sm text-fg-2">{INTRO[etape]}</p>
          <div className="mt-6">
            <FormulaireEtape etape={etape} fiche={fiche.slug} offre={o?.id ?? null} retour={retour} enLigne={enLigne} peutPublier={peutPublier && manques.length === 0} lieux={lieux} valeurs={valeurs}>
              {etape === 'publication' && o && <Recapitulatif o={o} cabinet={cabinet.presentation} manques={manques} lien={lien} />}
            </FormulaireEtape>
          </div>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}

function Recapitulatif({
  o,
  cabinet,
  manques,
  lien,
}: {
  o: NonNullable<Awaited<ReturnType<typeof getOffresRecruteur>>[number]>
  cabinet: string
  manques: ReturnType<typeof manquesOffre>
  lien: (e: EtapeOffre) => string
}) {
  const r = remuneration({ mode: o.mode, min: o.min, max: o.max })
  const { resume, points } = decouperDescription(o.description)
  const blocs: { etape: EtapeOffre; titre: string; contenu: React.ReactNode }[] = [
    { etape: 'cabinet', titre: 'Le cabinet', contenu: cabinet ? <p className="line-clamp-3 whitespace-pre-line">{cabinet}</p> : <p className="text-fg-2">La présentation de votre fiche s’affiche.</p> },
    {
      etape: 'poste',
      titre: 'Le poste',
      contenu: (
        <p>
          {o.titre} · {contratTexte(o)} · {tempsTexte(o)} · {periodeTexte(o.debut, o.fin)}
          <br />
          <span className="text-fg-2">{[o.adresse && formaterAdresse(o.adresse), o.communeNom].filter(Boolean).join(', ')}</span>
        </p>
      ),
    },
    { etape: 'remuneration', titre: 'Rémunération', contenu: <p>{o.min || o.max ? `${r.principal} ${r.detail}` : <span className="text-fg-2">À renseigner</span>}</p> },
    {
      etape: 'annonce',
      titre: 'L’annonce',
      contenu: (
        <div className="space-y-2">
          {resume ? <p>{resume}</p> : <p className="text-fg-2">Présentation à rédiger</p>}
          {points.length > 0 && (
            <ol className="list-decimal space-y-0.5 pl-5">
              {points.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ol>
          )}
          {o.avantages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {o.avantages.map((a) => (
                <span key={a} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ]
  return (
    <div className="space-y-3">
      {manques.length > 0 && (
        <ul className="squircle-xl space-y-1 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          {manques.map((m) => (
            <li key={m.message} className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <Link href={chemin(lien(m.etape))} className="underline underline-offset-2">
                {m.message}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {blocs.map((b) => (
        <section key={b.etape} className="squircle-xl border border-line px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-fg">{b.titre}</h3>
            <Link href={chemin(lien(b.etape))} className="inline-flex items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg">
              <Pencil className="size-3.5" aria-hidden /> Modifier
            </Link>
          </div>
          <div className="mt-1.5 text-sm text-fg">{b.contenu}</div>
        </section>
      ))}
    </div>
  )
}
