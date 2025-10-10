//import { test, expect } from '@playwright/test'
import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/actions/context'

test('With JS enabled', async ({ example }) => {
  const { email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(email)
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    email,
    'Too small: expected string to have >=1 characters'
  )
  await expect(email.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid email address')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await example.expectValid(email)

  // Submit form
  await button.click()
  await expect(button).toBeDisabled()
  await expect(page.locator('form > div[role="alert"]:visible')).toHaveText(
    'Missing custom header'
  )

  // Submit with valid headers
  await page.setExtraHTTPHeaders({ customHeader: 'foo' })

  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({ email: 'john@doe.com' })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { email, button, page } = example

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectErrors(
    email,
    'Too small: expected string to have >=1 characters',
    'Invalid email address'
  )
  await example.expectAutoFocus(email)

  // Try another invalid message
  await email.input.fill('john')
  await button.click()
  await page.reload()
  await example.expectError(email, 'Invalid email address')

  // Make form be valid and test selecting an option
  await email.input.fill('john@doe.com')

  // Submit form
  await button.click()
  await page.reload()
  await example.expectGlobalError('Missing custom header')

  // Submit with valid headers
  await page.setExtraHTTPHeaders({ customHeader: 'foo' })
  await button.click()
  await page.reload()
  await example.expectData({ email: 'john@doe.com' })
})
