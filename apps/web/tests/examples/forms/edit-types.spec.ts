import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/input-types'

test('With JS enabled', async ({ example }) => {
  const { email, password, button, page } = example

  await page.goto(route)

  // Render
  await example.expectField(password, { type: 'password' })

  await expect(button).toBeEnabled()

  await example.email.input.fill('mary@company.com')
  await example.password.input.fill('password')
  // Submit form
  button.click()

  await example.expectData({
    email: 'mary@company.com',
    password: 'password',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { password, button, page } = example
  await page.goto(route)

  // Render
  await example.expectField(password, { type: 'password' })

  await example.email.input.fill('mary@company.com')
  await example.password.input.fill('password')

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    email: 'mary@company.com',
    password: 'password',
  })
})
