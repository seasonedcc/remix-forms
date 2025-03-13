import { expect, test } from 'tests/setup/tests'

const route = '/examples/forms/use-field'

test('With JS enabled', async ({ example }) => {
  const { email, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(email, {
    label: 'Email',
  })
  await expect(button).toBeEnabled()

  // Fill in an invalid email address
  await email.input.fill('john@doe')

  // Client-side validation
  await button.click()

  // Show fields that are invalid using class
  const invalidClass = 'border-red-600 focus:border-red-600 focus:ring-red-600'

  expect(await email.input.getAttribute('class')).toContain(invalidClass)

  // Fill in a valid email
  await email.input.fill('default@domain.tld')

  expect(await email.input.getAttribute('class')).not.toContain(invalidClass)
})
