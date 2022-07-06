import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/actions/without-redirect'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await example.expectField(email)
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    firstName,
    'String must contain at least 1 character(s)',
  )
  await example.expectError(
    email,
    'String must contain at least 1 character(s)',
  )
  await expect(firstName.input).toBeFocused()

  // Make first field be valid, focus goes to the second field
  await firstName.input.fill('John')
  await button.click()
  await example.expectValid(firstName)
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
  await example.expectData({ firstName: 'John', email: 'john@doe.com' })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(
    firstName,
    'String must contain at least 1 character(s)',
  )

  await example.expectErrors(
    email,
    'String must contain at least 1 character(s)',
    'Invalid email',
  )

  await example.expectAutoFocus(firstName)
  await example.expectNoAutoFocus(email)

  // Make first field be valid, focus goes to the second field
  await firstName.input.fill('John')
  await button.click()
  await page.reload()
  await example.expectValid(firstName)
  await example.expectNoAutoFocus(firstName)
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
  await example.expectData({ firstName: 'John', email: 'john@doe.com' })
})
