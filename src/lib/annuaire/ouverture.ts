import { JOURS, type Horaires, type Jour } from '@/db/schema'

/**
 * Horaires déclarés par le cabinet, mis en mots pour la fiche publique.
 *
 * Fonctions pures : l'instant est toujours passé en argument, lu à la requête
 * par l'appelant, jamais au prérendu. L'heure est celle de Paris, quel que
 * soit le fuseau du serveur : un cabinet ouvre à 9 h heure locale.
 */

const FUSEAU = 'Europe/Paris'

/** Le jour et l'heure (`HH:MM`) d'un instant, à Paris. */
export function momentParis(instant: Date): { jour: Jour; heure: string } {
  const parties = new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const val = (t: string) => parties.find((p) => p.type === t)?.value ?? ''
  return { jour: val('weekday').toLowerCase() as Jour, heure: `${val('hour')}:${val('minute')}` }
}

/** « 08:30 » devient « 8h30 », « 14:00 » devient « 14h00 » : l'écriture des grilles d'horaires. */
export function heureCourte(hhmm: string): string {
  const [h, m] = hhmm.split(':')
  return `${Number(h)}h${m}`
}

/** « 19:00 » devient « 19 h », « 12:30 » devient « 12 h 30 » : l'écriture d'une phrase. */
export function heureEnMots(hhmm: string): string {
  const [h, m] = hhmm.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}

/** Les plages d'un jour, « 8h30 à 12h30 », dans l'ordre déclaré. */
export function plagesDuJour(horaires: Horaires, jour: Jour): string[] {
  return (horaires[jour] ?? []).map((p) => `${heureCourte(p.debut)} à ${heureCourte(p.fin)}`)
}

export function aDesHoraires(horaires: Horaires | null): horaires is Horaires {
  return horaires ? JOURS.some((j) => (horaires[j]?.length ?? 0) > 0) : false
}

export type Ouverture = { ouvert: boolean; texte: string; detail: string }

/**
 * « Ouvert · ferme à 19 h », « Fermé · ouvre à 14 h », « Fermé · ouvre lundi à 9 h ».
 * Nul quand aucune plage n'est déclarée : on ne dit rien plutôt que « fermé ».
 */
export function ouverture(horaires: Horaires | null, instant: Date): Ouverture | null {
  if (!aDesHoraires(horaires)) return null
  const { jour, heure } = momentParis(instant)
  const aujourdhui = horaires[jour] ?? []
  const enCours = aujourdhui.find((p) => p.debut <= heure && heure < p.fin)
  if (enCours) return { ouvert: true, texte: 'Ouvert', detail: `ferme à ${heureEnMots(enCours.fin)}` }
  const plusTard = aujourdhui.find((p) => p.debut > heure)
  if (plusTard) return { ouvert: false, texte: 'Fermé', detail: `ouvre à ${heureEnMots(plusTard.debut)}` }
  const i = JOURS.indexOf(jour)
  for (let k = 1; k <= 7; k++) {
    const j = JOURS[(i + k) % 7]
    const premiere = horaires[j]?.[0]
    if (premiere) {
      const quand = k === 1 ? 'demain' : j
      return { ouvert: false, texte: 'Fermé', detail: `ouvre ${quand} à ${heureEnMots(premiere.debut)}` }
    }
  }
  return null
}
