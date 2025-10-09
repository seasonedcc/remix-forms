import { expect, test } from 'tests/setup/tests'

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
    'Too small: expected string to have >=1 characters'
  )

  await example.expectError(
    password,
    'Too small: expected string to have >=1 characters'
  )

  await username.input.pressSequentially('fo')
  await page.waitForResponse((response) =>
    response.url().includes('async-validation.data?username=fo')
  )
  await expect(button).toBeEnabled()

  // Type in the username
  await username.input.pressSequentially('o')
  await page.waitForResponse((response) =>
    response.url().includes('async-validation.data?username=foo')
  )

  await expect(page.locator('[name=username] + div')).toHaveText(
    'Already taken'
  )
  await expect(button).toBeDisabled()

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
