import type { Config } from '@react-router/dev/config'
import { exampleRoutesToPrerender } from './app/routes'

export default {
  ssr: true,
  prerender: ['/', '/get-started', '/success', ...exampleRoutesToPrerender],
} satisfies Config
