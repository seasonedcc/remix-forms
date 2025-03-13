import { reactRouter } from '@react-router/dev/vite'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import type { UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default {
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
} satisfies UserConfig
