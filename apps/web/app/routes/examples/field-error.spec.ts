import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/actions/field-error'
test('With JS enabled clear server error on the client', async ({
  example,
}) => {
  const { email, password, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(email)
  await example.expectField(password)
  await expect(button).toBeEnabled()

  // Make generate server error
  await email.input.fill('foo@bar.com')
  await example.expectValid(email)
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()

  // Show field error
  await example.expectError(email, 'Email already taken')

  // Submit valid form
  await page.waitForTimeout(100)
  await email.input.pressSequentially('o')
  await example.expectValid(email)
})

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
  await email.input.fill('foo@bar.com')
  await example.expectValid(email)
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()

  // Show field error
  await example.expectError(email, 'Email already taken')

  // Submit valid form
  await email.input.fill('john@doe.com')
  button.click()
  await example.expectData({ email: 'john@doe.com', password: '123456' })
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
  await email.input.fill('foo@bar.com')
  await password.input.fill('123456')

  // Submit form
  await button.click()
  await page.reload()

  // Show field error
  await example.expectError(email, 'Email already taken')

  // Submit valid form
  await email.input.fill('john@doe.com')
  await button.click()
  await page.reload()
  await example.expectData({ email: 'john@doe.com', password: '123456' })
})
