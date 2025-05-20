import { expect, test } from 'tests/setup/tests'

const route = '/conf/01'

test('Redirects to success and back', async ({ example }) => {
  const { page } = example

  await page.goto(route)

  await page.click('form button:has-text("Make reservation")')
  await expect(page).toHaveURL('/conf/success/01')
  const back = page.getByRole('link', { name: 'Go back' })
  await expect(back).toHaveAttribute('href', '/conf/01')
  await back.click()
  await expect(page).toHaveURL('/conf/01')
})
