import type { Config } from '@react-router/dev/config'
import { exampleRoutes, confRoutes } from './app/routes'

export default {
  ssr: true,
  prerender: [
    '/',
    '/get-started',
    '/success',
    ...exampleRoutes,
    '/conf',
    ...confRoutes,
  ],
} satisfies Config
