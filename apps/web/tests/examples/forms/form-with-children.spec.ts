import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/form-with-children'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const howYouFoundOutAboutUs = example.field('howYouFoundOutAboutUs')
  const message = example.field('message')

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

  await example.expectSelect(howYouFoundOutAboutUs, { value: 'fromAFriend' })

  const options = howYouFoundOutAboutUs.input.locator('option')
  await expect(options.first()).toHaveText('Friend')
  await expect(options.last()).toHaveText('Search')

  await example.expectField(message, {
    multiline: true,
    required: false,
    placeholder: 'Your message',
  })

  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

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
  await button.click()
  await example.expectValid(firstName)
  await expect(email.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid email')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await howYouFoundOutAboutUs.input.selectOption('google')
  await message.input.fill('My message')
  await example.expectValid(email)
  await example.expectValid(howYouFoundOutAboutUs)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()

  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howYouFoundOutAboutUs: 'google',
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
  await howYouFoundOutAboutUs.input.selectOption('google')

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howYouFoundOutAboutUs: 'google',
    message: 'My message',
  })
})
