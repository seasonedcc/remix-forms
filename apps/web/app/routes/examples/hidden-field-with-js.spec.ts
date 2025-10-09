import { expect, test } from 'tests/setup/tests'

const route = '/examples/forms/hidden-field'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const howDidYouFindUs = example.field('howDidYouFindUs')

  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await example.expectField(email)
  await example.expectSelect(howDidYouFindUs, { value: '' })
  const options = howDidYouFindUs.input.locator('option')
  await expect(options.first()).toHaveText('A Friend')
  await expect(options.last()).toHaveText('Google')
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(firstName, 'Invalid input')

  await example.expectError(email, 'Invalid input')

  await expect(firstName.input).toBeFocused()

  // Make first field be valid, focus goes to the second field
  await firstName.input.fill('John')
  await button.click()
  await example.expectValid(firstName)
  await expect(email.input).toBeFocused()

  // Try another invalid message
  await email.input.fill('john')
  await example.expectError(email, 'Invalid input')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await howDidYouFindUs.input.selectOption('google')
  await example.expectValid(email)
  await example.expectValid(howDidYouFindUs)

  // Submit form
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howDidYouFindUs: 'google',
  })
})
