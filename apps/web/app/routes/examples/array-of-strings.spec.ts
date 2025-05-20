import { expect, test } from 'tests/setup/tests'

const route = '/examples/schemas/array-of-strings'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')
  const tagInput = page.locator(
    'input[placeholder="Add a tag and press Enter..."]'
  )

  await page.goto(route)

  await example.expectField(title)
  await expect(tagInput).toBeVisible()
  await expect(button).toBeEnabled()

  await title.input.fill('My post')
  await tagInput.fill('foo')
  await tagInput.press('Enter')
  await tagInput.fill('bar')
  await tagInput.press('Enter')
  await page.locator('span:has-text("foo") button').click()

  await button.click()

  await example.expectData({ title: 'My post', tags: ['bar'] })
})
