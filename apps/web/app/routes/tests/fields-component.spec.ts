import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/test-examples/fields-component'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const message = example.field('message')

  await page.goto(route)

  // All schema fields render in order
  await example.expectField(firstName)
  await example.expectField(email, { label: 'E-mail' })
  await example.expectField(message, { label: 'Message', required: false })
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(
    email,
    'Too small: expected string to have >=1 characters'
  )
  await expect(firstName.input).toBeFocused()

  // Fill required fields
  await firstName.input.fill('John')
  await button.click()
  await example.expectValid(firstName)
  await expect(email.input).toBeFocused()

  await email.input.fill('john@doe.com')
  await example.expectValid(email)

  // Submit form
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({ firstName: 'John', email: 'john@doe.com' })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const message = example.field('message')

  await page.goto(route)

  // All schema fields render
  await example.expectField(firstName)
  await example.expectField(email, { label: 'E-mail' })
  await example.expectField(message, { label: 'Message', required: false })

  // Server-side validation
  await button.click()
  await page.reload()

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectErrors(
    email,
    'Too small: expected string to have >=1 characters',
    'Invalid email address'
  )
  await example.expectAutoFocus(firstName)

  // Fill required fields
  await firstName.input.fill('John')
  await button.click()
  await page.reload()
  await example.expectValid(firstName)
  await example.expectAutoFocus(email)

  await email.input.fill('john@doe.com')
  await button.click()
  await page.reload()
  await example.expectData({ firstName: 'John', email: 'john@doe.com' })
})
