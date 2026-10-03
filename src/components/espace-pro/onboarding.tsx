'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { chemin } from '@/lib/navigation'
import type { Profession } from '@/lib/annuaire/types'
import { enregistrerEtape } from '@/app/(public)/espace-pro/onboarding/actions'
import {
  ACCESSIBILITE,
  ETAPES,
  JOURS,
  LANGUES,
  LIBELLE_JOUR,
  PAIEMENTS,
  TIERS_PAYANT,
  nombreEtapes,
  orientationsDe,
  schemaAccessibilite,
  schemaHoraires,
  schemaLangues,
  schemaOrientations,
  schemaPaiement,
  type CodeTiersPayant,
  type FicheCompletee,
  type Horaires,
  type Jour,
  type Plage,
} from '@/lib/espace-pro/fiche-completee'

type Props = {
  slug: string
  profession: Profession
  nom: string
  commune: string | null
  cheminPublic: string | null
  existante: FicheCompletee | null
  bienvenue: boolean
}

const PLAGE_MATIN: Plage = { debut: '09:00', fin: '12:30' }
const PLAGE_APRES_MIDI: Plage = { debut: '14:00', fin: '19:00' }

/**
 * Parcours d'accueil en quatre étapes, cinq pour une personne, qui déclare
 * aussi ses orientations.
 *
 * L'état de chaque étape vit ici, prérempli par ce qui est déjà en base, et
 * n'est envoyé qu'au clic sur « Continuer ». La validation se fait d'abord
 * dans le navigateur avec les mêmes schémas que le serveur, pour dire tout de
 * suite ce qui ne va pas, puis à nouveau côté serveur, qui reste seul juge.
 *
 * On reprend là où le praticien s'était arrêté, sauf s'il avait fini : il
 * revient alors modifier, et commence au début.
 */
