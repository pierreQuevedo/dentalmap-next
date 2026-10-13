/**
 * MAQUETTE, à supprimer une fois le groupe ACF « Article modulaire » importé
 * et un premier article réel rempli : l'article d'exemple avec les dix
 * modules, à partir d'une saisie locale passée par les mêmes parseurs que les
 * articles WordPress. Jamais indexée.
 */
import type { Metadata } from 'next'
import { ArticleModulairePage } from '@/components/conseils/article/article'
import { lireArticleModulaire, tempsDeLecture } from '@/lib/conseils/modules'
import { getConseils, type ConseilResume } from '@/lib/wp/queries'
import { ACF_EXEMPLE, A_LIRE_AUSSI_EXEMPLE } from './_donnees'

export const metadata: Metadata = { title: 'Maquette Article modulaire', robots: { index: false, follow: false } }

async function articlesPatients(): Promise<ConseilResume[]> {
  try {
    const reels = (await getConseils()).filter((c) => (c.categorie ?? 'patients') === 'patients').slice(0, 3)
    return reels.length > 0 ? reels : A_LIRE_AUSSI_EXEMPLE
  } catch {
    return A_LIRE_AUSSI_EXEMPLE
  }
}

export default async function Page() {
  const article = lireArticleModulaire(ACF_EXEMPLE)
  if (!article) throw new Error('La saisie d’exemple ne produit aucune section.')
  return (
    <ArticleModulairePage
      entete={{
        titre: 'Lire un devis de prothèse dentaire, ligne par ligne',
        categorie: 'patients',
        chapo: article.chapo,
        reluPar: article.reluPar,
        majLe: article.dateRelecture,
        tempsLecture: tempsDeLecture(article),
        image: null,
      }}
      article={article}
      aLireAussi={await articlesPatients()}
    />
  )
}
