import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { sendMagicLink } from '@/lib/email'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => sendMagicLink(email, url),
    }),
    nextCookies(),
  ],
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  advanced: { database: { generateId: 'uuid' } },
})

export type Session = typeof auth.$Infer.Session
