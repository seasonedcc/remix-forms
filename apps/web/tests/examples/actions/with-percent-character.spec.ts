import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/actions/without-redirect'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await example.expectField(email)

  await firstName.input.fill('John%')
  await example.expectValid(firstName)

  await email.input.fill('john@doe.com')
  await example.expectValid(email)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()
  await example.expectData({ firstName: 'John%', email: 'john@doe.com' })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(firstName)
  await example.expectField(email)

  await firstName.input.fill('John%')
  await example.expectValid(firstName)

  await email.input.fill('john@doe.com')
  await example.expectValid(email)

  // Submit form
  button.click()
  await example.expectData({ firstName: 'John%', email: 'john@doe.com' })
})
