import { expect, test } from 'tests/setup/tests'

const route = '/examples/object-schemas/nested-object'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')

  await page.goto(route)

  await example.expectField(name)
  await expect(button).toBeEnabled()

  await expect(page.locator('input[name="address\\[street\\]"]')).toBeVisible()
  await expect(page.locator('input[name="address\\[city\\]"]')).toBeVisible()
  await expect(page.locator('input[name="address\\[zip\\]"]')).toBeVisible()

  await button.click()

  await example.expectError(
    name,
    'Too small: expected string to have >=1 characters'
  )

  await example.expectErrorMessage(
    'address\\[street\\]',
    'Too small: expected string to have >=1 characters'
  )
  await example.expectErrorMessage(
    'address\\[city\\]',
    'Too small: expected string to have >=1 characters'
  )
  await example.expectErrorMessage(
    'address\\[zip\\]',
    'Too small: expected string to have >=5 characters'
  )

  await name.input.fill('Jane Doe')
  await page.locator('input[name="address\\[street\\]"]').fill('123 Main St')
  await page.locator('input[name="address\\[city\\]"]').fill('Springfield')
  await page.locator('input[name="address\\[zip\\]"]').fill('62704')

  await button.click()

  await example.expectData({
    name: 'Jane Doe',
    address: { street: '123 Main St', city: 'Springfield', zip: '62704' },
  })
})
