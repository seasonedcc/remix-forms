import { test } from 'tests/setup/tests'

const route = '/examples/forms/multiple-forms'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  const loginEmail = page.locator(
    'form:has(button:has-text("Login")) [name="email"]'
  )
  const loginPassword = page.locator(
    'form:has(button:has-text("Login")) [name="password"]'
  )
  const loginButton = page.locator('form button:has-text("Login")')

  await page.goto(route)

  await loginEmail.fill('john@doe.com')
  await loginPassword.fill('password123')
  await loginButton.click()
  await page.waitForLoadState('networkidle')

  await example.expectData({
    _action: '/login',
    email: 'john@doe.com',
    password: 'password123',
  })
})
