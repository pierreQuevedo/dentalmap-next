import { PRESENTATION_MAX, PRESENTATION_MIN, type FicheCompletee } from './fiche-completee'
import { presentationValide, type Contexte, type Distinction, type Filtre, type Force, type Fraicheur, type Mission } from './force'
import { PIECES } from './labo'

/**
 * La force d'une fiche de laboratoire. Même principe que pour un soignant :
 * calculée à la volée, jamais stockée ; elle ordonne les listes de résultats
 * avant la distance (`src/lib/annuaire/remplissage.ts`).
 *
 * Barème : identité 30, savoir-faire 15 (trois techniques), matériaux 10,
 * délais 10, zone 10, réalisations 10, ANSM 10, présentation 5.
 */
const JOUR_MS = 86_400_000
const age = (date: string | null, maintenant: Date) => (date ? (maintenant.getTime() - new Date(date).getTime()) / JOUR_MS : Infinity)

export const delaisRenseignes = (f: FicheCompletee | null) => !!f?.delais && Object.keys(f.delais).length > 0
const zoneRenseignee = (f: FicheCompletee | null) => f?.rayonKm !== null && f?.rayonKm !== undefined

/** Délais : 10 points, 5 à reconfirmer (6 mois), 0 et masqués au-delà de 12 mois. */
function pointsDelais(f: FicheCompletee | null, maintenant: Date) {
  if (!f || !delaisRenseignes(f)) return { points: 0, aReconfirmer: false }
  const jours = age(f.delaisConfirmesLe ?? f.majLe, maintenant)
  if (jours >= 365) return { points: 0, aReconfirmer: true }
  if (jours >= 182) return { points: 5, aReconfirmer: true }
  return { points: 10, aReconfirmer: false }
}

export function calculerForceLabo(f: FicheCompletee | null, ctx: Contexte, maintenant = new Date()): Force {
  const d = pointsDelais(f, maintenant)
  const items = [
    { cle: 'identite', libelle: 'Identité vérifiée', points: ctx.identiteVerifiee ? 30 : 0, max: 30 },
    { cle: 'savoir_faire', libelle: 'Savoir-faire', points: (f?.techniques.length ?? 0) >= 3 ? 15 : 0, max: 15 },
    { cle: 'materiaux', libelle: 'Matériaux et CFAO', points: (f?.materiaux.length ?? 0) > 0 ? 10 : 0, max: 10 },
    { cle: 'delais', libelle: 'Délais par type de pièce', points: d.points, max: 10, aReconfirmer: d.aReconfirmer },
    { cle: 'zone', libelle: 'Zone desservie', points: zoneRenseignee(f) ? 10 : 0, max: 10 },
    { cle: 'realisations', libelle: 'Photos de réalisations', points: (f?.realisations.length ?? 0) > 0 ? 10 : 0, max: 10 },
    { cle: 'ansm', libelle: 'Déclaration ANSM', points: f?.ansmNumero ? 10 : 0, max: 10 },
    { cle: 'presentation', libelle: 'Présentation', points: presentationValide(f?.presentation ?? null) ? 5 : 0, max: 5 },
  ]
  return { total: items.reduce((s, i) => s + i.points, 0), items }
}

export function missionsLabo(f: FicheCompletee | null): Mission[] {
  return [
    { cle: 'savoir_faire', titre: 'Savoir-faire et matériaux', detail: 'Présence dans les filtres des cabinets', gain: 25, minutes: 2, faite: (f?.techniques.length ?? 0) >= 3 && (f?.materiaux.length ?? 0) > 0, href: '/espace-pro/laboratoire/onboarding/savoir-faire/' },
    { cle: 'delais', titre: 'Délais et zone desservie', detail: 'Délais moyens et rayon de passage', gain: 20, minutes: 2, faite: delaisRenseignes(f) && zoneRenseignee(f), href: '/espace-pro/laboratoire/onboarding/delais/' },
    { cle: 'realisations', titre: 'Publier vos réalisations', detail: 'Une à huit photos de pièces', gain: 10, minutes: 3, faite: (f?.realisations.length ?? 0) > 0, href: '/espace-pro/realisations/' },
    { cle: 'ansm', titre: 'Déclaration ANSM', detail: 'Numéro d’enregistrement de fabricant sur mesure', gain: 10, minutes: 2, faite: !!f?.ansmNumero, href: '/espace-pro/conformite/' },
    {
      cle: 'presentation',
      titre: 'Présentation du laboratoire',
      detail: `${PRESENTATION_MIN} à ${PRESENTATION_MAX} caractères`,
      gain: 5,
      minutes: 4,
      faite: presentationValide(f?.presentation ?? null),
      href: '/espace-pro/missions/presentation/',
    },
  ]
}

