import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/modes/on-change'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await example.expectField(email)
  await expect(button).toBeDisabled()

  // Client-side validation
  await firstName.input.type('a')
  await firstName.input.fill('')

  await example.expectError(
    firstName,
    'Invalid input'
  )

  await email.input.type('a')
  await email.input.fill('')
  await example.expectError(
    email,
    'Invalid input'
  )
  await email.input.fill('john')
  await example.expectError(email, 'Invalid input')

  // Make form be valid
  await firstName.input.fill('John')
  await email.input.fill('john@doe.com')
  await expect(button).toBeEnabled()

  // Submit form
  await button.click()
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
    'Too small: expected string to have >=1 characters'
  )

  await example.expectErrors(
    email,
    'Too small: expected string to have >=1 characters',
    'Invalid email address'
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
  await example.expectError(email, 'Invalid email address')

  // Make form be valid and test selecting an option
  await email.input.fill('john@doe.com')

  // Submit form
  await button.click()
  await page.reload()
  await example.expectData({ firstName: 'John', email: 'john@doe.com' })
})
