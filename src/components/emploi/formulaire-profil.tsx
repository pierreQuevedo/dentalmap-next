'use client'

import { useActionState, useState, useTransition } from 'react'
import { Briefcase, FileText, GraduationCap, Loader2, Navigation, Plus, ShieldCheck, Trash2, Wrench } from 'lucide-react'
import { enregistrerProfil, type EtatProfil } from '@/lib/emploi/actions-candidat'
import { COMPETENCES, EXPERIENCES_MAX, QUALIFICATIONS, SITUATIONS, libelleChoixQualification, type Criteres, type Experience, type Formation, type Situation } from '@/lib/emploi/profil-candidat'
import { ChampsFormation, ChampsRecherche, Puce, aide, champ, etiquette } from './champs-candidat'

type Props = {
  situation: Situation
  qualification: string | null
  criteres: Criteres
  formation: Formation | null
  experiences: Experience[]
  competences: string[]
  cv: { nom: string; taille: string; url: string } | null
  ecoles: { slug: string; nom: string }[]
}

function Bloc({ i: I, titre, id, droite, children }: { i: typeof Briefcase; titre: string; id?: string; droite?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="squircle-2xl scroll-mt-24 border border-line p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <I className="size-4 text-fg-2" aria-hidden /> {titre}
        </h2>
        {droite}
      </div>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

/** CAND-PROFIL : tout le profil dans un formulaire, un seul « Enregistrer ». */
export function FormulaireProfil(p: Props) {
  const [etat, action, enCours] = useActionState<EtatProfil, FormData>(enregistrerProfil, null)
  const [, demarrer] = useTransition()
  const [situation, setSituation] = useState<Situation>(p.situation)
  const [experiences, setExperiences] = useState<Experience[]>(p.experiences.length ? p.experiences : [{ poste: '', structure: '', periode: '' }])
  const [cv, setCv] = useState<string | null>(null)
  const [retirerCv, setRetirerCv] = useState(false)
  const invalide = (k: string) => etat?.champ === k
  const etudiant = situation === 'etudiant'

  return (
    <form
      // Envoi à la main : sur une erreur, le formulaire garde la saisie au lieu de revenir aux valeurs enregistrées.
      onSubmit={(e) => {
        e.preventDefault()
        const donnees = new FormData(e.currentTarget)
        demarrer(() => action(donnees))
      }}
      className="space-y-4"
    >
      <Bloc i={ShieldCheck} titre={etudiant ? 'Situation' : 'Situation et qualification'}>
        <label className="block">
          <span className={etiquette}>Situation</span>
          <select name="situation" value={situation} onChange={(e) => setSituation(e.target.value as Situation)} className={champ}>
            {SITUATIONS.map((s) => (
              <option key={s.cle} value={s.cle}>
                {s.libelle}
              </option>
            ))}
          </select>
        </label>
        {!etudiant && (
          <fieldset>
            <legend className={etiquette}>Qualification</legend>
            <div className="flex flex-wrap gap-2">
              {QUALIFICATIONS.map((q) => (
                <Puce key={q} type="radio" name="qualification" value={q} coche={(p.qualification ?? 'titre') === q}>
                  {libelleChoixQualification(situation, q)}
                </Puce>
              ))}
            </div>
            <span className={aide}>Badge « Titre vérifié » par vérification automatique du titre : bientôt.</span>
          </fieldset>
        )}
      </Bloc>

      {etudiant && (
        <Bloc i={GraduationCap} titre="Ma formation" id="formation">
          <ChampsFormation f={p.formation} ecoles={p.ecoles} />
        </Bloc>
      )}

      <Bloc
        i={Briefcase}
        titre={etudiant ? 'Parcours' : 'Expériences'}
        droite={
          experiences.length < EXPERIENCES_MAX && (
            <button type="button" onClick={() => setExperiences([...experiences, { poste: '', structure: '', periode: '' }])} className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-fg hover:underline">
              <Plus className="size-4" aria-hidden /> Ajouter
            </button>
          )
        }
      >
        <ul className="space-y-3">
          {experiences.map((x, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_9rem_auto] sm:items-center">
              <input name="poste" defaultValue={x.poste} maxLength={80} aria-label="Poste" placeholder={etudiant ? 'Diplôme ou stage' : 'Poste'} className={champ} />
              <input name="structure" defaultValue={x.structure} maxLength={120} aria-label="Structure" placeholder="Cabinet, laboratoire, lycée, ville" className={champ} />
              <input name="periode" defaultValue={x.periode} maxLength={60} aria-label="Période" placeholder="2021 à aujourd’hui" className={champ} />
              <button
                type="button"
                aria-label="Retirer"
                onClick={() => setExperiences(experiences.filter((_, j) => j !== i))}
                className="grid size-10 cursor-pointer place-items-center justify-self-end rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <span className={aide}>Cinq au plus, les plus récentes d’abord. Le nom des structures n’est montré qu’au recruteur auquel vous postulez.</span>
      </Bloc>

      <Bloc i={Wrench} titre="Compétences">
        <div className="flex flex-wrap gap-2">
          {COMPETENCES[situation].map((c) => (
            <Puce key={`${situation}-${c}`} name="competences" value={c} coche={p.competences.includes(c)}>
              {c}
            </Puce>
          ))}
        </div>
      </Bloc>

      <Bloc i={Navigation} titre="Ce que vous cherchez">
        <ChampsRecherche c={p.criteres} invalide={invalide} etudiant={etudiant} />
      </Bloc>

      <Bloc i={FileText} titre="CV" droite={<span className="text-xs text-fg-2">Facultatif</span>}>
        {p.cv && !retirerCv && !cv && (
          <div className="squircle-xl flex items-center gap-3 border border-line p-3">
            <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300">
              <FileText className="size-5" aria-hidden />
            </span>
            <a href={p.cv.url} target="_blank" rel="noopener" className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-fg hover:underline">{p.cv.nom}</span>
              <span className="block text-xs text-fg-2">PDF{p.cv.taille ? ` · ${p.cv.taille}` : ''} · joint d’office à vos candidatures</span>
            </a>
            <button type="button" onClick={() => setRetirerCv(true)} className="cursor-pointer text-sm font-medium text-fg-2 hover:text-fg">
              Retirer
            </button>
          </div>
        )}
        {retirerCv && <input type="hidden" name="cvRetirer" value="oui" />}
        <label className={`squircle-xl flex cursor-pointer items-center gap-3 border border-dashed p-4 hover:border-line-strong ${invalide('cv') ? 'border-destructive' : 'border-line'}`}>
          <span className="min-w-0 flex-1 text-sm text-fg">{cv ?? (p.cv && !retirerCv ? 'Remplacer par un autre PDF' : 'Déposer un CV au format PDF, 5 Mo au plus')}</span>
          <input type="file" name="cv" accept="application/pdf" className="sr-only" onChange={(e) => setCv(e.target.files?.[0]?.name ?? null)} />
        </label>
      </Bloc>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3">
        {etat?.erreur && <p className="squircle-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
        <button type="submit" disabled={enCours} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground shadow-pop hover:bg-action-hover disabled:opacity-60">
          {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />} Enregistrer
        </button>
      </div>
    </form>
  )
}
