import { expect, test } from 'tests/setup/tests'

const route = '/examples/array-schemas/array-of-arrays'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)
  await expect(button).toBeEnabled()

  await title.input.fill('My matrix')

  await button.click()

  await example.expectErrorMessage(
    'matrix',
    'Too small: expected array to have >=1 items'
  )

  await page.locator('button:has-text("Add")').first().click()

  await page.locator('button:has-text("Add")').first().click()
  await expect(page.locator('input[name="matrix\\[0\\]\\[0\\]"]')).toBeFocused()

  await page.locator('input[name="matrix\\[0\\]\\[0\\]"]').fill('cell')

  await button.click()

  await example.expectData({ title: 'My matrix', matrix: [['cell']] })
})
