import { defineConfig } from 'vitest/config'

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  test: {
    globals: true,
    isolate: false,
    exclude: ['./dist', './tsc'],
  },
})
