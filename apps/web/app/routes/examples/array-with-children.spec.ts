import { expect, test } from 'tests/setup/tests'

const route = '/examples/array-schemas/array-with-children'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const listName = example.field('listName')

  await page.goto(route)

  await example.expectField(listName)
  await expect(button).toBeEnabled()

  await listName.input.fill('Groceries')

  await button.click()

  await example.expectErrorMessage(
    'items',
    'Too small: expected array to have >=1 items'
  )

  await page.locator('button:has-text("Add item")').click()
  await expect(page.locator('input[name="items\\[0\\]"]')).toBeFocused()

  await button.click()

  await example.expectErrorMessage(
    'items[0]',
    'Too small: expected string to have >=1 characters'
  )

  await page.locator('input[name="items\\[0\\]"]').fill('Apples')

  await page.locator('button:has-text("Add item")').click()
  await expect(page.locator('input[name="items\\[1\\]"]')).toBeFocused()
  await page.locator('input[name="items\\[1\\]"]').fill('Bananas')

  await page.locator('button:has-text("Up")').click()

  await page.locator('button:has-text("Remove")').last().click()

  await button.click()

  await example.expectData({ listName: 'Groceries', items: ['Bananas'] })
})
