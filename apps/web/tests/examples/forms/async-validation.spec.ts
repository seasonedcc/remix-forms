import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/async-validation'

test('With JS enabled', async ({ example }) => {
  const { password, button, page } = example
  const username = example.field('username')

  await page.goto(route)

  // Render
  await example.expectField(username)
  await example.expectField(password)
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    username,
    'String must contain at least 1 character(s)',
  )

  await example.expectError(
    password,
    'String must contain at least 1 character(s)',
  )

  // Type in the username
  await Promise.all([
    username.input.type('fo'),
    page.waitForResponse((response) =>
      response.url().includes('async-validation?username=fo'),
    ),
  ])

  await expect(button).toBeEnabled()

  await Promise.all([
    username.input.type('o'),
    page.waitForResponse((response) =>
      response.url().includes('async-validation?username=foo'),
    ),
  ])

  await expect(button).toBeDisabled()
  await expect(page.locator('[name=username] + div')).toHaveText(
    'Already taken',
  )

  // Make first field be valid, focus goes to the second field
  await username.input.fill('john')
  await expect(button).toBeEnabled()

  await button.click()
  await example.expectValid(username)
  await expect(password.input).toBeFocused()

  // Make form be valid
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  await button.click()
  await example.expectData({ username: 'john', password: '123456' })
})

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
    'String must contain at least 1 character(s)',
  )

  await example.expectError(
    password,
    'String must contain at least 1 character(s)',
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
