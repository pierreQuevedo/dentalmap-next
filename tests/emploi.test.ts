import { describe, expect, it } from 'vitest'
import { CriteresAlerte, lireCriteres } from '@/lib/emploi/alerte'
import { cheminPostuler } from '@/lib/emploi/chemins'
import { estFiltree, filtrerOffres, lireFiltres, urlFiltres } from '@/lib/emploi/filtres'
import { debutTexte, decouperDescription, etiquetteCarte, monogramme, referenceOffre, remuneration, tempsTexte } from '@/lib/emploi/format'
import { offreJobPosting, typesEmploi, type DonneesJobPosting } from '@/lib/emploi/jsonld'
import { resumeDepuisLigne, typeRecruteur, type LigneOffre } from '@/lib/emploi/ligne'
import { CODES_METIER, METIERS, metierDepuisCode, metierDepuisSlug, robotsListe } from '@/lib/emploi/metiers'
import { APPRENTISSAGE, PROFESSIONNALISATION, SALAIRES, SOURCES_SALAIRES, montantTexte, repereSalaire, sourcesDe } from '@/lib/emploi/salaires'
import type { OffreResume } from '@/lib/emploi/types'

describe('métiers : slugs et codes', () => {
  const attendu: Record<string, string> = {
    'assistant-dentaire': 'assistant_dentaire',
    'secretaire-assistant-gestion': 'secretaire',
    'prothesiste-dentaire': 'prothesiste',
    'aide-dentaire': 'aide_dentaire',
    'chirurgien-dentiste': 'chirurgien_dentiste',
    'assistant-specialise': 'assistant_specialise',
  }

  it('fait correspondre chaque slug au code de la table', () => {
    for (const [slug, code] of Object.entries(attendu)) expect(metierDepuisSlug(slug)?.code).toBe(code)
  })

  it('couvre exactement l’énumération de la table, dans les deux sens', () => {
    expect(METIERS.map((m) => m.code).sort()).toEqual([...CODES_METIER].sort())
    for (const code of CODES_METIER) expect(metierDepuisSlug(metierDepuisCode(code).slug)?.code).toBe(code)
  })

  it('refuse un slug inconnu ou un code utilisé comme slug (404)', () => {
    expect(metierDepuisSlug('dentiste')).toBeNull()
    expect(metierDepuisSlug('assistant_dentaire')).toBeNull()
    expect(metierDepuisSlug('')).toBeNull()
  })
})

describe('rémunération selon le mode', () => {
  it('salaire : fourchette brute mensuelle', () => {
    expect(remuneration({ mode: 'salaire', min: 2100, max: 2400 })).toEqual({ principal: '2 100 à 2 400 €', detail: 'brut par mois' })
    expect(remuneration({ mode: 'salaire', min: 2100, max: 2100 }).principal).toBe('2 100 €')
  })

  it('rétrocession et redevance : pourcentage des honoraires', () => {
    expect(remuneration({ mode: 'retrocession', min: 40, max: 40 })).toEqual({ principal: 'Rétrocession de 40 %', detail: 'des honoraires' })
    expect(remuneration({ mode: 'retrocession', min: 35, max: 45 }).principal).toBe('Rétrocession de 35 à 45 %')
    expect(remuneration({ mode: 'redevance', min: 35, max: 35 })).toEqual({ principal: 'Redevance de 35 %', detail: 'des honoraires, versée au cabinet' })
  })

  it('gratification : montant mensuel, ou mention légale à zéro', () => {
    expect(remuneration({ mode: 'gratification', min: 0, max: 0 })).toEqual({ principal: 'Gratification légale', detail: 'au-delà de deux mois de stage' })
    expect(remuneration({ mode: 'gratification', min: 650, max: 700 })).toEqual({ principal: 'Gratification de 650 à 700 €', detail: 'par mois' })
  })

  it('étiquette de carte', () => {
    expect(etiquetteCarte({ mode: 'retrocession', min: 40, max: 40 })).toBe('40 %')
    expect(etiquetteCarte({ mode: 'gratification', min: 0, max: 0 })).toBe('Stage')
    expect(etiquetteCarte({ mode: 'salaire', min: 1950, max: 2250 })).toBe('1 950 à 2 250 €')
  })

  it('temps, début, monogramme, référence, description', () => {
    expect(tempsTexte({ tempsPlein: true, heuresHebdo: 35 })).toBe('Temps plein, 35 h')
    expect(tempsTexte({ tempsPlein: false, heuresHebdo: null })).toBe('Temps partiel')
    expect(debutTexte(null)).toBe('Dès que possible')
    expect(debutTexte('2026-12-01')).toBe('1er décembre 2026')
    expect(debutTexte('Janvier 2027')).toBe('Janvier 2027')
    expect(monogramme('Dr Sophie Bernard')).toBe('SB')
    expect(monogramme('Laboratoire Artemis Dentaire')).toBe('AD')
    expect(referenceOffre('demo_o1')).toBe('DM-E-DEMOO1')
    expect(decouperDescription('Le cabinet recrute.\nSuite du résumé.\n\n- Assistance au fauteuil\n- Stérilisation')).toEqual({
      resume: 'Le cabinet recrute. Suite du résumé.',
      points: ['Assistance au fauteuil', 'Stérilisation'],
    })
  })
})