export function Onboarding({ slug, profession, nom, commune, cheminPublic, existante, bienvenue }: Props) {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)
  const NB_ETAPES = nombreEtapes(profession)
  const etapes = ETAPES.slice(0, NB_ETAPES)
  const orientationsPossibles = orientationsDe(profession)
  const [etape, setEtape] = useState(() => {
    if (!existante || existante.termineLe) return 1
    return Math.min(existante.etape + 1, NB_ETAPES)
  })

  const [horaires, setHoraires] = useState<Horaires>(existante?.horaires ?? {})
  const [langues, setLangues] = useState<string[]>(existante?.langues.length ? existante.langues : ['fr'])
  const [accessibilite, setAccessibilite] = useState<string[]>(existante?.accessibilite ?? [])
  const [commentaire, setCommentaire] = useState(existante?.accessibiliteCommentaire ?? '')
  const [paiements, setPaiements] = useState<string[]>(existante?.paiements ?? [])
  const [tiersPayant, setTiersPayant] = useState<CodeTiersPayant | null>(existante?.tiersPayant ?? null)
  const [orientations, setOrientations] = useState<string[]>(existante?.orientations ?? [])

  const donneesDeLEtape = () => {
    switch (etape) {
      case 1:
        return { schema: schemaHoraires, donnees: horaires }
      case 2:
        return { schema: schemaLangues, donnees: { langues } }
      case 3:
        return { schema: schemaAccessibilite, donnees: { accessibilite, commentaire } }
      case 4:
        return { schema: schemaPaiement, donnees: { paiements, tiersPayant } }
      default:
        return { schema: schemaOrientations(profession), donnees: { orientations } }
    }
  }

  const continuer = () => {
    setErreur(null)
    const { schema, donnees } = donneesDeLEtape()
    const verif = schema.safeParse(donnees)
    if (!verif.success) {
      setErreur(verif.error.issues[0]?.message ?? 'Saisie invalide.')
      return
    }
    const derniere = etape === NB_ETAPES
    demarrer(async () => {
      const resultat = await enregistrerEtape(slug, etape, verif.data, derniere)
      if (!resultat.ok) {
        setErreur(resultat.erreur)
        return
      }
      if (derniere) router.push(chemin('/espace-pro/fiche/?enregistre=1'))
      else setEtape(etape + 1)
    })
  }

  const passer = () => {
    setErreur(null)
    setEtape(etape + 1)
  }

  const actuelle = etapes[etape - 1]!

  return (
    <div>
      {bienvenue && (
        <p className="squircle-lg mb-8 border border-line bg-bg-soft p-4 text-sm text-fg">
          Votre identité a été vérifiée par Pro Santé Connect : la fiche est à vous. Vous pouvez maintenant y ajouter ce
          que le registre ne porte pas.
        </p>
      )}

      <p className="text-sm font-medium text-fg-2">
        {nom}
        {commune ? `, ${commune}` : ''}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">Compléter ma fiche</h1>

      <ol className="mt-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${NB_ETAPES}, minmax(0, 1fr))` }} aria-label="Étapes">
        {etapes.map((e) => {
          const faite = e.numero < etape
          const active = e.numero === etape
          return (
            <li key={e.numero} className="min-w-0">
              <div className={`h-1 squircle-full ${faite || active ? 'bg-action' : 'bg-line'}`} />
              <p className={`mt-2 truncate text-xs ${active ? 'font-semibold text-fg' : 'text-fg-2'}`}>
                {e.numero}. {e.titre}
              </p>
            </li>
          )
        })}
      </ol>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-fg">{actuelle.titre}</h2>
        <p className="mt-1 text-sm text-fg-2">{actuelle.resume}</p>

        <div className="mt-6">
          {etape === 1 && <EtapeHoraires horaires={horaires} onChange={setHoraires} />}
          {etape === 2 && (
            <Cases
              options={LANGUES}
              valeurs={langues}
              onChange={setLangues}
              aide="Cochez les langues dans lesquelles une consultation peut se tenir au cabinet."
            />
          )}
          {etape === 3 && (
            <>
              <Cases options={ACCESSIBILITE} valeurs={accessibilite} onChange={setAccessibilite} />
              <label htmlFor="commentaire" className="mt-6 block text-sm font-medium text-fg">
                Précision utile aux patients
                <span className="ml-1 font-normal text-fg-2">(facultatif)</span>
              </label>
              <textarea
                id="commentaire"
                rows={3}
                maxLength={300}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Par exemple : deuxième étage, interphone au nom du cabinet."
                className="squircle-md mt-2 w-full border border-line-strong px-3 py-2 text-fg outline-none focus:border-fg"
              />
              <p className="mt-1 text-right text-xs text-fg-2">{commentaire.length}/300</p>
            </>
          )}
          {etape === 4 && (
            <>
              <h3 className="text-sm font-medium text-fg">Modes de paiement acceptés</h3>
              <div className="mt-2">
                <Cases options={PAIEMENTS} valeurs={paiements} onChange={setPaiements} />
              </div>
              <h3 className="mt-6 text-sm font-medium text-fg">Tiers payant</h3>
              <div className="mt-2 grid gap-2">
                {TIERS_PAYANT.map((t) => (
                  <label
                    key={t.code}
                    className="squircle-lg flex cursor-pointer items-center gap-3 border border-line px-4 py-3 text-sm text-fg has-checked:border-fg"
                  >
                    <input
                      type="radio"
                      name="tiers-payant"
                      checked={tiersPayant === t.code}
                      onChange={() => setTiersPayant(t.code)}
                      className="accent-[var(--action)]"
                    />
                    {t.libelle}
                  </label>
                ))}
              </div>
            </>
          )}
          {etape === 5 && (
            <Cases
              options={orientationsPossibles}
              valeurs={orientations}
              onChange={setOrientations}
              aide="Ce que vous pratiquez le plus. Ces orientations ne sont pas des spécialités reconnues par l’Ordre : elles sont affichées comme déclarées par vous, et servent de filtre aux patients."
            />
          )}
        </div>

        {erreur && <p className="mt-4 text-sm text-destructive">{erreur}</p>}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={continuer}
            disabled={enCours}
            className="squircle-full bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover disabled:opacity-60"
          >
            {enCours ? 'Enregistrement…' : etape === NB_ETAPES ? 'Terminer' : 'Continuer'}
          </button>
          {etape > 1 && (
            <button
              type="button"
              onClick={() => {
                setErreur(null)
                setEtape(etape - 1)
              }}
              disabled={enCours}
              className="squircle-full border border-line-strong px-5 py-2.5 font-medium text-fg hover:border-fg disabled:opacity-60"
            >
              Retour
            </button>
          )}
          {etape < NB_ETAPES && (
            <button
              type="button"
              onClick={passer}
              disabled={enCours}
              className="ml-auto text-sm text-fg-2 underline hover:text-fg hover:no-underline"
            >
              Passer cette étape
            </button>
          )}
        </div>

        {cheminPublic && (
          <p className="mt-6 text-xs text-fg-2">
            Chaque étape validée est publiée aussitôt sur{' '}
            <Link href={chemin(cheminPublic)} className="underline hover:no-underline">
              votre fiche publique
            </Link>
            , dans un encadré qui indique que ces informations viennent de vous.
          </p>
        )}
      </section>
    </div>
  )
}

