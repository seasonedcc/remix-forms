import { expect, test } from 'tests/setup/tests'

const route = '/examples/forms/dynamic-form'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const firstName = example.field('firstName')
  const email = example.field('email')
  const age = example.field('age')

  await page.goto(route)

  await example.expectField(firstName)
  await example.expectField(email)
  await example.expectField(age)
  await expect(button).toBeEnabled()

  await firstName.input.fill('John')
  await email.input.fill('john@doe.com')
  await age.input.fill('42')

  await button.click()

  await example.expectData({
    firstName: 'John',
    email: 'john@doe.com',
    age: 42,
  })
})
