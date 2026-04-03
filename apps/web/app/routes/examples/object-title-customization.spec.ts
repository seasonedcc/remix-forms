import { expect, test } from 'tests/setup/tests'

const route = '/examples/render-object-field/object-title-customization'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example

  await page.goto(route)

  const wrapper = page.locator('.border-primary\\/30')
  await expect(wrapper).toBeVisible()

  const name = example.field('name')
  await name.input.fill('John')

  const street = page.locator(
    'input[name="address\\[street\\]"], input[name="address.street"]'
  )
  const city = page.locator(
    'input[name="address\\[city\\]"], input[name="address.city"]'
  )
  const zip = page.locator(
    'input[name="address\\[zip\\]"], input[name="address.zip"]'
  )

  await street.fill('123 Main St')
  await city.fill('Springfield')
  await zip.fill('62701')

  await button.click()

  await example.expectData({
    name: 'John',
    address: { street: '123 Main St', city: 'Springfield', zip: '62701' },
  })
})