/** Les montants sont formatés par `toLocaleString('fr-FR')`, avec des espaces fines insécables. */
const esp = (t: string | undefined) => t?.replace(/[\u202f\u00a0]/g, ' ')

describe('repère de salaire (minimums conventionnels, jamais les offres)', () => {
  it('minimum du métier dans le secteur du recruteur, avec sa source', () => {
    const r = repereSalaire('assistant_dentaire', 'cdi', 'cabinet')
    expect(esp(r?.texte)).toBe('Salaire minimum conventionnel d’assistant(e) dentaire en cabinet libéral : 2 113 € brut par mois.')
    expect(r?.objet).toBe('Minimum brut mensuel pour un temps plein, fixé par la convention collective')
    expect(r?.sources).toEqual([SOURCES_SALAIRES.idcc1619])
  })
  it('fourchette et précision pour le prothésiste en laboratoire', () => {
    const r = repereSalaire('prothesiste', 'cdi', 'laboratoire')
    expect(esp(r?.texte)).toBe('Salaire minimum conventionnel de prothésiste dentaire en laboratoire de prothèse : 1 935 € à 2 293 € brut par mois, du bac pro au BTS.')
    expect(r?.sources).toEqual([SOURCES_SALAIRES.idcc993])
  })
  it('rien quand le secteur n’a pas de grille ou que le montant est un texte', () => {
    expect(repereSalaire('assistant_dentaire', 'cdi', 'laboratoire')).toBeNull()
    expect(repereSalaire('assistant_dentaire', 'cdi', 'centre')).toBeNull()
    expect(repereSalaire('assistant_specialise', 'cdi', 'centre')).toBeNull()
    expect(repereSalaire('chirurgien_dentiste', 'cdi', 'cabinet')).toBeNull()
  })
  it('aucun taux pour un remplacement ou une collaboration : renvoi aux contrats types de l’Ordre', () => {
    const r = repereSalaire('chirurgien_dentiste', 'remplacement', 'cabinet')
    expect(r?.texte).not.toMatch(/\d/)
    expect(r?.sources[0]?.url).toContain('ordre-chirurgiens-dentistes.fr')
    expect(repereSalaire('chirurgien_dentiste', 'collaboration', 'cabinet')?.texte).toContain('redevance')
  })
})

