import { expect, test } from 'tests/setup/tests'

const route = '/get-started'

test('Get Started page shows installation info', async ({ example }) => {
  const { page } = example

  await page.goto(route)

  await expect(page.locator('h1')).toHaveText('Get Started')
  await expect(
    page.getByRole('link', { name: 'Check out more examples' })
  ).toHaveAttribute('href', '/examples')
})
