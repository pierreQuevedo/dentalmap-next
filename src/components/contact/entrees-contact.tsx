'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Building2, FileWarning, Handshake, Megaphone, Newspaper, ShieldCheck, Stethoscope, X } from 'lucide-react'
import { FormulaireDedie } from '@/components/contact/formulaire-dedie'
import { FormulairePartenariat } from '@/components/vitrine/partenaires/formulaire'
import { FORMULAIRES } from '@/lib/contact/formulaires'
import { chemin } from '@/lib/navigation'
import type { Objet } from '@/lib/contact/objets'

/**
 * « À qui vous adressez-vous ? » : chaque entrée ouvre son formulaire dédié
 * dans un panneau, avec la chorégraphie de la recherche de l'en-tête
 * (`recherche-header.tsx`, classes `recherche-*` de `globals.css`) : le
 * panneau se déplie sous la barre, le rideau se floute un peu après, le
 * contenu entre ligne par ligne et ressort en ordre inverse.
 *
 * Trois façons de refermer : Échap, un clic sur le rideau, la croix. Le
 * panneau reste monté, fermé, pour que sa sortie soit animée ; `inert` le
 * retire alors de la tabulation. Une adresse `?objet=…` (liens « Signaler »
 * des fiches, des offres et des annonces) ouvre directement le bon
 * formulaire, prérempli.
 */
type Phase = 'ferme' | 'ouverture' | 'ouvert' | 'fermeture'
const DUREE_OUVERTURE = 720
const DUREE_FERMETURE = 520
const rang = (i: number) => ({ '--i': i }) as CSSProperties

const ENTREES = [
  { objet: 'erreur-fiche', icone: FileWarning, titre: 'Une erreur sur une fiche', texte: 'Une adresse, un téléphone, un praticien qui n’exerce plus ici : nous vérifions auprès des registres et corrigeons.', lien: 'Signaler une erreur' },
  { objet: 'praticien', icone: Stethoscope, titre: 'Praticiens', texte: 'Revendication, connexion, modification ou retrait de votre fiche.', lien: 'Nous écrire' },
  { objet: 'laboratoire', icone: Building2, titre: 'Laboratoires', texte: 'Un changement d’activité, de nom ou d’adresse.', lien: 'Nous écrire' },
  { objet: 'annonce', icone: Megaphone, titre: 'Une offre ou une annonce', texte: 'Une offre d’emploi, une cession ou une formation qui pose problème.', lien: 'Signaler' },
  { objet: 'partenariat', icone: Handshake, titre: 'Partenariats', texte: 'Ordres, écoles, éditeurs, collectivités : tout passe par une convention écrite.', lien: 'Proposer' },
  { objet: 'presse', icone: Newspaper, titre: 'Presse', texte: 'Chiffres de l’annuaire, méthode, entretiens.', lien: 'Nous écrire' },
  { objet: 'donnees', icone: ShieldCheck, titre: 'Données personnelles', texte: 'Accès, rectification, opposition : réponse sous un mois.', lien: 'Exercer mes droits' },
] as const

const TITRE_PARTENARIAT = { titre: 'Un partenariat', intro: 'Ordres, écoles, syndicats, éditeurs, collectivités : tout partenariat passe par une convention écrite.' }

