import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/chakra-ui'

test('With JS enabled', async ({ example }) => {
  const { email, password, page } = example
  const button = page.locator('form button:has-text("Sign up"):visible')

  await page.goto(route)

  // Render
  await example.expectField(email, { label: 'Email address' })
  await example.expectField(password, { type: 'password' })
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  await example.expectError(email, 'Invalid email address')
  await example.expectError(
    password,
    'Too small: expected string to have >=8 characters'
  )
  await expect(email.input).toBeFocused()

  // Make first field valid, focus moves to second
  await email.input.fill('john@doe.com')
  await button.click()
  await example.expectValid(email)
  await expect(password.input).toBeFocused()

  // Try too-short password
  await password.input.fill('short')
  await example.expectError(
    password,
    'Too small: expected string to have >=8 characters'
  )

  // Make form valid
  await password.input.fill('longpassword')
  await example.expectValid(password)

  // Submit
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({
    email: 'john@doe.com',
    password: 'longpassword',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { email, password, page } = example
  const button = page.locator('form button:has-text("Sign up"):visible')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  await example.expectError(email, 'Invalid email address')
  await example.expectErrors(
    password,
    'Too small: expected string to have >=8 characters'
  )
  await example.expectAutoFocus(email)
  await example.expectNoAutoFocus(password)

  // Make first field valid, focus moves to second
  await email.input.fill('john@doe.com')
  await button.click()
  await page.reload()
  await example.expectValid(email)
  await example.expectNoAutoFocus(email)
  await example.expectAutoFocus(password)

  // Try too-short password
  await password.input.fill('short')
  await button.click()
  await page.reload()
  await example.expectError(
    password,
    'Too small: expected string to have >=8 characters'
  )

  // Make form valid and submit
  await password.input.fill('longpassword')
  await button.click()
  await page.reload()
  await example.expectData({
    email: 'john@doe.com',
    password: 'longpassword',
  })
})
