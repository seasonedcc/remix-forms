import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/async-validation'

testWithoutJS('With JS disabled', async ({ example }) => {
  const { password, button, page } = example
  const username = example.field('username')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(
    username,
    'Too small: expected string to have >=1 characters'
  )

  await example.expectError(
    password,
    'Too small: expected string to have >=1 characters'
  )

  await example.expectAutoFocus(username)
  await example.expectNoAutoFocus(password)

  // Make first field be valid, focus goes to the second field
  await username.input.fill('john')
  await button.click()
  await page.reload()
  await example.expectValid(username)
  await example.expectAutoFocus(password)
  await example.expectNoAutoFocus(username)

  // Make form be valid
  await username.input.fill('foo')
  await password.input.fill('123456')

  // Submit form
  await button.click()
  await page.reload()

  // Show field error
  await example.expectError(username, 'Already taken')

  // Submit valid form
  await username.input.fill('john')
  await button.click()
  await page.reload()
  await example.expectData({ username: 'john', password: '123456' })
})
