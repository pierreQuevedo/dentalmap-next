import { describe, expect, it } from 'vitest'
import { extraireAdresse, lireCapacite, lireDiplomes, lireEcole, lireFaculte, lireInternat, nomCourt, postesInternat, sitesDe } from '../src/lib/formation/faculte'

const CONTENU = `<p>L&#8217;UFR intègre chaque année une centaine d&#8217;étudiants.</p>
<h2>Identité</h2>
<ul>
<li><strong>Université</strong> : Université de Bordeaux</li>
<li><strong>Adresse</strong> : 146 rue Léo Saignat, CS 61292, 33076 Bordeaux Cedex</li>
<li><strong>Site web</strong> : https://sante.u-bordeaux.fr/odonto</li>
<li><strong>Scolarité</strong> : 05 57 57 57 34 · scolarite.odontologie@u-bordeaux.fr</li>
</ul>
<h2>Accès aux études</h2>
<ul>
<li><strong>Voies d’accès</strong> : PASS, L.AS, passerelles</li>
<li><strong>Capacité d’accueil en deuxième année</strong> : 82 (2026-2027). PASS 35, L.AS 4. En 2025-2026 : 80.</li>
</ul>
<h2>Cursus</h2>
<ul>
<li><strong>Durée</strong> : 6 ans minimum, 8 à 9 ans avec l&#8217;internat</li>
<li><strong>Diplôme</strong> : Diplôme d&#8217;État de docteur en chirurgie dentaire</li>
<li><strong>Effectif étudiant</strong> : 432</li>
</ul>
<h2>Internat</h2>
<ul>
<li>Orthopédie dento-faciale : 11 (2025-2026), 10 (2026-2027)</li>
<li>Chirurgie orale : 2 postes (2026-2027)</li>
</ul>
<h2>Soins et hôpital</h2>
<ul>
<li><strong>Service hospitalier</strong> : CHU de Bordeaux, pôle bucco-dentaire</li>
</ul>
<p>Centres de soins où les étudiants exercent :</p>
<ul>
<li>CSERD, hôpital Pellegrin, Bordeaux</li>
<li>Hôpital Charles-Foix, Ivry-sur-Seine</li>
</ul>
<h2>Sources</h2>
<p>Informations relevées le 28 septembre 2026 sur les pages officielles suivantes :</p>
<ul>
<li><a href="https://sante.u-bordeaux.fr/odonto" rel="noopener">https://sante.u-bordeaux.fr/odonto</a></li>
<li><a href="https://www.legifrance.gouv.fr/jorf/id/X" rel="noopener">https://www.legifrance.gouv.fr/jorf/id/X</a></li>
</ul>`

describe('lireFaculte', () => {
  const f = lireFaculte(CONTENU)!

  it('lit les sections balisées', () => {
    expect(f.presentation).toBe('L’UFR intègre chaque année une centaine d’étudiants.')
    expect(f.universite).toBe('Université de Bordeaux')
    expect(f.telephone).toBe('05 57 57 57 34')
    expect(f.email).toBe('scolarite.odontologie@u-bordeaux.fr')
    expect(f.voiesAcces).toBe('PASS, L.AS, passerelles')
    expect(f.diplome).toBe('Diplôme d’État de docteur en chirurgie dentaire')
    expect(f.effectif).toBe(432)
    expect(f.chu).toBe('CHU de Bordeaux, pôle bucco-dentaire')
    expect(f.centresDeSoins).toEqual(['CSERD, hôpital Pellegrin, Bordeaux', 'Hôpital Charles-Foix, Ivry-sur-Seine'])
    expect(f.sources).toHaveLength(2)
    expect(f.dateReleve).toBe('28 septembre 2026')
  })

  it('sépare la capacité en nombre, année et détail', () => {
    expect(f.capacite).toEqual({ nombre: 82, annee: '2026-2027', detail: 'PASS 35, L.AS 4. En 2025-2026 : 80.' })
    expect(lireCapacite('. Aucun document officiel.')).toEqual({ nombre: null, annee: null, detail: 'Aucun document officiel.' })
    expect(lireCapacite(undefined).nombre).toBeNull()
    expect(lireCapacite('74 (2025-2026 (37 PASS, 10 L.AS 1 ; chiffre relayé pour 2026-2027))')).toEqual({ nombre: 74, annee: '2025-2026', detail: '37 PASS, 10 L.AS 1 ; chiffre relayé pour 2026-2027' })
  })

  it('retient l’année la plus récente des internats', () => {
    expect(f.internats[0]).toMatchObject({ specialite: 'Orthopédie dento-faciale', postes: 10, annee: '2026-2027' })
    expect(f.internats[1]).toMatchObject({ specialite: 'Chirurgie orale', postes: 2, annee: '2026-2027' })
    expect(postesInternat(f)).toEqual({ total: 12, annee: '2026-2027' })
    expect(lireInternat('Médecine bucco-dentaire : 3 postes')).toMatchObject({ postes: 3, annee: null })
  })

  it('ne lit pas un contenu libre', () => {
    expect(lireFaculte('<p>Un BTS en deux ans.</p>')).toBeNull()
    expect(lireFaculte(null)).toBeNull()
  })
})

