import { EyeOff } from 'lucide-react'
import { initiales, nomCandidat } from '@/lib/emploi/candidature'
import { libelleQualification, mobilite, pucesCriteres } from '@/lib/emploi/profil-candidat'
import type { ProfilCandidat } from '@/lib/emploi/candidat-donnees'

/** Le nom tel qu'un recruteur le lit, selon la visibilité : « Camille M. », ou les initiales « C. M. ». */
export function nomVuParRecruteur(nom: string, visibilite: ProfilCandidat['visibilite']): string {
  if (visibilite === 'anonyme') return initiales(nom).split('').join('. ') + '.'
  return nomCandidat(nom, false)
}

/** « Ce que voient les recruteurs » : l'aperçu du profil, selon la visibilité choisie. */
export function ApercuCandidat({ p, nom, cadre = true }: { p: ProfilCandidat; nom: string; /** Sans cadre, quand l'aperçu est déjà dans un encart (fin du parcours de bienvenue). */ cadre?: boolean }) {
  const puces = pucesCriteres(p.criteres)
  return (
    <div className={cadre ? 'squircle-2xl border border-line p-5' : ''}>
      <h2 className="text-base font-semibold text-fg">Ce que voient les recruteurs</h2>
      {p.visibilite === 'discret' && <p className="squircle-xl mt-3 bg-bg-soft px-3.5 py-2.5 text-xs text-fg-2">Profil discret : seul le recruteur d’une offre à laquelle vous postulez le voit.</p>}
      <div className="squircle-xl mt-4 border border-line p-4">
        <div className="flex items-center gap-3">
          <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-bg-soft text-xs font-bold text-fg ring-1 ring-line">{initiales(nom)}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{nomVuParRecruteur(nom, p.visibilite)}</p>
            <p className="truncate text-xs text-fg-2">{libelleQualification(p)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-2">
          {[p.experiences.length ? `${p.experiences.length} expérience${p.experiences.length > 1 ? 's' : ''}` : null, mobilite(p.criteres)].filter(Boolean).join(' · ') || 'Complétez votre profil'}
        </p>
        {(puces.length > 0 || p.competences.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[...puces, ...p.competences.slice(0, 3)].map((t) => (
              <span key={t} className="squircle-full bg-bg-soft px-2 py-0.5 text-[11px] text-fg">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <ul className="mt-4 space-y-1.5 text-xs text-fg-2">
        {[p.visibilite === 'anonyme' ? 'Ni nom, ni photo : vos initiales seulement' : 'Ni nom complet, ni photo, ni adresse', 'Votre ville et un rayon, jamais votre adresse', 'Coordonnées seulement quand vous postulez'].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <EyeOff className="size-3.5 shrink-0" aria-hidden /> {t}
          </li>
        ))}
      </ul>
    </div>
  )
}
