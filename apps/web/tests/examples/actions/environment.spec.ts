//import { test, expect } from '@playwright/test'
import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/actions/environment'

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
    'String must contain at least 1 character(s)',
  )
  await expect(email.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid email')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await example.expectValid(email)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()
  await expect(page.locator('form > div[role="alert"]:visible')).toHaveText(
    'Missing custom header',
  )

  // Submit with valid headers
  await page.setExtraHTTPHeaders({ customHeader: 'foo' })

  button.click()
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
    'String must contain at least 1 character(s)',
    'Invalid email',
  )
  await example.expectAutoFocus(email)

  // Try another invalid message
  await email.input.fill('john')
  await button.click()
  await page.reload()
  await example.expectError(email, 'Invalid email')

  // Make form be valid and test selecting an option
  await email.input.fill('john@doe.com')

  // Submit form
  await button.click()
  await page.reload()
  await expect(page.locator('form > div[role="alert"]:visible')).toHaveText(
    'Missing custom header',
  )

  // Submit with valid headers
  await page.setExtraHTTPHeaders({ customHeader: 'foo' })
  await button.click()
  await page.reload()
  await example.expectData({ email: 'john@doe.com' })
})
