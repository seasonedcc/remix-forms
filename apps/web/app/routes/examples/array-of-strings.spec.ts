import { expect, test } from 'tests/setup/tests'

const route = '/examples/schemas/array-of-strings'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)
  await expect(button).toBeEnabled()

  await title.input.fill('My post')

  await page.locator('button:has-text("Add")').click()
  const tagInput = page.locator('input[name="tags\\[0\\]"]')
  await tagInput.fill('foo')

  await button.click()

  await example.expectData({ title: 'My post', tags: ['foo'] })
})
