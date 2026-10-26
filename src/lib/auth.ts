import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { nextCookies } from 'better-auth/next-js'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerBienvenue, envoyerCode } from '@/lib/email'
import { SITE_URL } from '@/lib/seo/site'
import { LONGUEUR_MOT_DE_PASSE, MESSAGE_MOT_DE_PASSE, motDePasseValide } from '@/lib/tunnel/mot-de-passe'
import { ETAPES_TUNNEL, ROLES } from '@/lib/tunnel/etapes'

/**
 * Origines acceptées.
 *
 * Better Auth refuse en 403 « Invalid origin » toute requête dont l'en-tête
 * `Origin` ne correspond pas à `baseURL`. Sur Vercel, chaque déploiement de
 * prévisualisation a sa propre adresse : sans l'ajouter ici, la connexion
 * marcherait en production et nulle part ailleurs, ce qui est la pire façon de
 * s'en apercevoir. L'adresse de branche (`…-git-<branche>-…vercel.app`), celle
 * qu'on partage pour relire une prévisualisation, n'est pas `VERCEL_URL` :
 * sans elle, inscription et connexion y répondaient 403.
 */
/** Où se trouve le nouveau mot de passe, selon la route de Better Auth. */
const CHAMP_MOT_DE_PASSE: Record<string, string> = {
  '/sign-up/email': 'password',
  '/email-otp/reset-password': 'password',
  '/reset-password': 'newPassword',
  '/change-password': 'newPassword',
}

/** Les profils qu'un compte peut se donner : ceux de l'inscription. */
const ROLES_CHOISIS: readonly string[] = ROLES.filter((r) => r !== 'patient')

const brancheVercel = process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`
// En développement, `test.localhost` : une seconde adresse locale, aux cookies séparés, pour tester un autre compte.
const essaiLocal = process.env.NODE_ENV === 'development' && 'http://test.localhost:3000'
const origines = [SITE_URL, process.env.BETTER_AUTH_URL, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, brancheVercel, essaiLocal]
  .filter((v): v is string => Boolean(v))
  .map((v) => v.replace(/\/$/, ''))

// En prévisualisation sans `BETTER_AUTH_URL`, l'adresse de branche : c'est elle qu'on ouvre, et la clé d'accès s'y rattache.
const baseURL = process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_ENV === 'preview' && brancheVercel ? brancheVercel : SITE_URL)

export const auth = betterAuth({
  baseURL,
  trustedOrigins: [...new Set(origines)],
  database: drizzleAdapter(db, { provider: 'pg' }),
  /*
   * Connexion par adresse et mot de passe. L'adresse est vérifiée par un code
   * à six chiffres envoyé par courriel, à l'inscription comme pour un mot de
   * passe oublié ; un code peut aussi servir à se connecter sans mot de
   * passe. La session s'ouvre dès que le code de l'inscription est bon.
   */
  emailAndPassword: { enabled: true, minPasswordLength: LONGUEUR_MOT_DE_PASSE, requireEmailVerification: true },
  emailVerification: {
    autoSignInAfterVerification: true,
    /*
     * La bienvenue part une fois l'adresse confirmée par le code, pas à la
     * création du compte. Le même rappel suit un changement d'adresse : un
     * compte de plus d'un jour ne la reçoit pas.
     */
    afterEmailVerification: async (u) => {
      if (Date.now() - new Date(u.createdAt).getTime() > 86_400_000) return
      await envoyerBienvenue(u.email, u.name, (u as { role?: string | null }).role)
    },
  },
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
  /*
   * La règle complète du mot de passe (majuscule, minuscule, chiffre,
   * caractère spécial) vérifiée côté serveur, quel que soit l'écran.
   */
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      /*
       * Le rôle se choisit parmi les profils proposés, jamais une valeur
       * libre : l'API de Better Auth l'accepte à l'inscription et à la mise
       * à jour du compte (audit du 2026-10-26). Plus de nouveau compte patient.
       */
      if (ctx.path === '/sign-up/email' || ctx.path === '/update-user') {
        const corps = ctx.body as Record<string, unknown> | undefined
        if (corps && 'role' in corps && !ROLES_CHOISIS.includes(corps.role as string)) throw new APIError('BAD_REQUEST', { message: 'Profil inconnu.', code: 'ROLE_INVALIDE' })
        if (corps && 'etapeTunnel' in corps && ![...ETAPES_TUNNEL, 'attente'].includes(corps.etapeTunnel as string)) throw new APIError('BAD_REQUEST', { message: 'Étape inconnue.', code: 'ETAPE_INVALIDE' })
      }
      const champ = CHAMP_MOT_DE_PASSE[ctx.path]
      if (!champ) return
      const valeur = (ctx.body as Record<string, unknown> | undefined)?.[champ]
      if (typeof valeur === 'string' && !motDePasseValide(valeur)) throw new APIError('BAD_REQUEST', { message: MESSAGE_MOT_DE_PASSE, code: 'PASSWORD_TOO_WEAK' })
    }),
  },
  /*
   * L'activité du compte : chaque session ouverte ou prolongée (une fois par
   * jour au plus, `updateAge`) la date, et lève un avertissement
   * d'inactivité en cours. La session est effacée à la déconnexion : sa date
   * ne suffit pas.
   */
  databaseHooks: {
    session: {
      create: { after: async (s) => noterActivite(s.userId) },
      update: { after: async (s) => noterActivite((s as { userId?: string } | null)?.userId) },
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
    /*
     * CX4 : clé d'accès (WebAuthn). Liée au domaine de `baseURL` : une clé
     * créée sur dentalmap.fr ne sert pas sur un déploiement de
     * prévisualisation, qui garde l'adresse et le mot de passe. Le mot de
     * passe reste valable dans tous les cas.
     */
    passkey({ rpName: 'DentalMap', rpID: new URL(baseURL).hostname, origin: baseURL.replace(/\/$/, '') }),
    nextCookies(),
  ],
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  advanced: { database: { generateId: 'uuid' } },
})

async function noterActivite(userId: string | undefined) {
  if (!userId) return
  await db.execute(sql`UPDATE "user" SET derniere_activite_le = now(), inactivite_averti_le = NULL WHERE id = ${userId}::uuid`).catch((e) => console.error('[auth] activité non notée', e))
}

export type Session = typeof auth.$Infer.Session