export function EntreesContact({ objetInitial, initiales }: { objetInitial?: Objet; initiales?: Partial<Record<string, string>> }) {
  const pathname = usePathname()
  // Arrivée par un lien `?objet=…` : le panneau démarre ouvert sur le bon formulaire.
  const [etat, setEtat] = useState<{ phase: Phase; objet: Objet | null }>(() => (objetInitial ? { phase: 'ouverture', objet: objetInitial } : { phase: 'ferme', objet: null }))
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null)
  const declencheur = useRef<HTMLElement | null>(null)
  const premierChamp = useRef<HTMLDivElement>(null)
  const idPanneau = useId()
  const phase = etat.phase
  const ouvert = phase === 'ouverture' || phase === 'ouvert'

  const planifier = useCallback((de: Phase, vers: Phase, delai: number) => {
    if (minuterie.current) clearTimeout(minuterie.current)
    minuterie.current = setTimeout(() => setEtat((e) => (e.phase === de ? { ...e, phase: vers } : e)), delai)
  }, [])
  const ouvrir = useCallback(
    (objet: Objet, depuis?: HTMLElement | null) => {
      declencheur.current = depuis ?? null
      setEtat({ phase: 'ouverture', objet })
      planifier('ouverture', 'ouvert', DUREE_OUVERTURE)
    },
    [planifier],
  )
  const fermer = useCallback(() => {
    setEtat((e) => (e.phase === 'ferme' ? e : { ...e, phase: 'fermeture' }))
    planifier('fermeture', 'ferme', DUREE_FERMETURE)
  }, [planifier])
  useEffect(() => () => { if (minuterie.current) clearTimeout(minuterie.current) }, [])

  // Ouvert d'emblée : la phase d'ouverture se termine comme après un clic.
  useEffect(() => {
    if (objetInitial) planifier('ouverture', 'ouvert', DUREE_OUVERTURE)
  }, [objetInitial, planifier])

  // Changer de page referme sans animation.
  const [route, setRoute] = useState(pathname)
  if (route !== pathname) {
    setRoute(pathname)
    setEtat({ phase: 'ferme', objet: null })
  }

  // Visible, fermeture comprise : le corps ne défile plus et la barre reste
  // opaque, comme pour la recherche (même attribut, mêmes règles CSS).
  const visible = phase !== 'ferme'
  useEffect(() => {
    if (!visible) return
    const html = document.documentElement
    const precedent = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    html.dataset.recherche = 'ouverte'
    return () => {
      document.body.style.overflow = precedent
      delete html.dataset.recherche
    }
  }, [visible])

  // Échap referme ; le focus va au premier champ, puis revient au déclencheur.
  useEffect(() => {
    if (!ouvert) return
    const retour = declencheur.current
    premierChamp.current?.querySelector<HTMLElement>('input:not([type=hidden]), textarea, [role=combobox]')?.focus({ preventScroll: true })
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('keydown', surTouche)
      retour?.focus({ preventScroll: true })
    }
  }, [ouvert, fermer])

  const objet = etat.objet
  const tete = objet === 'partenariat' ? TITRE_PARTENARIAT : objet ? FORMULAIRES[objet] : null
  const lien = objet && objet !== 'partenariat' ? FORMULAIRES[objet].lien : undefined
  const [premiere, ...suite] = ENTREES

  return (
    <section className="container pb-16 md:pb-20">
      <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
        À qui vous adressez-vous&nbsp;?
        <span className="block text-fg-2">Chaque demande a son formulaire.</span>
      </h2>
      <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li className="col-span-2">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls={idPanneau}
            onClick={(e) => ouvrir(premiere.objet, e.currentTarget)}
            className="squircle-3xl dark flex h-full min-h-64 w-full cursor-pointer flex-col justify-between overflow-hidden bg-background p-6 text-left text-fg md:p-8"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-teal text-white">
              <premiere.icone className="size-6" aria-hidden />
            </span>
            <span className="mt-10 block">
              <span className="block text-3xl font-semibold tracking-tight text-white md:text-4xl">{premiere.titre}</span>
              <span className="mt-3 block max-w-md text-white/70">{premiere.texte}</span>
              <span className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground sm:inline-flex sm:w-auto">
                {premiere.lien} <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </span>
          </button>
        </li>
        {suite.map((e) => (
          <li key={e.objet}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-controls={idPanneau}
              onClick={(ev) => ouvrir(e.objet, ev.currentTarget)}
              className="squircle-3xl group flex h-full w-full cursor-pointer flex-col border border-line bg-bg p-4 text-left transition-colors hover:bg-bg-soft sm:p-6"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal">
                <e.icone className="size-5" aria-hidden />
              </span>
              <span className="mt-4 block text-base font-semibold leading-snug tracking-tight text-fg sm:mt-6 sm:text-lg">{e.titre}</span>
              <span className="mt-1 hidden text-sm text-fg-2 sm:block">{e.texte}</span>
              <span className="mt-auto block pt-5 text-sm font-semibold text-fg">
                {e.lien}&nbsp;
                <ArrowUpRight className="inline size-3.5 align-[-2px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-fg-2">
        Autre chose&nbsp;?{' '}
        <button type="button" onClick={(e) => ouvrir('autre', e.currentTarget)} className="cursor-pointer font-semibold text-fg underline underline-offset-4 hover:no-underline">
          Écrivez-nous
        </button>
      </p>

      {/* Le rideau, puis le panneau : mêmes classes et mêmes phases que la recherche. */}
      <div aria-hidden data-etat={phase} onClick={fermer} className={`recherche-rideau fixed inset-x-0 top-20 bottom-0 z-40 bg-bg/40 ${ouvert ? '' : 'pointer-events-none'}`} />
      <div
        id={idPanneau}
        role="dialog"
        aria-modal="true"
        aria-label={tete?.titre ?? 'Formulaire de contact'}
        inert={!ouvert}
        data-etat={phase}
        className={`recherche-panneau fixed inset-x-0 top-20 z-40 ${ouvert ? '' : 'pointer-events-none'}`}
      >
        <div className="relative max-h-[calc(100dvh-5rem)] overflow-y-auto bg-bg after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line">
          {objet && tete && (
            <div className="mx-auto grid max-w-[1288px] gap-8 px-5 pb-10 pt-6 md:px-10 md:pb-14 md:pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:px-20">
              <div>
                <div className="recherche-intro flex items-start justify-between gap-4" style={rang(0)}>
                  <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">{tete.titre}</h2>
                  <button type="button" onClick={fermer} aria-label="Fermer" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line text-fg hover:bg-bg-soft lg:hidden">
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <p className="recherche-intro mt-3 text-lg text-fg-2" style={rang(1)}>
                  {tete.intro}
                </p>
                {lien && (
                  <Link href={chemin(lien.href)} className="recherche-intro mt-5 inline-flex items-center gap-1.5 font-medium text-fg underline-offset-4 hover:underline" style={rang(2)}>
                    {lien.libelle} <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                )}
                <p className="recherche-intro mt-8 hidden text-sm text-fg-2 lg:block" style={rang(3)}>
                  Sans compte. Une personne de l’équipe lit chaque message.
                </p>
              </div>
              <div ref={premierChamp} className="relative">
                <button type="button" onClick={fermer} aria-label="Fermer" className="absolute -top-2 right-0 hidden size-10 place-items-center rounded-full border border-line text-fg hover:bg-bg-soft lg:grid">
                  <X className="size-4" aria-hidden />
                </button>
                <div className="lg:pr-14">
                  {objet === 'partenariat' ? (
                    <div className="recherche-intro" style={rang(2)}>
                      <FormulairePartenariat nu />
                    </div>
                  ) : (
                    <FormulaireDedie key={objet} objet={objet} initiales={objet === objetInitial ? initiales : undefined} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
