import { expect, test } from 'tests/setup/tests'

const route = '/examples/schemas/array-of-objects'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')
  const nameInput = page.locator('input[placeholder="Name"]')
  const emailInput = page.locator('input[placeholder="E-mail"]')
  const addButton = page.locator('button:has-text("+")')

  await page.goto(route)

  await example.expectField(title)
  await expect(nameInput).toBeVisible()
  await expect(emailInput).toBeVisible()
  await expect(button).toBeEnabled()

  await title.input.fill('Contacts')
  await nameInput.fill('John')
  await emailInput.fill('john@doe.com')
  await addButton.click()

  await nameInput.fill('Jane')
  await emailInput.fill('jane@doe.com')
  await addButton.click()

  await page.locator('span:has-text("John (john@doe.com)") button').click()

  await button.click()

  await example.expectData({
    title: 'Contacts',
    contacts: [{ name: 'Jane', email: 'jane@doe.com' }],
  })
})
