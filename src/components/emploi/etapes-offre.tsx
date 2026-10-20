'use client'

import { useActionState, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Euro, Loader2, MapPin, Percent, Send, TriangleAlert } from 'lucide-react'
import { enregistrerEtape, type EtatEtape } from '@/lib/emploi/actions-etapes'
import { LIBELLE_CONTRAT, METIERS, type CodeContrat, type CodeMetier } from '@/lib/emploi/metiers'
import { AVANTAGES, PRESENTATION_MIN, enPourcentage, modeDuContrat, type EtapeOffre } from '@/lib/emploi/offre-pro'
import { chemin } from '@/lib/navigation'

const CONTRATS: CodeContrat[] = ['cdi', 'cdd', 'remplacement', 'collaboration', 'alternance', 'stage']

const champ = 'squircle-xl w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'
const etiquette = 'mb-1.5 block text-sm font-medium text-fg'
const aide = 'mt-1 block text-xs text-fg-2'

export type ValeursEtapes = {
  cabinet: { presentation: string; avantages: string[]; lieuId: string | null }
  poste: { metier: CodeMetier; titre: string; contrat: CodeContrat; tempsPlein: boolean; heuresHebdo: number | null; debut: string | null; fin: string | null; lieuId: string | null }
  remuneration: { min: number | null; max: number | null }
  annonce: { presentation: string; missions: string; profil: string; avantages: string[] }
}

type Props = {
  etape: EtapeOffre
  fiche: string
  offre: string | null
  /** L'étape précédente, ou la liste des offres. */
  retour: string
  /** Offre en ligne : chaque étape enregistre directement, sans brouillon. */
  enLigne: boolean
  /** Publication : le palier Ambassadeur est atteint. */
  peutPublier: boolean
  lieux: { id: string; libelle: string }[]
  valeurs: ValeursEtapes
  /** Publication : le récapitulatif, rendu côté serveur. */
  children?: ReactNode
}

/**
 * Le formulaire d'une étape de « Créer un poste » : ses champs, puis
 * « Retour », « Enregistrer et quitter » et « Continuer » (ou « Publier »).
 */
