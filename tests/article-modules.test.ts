import { describe, expect, it } from 'vitest'
import {
  ancre,
  idsMedias,
  initiales,
  lienSur,
  lireArticleModulaire,
  lireContenu,
  lireDate,
  lireImage,
  lireModule,
  lireSources,
  questionsDe,
  sommaire,
  tempsDeLecture,
} from '../src/lib/conseils/modules'
import { ACF_EXEMPLE } from '../src/app/(public)/maquettes/article-modulaire/_donnees'

describe('lireArticleModulaire', () => {
  it('reste null tant que le groupe n’est pas importé ou rempli', () => {
    expect(lireArticleModulaire(undefined)).toBeNull()
    expect(lireArticleModulaire(null)).toBeNull()
    // WordPress renvoie un tableau vide quand aucun groupe ACF n'est attaché.
    expect(lireArticleModulaire([])).toBeNull()
    expect(lireArticleModulaire({})).toBeNull()
    expect(lireArticleModulaire({ article_chapo: 'Un chapô seul', section_1: { type: 'aucun' } })).toBeNull()
    expect(lireArticleModulaire({ section_1: { type: 'texte', titre: 'Titre sans contenu', contenu: '' } })).toBeNull()
  })

  it('lit l’exemple complet : dix modules, sommaire, sources', () => {
    const a = lireArticleModulaire(ACF_EXEMPLE)!
    expect(a.sections.map((s) => s.module.type)).toEqual(['texte', 'a_retenir', 'etapes', 'encadre', 'chiffres', 'comparatif', 'citation', 'image', 'questions', 'appel'])
    expect(a.dateRelecture).toBe('2026-10-11')
    expect(a.sources).toHaveLength(3)
    expect(sommaire(a.sections).map((e) => e.titre)).toEqual([
      'Ce que le devis doit indiquer',
      'À retenir',
      'Comparer deux devis, étape par étape',
      'Les repères',
      'Les trois paniers',
      'Questions fréquentes',
    ])
    expect(questionsDe(a.sections)).toHaveLength(3)
    expect(tempsDeLecture(a)).toBeGreaterThanOrEqual(1)
  })

  it('ignore une section vide entre deux sections remplies, sans trou', () => {
    const a = lireArticleModulaire({
      section_1: { type: 'encadre', texte: 'Un.' },
      section_2: { type: 'chiffres', chiffres: '' },
      section_5: { type: 'encadre', texte: 'Deux.' },
    })!
    expect(a.sections).toHaveLength(2)
  })

  it('rend des ancres uniques à deux intertitres identiques', () => {
    const a = lireArticleModulaire({
      section_1: { type: 'texte', titre: 'En pratique', contenu: 'Un.' },
      section_2: { type: 'texte', titre: 'En pratique', contenu: 'Deux.' },
    })!
    expect(a.sections.map((s) => s.ancre)).toEqual(['en-pratique', 'en-pratique-2'])
  })
})

