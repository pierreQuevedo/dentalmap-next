import { describe, expect, it } from 'vitest'
import { anneeDe, nommerSource, rangerSources } from '@/lib/espace-pro/sources-etablissement'

const BORDEAUX = [
  'https://sante.u-bordeaux.fr/college-sante/nos-composantes/ufr-sciences-odontologiques',
  'https://www.u-bordeaux.fr/universite/organisation-et-fonctionnement/composantes-de-formation/college-sciences-sante/ufr-odontologie',
  'https://sante.u-bordeaux.fr/scolarite-demarches-administratives/contact/sciences-odontologiques',
  'https://sante.u-bordeaux.fr/application/files/6617/3934/8215/Capacites_daccueil_2025-26_MMOP.pdf',
  'https://sante.u-bordeaux.fr/application/files/4417/7444/3955/Capacites_daccueil_MMOP_2026_27.pdf',
  'https://www.chu-bordeaux.fr/Les-p%C3%B4les/P%C3%B4le-m%C3%A9decine-et-chirurgie-bucco-dentaire/',
  'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053934830',
]

describe('nommerSource', () => {
  it('nomme chaque source de Bordeaux', () => {
    expect(BORDEAUX.map((u) => nommerSource(u).libelle)).toEqual([
      'Page de la faculté',
      'La faculté sur le site de l’université',
      'Contact de la scolarité',
      'Capacités d’accueil 2025-2026',
      'Capacités d’accueil 2026-2027',
      'Service hospitalier du CHU',
      'Texte au Journal officiel',
    ])
    expect(nommerSource(BORDEAUX[4]!).nature).toBe('pdf')
    expect(nommerSource(BORDEAUX[5]!).domaine).toBe('chu-bordeaux.fr')
  })
  it('la racine d’un site, la presse, l’ARS, le numerus apertus', () => {
    expect(nommerSource('https://odonto.univ-rennes.fr/').libelle).toBe('Site de la faculté')
    expect(nommerSource('https://www.information-dentaire.fr/actualites/caen/').rubrique).toBe('Actualités')
    expect(nommerSource('https://www.bourgogne-franche-comte.ars.sante.fr/une-faculte').libelle).toBe('Communiqué de l’agence régionale de santé')
    expect(nommerSource('https://acces-sante.univ-rennes.fr/files/Numerus%20Apertus%202026-2027%20-%20vote%20CA%20171224.pdf').libelle).toBe('Numerus apertus 2026-2027')
  })
})

describe('rangerSources', () => {
  it('par rubrique, l’année récente d’abord, sans doublon', () => {
    const r = rangerSources([...BORDEAUX, BORDEAUX[0]!])
    expect(r.map((g) => g.rubrique)).toEqual(['L’établissement', 'Accès et places', 'Soins', 'Textes officiels'])
    expect(r[0]!.sources).toHaveLength(3)
    expect(r[1]!.sources.map((s) => s.libelle)).toEqual(['Capacités d’accueil 2026-2027', 'Capacités d’accueil 2025-2026'])
  })
})

describe('anneeDe', () => {
  it('période, plan pluriannuel, dossier de dépôt ignoré', () => {
    expect(anneeDe('x/Capacites_MMOP_2026_27.pdf')).toBe('2026-2027')
    expect(anneeDe('x/capacites-accueil-sante-2022-2026_urca_ca_6.12.2022.pdf')).toBe('2022-2026')
    expect(anneeDe('x/wp-content/uploads/sites/29/2025/10/Capacite-MMOP-2026.pdf')).toBe('2026')
    expect(anneeDe('x/passerelles')).toBeNull()
  })
})
