import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/use-fetcher'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')

  await page.goto(route)

  // Render
  await example.expectField(name, { label: null, placeholder: 'Add to-do' })
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(name, 'String must contain at least 1 character(s)')
  await expect(name.input).toBeFocused()

  // Make form be valid
  await name.input.fill('todo')
  await button.click()
  await example.expectValid(name)
  await expect(name.input).toBeFocused()
  await expect(page.locator('label[for=todo]')).toHaveText('todo')
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Does not show field errors but focus on the first field
  await example.expectAutoFocus(name)

  // Submit form
  await name.input.fill('todo')
  await button.click()
  await page.reload()
  await example.expectValid(name)
  await example.expectAutoFocus(name)
  await example.expectData({ name: 'todo' })
})
