import { expect, test } from 'tests/setup/tests'

const route = '/success'

test('Displays success message and link', async ({ example }) => {
  const { page } = example

  await page.goto(route)

  await expect(page.locator('h1')).toHaveText('Success! 🎉')
  await expect(
    page.getByRole('link', { name: /other examples/ })
  ).toHaveAttribute('href', '/examples')
})
