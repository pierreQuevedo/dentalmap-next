'use client'

import { useActionState, useState } from 'react'
import { Check, Plus, Send, Trash2 } from 'lucide-react'
import { proposerFormation, type EtatProposition } from '@/lib/formation/actions-privee'
import { EN_LIGNE, FORMATS_FORMATION, PRISES_EN_CHARGE, PUBLICS_FORMATION, REGIONS_FORMATION } from '@/lib/formation/privee'
import { THEMES_FORMATION } from '@/lib/formation/themes'

/**
 * A : proposer une formation privée. Le formulaire tient tout dans son état
 * et l'envoie en JSON ; une erreur de l'action revient ici sans rien perdre.
 * Champs d’après la fiche publique (`src/components/formation/fiche-formation-privee.tsx`).
 */
type Session = { dates: string; debut: string; region: string; ville: string; places: string }
type Etape = { titre: string; detail: string; duree: string }

const champ = 'squircle-lg h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'
const libelle = 'mb-1 block text-xs font-medium text-fg'
const puce = 'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg'

function Bloc({ titre, aide, children }: { titre: string; aide?: string; children: React.ReactNode }) {
  return (
    <section className="squircle-2xl border border-line bg-bg p-5">
      <h2 className="text-sm font-semibold text-fg">{titre}</h2>
      {aide && <p className="mt-0.5 text-xs text-fg-2">{aide}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  )
}

export function SaisieFormationPrivee({ organismeParDefaut }: { organismeParDefaut?: string }) {
  const [etat, envoyer, enCours] = useActionState<EtatProposition, FormData>(proposerFormation, null)
  const [organisme, setOrganisme] = useState(organismeParDefaut ?? '')
  const [siren, setSiren] = useState('')
  const [intitule, setIntitule] = useState('')
  const [theme, setTheme] = useState('')
  const [resume, setResume] = useState('')
  const [publics, setPublics] = useState<string[]>([])
  const [format, setFormat] = useState('')
  const [duree, setDuree] = useState('')
  const [sessions, setSessions] = useState<Session[]>([{ dates: '', debut: '', region: '', ville: '', places: '' }])
  const [programme, setProgramme] = useState<Etape[]>([])
  const [prerequis, setPrerequis] = useState<string[]>([])
  const [tarif, setTarif] = useState('')
  const [prises, setPrises] = useState<string[]>([])
  const [lien, setLien] = useState('')
  const [site, setSite] = useState('')

  const basculer = (liste: string[], v: string) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v])
  const majSession = (i: number, p: Partial<Session>) => setSessions((s) => s.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const majEtape = (i: number, p: Partial<Etape>) => setProgramme((s) => s.map((x, k) => (k === i ? { ...x, ...p } : x)))

  const json = JSON.stringify({
    organisme,
    siren,
    intitule,
    theme,
    resume,
    publics,
    format,
    duree,
    sessions: sessions.map((s) => ({ dates: s.dates, debut: s.debut, region: s.region, ville: s.region === EN_LIGNE ? '' : s.ville, places: s.places ? Number(s.places) : null })),
    programme: programme.filter((e) => e.titre.trim()),
    prerequis: prerequis.filter((p) => p.trim()),
    tarif,
    priseEnCharge: prises,
    lienInscription: lien,
    siteOrganisme: site,
  })

  return (
    <form action={envoyer} className="space-y-4">
      <input type="hidden" name="proposition" value={json} />

      <Bloc titre="L’organisme" aide="Le SIREN est facultatif ; s’il est donné, nous le contrôlons au répertoire Sirene.">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div>
            <label htmlFor="fp-organisme" className={libelle}>Nom de l’organisme</label>
            <input id="fp-organisme" value={organisme} onChange={(e) => setOrganisme(e.target.value)} required maxLength={160} placeholder="Atelier Implanto Formation" className={champ} />
          </div>
          <div>
            <label htmlFor="fp-siren" className={libelle}>SIREN (facultatif)</label>
            <input id="fp-siren" value={siren} onChange={(e) => setSiren(e.target.value)} inputMode="numeric" maxLength={11} placeholder="812 345 678" className={`${champ} font-mono`} />
          </div>
        </div>
        <div>
          <label htmlFor="fp-site" className={libelle}>Site de l’organisme (facultatif)</label>
          <input id="fp-site" type="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://organisme.fr" className={champ} />
        </div>
      </Bloc>

      <Bloc titre="La formation">
        <div>
          <label htmlFor="fp-intitule" className={libelle}>Intitulé</label>
          <input id="fp-intitule" value={intitule} onChange={(e) => setIntitule(e.target.value)} required maxLength={160} placeholder="Implantologie : de la planification à la pose guidée" className={champ} />
        </div>
        <fieldset>
          <legend className={libelle}>Thème</legend>
          <div className="flex flex-wrap gap-2">
            {THEMES_FORMATION.map((t) => (
              <label key={t} className={puce}>
                <input type="radio" name="fp-theme" value={t} checked={theme === t} onChange={() => setTheme(t)} className="sr-only" />
                {theme === t && <Check className="size-3.5" aria-hidden />}
                {t}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="fp-resume" className={libelle}>En quelques mots (facultatif)</label>
          <textarea id="fp-resume" value={resume} onChange={(e) => setResume(e.target.value)} rows={3} maxLength={400} className={`${champ} h-auto py-2`} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <fieldset>
            <legend className={libelle}>Public</legend>
            <div className="flex flex-wrap gap-2">
              {PUBLICS_FORMATION.map((p) => (
                <label key={p} className={puce}>
                  <input type="checkbox" checked={publics.includes(p)} onChange={() => setPublics((x) => basculer(x, p))} className="sr-only" />
                  {publics.includes(p) && <Check className="size-3.5" aria-hidden />}
                  {p}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className={libelle}>Format</legend>
            <div className="flex flex-wrap gap-2">
              {FORMATS_FORMATION.map((f) => (
                <label key={f} className={puce}>
                  <input type="radio" name="fp-format" checked={format === f} onChange={() => setFormat(f)} className="sr-only" />
                  {format === f && <Check className="size-3.5" aria-hidden />}
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="fp-duree" className={libelle}>Durée</label>
            <input id="fp-duree" value={duree} onChange={(e) => setDuree(e.target.value)} required maxLength={60} placeholder="4 jours, 7 heures…" className={champ} />
          </div>
          <div>
            <label htmlFor="fp-tarif" className={libelle}>Tarif indiqué par l’organisme (facultatif)</label>
            <input id="fp-tarif" value={tarif} onChange={(e) => setTarif(e.target.value)} maxLength={60} placeholder="2 400 €" className={champ} />
          </div>
        </div>
      </Bloc>

      <Bloc titre="Sessions" aide="Une ligne par session. « En ligne » vaut pour toutes les régions dans les alertes des praticiens.">
        {sessions.map((s, i) => (
          <div key={i} className="squircle-xl grid gap-3 border border-line p-3 sm:grid-cols-[minmax(0,1.4fr)_9.5rem_minmax(0,1fr)] sm:items-end">
            <div>
              <label htmlFor={`fp-s${i}-dates`} className={libelle}>Dates</label>
              <input id={`fp-s${i}-dates`} value={s.dates} onChange={(e) => majSession(i, { dates: e.target.value })} required maxLength={80} placeholder="14 et 15 novembre 2026" className={champ} />
            </div>
            <div>
              <label htmlFor={`fp-s${i}-debut`} className={libelle}>Premier jour</label>
              <input id={`fp-s${i}-debut`} type="date" value={s.debut} onChange={(e) => majSession(i, { debut: e.target.value })} required className={champ} />
            </div>
            <div>
              <label htmlFor={`fp-s${i}-region`} className={libelle}>Région</label>
              <select id={`fp-s${i}-region`} value={s.region} onChange={(e) => majSession(i, { region: e.target.value })} required className={champ}>
                <option value="">Choisir</option>
                <option value={EN_LIGNE}>En ligne</option>
                {REGIONS_FORMATION.map((r) => (
                  <option key={r.code} value={r.code}>{r.nom}</option>
                ))}
              </select>
            </div>
            {s.region !== EN_LIGNE && (
              <div>
                <label htmlFor={`fp-s${i}-ville`} className={libelle}>Ville</label>
                <input id={`fp-s${i}-ville`} value={s.ville} onChange={(e) => majSession(i, { ville: e.target.value })} maxLength={80} placeholder="Bordeaux" className={champ} />
              </div>
            )}
            <div>
              <label htmlFor={`fp-s${i}-places`} className={libelle}>Places (facultatif)</label>
              <input id={`fp-s${i}-places`} type="number" min={1} max={500} value={s.places} onChange={(e) => majSession(i, { places: e.target.value })} className={champ} />
            </div>
            {sessions.length > 1 && (
              <button type="button" onClick={() => setSessions((x) => x.filter((_, k) => k !== i))} className="inline-flex h-10 cursor-pointer items-center gap-1.5 justify-self-start rounded-full px-3 text-xs font-medium text-fg-2 hover:text-destructive">
                <Trash2 className="size-3.5" aria-hidden /> Retirer
              </button>
            )}
          </div>
        ))}
        {sessions.length < 12 && (
          <button type="button" onClick={() => setSessions((x) => [...x, { dates: '', debut: '', region: '', ville: '', places: '' }])} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong">
            <Plus className="size-4" aria-hidden /> Ajouter une session
          </button>
        )}
      </Bloc>

      <Bloc titre="Programme et prérequis" aide="Facultatifs, mais ils aident les praticiens à choisir.">
        {programme.map((e, i) => (
          <div key={i} className="squircle-xl grid gap-3 border border-line p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_8rem_auto] sm:items-end">
            <div>
              <label htmlFor={`fp-p${i}-titre`} className={libelle}>Étape {i + 1}</label>
              <input id={`fp-p${i}-titre`} value={e.titre} onChange={(ev) => majEtape(i, { titre: ev.target.value })} maxLength={100} placeholder="Planification" className={champ} />
            </div>
            <div>
              <label htmlFor={`fp-p${i}-detail`} className={libelle}>Contenu</label>
              <input id={`fp-p${i}-detail`} value={e.detail} onChange={(ev) => majEtape(i, { detail: ev.target.value })} maxLength={300} className={champ} />
            </div>
            <div>
              <label htmlFor={`fp-p${i}-duree`} className={libelle}>Quand</label>
              <input id={`fp-p${i}-duree`} value={e.duree} onChange={(ev) => majEtape(i, { duree: ev.target.value })} maxLength={40} placeholder="Jour 1" className={champ} />
            </div>
            <button type="button" aria-label={`Retirer l’étape ${i + 1}`} onClick={() => setProgramme((x) => x.filter((_, k) => k !== i))} className="grid size-10 cursor-pointer place-items-center rounded-full text-fg-2 hover:text-destructive">
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        {programme.length < 12 && (
          <button type="button" onClick={() => setProgramme((x) => [...x, { titre: '', detail: '', duree: '' }])} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong">
            <Plus className="size-4" aria-hidden /> Ajouter une étape
          </button>
        )}
        <div className="space-y-2 pt-2">
          <p className={libelle}>Prérequis</p>
          {prerequis.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input value={p} onChange={(e) => setPrerequis((x) => x.map((y, k) => (k === i ? e.target.value : y)))} maxLength={160} aria-label={`Prérequis ${i + 1}`} className={champ} />
              <button type="button" aria-label={`Retirer le prérequis ${i + 1}`} onClick={() => setPrerequis((x) => x.filter((_, k) => k !== i))} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-fg-2 hover:text-destructive">
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          {prerequis.length < 8 && (
            <button type="button" onClick={() => setPrerequis((x) => [...x, ''])} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong">
              <Plus className="size-4" aria-hidden /> Ajouter un prérequis
            </button>
          )}
        </div>
      </Bloc>

      <Bloc titre="Prise en charge et inscription" aide="Chaque mention s’affiche « déclarée par l’organisme » jusqu’à ce que l’équipe la vérifie à sa source.">
        <fieldset>
          <legend className={libelle}>Prise en charge déclarée</legend>
          <div className="flex flex-wrap gap-2">
            {PRISES_EN_CHARGE.map((p) => (
              <label key={p} className={puce}>
                <input type="checkbox" checked={prises.includes(p)} onChange={() => setPrises((x) => basculer(x, p))} className="sr-only" />
                {prises.includes(p) && <Check className="size-3.5" aria-hidden />}
                {p}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="fp-lien" className={libelle}>Lien d’inscription</label>
          <input id="fp-lien" type="url" value={lien} onChange={(e) => setLien(e.target.value)} required placeholder="https://organisme.fr/inscription" className={champ} />
        </div>
      </Bloc>

      {etat?.erreur && (
        <p role="alert" className="squircle-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-fg-2">Rien n’est publié avant la vérification de l’équipe. Vous recevez un email à chaque étape.</p>
        <button type="submit" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
          <Send className="size-4" aria-hidden /> {enCours ? 'Envoi…' : 'Envoyer la proposition'}
        </button>
      </div>
    </form>
  )
}
