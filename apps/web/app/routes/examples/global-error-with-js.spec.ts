import { expect, test } from 'tests/setup/tests'

const route = '/examples/actions/global-error'

test('With JS enabled', async ({ example }) => {
  const { email, password, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(email)
  await example.expectField(password, { type: 'password' })
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(email, 'Invalid input')
  await example.expectError(password, 'Invalid input')

  // Make first field be valid, focus goes to the second field
  await email.input.fill('john@doe.com')
  await button.click()
  await example.expectValid(email)
  await expect(password.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid input')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await example.expectValid(email)
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  await example.expectNoGlobalError()
  await button.click()
  await expect(button).toBeDisabled()

  // Show global error
  await example.expectGlobalError('Wrong email or password')

  // Submit valid form
  await password.input.fill('supersafe')
  await button.click()
  await example.expectNoGlobalError()
  await example.expectData({ email: 'john@doe.com', password: 'supersafe' })
})
