import { expect, test } from 'tests/setup/tests'

const route = '/examples/schemas/array-of-strings'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)
  await expect(button).toBeEnabled()

  await title.input.fill('My post')

  // Submit with no items — array-level error should show
  await button.click()

  await example.expectErrorMessage(
    'tags',
    'Too small: expected array to have >=1 items'
  )

  // Add an item, remove it, submit again — same error should show
  await page.locator('button:has-text("Add")').click()
  await page.locator('button:has-text("Remove")').click()
  await button.click()

  await example.expectErrorMessage(
    'tags',
    'Too small: expected array to have >=1 items'
  )

  await page.locator('button:has-text("Add")').click()
  const tagInput = page.locator('input[name="tags\\[0\\]"]')

  await button.click()

  await example.expectErrorMessage(
    'tags[0]',
    'Too small: expected string to have >=1 characters'
  )

  await tagInput.fill('foo')

  await button.click()

  await example.expectData({ title: 'My post', tags: ['foo'] })
})
