import { expect } from '@playwright/test'
import { test } from 'tests/setup/tests'

const route = '/examples/forms/imperative-submit'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  const token = example.field('token')

  await page.goto(route)

  await token.input.first().type('123')
  await expect(page.locator('#action-data > pre')).toBeHidden()

  await token.input.first().type('4')
  await page.waitForLoadState('networkidle')

  await example.expectData({
    token: '1234',
  })
})
