import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: process.env.WP_GRAPHQL_URL,
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
