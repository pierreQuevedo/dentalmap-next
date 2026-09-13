import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SITE_DESCRIPTION, SITE_NOM, SITE_URL } from '@/lib/seo/site'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NOM, template: `%s | ${SITE_NOM}` },
  description: SITE_DESCRIPTION,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // `suppressHydrationWarning` est requis par next-themes : la classe de thème
    // est posée sur <html> par un script avant l'hydratation, ce que React
    // signalerait sinon comme une divergence.
    <html lang="fr" suppressHydrationWarning className={`${figtree.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