describe('salaires minimums des pages Emploi', () => {
  it('chaque montant cite une source', () => {
    for (const l of Object.values(SALAIRES)) {
      for (const c of l!.valeurs) if (c && 'montant' in c) expect(SOURCES_SALAIRES[c.source].url).toMatch(/^https:\/\/www\.legifrance\.gouv\.fr\//)
    }
  })
  it('montants retenus', () => {
    expect(SALAIRES.secretaire?.valeurs.map((c) => (c && 'montant' in c ? c.montant : null))).toEqual([2090, null, 1896, null])
    expect(SALAIRES.aide_dentaire?.valeurs[0]).toMatchObject({ montant: 1905 })
    expect(SALAIRES.prothesiste?.valeurs[0]).toMatchObject({ montant: 1963, haut: 3065, source: 'idcc1619' })
    expect(SALAIRES.chirurgien_dentiste?.valeurs).toEqual([
      { texte: 'Honoraires', precision: 'Exercice libéral' },
      null,
      null,
      { montant: 4634, precision: 'Début de grille des praticiens hospitaliers', source: 'ph' },
    ])
  })
  it('fourchette affichée « à »', () => {
    expect(esp(montantTexte({ montant: 1935, haut: 2293 }))).toBe('1 935 € à 2 293 €')
    expect(esp(montantTexte({ montant: 2113 }))).toBe('2 113 €')
  })
  it('assistant(e) spécialisé(e) : minimum avec la prime de mention', () => {
    expect(repereSalaire('assistant_specialise', 'cdi', 'cabinet')?.texte).toMatch(/2\s328 €/u)
  })
  it('sources sans doublon, dans l’ordre', () => {
    expect(sourcesDe(Object.values(SALAIRES) as never)).toEqual([SOURCES_SALAIRES.idcc1619, SOURCES_SALAIRES.idcc993, SOURCES_SALAIRES.mentions1619, SOURCES_SALAIRES.ph])
    expect(sourcesDe([SALAIRES.aide_dentaire!])).toEqual([SOURCES_SALAIRES.idcc1619])
  })
  it('alternance : pourcentages du SMIC du Code du travail', () => {
    expect(APPRENTISSAGE.map((l) => l.taux)).toEqual([
      [27, 39, 55],
      [43, 51, 67],
      [53, 61, 78],
      [100, 100, 100],
    ])
    expect(PROFESSIONNALISATION.map((l) => [l.taux, l.avecBac])).toEqual([
      [55, 65],
      [70, 80],
    ])
  })
})

const LIGNE: LigneOffre = {
  id: 'demo_o1',
  slug: 'assistant-dentaire-qualifie-bordeaux',
  titre: 'Assistant(e) dentaire qualifié(e)',
  metier: 'assistant_dentaire',
  contrat: 'cdi',
  temps_plein: true,
  heures_hebdo: 35,
  debut: '2026-11-03',
  fin: null,
  mode_remuneration: 'salaire',
  remuneration_min: 2100,
  remuneration_max: 2400,
  publiee_le: '2026-10-06T08:00:00.000Z',
  profession: 'dentiste',
  nom: 'DUPONT',
  prenom: 'MARTIN',
  raison_sociale: null,
  adresse_ligne: '12 RUE SAINTE CATHERINE',
  code_postal: '33000',
  finess: null,
  commune_nom: 'Bordeaux',
  commune_slug: 'bordeaux',
  departement_slug: 'gironde',
  lon: -0.5737,
  lat: 44.8398,
  metres: 500,
  photo_url: null,
}

describe('ligne SQL vers offre', () => {
  it('nomme le recruteur et son type', () => {
    const o = resumeDepuisLigne(LIGNE)
    expect(o.recruteur).toBe('Dr Martin Dupont')
    expect(o.type).toBe('cabinet')
    expect(o.adresse).toBe('12 Rue Sainte Catherine')
    expect(typeRecruteur('prothesiste', null)).toBe('laboratoire')
    expect(typeRecruteur('dentiste', '330000000')).toBe('centre')
  })
})

describe('JSON-LD JobPosting', () => {
  const base: DonneesJobPosting = {
    ...resumeDepuisLigne(LIGNE),
    description: 'Le cabinet recherche un(e) assistant(e) <qualifié(e)>.\n\nAssistance au fauteuil\nStérilisation',
    profil: 'Titre d’assistant(e) dentaire',
    avantages: ['Mutuelle'],
    publieeLe: '2026-10-06T08:00:00.000Z',
    expireLe: '2026-11-05T22:59:59.000Z',
    regionNom: 'Nouvelle-Aquitaine',
    praticien: { profession: 'dentiste', chemin: '/dentistes/gironde/bordeaux/dr-martin-dupont/' },
  }

  it('reprend titre, dates, lieu, recruteur et salaire mensuel', () => {
    const j = offreJobPosting(base)
    expect(j['@type']).toBe('JobPosting')
    expect(j.title).toBe('Assistant(e) dentaire qualifié(e)')
    expect(j.datePosted).toBe('2026-10-06')
    expect(j.validThrough).toBe('2026-11-05T22:59:59.000Z')
    expect(j.employmentType).toBe('FULL_TIME')
    expect(j.directApply).toBe(false)
    expect(j.occupationalCategory).toContain('3251')
    expect(j.hiringOrganization).toMatchObject({ '@type': 'Dentist', name: 'Dr Martin Dupont' })
    expect((j.hiringOrganization as { sameAs: string }).sameAs).toMatch(/\/dentistes\/gironde\/bordeaux\/dr-martin-dupont\/$/)
    expect(j.jobLocation).toMatchObject({ address: { postalCode: '33000', addressLocality: 'Bordeaux', addressRegion: 'Nouvelle-Aquitaine', addressCountry: 'FR' } })
    expect(j.baseSalary).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: { '@type': 'QuantitativeValue', minValue: 2100, maxValue: 2400, unitText: 'MONTH' },
    })
  })

  it('échappe le HTML de la description', () => {
    const d = offreJobPosting(base).description as string
    expect(d).toContain('&lt;qualifié(e)&gt;')
    expect(d).toContain('<li>Stérilisation</li>')
    expect(d).not.toContain('<qualifié')
  })

  it('remplacement : CONTRACTOR et pas de baseSalary (pourcentage)', () => {
    const j = offreJobPosting({ ...base, metier: 'chirurgien_dentiste', contrat: 'remplacement', mode: 'retrocession', min: 40, max: 40 })
    expect(j.employmentType).toBe('CONTRACTOR')
    expect(j).not.toHaveProperty('baseSalary')
  })

  it('laboratoire et types d’emploi', () => {
    expect(offreJobPosting({ ...base, praticien: { profession: 'prothesiste', chemin: null } }).hiringOrganization).toEqual({ '@type': 'MedicalBusiness', name: 'Dr Martin Dupont' })
    expect(typesEmploi({ contrat: 'cdd', tempsPlein: false })).toEqual(['PART_TIME', 'TEMPORARY'])
    expect(typesEmploi({ contrat: 'stage', tempsPlein: true })).toBe('INTERN')
    expect(offreJobPosting({ ...base, mode: 'gratification', min: 0, max: 0, contrat: 'stage' })).not.toHaveProperty('baseSalary')
  })
})

