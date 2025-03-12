import type { Config } from '@react-router/dev/config'
import { confRoutes, exampleRoutesToPrerender } from './app/routes'

export default {
  ssr: true,
  prerender: [
    '/',
    '/get-started',
    '/success',
    ...exampleRoutesToPrerender,
    '/conf',
    ...confRoutes,
  ],
} satisfies Config
