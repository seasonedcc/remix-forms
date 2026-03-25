import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/test-examples/hidden-field-with-custom-children'

test('With JS enabled', async ({ example }) => {
  const { firstName, button, page } = example
  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await expect(button).toBeEnabled()

  // Hidden field should be present in the DOM
  await expect(
    page.locator('input[name="csrfToken"][type="hidden"]')
  ).toHaveCount(1)

  // Client-side validation
  await button.click()

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )

  // Fill and submit
  await firstName.input.fill('John')
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, button, page } = example
  await page.goto(route)

  // Hidden field should be present in the DOM
  await expect(
    page.locator('input[name="csrfToken"][type="hidden"]')
  ).toHaveCount(1)

  // Server-side validation
  await button.click()
  await page.reload()

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )

  // Fill and submit
  await firstName.input.fill('John')
  await button.click()
  await page.reload()

  await example.expectData({
    csrfToken: 'abc123',
    firstName: 'John',
  })
})
