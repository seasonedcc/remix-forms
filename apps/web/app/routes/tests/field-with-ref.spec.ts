import { expect, test } from 'tests/setup/tests'

const route = '/test-examples/field-with-ref'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example

  await page.goto(route)
  const tags = example.field('oneTag')

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectErrorMessage(
    'tags',
    'Array must contain at least 1 element(s)'
  )

  await expect(tags.input).toBeFocused()

  await tags.input.fill('some tag')
  await tags.input.press('Enter')

  // Submit form
  button.click()
  await expect(button).toBeDisabled()
  await example.expectData({ tags: ['some tag'] })
})
