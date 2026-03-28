import { expect, test } from 'tests/setup/tests'

const route = '/examples/object-schemas/object-with-children'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const title = example.field('title')

  await page.goto(route)

  await example.expectField(title)
  await expect(button).toBeEnabled()

  await expect(page.locator('label:has-text("Author details")')).toBeVisible()
  await expect(page.locator('label:has-text("Full name")')).toBeVisible()

  await expect(page.locator('input[name="author\\[name\\]"]')).toBeVisible()
  await expect(page.locator('input[name="author\\[email\\]"]')).toBeVisible()
  await expect(page.locator('textarea[name="author\\[bio\\]"]')).toBeVisible()

  await button.click()

  await example.expectError(
    title,
    'Too small: expected string to have >=1 characters'
  )

  await title.input.fill('My Article')
  await page.locator('input[name="author\\[name\\]"]').fill('Jane Doe')
  await page.locator('input[name="author\\[email\\]"]').fill('jane@example.com')
  await page
    .locator('textarea[name="author\\[bio\\]"]')
    .fill('Writer and developer')

  await button.click()

  await example.expectData({
    title: 'My Article',
    author: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      bio: 'Writer and developer',
    },
  })
})
