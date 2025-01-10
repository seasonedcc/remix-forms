import type { Config } from '@react-router/dev/config'
import { exampleRoutesToPrerender, confRoutes } from './app/routes'

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
