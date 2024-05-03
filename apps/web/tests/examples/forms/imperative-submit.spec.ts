import { expect } from '@playwright/test'
import { test } from 'tests/setup/tests'

const route = '/examples/forms/imperative-submit'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  const token = example.field('token')

  await page.goto(route)

  await token.input.first().fill('123')
  expect(page.locator('#action-data > pre')).toBeHidden()

  await token.input.first().fill('1234')

  await example.expectData({
    token: '1234',
  })
})