describe('sitesDe', () => {
  it('sépare les sites nommés', () => {
    expect(sitesDe('Site Montrouge, 1 rue Maurice Arnoux, 92120 Montrouge ; site Garancière, 5 rue Garancière, 75006 Paris', 'UFR')).toEqual([
      { nom: 'Site Montrouge', adresse: '1 rue Maurice Arnoux, 92120 Montrouge' },
      { nom: 'Site Garancière', adresse: '5 rue Garancière, 75006 Paris' },
    ])
    expect(sitesDe('2 rue de Braga, 63100 Clermont-Ferrand', 'UFR')).toEqual([{ nom: 'UFR', adresse: '2 rue de Braga, 63100 Clermont-Ferrand' }])
  })
})

describe('extraireAdresse', () => {
  it('retire la boîte postale et le cedex', () => {
    expect(extraireAdresse('146 rue Léo Saignat, CS 61292, 33076 Bordeaux Cedex')).toBe('146 rue Léo Saignat, 33076 Bordeaux')
  })
  it('isole la voie dans une désignation', () => {
    expect(extraireAdresse('Centre dentaire Saint-Julien (CHU de Rouen), 2 rue Danton, 76140 Le Petit-Quevilly')).toBe('2 rue Danton, 76140 Le Petit-Quevilly')
    expect(extraireAdresse('Pôle des formations et de recherche en santé, 2 rue des Rochambelles, CS 14032, 14032 Caen Cedex 5')).toBe('2 rue des Rochambelles, 14032 Caen')
  })
  it('garde le texte tel quel sans numéro de voie', () => {
    expect(extraireAdresse('Hôpital Charles-Foix, Ivry-sur-Seine')).toBe('Hôpital Charles-Foix, Ivry-sur-Seine')
  })
})

describe('nomCourt', () => {
  it('prend ce qui précède la virgule, complété si trop court', () => {
    expect(nomCourt('Hôpital Charles-Foix, Ivry-sur-Seine')).toBe('Hôpital Charles-Foix')
    expect(nomCourt('CSERD, hôpital Pellegrin, Bordeaux')).toBe('CSERD, hôpital Pellegrin')
  })
})

const ECOLE = `<p>École privée hors contrat depuis 1985.</p>
<h2>Identité</h2>
<ul>
<li><strong>Type</strong> : École privée</li>
<li><strong>Statut</strong> : Privé</li>
<li><strong>Adresse</strong> : 2 rue de l&#8217;Oiselière, 85500 Les Herbiers</li>
<li><strong>Site web</strong> : https://www.edgo-prothesiste-dentaire.fr/</li>
<li><strong>Contact</strong> : 02 51 66 01 61 · contact@edgo-prothesiste.fr</li>
</ul>
<h2>Diplômes</h2>
<ul>
<li>Bac pro Technicien en prothèse dentaire | Bac | 3 ans | Initiale ou apprentissage</li>
<li>BTS Prothésiste dentaire | Bac+2 | 2 ans | Apprentissage</li>
</ul>
<h2>Admission</h2>
<ul>
<li><strong>Places par promotion</strong> : 25</li>
<li><strong>Frais de scolarité</strong> : 6 800 euros par an</li>
</ul>
<h2>Sources</h2>
<p>Informations relevées le 28 septembre 2026 sur les pages suivantes :</p>
<ul><li><a href="https://www.edgo-prothesiste-dentaire.fr/">edgo</a></li></ul>`

describe('lireEcole', () => {
  it('lit une école et ses diplômes', () => {
    const e = lireEcole(ECOLE)!
    expect(e.type).toBe('École privée')
    expect(e.statut).toBe('prive')
    expect(e.adresse).toBe('2 rue de l’Oiselière, 85500 Les Herbiers')
    expect(e.telephone).toBe('02 51 66 01 61')
    expect(e.email).toBe('contact@edgo-prothesiste.fr')
    expect(e.diplomes).toEqual([
      { intitule: 'Bac pro Technicien en prothèse dentaire', niveau: 'Bac', duree: '3 ans', modalite: 'Initiale ou apprentissage' },
      { intitule: 'BTS Prothésiste dentaire', niveau: 'Bac+2', duree: '2 ans', modalite: 'Apprentissage' },
    ])
    expect(e.capacite).toBe(25)
    expect(e.frais).toBe('6 800 euros par an')
    expect(e.dateReleve).toBe('28 septembre 2026')
  })
  it('ne prend pas une faculté pour une école', () => {
    expect(lireEcole(CONTENU)).toBeNull()
    expect(lireDiplomes(CONTENU)).toEqual([])
    expect(lireDiplomes(ECOLE)).toHaveLength(2)
  })
})
