/**
 * Génération de slugs d'URL.
 *
 * Un slug est écrit une fois et ne change plus : il fait partie de l'URL
 * publique, donc du référencement acquis. Toute modification de ces fonctions
 * doit être considérée comme cassante.
 */

/** Translittère, met en minuscules et ne garde que des mots séparés par des tirets. */
export function slugifier(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[’']/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Slug d'une commune ou d'un arrondissement.
 *
 * « Paris 16e Arrondissement » devient « paris-16e » : le mot « arrondissement »
 * alourdit l'URL sans rien apporter, et la forme courte est celle que les gens
 * écrivent.
 */
export function slugCommune(nom: string): string {
  return slugifier(nom.replace(/\s+Arrondissement$/i, ''))
}

/**
 * Rend un slug unique dans un ensemble donné.
 *
 * En cas de collision, suffixe avec le discriminant fourni, en général le code
 * INSEE, plutôt qu'un compteur : le résultat ne dépend alors pas de l'ordre de
 * traitement, et reste stable d'un import à l'autre.
 */
export function slugUnique(slug: string, discriminant: string, pris: Set<string>): string {
  if (!pris.has(slug)) {
    pris.add(slug)
    return slug
  }
  const candidat = `${slug}-${slugifier(discriminant)}`
  pris.add(candidat)
  return candidat
}

/**
 * Forme cherchable d'un nom de commune : minuscules, sans accents ni
 * ponctuation, mots séparés par une espace.
 *
 * Sert l'autocomplétion tolérante aux fautes. Distincte du slug, qui sépare par
 * des tirets et sert d'URL : les deux ne doivent pas être confondus, un slug
 * est figé à vie alors que cette forme peut être recalculée.
 */
export function formeCherchable(nom: string): string {
  return slugifier(nom).replace(/-/g, ' ')
}
