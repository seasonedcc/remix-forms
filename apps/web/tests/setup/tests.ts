import { test as base } from '@playwright/test'
import { Example } from './example'

const test = base.extend<{ example: Example }>({
  example: async ({ page }, use) => {
    await page.route('**/*', async (route) => {
      await new Promise((f) => setTimeout(f, 100))
      await route.continue()
    })

    await use(new Example(page))
  },
})

const testWithoutJS = base.extend<{ example: Example }>({
  example: async ({ browser }, use) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await use(new Example(page))
  },
})

export { test, testWithoutJS }
export { expect } from '@playwright/test'
