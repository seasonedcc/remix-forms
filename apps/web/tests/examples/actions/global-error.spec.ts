import { test, testWithoutJS, expect } from 'tests/setup/tests'

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
  await example.expectError(
    email,
    'String must contain at least 1 character(s)',
  )
  await example.expectError(
    password,
    'String must contain at least 1 character(s)',
  )

  // Make first field be valid, focus goes to the second field
  await email.input.fill('john@doe.com')
  await button.click()
  await example.expectValid(email)
  await expect(password.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid email')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await example.expectValid(email)
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()

  // Show global error
  await expect(page.locator('form > div[role="alert"]:visible')).toHaveText(
    'Wrong email or password',
  )

  // Submit valid form
  await password.input.fill('supersafe')
  button.click()
  await example.expectData({ email: 'john@doe.com', password: 'supersafe' })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { email, password, button, page } = example

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

  await example.expectError(
    password,
    'String must contain at least 1 character(s)',
  )

  await example.expectAutoFocus(email)
  await example.expectNoAutoFocus(password)

  // Make first field be valid, focus goes to the second field
  await email.input.fill('john@doe.com')
  await button.click()
  await page.reload()
  await example.expectValid(email)
  await example.expectAutoFocus(password)
  await example.expectNoAutoFocus(email)

  // Try another invalid message
  await email.input.fill('john')
  await button.click()
  await page.reload()
  await example.expectError(email, 'Invalid email')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await password.input.fill('123456')

  // Submit form
  await button.click()
  await page.reload()

  // Show global error
  await expect(page.locator('form > div[role="alert"]:visible')).toHaveText(
    'Wrong email or password',
  )

  // Submit valid form
  await password.input.fill('supersafe')
  await button.click()
  await page.reload()
  await example.expectData({ email: 'john@doe.com', password: 'supersafe' })
})
