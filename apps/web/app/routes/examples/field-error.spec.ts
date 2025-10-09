import { expect, test } from 'tests/setup/tests'

const route = '/examples/actions/field-error'

test('With JS enabled', async ({ example }) => {
  const { email, password, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(email)
  await example.expectField(password)
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    email,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(
    password,
    'Too small: expected string to have >=1 characters'
  )

  // Make first field be valid, focus goes to the second field
  await email.input.fill('john@doe.com')
  await button.click()
  await example.expectValid(email)
  await expect(password.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid email address')

  // Make form be valid
  await email.input.fill('foo@bar.com')
  await example.expectValid(email)
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  await button.click()
  await expect(button).toBeDisabled()

  // Show field error
  await example.expectError(email, 'Email already taken')

  // Submit valid form
  await email.input.fill('john@doe.com')
  await button.click()
  await example.expectData({ email: 'john@doe.com', password: '123456' })
})
