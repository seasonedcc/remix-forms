import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/form-with-children'

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const howDidYouFindUs = example.field('howDidYouFindUs')
  const message = example.field('message')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(
    firstName,
    'String must contain at least 1 character(s)'
  )

  await example.expectErrors(
    email,
    'String must contain at least 1 character(s)',
    'Invalid email'
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
  await howDidYouFindUs.input.last().click()

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howDidYouFindUs: 'google',
    message: 'My message',
  })
})
