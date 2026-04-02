import { expect, test } from 'tests/setup/tests'

const route = '/examples/render-array-field/array-title-customization'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)

  const badge = page.locator('.text-accent')
  await expect(badge).toContainText('Array of string')

  await title.input.fill('My list')

  const addButton = page.getByRole('button', { name: 'Add' }).first()
  await addButton.click()

  const tagInputs = page.locator('input[name*="tags"]')
  await expect(tagInputs.first()).toBeFocused()
  await tagInputs.first().fill('react')

  await addButton.click()
  await expect(tagInputs.nth(1)).toBeFocused()
  await tagInputs.nth(1).fill('remix')

  await button.click()

  await example.expectData({
    title: 'My list',
    tags: ['react', 'remix'],
  })
})
