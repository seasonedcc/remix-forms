import { expect, test } from 'tests/setup/tests'

const route = '/examples/render-object-array-item/drag-and-drop'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)
  await title.input.fill('My tasks')

  const addButton = page.getByRole('button', { name: 'Add' })
  await addButton.click()
  await addButton.click()

  const nameInputs = page.locator('input[name*="name"]').filter({
    hasNot: page.locator('[name="title"]'),
  })
  await expect(nameInputs).toHaveCount(2)
  await nameInputs.first().fill('Task A')
  await nameInputs.nth(1).fill('Task B')

  await button.click()

  await example.expectData({
    title: 'My tasks',
    tasks: [
      { name: 'Task A', done: false },
      { name: 'Task B', done: false },
    ],
  })
})

test('Drag reorder works', async ({ example }) => {
  const { page } = example

  await page.goto(route)

  const addButton = page.getByRole('button', { name: 'Add' })
  await addButton.click()
  await addButton.click()
  await addButton.click()

  const nameInputs = page.locator('input[name*="name"]').filter({
    hasNot: page.locator('[name="title"]'),
  })
  await nameInputs.first().fill('First')
  await nameInputs.nth(1).fill('Second')
  await nameInputs.nth(2).fill('Third')

  const draggables = page.locator('[draggable="true"]')
  await expect(draggables).toHaveCount(3)

  const first = draggables.first()
  const third = draggables.nth(2)
  await first.dragTo(third)

  const reorderedInputs = page.locator('input[name*="name"]').filter({
    hasNot: page.locator('[name="title"]'),
  })
  await expect(reorderedInputs.first()).not.toHaveValue('First')
})

test('Remove item works', async ({ example }) => {
  const { page } = example

  await page.goto(route)

  const addButton = page.getByRole('button', { name: 'Add' })
  await addButton.click()
  await addButton.click()

  const removeButtons = page.getByRole('button', { name: 'Remove' })
  await expect(removeButtons).toHaveCount(2)

  await removeButtons.first().click()
  await expect(removeButtons).toHaveCount(1)
})
