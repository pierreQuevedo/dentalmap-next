import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/db/schema.ts', './src/db/auth-schema.ts'],
  out: './src/db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
  extensionsFilters: ['postgis'],
  /*
   * `strict` demande une confirmation avant d'exécuter un `push`. Sur Vercel,
   * le build de prévisualisation n'a pas de terminal pour répondre et le
   * déploiement échouait dès que le schéma changeait : là, on laisse
   * `--force` appliquer sans question.
   */
  strict: !process.env.VERCEL,
  verbose: true,
})
