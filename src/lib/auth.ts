import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { envoyerBienvenue, envoyerCode } from '@/lib/email'
import { SITE_URL } from '@/lib/seo/site'

/**
 * Origines acceptées.
 *
 * Better Auth refuse en 403 « Invalid origin » toute requête dont l'en-tête
 * `Origin` ne correspond pas à `baseURL`. Sur Vercel, chaque déploiement de
 * prévisualisation a sa propre adresse : sans l'ajouter ici, la connexion
 * marcherait en production et nulle part ailleurs, ce qui est la pire façon de
 * s'en apercevoir.
 */
const origines = [SITE_URL, process.env.BETTER_AUTH_URL, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`]
  .filter((v): v is string => Boolean(v))
  .map((v) => v.replace(/\/$/, ''))

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? SITE_URL,
  trustedOrigins: [...new Set(origines)],
  database: drizzleAdapter(db, { provider: 'pg' }),
  /*
   * Connexion par adresse et mot de passe. L'adresse est vérifiée par un code
   * à six chiffres envoyé par courriel, à l'inscription comme pour un mot de
   * passe oublié ; un code peut aussi servir à se connecter sans mot de
   * passe. La session s'ouvre dès que le code de l'inscription est bon.
   */
  emailAndPassword: { enabled: true, minPasswordLength: 12, requireEmailVerification: true },
  emailVerification: { autoSignInAfterVerification: true },
  /*
   * Champs du tunnel sur le compte. `input: true` les rend modifiables par
   * `updateUser`, ce que font les actions du tunnel ; ils ne sont jamais
   * obligatoires, une session ouverte sans rôle est un parcours à reprendre.
   */
  user: {
    additionalFields: {
      role: { type: 'string', required: false, input: true },
      etapeTunnel: { type: 'string', required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (u) => {
          await envoyerBienvenue(u.email, u.name)
        },
      },
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => envoyerCode(email, otp, type),
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
    }),
    nextCookies(),
  ],
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  advanced: { database: { generateId: 'uuid' } },
})

export type Session = typeof auth.$Infer.Session