/** Les critères de recherche des cabinets que la fiche remplit déjà. */
export function filtresLabo(f: FicheCompletee | null, maintenant = new Date()): Filtre[] {
  const t = new Set(f?.techniques ?? [])
  const m = new Set(f?.materiaux ?? [])
  return [
    { libelle: 'Zircone', actif: m.has('zircone') },
    { libelle: 'Céramo-métal', actif: t.has('ceramo_metallique') },
    { libelle: 'Implantologie', actif: t.has('implantaire') },
    { libelle: 'Empreintes STL', actif: !!f?.empreintesStl || t.has('cfao') },
    { libelle: 'Ramassage', actif: !!f?.ramassage },
    { libelle: 'Délais affichés', actif: delaisRenseignes(f) && age(f?.delaisConfirmesLe ?? f?.majLe ?? null, maintenant) < 365 },
    { libelle: 'Amovible', actif: t.has('amovible') },
    { libelle: 'Galerie', actif: (f?.realisations.length ?? 0) > 0 },
    { libelle: 'Déclaré ANSM', actif: !!f?.ansmNumero },
  ]
}

const REGLES = {
  delais: { libelle: 'Délais de fabrication', validite: 182, rappel: 150, regle: 'Rappel à cinq mois, à reconfirmer à six, masqués à douze' },
  zone: { libelle: 'Zone et ramassage', validite: 365, rappel: 350, regle: 'Reconfirmation annuelle' },
  savoir_faire: { libelle: 'Savoir-faire', validite: 365, rappel: 350, regle: 'Reconfirmation annuelle' },
  realisations: { libelle: 'Réalisations', validite: 730, rappel: 715, regle: 'À renouveler tous les deux ans' },
} as const

export function fraicheurLabo(f: FicheCompletee | null, maintenant = new Date()): Fraicheur[] {
  if (!f) return []
  const blocs: [keyof typeof REGLES, boolean, string | null][] = [
    ['delais', delaisRenseignes(f), f.delaisConfirmesLe],
    ['zone', zoneRenseignee(f), f.zoneConfirmeeLe],
    ['savoir_faire', f.techniques.length > 0 || f.materiaux.length > 0, f.savoirFaireConfirmeLe],
    ['realisations', f.realisations.length > 0, f.realisationsConfirmeesLe],
  ]
  return blocs
    .filter(([, ok]) => ok)
    .map(([cle, , le]) => {
      const r = REGLES[cle]
      const confirmeLe = le ?? f.majLe
      const jours = Math.max(0, Math.floor(age(confirmeLe, maintenant)))
      const etat = cle === 'delais' && jours >= 365 ? 'expire' : jours >= r.validite ? 'a_reconfirmer' : jours >= r.rappel ? 'rappel' : 'a_jour'
      return { cle, libelle: r.libelle, confirmeLe, jours, validite: r.validite, part: Math.min(1, jours / r.validite), etat, regle: r.regle } as Fraicheur
    })
}

export function distinctionsLabo(f: FicheCompletee | null, ctx: Contexte, force: Force, maintenant = new Date()): Distinction[] {
  return [
    { code: 'fiche_verifiee', titre: 'Fiche vérifiée', condition: 'Identité confirmée', obtenue: ctx.identiteVerifiee },
    { code: 'labo_verifie', titre: 'Labo vérifié', condition: 'Kbis validé par l’équipe', obtenue: ctx.identiteVerifiee },
    { code: 'savoir_faire', titre: 'Savoir-faire', condition: 'Trois techniques et des matériaux', obtenue: (f?.techniques.length ?? 0) >= 3 && (f?.materiaux.length ?? 0) > 0 },
    { code: 'declare_ansm', titre: 'Déclaré ANSM', condition: 'Numéro d’enregistrement renseigné', obtenue: !!f?.ansmNumero },
    { code: 'delais_a_jour', titre: 'Délais à jour', condition: 'Délais confirmés depuis moins de six mois', obtenue: delaisRenseignes(f) && age(f?.delaisConfirmesLe ?? f?.majLe ?? null, maintenant) < 182 },
    { code: 'fiche_exemplaire', titre: 'Fiche exemplaire', condition: 'Palier à 90 %', obtenue: force.total >= 90 },
  ]
}

/** « Couronne 5 j · bridge 8 j » : les deux premiers délais, pour les résumés. */
export function resumeDelais(f: FicheCompletee | null): string | null {
  if (!delaisRenseignes(f)) return null
  return Object.entries(f!.delais!)
    .slice(0, 2)
    .map(([c, j]) => `${(PIECES.find((p) => p.code === c)?.libelle ?? c).split(' ')[0]} ${j} j`)
    .join(' · ')
}
