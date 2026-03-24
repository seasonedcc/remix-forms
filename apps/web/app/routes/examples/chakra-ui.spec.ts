import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/chakra-ui'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  const firstName = example.field('firstName')
  const email = example.field('email')
  const password = example.field('password')
  const bio = example.field('bio')
  const button = page.locator('form button:has-text("Sign up"):visible')

  await page.goto(route)

  // Render
  await example.expectField(firstName, { label: 'First name' })
  await example.expectField(email, { label: 'Email address' })
  await example.expectField(password, { type: 'password' })
  await example.expectField(bio, { multiline: true, required: false })
  await example.expectRadioToHaveOptions('role', [
    { name: 'Developer', value: 'developer' },
    { name: 'Designer', value: 'designer' },
    { name: 'Manager', value: 'manager' },
  ])
  await expect(button).toBeEnabled()

  // Custom props render correctly
  await expect(firstName.input).toHaveClass(/input-lg/)
  await expect(email.input).toHaveClass(/bg-base-200/)
  await expect(bio.input).toHaveClass(/resize-none/)

  // Client-side validation
  await button.click()

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(email, 'Invalid email address')
  await example.expectError(
    password,
    'Too small: expected string to have >=8 characters'
  )
  await expect(firstName.input).toBeFocused()

  // Fill required fields
  await firstName.input.fill('Jane')
  await example.expectValid(firstName)

  await email.input.fill('jane@doe.com')
  await example.expectValid(email)

  await password.input.fill('longpassword')
  await example.expectValid(password)

  // Select a radio option
  await page.locator('[name="role"][value="designer"]').click()

  // Optionally fill bio
  await bio.input.fill('Hello world')

  // Submit
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({
    firstName: 'Jane',
    email: 'jane@doe.com',
    password: 'longpassword',
    bio: 'Hello world',
    role: 'designer',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { page } = example
  const firstName = example.field('firstName')
  const email = example.field('email')
  const password = example.field('password')
  const button = page.locator('form button:has-text("Sign up"):visible')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(email, 'Invalid email address')
  await example.expectErrors(
    password,
    'Too small: expected string to have >=8 characters'
  )
  await example.expectAutoFocus(firstName)
  await example.expectNoAutoFocus(email)

  // Fill first field, focus moves
  await firstName.input.fill('Jane')
  await button.click()
  await page.reload()
  await example.expectValid(firstName)
  await example.expectNoAutoFocus(firstName)
  await example.expectAutoFocus(email)

  // Fill email
  await email.input.fill('jane@doe.com')
  await button.click()
  await page.reload()
  await example.expectValid(email)
  await example.expectAutoFocus(password)

  // Fill password
  await password.input.fill('longpassword')
  // Select a radio option
  await page.locator('[name="role"][value="manager"]').click()

  // Submit
  await button.click()
  await page.reload()
  await example.expectData({
    firstName: 'Jane',
    email: 'jane@doe.com',
    password: 'longpassword',
    role: 'manager',
  })
})
