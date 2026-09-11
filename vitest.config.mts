import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Neon peut démarrer à froid : 30 s ne suffisent pas toujours au premier test.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
})
