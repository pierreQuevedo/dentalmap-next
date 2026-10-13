'use client'

import { Figtree } from 'next/font/google'
import { Page500 } from '@/components/vitrine/erreurs/page-500'
import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

/**
 * Dernier recours : une erreur dans le layout racine lui-même. Ce fichier le
 * remplace entièrement, d'où le document complet, la feuille de style et la
 * police. Ni en-tête ni pied de page, qui dépendent de ce qui vient d'échouer.
 */
export default function ErreurGlobale({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fr" className={`${figtree.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Page500 retry={retry} reference={error.digest} sansEnTete />
      </body>
    </html>
  )
}
