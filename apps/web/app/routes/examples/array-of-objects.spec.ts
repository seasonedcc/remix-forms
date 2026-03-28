import { expect, test } from 'tests/setup/tests'

const route = '/examples/schemas/array-of-objects'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)
  await expect(button).toBeEnabled()

  await title.input.fill('Contacts')

  // Submit with no items — array-level error should show
  await button.click()

  await example.expectErrorMessage(
    'contacts',
    'Too small: expected array to have >=1 items'
  )

  // Add an item, remove it, submit again — same error should show
  await page.locator('button:has-text("Add")').click()
  await page.locator('button:has-text("Remove")').click()
  await button.click()

  await example.expectErrorMessage(
    'contacts',
    'Too small: expected array to have >=1 items'
  )

  await page.locator('button:has-text("Add")').click()
  await page.locator('input[name="contacts\\[0\\]\\[name\\]"]').fill('Jane')
  await page
    .locator('input[name="contacts\\[0\\]\\[email\\]"]')
    .fill('jane@doe.com')

  await button.click()

  await example.expectData({
    title: 'Contacts',
    contacts: [{ name: 'Jane', email: 'jane@doe.com' }],
  })
})
