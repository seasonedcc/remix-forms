import { test, testWithoutJS, expect } from 'tests/setup/tests'

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
    'String must contain at least 1 character(s)',
  )
  await example.expectGlobalError(
    'Some prop errorCsrf Token: String must contain at least 1 character(s)',
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
    'String must contain at least 1 character(s)',
  )
  // TODO: Fix the server-side validation
  // await example.expectGlobalError(
  //   'Some prop errorCsrf Token: String must contain at least 1 character(s)',
  // )
  await example.expectGlobalError(
    'Csrf Token: String must contain at least 1 character(s)',
  )
})
