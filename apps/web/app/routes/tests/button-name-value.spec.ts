import { test } from 'tests/setup/tests'

const route = '/test-examples/button-name-value'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  const nameField = example.field('name')
  const saveButton = page.locator('form button:has-text("Save")')

  await page.goto(route)

  await nameField.input.fill('John')

  await saveButton.click()
  await page.waitForLoadState('networkidle')

  await example.expectData({
    name: 'John',
    _action: 'save',
  })
})

test('Clicking the other button sends its value', async ({ example }) => {
  const { page } = example
  const nameField = example.field('name')
  const deleteButton = page.locator('form button:has-text("Delete")')

  await page.goto(route)

  await nameField.input.fill('John')

  await deleteButton.click()
  await page.waitForLoadState('networkidle')

  await example.expectData({
    name: 'John',
    _action: 'delete',
  })
})
