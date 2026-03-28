import { expect, test } from 'tests/setup/tests'

const route = '/examples/object-schemas/deeply-nested'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const company = example.field('company')

  await page.goto(route)

  await example.expectField(company)
  await expect(button).toBeEnabled()

  await expect(
    page.locator('input[name="headquarters\\[address\\]\\[street\\]"]')
  ).toBeVisible()
  await expect(
    page.locator('input[name="headquarters\\[address\\]\\[city\\]"]')
  ).toBeVisible()
  await expect(
    page.locator('input[name="headquarters\\[phone\\]"]')
  ).toBeVisible()

  await button.click()

  await example.expectError(
    company,
    'Too small: expected string to have >=1 characters'
  )

  await company.input.fill('Acme Inc')
  await page
    .locator('input[name="headquarters\\[address\\]\\[street\\]"]')
    .fill('456 Oak Ave')
  await page
    .locator('input[name="headquarters\\[address\\]\\[city\\]"]')
    .fill('Portland')
  await page.locator('input[name="headquarters\\[phone\\]"]').fill('555-0123')

  await button.click()

  await example.expectData({
    company: 'Acme Inc',
    headquarters: {
      address: { street: '456 Oak Ave', city: 'Portland' },
      phone: '555-0123',
    },
  })
})
