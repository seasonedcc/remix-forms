import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/hidden-field'

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const howDidYouFindUs = example.field('howDidYouFindUs')

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
  await howDidYouFindUs.input.selectOption('google')

  // Submit form
  await button.click()
  await page.reload()
  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
    email: 'john@doe.com',
    howDidYouFindUs: 'google',
  })
})
