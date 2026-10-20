import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Test di integrazione: Payload vero su un database di PROVA (TEST_DATABASE_URL, vedi
// vitest.setup.ts). In sequenza, perché condividono il database.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/int/**/*.int.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
})
