import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/test-examples/field-with-radio-children'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const howYouFoundOutAboutUs = example.field('howYouFoundOutAboutUs')
  const message = example.field('message')
  const buttonSpan = page.locator('form span:has-text("OK"):visible')

  await page.goto(route)

  // Render
  await example.expectField(firstName, { placeholder: 'Your first name' })

  await example.expectField(email, {
    label: 'E-mail',
    placeholder: 'Your e-mail',
  })

  await expect(page.locator('form em:visible')).toHaveText(
    "You'll hear from us at this address 👆🏽",
  )
  await example.expectRadioToHaveOptions('howYouFoundOutAboutUs', [
    { name: 'Friend', value: 'fromAFriend' },
    { name: 'Search', value: 'google' },
  ])

  await howYouFoundOutAboutUs.input.first().click()

  await example.expectField(message, {
    multiline: true,
    required: false,
    placeholder: 'Your message',
  })

  await expect(button).toBeEnabled()

  // Client-side validation
  await buttonSpan.click()

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
  await buttonSpan.click()
  await example.expectValid(firstName)
  await expect(email.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid email')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await howYouFoundOutAboutUs.input.last().click()
  await message.input.fill('My message')
  await example.expectValid(email)

  // Submit form
  await buttonSpan.click()
  await expect(button).toBeDisabled()

  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howYouFoundOutAboutUs: 'fromAFriend',
    message: 'My message',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const howYouFoundOutAboutUs = example.field('howYouFoundOutAboutUs')
  const message = example.field('message')

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
  await message.input.fill('My message')
  await button.click()
  await page.reload()
  await example.expectError(email, 'Invalid email')

  // Make form be valid and test selecting an option
  await email.input.fill('john@doe.com')
  await howYouFoundOutAboutUs.input.last().click()

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howYouFoundOutAboutUs: 'fromAFriend',
    message: 'My message',
  })
})
