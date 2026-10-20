import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Test unitari del frontend: funzioni pure, nessun backend acceso (pnpm test)
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    env: { SITE_URL: 'https://www.sorazon.it' },
  },
})
