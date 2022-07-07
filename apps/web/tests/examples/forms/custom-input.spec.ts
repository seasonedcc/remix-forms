import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/custom-input'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await expect(email.label).toHaveText('Email')
  await expect(email.label).toHaveId('label-for-email')
  await expect(email.input).toHaveAttribute('type', 'email')
  await expect(email.input).toHaveClass('border-2 border-dashed rounded-md')
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    firstName,
    'String must contain at least 1 character(s)',
  )

  const emailErrors = page.locator(`#errors-for-email:visible`)
  await expect(emailErrors).toHaveAttribute('role', 'alert')

  await expect(emailErrors).toHaveText(
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
  await expect(emailErrors).toHaveText('Invalid email')

  // Make form be valid
  await email.input.fill('john@doe.com')

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

  const emailErrors = page.locator(`#errors-for-email:visible`)
  await expect(emailErrors).toHaveAttribute('role', 'alert')

  await expect(emailErrors.locator('div').first()).toHaveText(
    'String must contain at least 1 character(s)',
  )

  await expect(emailErrors.locator('div').last()).toHaveText('Invalid email')

  await example.expectAutoFocus(firstName)
  await example.expectNoAutoFocus(email)

  // Make first field be valid, focus goes to the second field
  await firstName.input.fill('John')
  await button.click()
  await page.reload()
  await example.expectValid(firstName)
  await example.expectNoAutoFocus(firstName)
  await example.expectNoAutoFocus(email)

  // Make form be valid
  await email.input.fill('john@doe.com')

  // Submit form
  await button.click()
  await page.reload()
  await example.expectData({ firstName: 'John', email: 'john@doe.com' })
})
