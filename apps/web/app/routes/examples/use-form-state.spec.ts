import { expect, test } from 'tests/setup/tests'

const route = '/examples/forms/use-form-state'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const age = example.field('age')

  await page.goto(route)

  await example.expectField(age)
  await expect(button).toBeDisabled()

  await age.input.fill('5')
  await expect(button).toBeEnabled()

  await button.click()

  await example.expectData({ age: 5 })
})
