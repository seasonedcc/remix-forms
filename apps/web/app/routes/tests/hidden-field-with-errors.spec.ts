import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/test-examples/hidden-field-with-errors'

test('With JS enabled', async ({ example }) => {
  const { firstName, button, page } = example
  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectGlobalError(
    'Some prop errorCsrf Token: Too small: expected string to have >=1 characters'
  )
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, button, page } = example
  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(
    firstName,
    'Too small: expected string to have >=1 characters'
  )

  await example.expectGlobalError(
    'Some prop errorCsrf Token: Too small: expected string to have >=1 characters'
  )
})
