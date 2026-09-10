import type { CodegenConfig } from '@graphql-codegen/cli'

// Le codegen lit le schéma versionné, pas l'endpoint en ligne : ni la CI ni un build
// Vercel ne doivent dépendre de la disponibilité du CMS. Le schéma se rafraîchit avec
// `pnpm schema:pull` après toute modification de CPT ou de groupe de champs ACF.
const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/lib/wp/**/*.ts', '!src/lib/wp/generated/**'],
  generates: {
    'src/lib/wp/generated/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: { scalars: { DateTime: 'string' } },
    },
  },
  ignoreNoDocuments: true,
}

export default config
