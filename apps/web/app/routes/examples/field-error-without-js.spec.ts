import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/actions/field-error'

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
    'Invalid email'
  )

  await example.expectError(
    password,
    'String must contain at least 1 character(s)'
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
