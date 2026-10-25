import { formaterNom } from '@/lib/annuaire/nom'
import type { Espace } from './espace'
import { reussitesDuParrain } from './parrainage-donnees'
import { BAREME, OU_GAGNER, type CleGain, type Points } from './progression'

/**
 * Ce qui rapporte encore des points, et ce qui en a rapporté : partagé par la
 * vue d'ensemble et la page Progression, pour qu'elles disent la même chose.
 */

export type Action = { cle: string; source: CleGain; titre: string; detail: string; points: number; minutes: number | null; href: string }
export type Acquis = { cle: string; titre: string; href: string }
export type EvenementHistorique = { texte: string; le: string; points: number; source: CleGain | 'identite' | 'publication' }

/** Une adresse de l'espace avec la fiche courante (`q`), ancre comprise. */
export function avecFiche(h: string, q: string): string {
  const [base, ancre] = h.split('#')
  return `${base}${q}${ancre ? `#${ancre}` : ''}`
}

/** À faire : les missions de la fiche (un point par pour cent) et les actions de diffusion pas encore acquises, du plus rentable au plus rapide. */
export function actionsAFaire(espace: Espace, points: Points, q: string): { aFaire: Action[]; acquis: Acquis[] } {
  const missions: Action[] = espace.missions
    .filter((m) => !m.faite)
    .map((m) => ({ cle: m.cle, source: 'fiche', titre: m.titre, detail: m.detail, points: m.gain, minutes: m.minutes, href: `${m.href}${q}` }))
  // Faire connaître la fiche n'a de sens qu'une fois publiée : avant la vérification, la fiche d'abord.
  const diffusion: Action[] = BAREME.filter((b) => points.verifiee && b.cle !== 'fiche' && points.detail[b.cle] < b.max).map((b) => ({
    cle: b.cle,
    source: b.cle,
    titre: b.libelle,
    detail: b.detail,
    points: b.cle === 'parrainage' ? 25 : b.max - points.detail[b.cle],
    minutes: null,
    href: avecFiche(OU_GAGNER[b.cle], q),
  }))
  const aFaire = [...missions, ...diffusion].sort((a, b) => b.points - a.points || (a.minutes ?? 99) - (b.minutes ?? 99))
  const acquis = [
    ...espace.missions.filter((m) => m.faite).map((m) => ({ cle: m.cle, titre: m.titre, href: `${m.href}${m.href.includes('?') ? '&' : '?'}suite=${encodeURIComponent(`/espace-pro/progression/${q}`)}${q ? `&${q.slice(1)}` : ''}` })),
    ...BAREME.filter((b) => b.cle !== 'fiche' && points.detail[b.cle] >= b.max).map((b) => ({ cle: b.cle, titre: b.libelle, href: avecFiche(OU_GAGNER[b.cle], q) })),
  ]
  return { aFaire, acquis }
}

/** L'historique des gains, d'après les dates connues de la fiche et les parrainages réussis. */
export async function historiqueDe(espace: Espace, limite = 8): Promise<EvenementHistorique[]> {
  const { fiche, completee } = espace
  const reussites = await reussitesDuParrain(fiche.id)
  const evenements = [
    fiche.demande?.statut === 'acceptee' && fiche.demande.traiteLe && { texte: 'Identité vérifiée', le: fiche.demande.traiteLe, points: 30, source: 'identite' as const },
    // Terminée avant l'accord, la fiche est prête mais pas encore en ligne.
    completee?.publieeLe && { texte: espace.ctx.identiteVerifiee ? 'Fiche publiée' : 'Fiche prête, en attente de vérification', le: completee.publieeLe, points: 0, source: 'publication' as const },
    completee?.lienGoogleLe && { texte: 'Lien vérifié sur votre fiche Google', le: completee.lienGoogleLe, points: 20, source: 'google' as const },
    completee?.photoUrl && completee.photoConfirmeeLe && { texte: 'Photo de profil ajoutée', le: completee.photoConfirmeeLe, points: 12, source: 'fiche' as const },
    completee?.presentation && completee.presentationConfirmeeLe && { texte: 'Présentation rédigée', le: completee.presentationConfirmeeLe, points: 10, source: 'fiche' as const },
    ...reussites.map((r, i) => ({ texte: `Parrainage réussi : ${['Dr', formaterNom(r.prenom), formaterNom(r.nom)].filter(Boolean).join(' ')}`, le: r.le, points: i < 3 ? 25 : 0, source: 'parrainage' as const })),
  ]
  return (evenements.filter(Boolean) as EvenementHistorique[]).sort((a, b) => +new Date(b.le) - +new Date(a.le)).slice(0, limite)
}
