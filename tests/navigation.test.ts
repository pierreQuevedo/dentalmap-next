import { describe, expect, it } from 'vitest'
import {
  ANNONCE_TYPES,
  CONSEIL_CATEGORIES,
  FORMATION_TYPES,
  exploreStatic,
  footerCols,
  legalNav,
  mainNav,
  mainNavIcons,
  type NavLink,
} from '../src/lib/navigation'

/** Tous les liens de la navigation, quelle que soit leur provenance. */
function tousLesLiens(): NavLink[] {
  const liens: NavLink[] = []
  for (const entree of mainNav) {
    liens.push(...(entree.links ?? []))
    for (const col of entree.columns ?? []) liens.push(...col.links)
  }
  for (const col of footerCols) liens.push(...col.links)
  liens.push(...legalNav)
  liens.push(...exploreStatic.links.map((l) => ({ label: l.title, href: l.href })))
  return liens
}

describe('navigation', () => {
  it('donne une icône à chaque entrée principale', () => {
    for (const entree of mainNav) expect(mainNavIcons[entree.label]).toBeDefined()
  })

  it("n'a que des liens internes absolus, sans slash final", () => {
    for (const l of tousLesLiens()) {
      if (l.external) {
        expect(l.href).toMatch(/^https:\/\//)
        continue
      }
      expect(l.href.startsWith('/')).toBe(true)
      // Le slash final est ajouté par Next à la construction du lien ; le
      // porter ici produirait des doublons d'URL dans les tests d'intégration.
      const chemin = l.href.split(/[?#]/)[0]
      expect(chemin === '/' || !chemin.endsWith('/')).toBe(true)
    }
  })

  it('signale tout lien externe', () => {
    for (const l of tousLesLiens()) {
      if (l.href.startsWith('http')) expect(l.external).toBe(true)
    }
  })

  it("ne mentionne DentalBridge que dans la colonne Professionnels du pied de page", () => {
    const ailleurs = tousLesLiens().filter(
      (l) => /dentalbridge/i.test(l.href) || /dentalbridge/i.test(l.label),
    )
    expect(ailleurs).toHaveLength(1)
    const pro = footerCols.find((c) => c.title === 'Professionnels')
    expect(pro?.links.some((l) => /dentalbridge/i.test(l.href))).toBe(true)
  })

  it('ne renvoie plus vers la page de méthode de vérification, retirée du site', () => {
    for (const l of tousLesLiens()) expect(l.href).not.toContain('/methode-de-verification')
  })

  it("garde la colonne Notre méthode sans lien, avec sa seule affirmation", () => {
    const annuaire = mainNav.find((e) => e.label === 'Annuaire')
    const methode = annuaire?.columns?.find((c) => c.highlight)
    expect(methode?.title).toBe('Notre méthode')
    expect(methode?.links).toHaveLength(0)
    expect(methode?.note).toContain('RPPS')
  })

  it('couvre chaque catégorie et chaque type dans les menus', () => {
    const conseils = mainNav.find((e) => e.label === 'Conseils')?.links ?? []
    for (const c of CONSEIL_CATEGORIES) expect(conseils.some((l) => l.href === `/conseils/${c}`)).toBe(true)

    const annonces = mainNav.find((e) => e.label === 'Annonces')?.links ?? []
    for (const t of ANNONCE_TYPES) expect(annonces.some((l) => l.href === `/annonces/${t}`)).toBe(true)

    const formations = mainNav.find((e) => e.label === 'Formation')?.links ?? []
    for (const t of FORMATION_TYPES) expect(formations.some((l) => l.href === `/formation/${t}`)).toBe(true)
  })

  it("n'a pas de doublon à l'intérieur d'un même menu", () => {
    for (const entree of mainNav) {
      const hrefs = (entree.links ?? []).map((l) => l.href)
      expect(new Set(hrefs).size).toBe(hrefs.length)
    }
    for (const col of footerCols) {
      const hrefs = col.links.map((l) => l.href)
      expect(new Set(hrefs).size).toBe(hrefs.length)
    }
  })
})