describe('indexation des listes', () => {
  it('une commune sans offre est en noindex, follow', () => {
    expect(robotsListe(0)).toEqual({ index: false, follow: true })
  })
  it('une commune avec des offres est indexable', () => {
    expect(robotsListe(3)).toBeUndefined()
  })
  it('une page filtrée ne l’est pas', () => {
    expect(robotsListe(3, true)).toEqual({ index: false, follow: true })
  })
})

describe('filtres de la page commune', () => {
  const o = (p: Partial<OffreResume>): OffreResume => ({ ...resumeDepuisLigne(LIGNE), ...p })
  const offres = [
    o({ id: 'a', contrat: 'cdi', tempsPlein: true, min: 2100, max: 2400 }),
    o({ id: 'b', contrat: 'cdd', tempsPlein: false, min: 1700, max: 1850 }),
    o({ id: 'c', contrat: 'alternance', tempsPlein: true, min: 1100, max: 1350 }),
    o({ id: 'd', contrat: 'remplacement', mode: 'retrocession', min: 40, max: 40 }),
  ]

  it('lit l’URL et ignore les valeurs inconnues', () => {
    expect(lireFiltres({ contrat: ['cdd', 'cdi', 'nimporte'], temps: 'plein', min: '2000', vue: 'carte' })).toEqual({ contrats: ['cdi', 'cdd'], temps: 'plein', min: 2000, vue: 'carte' })
    expect(lireFiltres({})).toEqual({ contrats: [], temps: 'tous', min: null, vue: 'liste' })
    expect(estFiltree(lireFiltres({ vue: 'carte' }))).toBe(false)
  })

  it('filtre sans changer l’ordre', () => {
    expect(filtrerOffres(offres, lireFiltres({ contrat: ['cdi', 'cdd'] })).map((x) => x.id)).toEqual(['a', 'b'])
    expect(filtrerOffres(offres, lireFiltres({ temps: 'partiel' })).map((x) => x.id)).toEqual(['b'])
    // Un minimum de salaire écarte les pourcentages, qui ne sont pas des euros.
    expect(filtrerOffres(offres, lireFiltres({ min: '2000' })).map((x) => x.id)).toEqual(['a'])
  })

  it('reconstruit l’URL', () => {
    expect(urlFiltres('/emploi/x/', lireFiltres({ contrat: 'cdi', vue: 'carte' }))).toBe('/emploi/x/?contrat=cdi&vue=carte')
    expect(urlFiltres('/emploi/x/', lireFiltres({ contrat: 'cdi', vue: 'carte' }), 'liste')).toBe('/emploi/x/?contrat=cdi')
    expect(urlFiltres('/emploi/x/', lireFiltres({}))).toBe('/emploi/x/')
  })
})

describe('alerte emploi et candidature', () => {
  it('lit et valide les critères du formulaire', () => {
    const f = new FormData()
    f.append('metiers', 'assistant_dentaire')
    f.append('contrats', 'cdi')
    f.append('contrats', 'cdd')
    f.append('contrats', 'cdi')
    f.set('commune', '33063')
    f.set('rayonKm', '10')
    const c = CriteresAlerte.parse(lireCriteres(f))
    expect(c).toEqual({ metiers: ['assistant_dentaire'], contrats: ['cdd', 'cdi'], commune: '33063', rayonKm: 10 })
  })

  it('refuse un métier inconnu', () => {
    const f = new FormData()
    f.append('metiers', 'astronaute')
    expect(CriteresAlerte.safeParse(lireCriteres(f)).success).toBe(false)
  })

  it('Postuler ouvre le tiroir sur la page de l’offre, qui demande la connexion si besoin', () => {
    expect(cheminPostuler('mon-offre')).toBe('/emploi/offre/mon-offre/?postuler=1')
  })
})
