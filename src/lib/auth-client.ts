import { createAuthClient } from 'better-auth/react'
import { emailOTPClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from './auth'

/**
 * Client Better Auth.
 *
 * `trailingSlash: true` dans la configuration Next fait répondre 308 à toute
 * URL sans barre finale. Sur un POST, le navigateur rejoue bien la requête vers
 * la nouvelle adresse mais sans son corps : la connexion échouait en 400, alors
 * que la même requête envoyée directement à l'adresse barrée répondait 200.
 *
 * On ajoute donc la barre à l'appel, ce qui évite la redirection. Le
 * gestionnaire de `/api/auth/[...all]` la retire avant de passer la main, le
 * routeur interne de Better Auth ne la reconnaissant pas non plus.
 */
export const authClient = createAuthClient({
  plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
  fetchOptions: {
    customFetchImpl: (entree, init) => {
      const base = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
      const url = new URL(entree instanceof Request ? entree.url : String(entree), base)
      if (!url.pathname.endsWith('/')) url.pathname += '/'
      return fetch(url.toString(), init)
    },
  },
})

export const { signIn, signUp, signOut, useSession, emailOtp } = authClient
