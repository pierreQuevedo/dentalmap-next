import Link from 'next/link'
import { MessageSquareQuote, PenLine, Sparkles } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { POINTS_AVIS, libelleLien, noteFr, recherchePour, type ResumeAvis } from '@/lib/formation/avis'
import type { AvisPublic } from '@/lib/formation/avis-donnees'
import { dateLisible } from '@/lib/formation/page-etablissement'
import { Etoiles } from './etoiles'
import { RetourAvis, SignalerAvis } from './avis-client'

const VISIBLES = 6

/**
 * Les avis d'une école ou d'une faculté : la note, la répartition, l'appel à
 * donner le sien, puis les avis du plus récent au plus ancien, chacun avec la
 * réponse de l'établissement. La mention dit comment ils sont recueillis
 * (art. L111-7-2 du Code de la consommation), jamais comment ils classent.
 */
export function AvisEtablissement({ lienPage, nom, type, avis, resume }: { lienPage: string; nom: string; type: 'ecole_prothese' | 'faculte'; avis: AvisPublic[]; resume: ResumeAvis }) {
  const ecrire = `${lienPage}avis/`
  const mention = (
    <p className="text-xs leading-relaxed text-fg-2">
      Les avis sont déposés par des personnes connectées qui déclarent leur lien avec {nom}, sans vérification de leur scolarité. Ils paraissent dès leur dépôt, du plus récent au
      plus ancien. Chaque auteur reçoit {POINTS_AVIS} points de mise en avant pour son profil candidat sur DentalMap, quelle que soit sa note. Un avis signalé est examiné par
      l’équipe DentalMap ; il n’est jamais retiré pour sa note.
    </p>
  )
  const recompense = (
    <p className="squircle-xl inline-flex items-center gap-2 bg-teal/10 px-3 py-2 text-sm font-medium text-teal">
      <Sparkles className="size-4 shrink-0" aria-hidden /> +{POINTS_AVIS} points de mise en avant pour votre recherche de {recherchePour(type)}
    </p>
  )
  // Sans avis, un seul bloc : l'appel à donner le premier.
  if (!avis.length) {
    return (
      <section id="avis" className="container scroll-mt-20 py-20 md:py-24">
        <RetourAvis />
        <div className="squircle-3xl grid gap-8 bg-bg-soft p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-12">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
              Avis
              <span className="block text-fg-2">Aucun pour l’instant.</span>
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-fg-2">Vous y avez étudié, ou vous y étudiez ? Votre expérience aide ceux qui hésitent à choisir.</p>
            <div className="mt-5">{recompense}</div>
            <div className="mt-6 max-w-xl">{mention}</div>
          </div>
          <Link href={chemin(ecrire)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            <PenLine className="size-4" aria-hidden /> Donner le premier avis
          </Link>
        </div>
      </section>
    )
  }
  return (
    <section id="avis" className="container scroll-mt-20 py-20 md:py-24">
      <RetourAvis />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Avis</h2>
          {resume.moyenne !== null && (
            <>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-tight text-fg">{noteFr(resume.moyenne)}</span>
                <span className="pb-2">
                  <Etoiles note={resume.moyenne} taille="size-5" />
                  <span className="mt-1 block text-sm text-fg-2">
                    {resume.nombre} avis
                  </span>
                </span>
              </div>
              <ul className="mt-6 space-y-1.5" aria-label="Répartition des notes">
                {([5, 4, 3, 2, 1] as const).map((n) => (
                  <li key={n} className="flex items-center gap-3 text-xs text-fg-2">
                    <span className="w-3 text-right tabular-nums">{n}</span>
                    <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-teal" style={{ width: `${(resume.repartition[n] / resume.nombre) * 100}%` }} />
                    </span>
                    <span className="w-6 tabular-nums">{resume.repartition[n]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-8">{recompense}</div>
          <Link href={chemin(ecrire)} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            <PenLine className="size-4" aria-hidden /> Donner mon avis
          </Link>
          <div className="mt-6">{mention}</div>
        </div>

        <div>
            <ol className="space-y-4">
              {avis.slice(0, VISIBLES).map((a) => (
                <CarteAvis key={a.id} a={a} nom={nom} />
              ))}
            </ol>
            {avis.length > VISIBLES && (
              <details className="group mt-4">
                <summary className="inline-flex h-10 cursor-pointer list-none items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong group-open:hidden">
                  Voir les {avis.length - VISIBLES} autres avis
                </summary>
                <ol className="space-y-4">
                  {avis.slice(VISIBLES).map((a) => (
                    <CarteAvis key={a.id} a={a} nom={nom} />
                  ))}
                </ol>
              </details>
            )}
        </div>
      </div>
    </section>
  )
}

function CarteAvis({ a, nom }: { a: AvisPublic; nom: string }) {
  return (
    <li className="squircle-2xl border border-line bg-bg p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <Etoiles note={a.note} />
        <span className="text-xs text-fg-2">
          {dateLisible(a.creeLe)}
          {a.modifieLe ? ' · modifié' : ''}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-fg">{a.texte}</p>
      <p className="mt-3 text-sm text-fg-2">
        <span className="font-medium text-fg">{a.auteur}</span> · {libelleLien(a.lien)}
        {a.annee ? `, ${a.annee}` : ''}
      </p>
      {a.reponse && (
        <div className="squircle-xl mt-4 border-l-2 border-teal bg-bg-soft p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-fg">
            <MessageSquareQuote className="size-3.5 text-teal" aria-hidden /> Réponse de {nom}
            {a.reponduLe ? <span className="font-normal text-fg-2"> · {dateLisible(a.reponduLe)}</span> : null}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-fg-2">{a.reponse}</p>
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <SignalerAvis avis={a.id} />
      </div>
    </li>
  )
}
