import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/input-types'

test('With JS enabled', async ({ example }) => {
  const { email, password, button, page } = example
  const favColor = example.field('favColor')

  await page.goto(route)

  // Render
  await example.expectField(password, { type: 'password' })
  await example.expectField(email, { type: 'email' })
  await example.expectField(favColor, {
    label: 'Favorite Color',
    type: 'color',
    value: '#000000',
  })

  await expect(button).toBeEnabled()

  await example.email.input.fill('mary@company.com')
  await example.password.input.fill('password')
  await favColor.input.fill('#000000')
  await example.button // Submit form
    .click()

  await example.expectData({
    email: 'mary@company.com',
    password: 'password',
    favColor: '#000000',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { email, password, button, page } = example
  const favColor = example.field('favColor')
  await page.goto(route)

  // Render
  await example.expectField(email, { type: 'email' })
  await example.expectField(password, { type: 'password' })
  await example.expectField(favColor, {
    label: 'Favorite Color',
    type: 'color',
    value: '#000000',
  })

  await example.email.input.fill('mary@company.com')
  await example.password.input.fill('password')
  await favColor.input.fill('#000000')

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    email: 'mary@company.com',
    password: 'password',
    favColor: '#000000',
  })
})
