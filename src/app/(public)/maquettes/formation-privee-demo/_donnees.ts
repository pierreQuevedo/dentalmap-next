import { cacheLife, cacheTag } from 'next/cache'
import { getFormationsPriveesPubliees } from '@/lib/formation/privee-donnees'
import { assembler, type ArticleFormation, type FormationPriveeVue } from '@/lib/formation/privee-liste'

/**
 * Démonstration des pages des formations privées, sans écrire dans
 * WordPress. Le détail vient de Neon, tel que `scripts/demo-formations-privees.ts`
 * l'écrit (adresses `demo-…`) ; l'article WordPress qui manque est remplacé
 * par son équivalent (titre, adresse, photo), puis tout passe par les mêmes
 * fonctions que les pages publiques (`assembler`, `filtrerEtTrier`).
 * Jamais indexée.
 */
export const BASE_DEMO = '/maquettes/formation-privee-demo/'

/** Les photos que porteraient les articles WordPress, par adresse. */
const PHOTOS: Record<string, string> = {
  'demo-implantologie-pose-guidee': '/images/demo/pexels-6627447.jpg',
  'demo-parodontologie-non-chirurgicale': '/images/demo/pexels-6627320.jpg',
  'demo-cfao-zircone': '/images/demo/pexels-8413334.jpg',
  'demo-gestion-du-cabinet': '/images/demo/pexels-3881296.jpg',
}

export async function getVuesDemo(): Promise<FormationPriveeVue[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp:formation', 'formations-privees')
  const details = (await getFormationsPriveesPubliees()).filter((x) => x.wpSlug.startsWith('demo-'))
  const articles: ArticleFormation[] = details.map((x) => ({
    slug: x.wpSlug,
    titre: x.d.intitule,
    image: PHOTOS[x.wpSlug] ? { url: PHOTOS[x.wpSlug]!, alt: '' } : null,
  }))
  return assembler(articles, new Map(details.map(({ wpSlug, ...det }) => [wpSlug, det])))
}
