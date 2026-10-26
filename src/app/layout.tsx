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

const GTM_ID = 'GTM-WLZHVRCH'

const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // `suppressHydrationWarning` est requis par next-themes : la classe de thème
    // est posée sur <html> par un script avant l'hydratation, ce que React
    // signalerait sinon comme une divergence.
    <html lang="fr" suppressHydrationWarning className={`${figtree.variable} h-full`}>
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: GTM_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