describe('lireModule', () => {
  it('donne leurs titres par défaut à « À retenir » et aux questions', () => {
    expect(lireModule({ type: 'a_retenir', points: 'Un\nDeux' })).toMatchObject({ titre: 'À retenir', points: ['Un', 'Deux'] })
    expect(lireModule({ type: 'questions', questions: 'Q ? | R.' })).toMatchObject({ titre: 'Questions fréquentes' })
  })

  it('plafonne les listes aux maxima des notes Figma', () => {
    const points = Array.from({ length: 8 }, (_, i) => `Point ${i}`).join('\n')
    expect(lireModule({ type: 'a_retenir', points })).toMatchObject({ points: expect.any(Array) })
    expect((lireModule({ type: 'a_retenir', points }) as { points: string[] }).points).toHaveLength(5)
    const etapes = Array.from({ length: 9 }, (_, i) => `É${i} | détail`).join('\n')
    expect((lireModule({ type: 'etapes', etapes }) as { etapes: unknown[] }).etapes).toHaveLength(6)
    const questions = Array.from({ length: 10 }, (_, i) => `Q${i} ? | R.`).join('\n')
    expect((lireModule({ type: 'questions', questions }) as { questions: unknown[] }).questions).toHaveLength(8)
  })

  it('ignore les lignes sans seconde colonne et garde les « | » d’une réponse', () => {
    const m = lireModule({ type: 'questions', questions: 'Sans réponse\nQ ? | A | B' })
    expect(m).toMatchObject({ questions: [{ question: 'Q ?', reponse: 'A | B' }] })
  })

  it('aligne les rangées du comparatif sur les en-têtes, quatre colonnes au plus', () => {
    const m = lireModule({ type: 'comparatif', tableau: 'A | B | C | D | E\n1 | 2\n3 | 4 | 5 | 6 | 7' })
    expect(m).toMatchObject({ entetes: ['A', 'B', 'C', 'D'], rangees: [['1', '2', '', ''], ['3', '4', '5', '6']] })
    expect(lireModule({ type: 'comparatif', tableau: 'A | B' })).toBeNull()
  })

  it('retire les guillemets saisis dans une citation', () => {
    expect(lireModule({ type: 'citation', citation: '« Bonjour. »', auteur: 'Dr A' })).toMatchObject({ citation: 'Bonjour.' })
  })

  it('préremplit l’appel à l’action selon la destination', () => {
    expect(lireModule({ type: 'appel', destination: 'recherche' })).toMatchObject({ href: '/recherche/', libelle: 'Rechercher un praticien' })
    expect(lireModule({ type: 'appel', destination: 'revendiquer', titre: 'À vous' })).toMatchObject({ titre: 'À vous', libelle: 'Revendiquer ma fiche' })
    // Un lien libre sans adresse sûre, libellé ou titre ne s'affiche pas.
    expect(lireModule({ type: 'appel', destination: 'lien', titre: 'T', lien_url: 'javascript:alert(1)', lien_libelle: 'Go' })).toBeNull()
    expect(lireModule({ type: 'appel', destination: 'lien', lien_url: '/formation/', lien_libelle: 'Go' })).toBeNull()
    expect(lireModule({ type: 'appel', destination: 'lien', titre: 'T', lien_url: '/formation/', lien_libelle: 'Go' })).toMatchObject({ href: '/formation/' })
  })

  it('prend le ton Information par défaut et le format Large', () => {
    expect(lireModule({ type: 'encadre', ton: 'inconnu', texte: 'X' })).toMatchObject({ ton: 'information' })
    expect(lireModule({ type: 'image', image: 'https://cms.dentalmap.fr/a.jpg' })).toMatchObject({ format: 'large' })
  })

  it('rend null pour un type inconnu ou une section mal formée', () => {
    expect(lireModule({ type: 'galerie' })).toBeNull()
    expect(lireModule('texte')).toBeNull()
    expect(lireModule([])).toBeNull()
  })
})

describe('valeurs brutes', () => {
  it('lit une image dans ses trois formes', () => {
    expect(lireImage({ url: 'https://cms.dentalmap.fr/a.jpg', alt: 'Alt', width: 800, height: 600 })).toEqual({ url: 'https://cms.dentalmap.fr/a.jpg', alt: 'Alt', largeur: 800, hauteur: 600 })
    const medias = new Map([[12, { url: 'https://cms.dentalmap.fr/b.jpg', alt: '', largeur: null, hauteur: null }]])
    expect(lireImage(12, medias)?.url).toBe('https://cms.dentalmap.fr/b.jpg')
    expect(lireImage('12', medias)?.url).toBe('https://cms.dentalmap.fr/b.jpg')
    expect(lireImage(13, medias)).toBeNull()
    expect(lireImage(false)).toBeNull()
    expect(idsMedias({ section_1: { type: 'image', image: 12 }, section_2: { type: 'citation', photo: '7' } })).toEqual([12, 7])
  })

  it('lit les dates ACF', () => {
    expect(lireDate('20261011')).toBe('2026-10-11')
    expect(lireDate('2026-10-11')).toBe('2026-10-11')
    expect(lireDate('11/10/2026')).toBe('2026-10-11')
    expect(lireDate('')).toBeNull()
    expect(lireDate('bientôt')).toBeNull()
  })

  it('pose les paragraphes au format light et rabaisse les titres', () => {
    expect(lireContenu('Un.\n\nDeux.')).toBe('<p>Un.</p>\n<p>Deux.</p>')
    expect(lireContenu('<h2>Titre</h2><p>Texte</p>')).toBe('<p><strong>Titre</strong></p><p>Texte</p>')
  })

  it('n’accepte que des liens http, https ou internes', () => {
    expect(lienSur('https://www.ameli.fr/')).toBe('https://www.ameli.fr/')
    expect(lienSur('/contact/')).toBe('/contact/')
    expect(lienSur('//evil.example')).toBeNull()
    expect(lienSur('javascript:alert(1)')).toBeNull()
  })

  it('lit les sources « Libellé | adresse », adresse facultative', () => {
    expect(lireSources('Ameli | https://www.ameli.fr/\nRapport HAS 2024')).toEqual([
      { libelle: 'Ameli', url: 'https://www.ameli.fr/' },
      { libelle: 'Rapport HAS 2024', url: null },
    ])
  })

  it('forme ancres et initiales', () => {
    expect(ancre('Ce que le devis doit indiquer')).toBe('ce-que-le-devis-doit-indiquer')
    expect(ancre('À retenir')).toBe('a-retenir')
    expect(initiales('Dr Camille Rivière, chirurgienne-dentiste')).toBe('CR')
  })
})