export function FormulaireEtape(p: Props) {
  const [etat, action, enCours] = useActionState<EtatEtape, FormData>(enregistrerEtape, null)
  const invalide = (c: string) => (etat?.champ === c ? 'border-destructive' : '')
  const valeurs = etat?.saisie ? avecSaisie(p.valeurs, etat.saisie) : p.valeurs
  return (
    <form action={action} className="flex flex-col">
      <input type="hidden" name="fiche" value={p.fiche} />
      <input type="hidden" name="etape" value={p.etape} />
      {p.offre && <input type="hidden" name="offre" value={p.offre} />}

      <div key={etat?.n ?? 0} className="space-y-5">
        {p.etape === 'cabinet' && <ChampsCabinet v={valeurs.cabinet} lieux={p.lieux} invalide={invalide} />}
        {p.etape === 'poste' && <ChampsPoste v={valeurs.poste} lieux={p.lieux} invalide={invalide} enLigne={p.enLigne} />}
        {p.etape === 'remuneration' && <ChampsRemuneration v={valeurs.remuneration} contrat={p.valeurs.poste.contrat} invalide={invalide} />}
        {p.etape === 'annonce' && <ChampsAnnonce v={valeurs.annonce} invalide={invalide} />}
        {p.children}
      </div>

      {etat?.erreur && <p className="squircle-xl mt-5 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <Link href={chemin(p.retour)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-fg-2 hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> Retour
        </Link>
        <span className="flex-1" />
        {!p.enLigne && (p.etape !== 'cabinet' || p.offre) && (
          <button type="submit" name="intention" value="brouillon" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60">
            Enregistrer et quitter
          </button>
        )}
        {p.etape === 'publication' ? (
          p.enLigne ? (
            <button type="submit" name="intention" value="publier" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
              {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />} Terminer
            </button>
          ) : (
            <button
              type="submit"
              name="intention"
              value="publier"
              disabled={enCours || !p.peutPublier}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enCours ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />} Publier l’offre
            </button>
          )
        ) : (
          <button type="submit" name="intention" value="suivant" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
            {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {p.enLigne ? 'Enregistrer et continuer' : 'Continuer'} <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </form>
  )
}

/** Les valeurs du formulaire, reprises de la saisie renvoyée avec une erreur. */
function avecSaisie(v: ValeursEtapes, s: Record<string, string | string[]>): ValeursEtapes {
  const t = (k: string, d: string) => (typeof s[k] === 'string' ? (s[k] as string) : d)
  const n = (k: string, d: number | null) => (typeof s[k] === 'string' && s[k] !== '' ? Number(s[k]) : s[k] === '' ? null : d)
  const avantages = Array.isArray(s.avantages) ? s.avantages : 'avantages' in s ? [] : null
  return {
    cabinet: { presentation: t('presentation', v.cabinet.presentation), avantages: avantages ?? v.cabinet.avantages, lieuId: t('lieu', v.cabinet.lieuId ?? '') || null },
    poste: {
      metier: t('metier', v.poste.metier) as CodeMetier,
      titre: t('titre', v.poste.titre),
      contrat: t('contrat', v.poste.contrat) as CodeContrat,
      tempsPlein: t('temps', v.poste.tempsPlein ? 'plein' : 'partiel') === 'plein',
      heuresHebdo: n('heures', v.poste.heuresHebdo),
      debut: t('debut', v.poste.debut ?? '') || null,
      fin: t('fin', v.poste.fin ?? '') || null,
      lieuId: t('lieu', v.poste.lieuId ?? '') || null,
    },
    remuneration: { min: n('min', v.remuneration.min), max: n('max', v.remuneration.max) },
    annonce: { presentation: t('presentation', v.annonce.presentation), missions: t('missions', v.annonce.missions), profil: t('profil', v.annonce.profil), avantages: avantages ?? v.annonce.avantages },
  }
}

function ChoixLieu({ lieux, defaut, invalide, vide }: { lieux: { id: string; libelle: string }[]; defaut: string | null; invalide: string; vide?: string }) {
  return (
    <span className={`squircle-xl flex items-center gap-2 border bg-bg px-3.5 ${invalide || 'border-line'}`}>
      <MapPin className="size-4 text-fg-2" aria-hidden />
      <select name="lieu" defaultValue={defaut ?? (vide ? '' : lieux[0]?.id)} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none">
        {vide && <option value="">{vide}</option>}
        {lieux.map((l) => (
          <option key={l.id} value={l.id}>
            {l.libelle}
          </option>
        ))}
      </select>
    </span>
  )
}

function Avantages({ choisis }: { choisis: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVANTAGES.map((a) => (
        <label key={a} className="squircle-full cursor-pointer border border-line px-3 py-1.5 text-sm text-fg has-[:checked]:border-teal has-[:checked]:bg-teal/10 has-[:checked]:text-teal">
          <input type="checkbox" name="avantages" value={a} defaultChecked={choisis.includes(a)} className="sr-only" />
          {a}
        </label>
      ))}
    </div>
  )
}

function ChampsCabinet({ v, lieux, invalide }: { v: ValeursEtapes['cabinet']; lieux: { id: string; libelle: string }[]; invalide: (c: string) => string }) {
  const [texte, setTexte] = useState(v.presentation)
  return (
    <>
      <label className="block">
        <span className={etiquette}>Présentation du cabinet</span>
        <textarea
          name="presentation"
          rows={6}
          maxLength={1200}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="L’équipe, les soins pratiqués, l’équipement, l’ambiance : ce qui donne envie de vous rejoindre."
          className={`${champ} resize-y ${invalide('presentation')}`}
        />
        <span className={`${aide} text-right`}>{texte.trim().length} / 1 200 caractères</span>
        <span className={aide}>Affichée dans la section « Le cabinet » de chaque offre. Sans elle, c’est la présentation de votre fiche qui s’affiche.</span>
      </label>
      <fieldset>
        <legend className={etiquette}>Avantages proposés</legend>
        <Avantages choisis={v.avantages} />
        <span className={aide}>Cochés d’office sur chaque nouvelle offre, modifiables offre par offre.</span>
      </fieldset>
      {lieux.length > 1 && (
        <label className="block">
          <span className={etiquette}>Lieu proposé par défaut</span>
          <ChoixLieu lieux={lieux} defaut={v.lieuId} invalide={invalide('lieu')} vide="Le lieu principal" />
        </label>
      )}
    </>
  )
}

function ChampsPoste({ v, lieux, invalide, enLigne }: { v: ValeursEtapes['poste']; lieux: { id: string; libelle: string }[]; invalide: (c: string) => string; enLigne: boolean }) {
  const [contrat, setContrat] = useState<CodeContrat>(v.contrat)
  const [tempsPlein, setTempsPlein] = useState(v.tempsPlein)
  const [metier, setMetier] = useState<CodeMetier>(v.metier)
  const [titre, setTitre] = useState(v.titre)
  const avecFin = contrat === 'cdd' || contrat === 'remplacement' || contrat === 'stage'
  const mode = modeDuContrat(v.contrat)
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={etiquette}>Poste</span>
          <select
            name="metier"
            value={metier}
            onChange={(e) => {
              const m = e.target.value as CodeMetier
              // L'intitulé suit le poste tant qu'il n'a pas été réécrit.
              if (titre === METIERS.find((x) => x.code === metier)?.nom) setTitre(METIERS.find((x) => x.code === m)?.nom ?? titre)
              setMetier(m)
            }}
            className={champ}
          >
            {METIERS.map((m) => (
              <option key={m.code} value={m.code}>
                {m.nom}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={etiquette}>Intitulé de l’offre</span>
          <input name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={120} required className={`${champ} ${invalide('titre')}`} />
        </label>
      </div>

      <fieldset>
        <legend className={etiquette}>Contrat</legend>
        <div className="flex flex-wrap gap-2">
          {CONTRATS.filter((c) => !enLigne || modeDuContrat(c) === mode).map((c) => (
            <label key={c} className={`squircle-full cursor-pointer border px-3.5 py-1.5 text-sm ${contrat === c ? 'border-teal bg-teal/10 font-medium text-teal' : 'border-line text-fg hover:border-line-strong'}`}>
              <input type="radio" name="contrat" value={c} checked={contrat === c} onChange={() => setContrat(c)} className="sr-only" />
              {LIBELLE_CONTRAT[c]}
            </label>
          ))}
        </div>
        {enLigne && <span className={aide}>Une offre en ligne garde sa famille de contrat.</span>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <fieldset>
          <legend className={etiquette}>Temps de travail</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['plein', 'Temps plein'],
                ['partiel', 'Temps partiel'],
              ] as const
            ).map(([t, l]) => (
              <label key={t} className={`squircle-full cursor-pointer border px-3.5 py-1.5 text-sm ${(t === 'plein') === tempsPlein ? 'border-teal bg-teal/10 font-medium text-teal' : 'border-line text-fg hover:border-line-strong'}`}>
                <input type="radio" name="temps" value={t} checked={(t === 'plein') === tempsPlein} onChange={() => setTempsPlein(t === 'plein')} className="sr-only" />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className={etiquette}>Heures par semaine</span>
          <input name="heures" type="number" min={1} max={48} defaultValue={v.heuresHebdo ?? ''} placeholder="Facultatif" className={champ} />
        </label>
      </div>

      <div className={`grid gap-4 ${avecFin ? 'sm:grid-cols-2' : ''}`}>
        <label className="block">
          <span className={etiquette}>Début</span>
          <input name="debut" type="date" defaultValue={v.debut ?? ''} className={champ} />
          <span className={aide}>Vide : dès que possible.</span>
        </label>
        {avecFin && (
          <label className="block">
            <span className={etiquette}>Fin</span>
            <input name="fin" type="date" defaultValue={v.fin ?? ''} className={champ} />
          </label>
        )}
      </div>

      <label className="block">
        <span className={etiquette}>Lieu</span>
        <ChoixLieu lieux={lieux} defaut={v.lieuId} invalide={invalide('lieu')} />
        <span className={aide}>Parmi vos lieux d’exercice.</span>
      </label>
    </>
  )
}

function ChampsRemuneration({ v, contrat, invalide }: { v: ValeursEtapes['remuneration']; contrat: CodeContrat; invalide: (c: string) => string }) {
  const pourcent = enPourcentage(contrat)
  const stage = modeDuContrat(contrat) === 'gratification'
  const Unite = pourcent ? Percent : Euro
  return (
    <div>
      <p className="mb-4 text-sm text-fg-2">
        {LIBELLE_CONTRAT[contrat]} :{' '}
        {pourcent ? `${contrat === 'remplacement' ? 'rétrocession' : 'redevance'} en pourcentage des honoraires.` : stage ? 'gratification mensuelle.' : 'salaire brut mensuel.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['min', 'max'] as const).map((c) => (
          <label key={c} className="block">
            <span className={etiquette}>{c === 'min' ? 'Fourchette basse' : 'Fourchette haute'}</span>
            <span className={`squircle-xl flex items-center gap-2 border bg-bg px-3.5 focus-within:border-line-strong ${invalide(c) || 'border-line'}`}>
              <input name={c} type="number" min={0} max={pourcent ? 100 : 20000} defaultValue={v[c] || ''} required={!stage} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none" />
              <Unite className="size-4 text-fg-2" aria-hidden />
            </span>
            <span className={aide}>{pourcent ? 'des honoraires' : stage ? 'Gratification par mois' : 'Brut mensuel'}</span>
          </label>
        ))}
      </div>
      <p className="squircle-xl mt-4 flex items-start gap-2 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
        <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
        {pourcent
          ? 'Obligatoire : la fourchette de rétrocession ou de redevance. Sans elle, l’offre n’est pas publiée.'
          : stage
            ? 'Gratification : laissez zéro pour un stage de deux mois au plus, la mention légale s’affiche.'
            : 'Obligatoire : une fourchette brute mensuelle. Sans elle, l’offre n’est pas publiée.'}
      </p>
    </div>
  )
}

function ChampsAnnonce({ v, invalide }: { v: ValeursEtapes['annonce']; invalide: (c: string) => string }) {
  const [presentation, setPresentation] = useState(v.presentation)
  return (
    <>
      <label className="block">
        <span className={etiquette}>Présentation du poste</span>
        <textarea
          name="presentation"
          rows={4}
          maxLength={700}
          value={presentation}
          onChange={(e) => setPresentation(e.target.value)}
          placeholder="Le poste en quelques phrases : le rôle, l’organisation, ce qui le rend intéressant."
          className={`${champ} resize-y ${invalide('presentation')}`}
        />
        <span className={`${aide} text-right ${presentation.trim().length < PRESENTATION_MIN ? '' : 'text-teal!'}`}>
          {presentation.trim().length} / 700 caractères, {PRESENTATION_MIN} au moins
        </span>
      </label>
      <label className="block">
        <span className={etiquette}>Missions</span>
        <textarea
          name="missions"
          rows={4}
          maxLength={800}
          defaultValue={v.missions}
          placeholder={'Une mission par ligne :\nAssistance au fauteuil\nStérilisation et hygiène\nAccueil des patients'}
          className={`${champ} resize-y ${invalide('missions')}`}
        />
        <span className={aide}>Une par ligne : la page de l’offre en fait une liste numérotée.</span>
      </label>
      <label className="block">
        <span className={etiquette}>Profil recherché</span>
        <textarea name="profil" rows={3} maxLength={800} defaultValue={v.profil} placeholder={'Un point par ligne :\nDiplôme d’assistant(e) dentaire\nDeux ans d’expérience\nSens du contact'} className={`${champ} resize-y`} />
        <span className={aide}>Un point par ligne. Facultatif.</span>
      </label>
      <fieldset>
        <legend className={etiquette}>Avantages</legend>
        <Avantages choisis={v.avantages} />
        <span className={aide}>Repris des informations du cabinet ; ajustez-les pour ce poste.</span>
      </fieldset>
    </>
  )
}
