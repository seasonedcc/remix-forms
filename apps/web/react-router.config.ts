import type { Config } from '@react-router/dev/config'

export default {
  ssr: true,
  async prerender() {
    return ['/', '/get-started']
  },
} satisfies Config
