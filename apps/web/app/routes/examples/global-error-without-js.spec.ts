import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/actions/global-error'

testWithoutJS('With JS disabled', async ({ example }) => {
  const { email, password, button, page } = example

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectErrors(
    email,
    'Too small: expected string to have >=1 characters',
    'Invalid email address'
  )

  await example.expectError(
    password,
    'Too small: expected string to have >=1 characters'
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
  await example.expectError(email, 'Invalid email address')

  // Make form be valid
  await email.input.fill('john@doe.com')
  await password.input.fill('123456')

  // Submit form
  await button.click()
  await page.reload()

  // Show global error
  await example.expectGlobalError('Wrong email or password')

  // Submit valid form
  await password.input.fill('supersafe')
  await button.click()
  await page.reload()
  await example.expectData({ email: 'john@doe.com', password: 'supersafe' })
})
