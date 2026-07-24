import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Default environment stays 'node' for existing lib-level tests -- .tsx
    // component tests opt into a DOM environment per-file via a
    // `// @vitest-environment happy-dom` docblock (see
    // __tests__/contextual-tooltip.test.tsx) rather than switching every
    // test to a DOM environment it doesn't need.
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