/** Cases à cocher présentées en grille, pour les listes de codes. */
function Cases({
  options,
  valeurs,
  onChange,
  aide,
}: {
  options: readonly { code: string; libelle: string }[]
  valeurs: string[]
  onChange: (v: string[]) => void
  aide?: string
}) {
  const basculer = (code: string) =>
    onChange(valeurs.includes(code) ? valeurs.filter((v) => v !== code) : [...valeurs, code])
  return (
    <>
      {aide && <p className="mb-3 text-sm text-fg-2">{aide}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.code}
            className="squircle-lg flex cursor-pointer items-center gap-3 border border-line px-4 py-3 text-sm text-fg has-checked:border-fg"
          >
            <input
              type="checkbox"
              checked={valeurs.includes(o.code)}
              onChange={() => basculer(o.code)}
              className="accent-[var(--action)]"
            />
            {o.libelle}
          </label>
        ))}
      </div>
    </>
  )
}

function EtapeHoraires({ horaires, onChange }: { horaires: Horaires; onChange: (h: Horaires) => void }) {
  const regler = (jour: Jour, plages: Plage[] | undefined) => {
    const suivant = { ...horaires }
    if (plages && plages.length > 0) suivant[jour] = plages
    else delete suivant[jour]
    onChange(suivant)
  }

  const appliquerLundi = () => {
    const modele = horaires.lundi
    if (!modele) return
    const suivant = { ...horaires }
    for (const j of ['mardi', 'mercredi', 'jeudi', 'vendredi'] as const) suivant[j] = modele.map((p) => ({ ...p }))
    onChange(suivant)
  }

  return (
    <div>
      <div className="grid gap-3">
        {JOURS.map((jour) => {
          const plages = horaires[jour] ?? []
          const ouvert = plages.length > 0
          return (
            <div key={jour} className="squircle-lg border border-line p-4">
              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-fg">
                  <input
                    type="checkbox"
                    checked={ouvert}
                    onChange={(e) => regler(jour, e.target.checked ? [PLAGE_MATIN, PLAGE_APRES_MIDI] : undefined)}
                    className="accent-[var(--action)]"
                  />
                  {LIBELLE_JOUR[jour]}
                </label>
                {!ouvert && <span className="text-sm text-fg-2">Fermé</span>}
              </div>

              {ouvert && (
                <div className="mt-3 grid gap-2">
                  {plages.map((p, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="w-20 text-fg-2">{i === 0 ? 'Matin' : 'Après-midi'}</span>
                      <input
                        type="time"
                        value={p.debut}
                        aria-label={`Début ${i === 0 ? 'matin' : 'après-midi'} ${LIBELLE_JOUR[jour]}`}
                        onChange={(e) => regler(jour, plages.map((q, k) => (k === i ? { ...q, debut: e.target.value } : q)))}
                        className="squircle-md border border-line-strong px-2 py-1.5 text-fg outline-none focus:border-fg"
                      />
                      <span className="text-fg-2">à</span>
                      <input
                        type="time"
                        value={p.fin}
                        aria-label={`Fin ${i === 0 ? 'matin' : 'après-midi'} ${LIBELLE_JOUR[jour]}`}
                        onChange={(e) => regler(jour, plages.map((q, k) => (k === i ? { ...q, fin: e.target.value } : q)))}
                        className="squircle-md border border-line-strong px-2 py-1.5 text-fg outline-none focus:border-fg"
                      />
                      {i === 1 && (
                        <button
                          type="button"
                          onClick={() => regler(jour, [plages[0]])}
                          className="text-xs text-fg-2 underline hover:text-fg hover:no-underline"
                        >
                          Journée continue
                        </button>
                      )}
                    </div>
                  ))}
                  {plages.length === 1 && (
                    <button
                      type="button"
                      onClick={() => regler(jour, [plages[0], PLAGE_APRES_MIDI])}
                      className="self-start text-xs text-fg-2 underline hover:text-fg hover:no-underline"
                    >
                      Ajouter une coupure
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {horaires.lundi && (
        <button
          type="button"
          onClick={appliquerLundi}
          className="mt-4 text-sm text-fg underline hover:no-underline"
        >
          Appliquer les horaires du lundi du mardi au vendredi
        </button>
      )}
    </div>
  )
}
