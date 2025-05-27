import { expect, test } from 'tests/setup/tests'

const route = '/examples/actions/field-error'
test('With JS enabled clear server error on the client', async ({
  example,
}) => {
  const { email, password, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(email)
  await example.expectField(password)
  await expect(button).toBeEnabled()

  // Make generate server error
  await email.input.fill('foo@bar.com')
  await example.expectValid(email)
  await password.input.fill('123456')
  await example.expectValid(password)

  // Submit form
  await button.click()
  await expect(button).toBeDisabled()

  // Show field error
  await example.expectError(email, 'Email already taken')

  // Submit valid form
  await page.waitForTimeout(100)
  await email.input.pressSequentially('o')
  await example.expectValid(email)
})
