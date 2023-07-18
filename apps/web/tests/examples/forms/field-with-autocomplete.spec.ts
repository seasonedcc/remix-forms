import { test, expect } from 'tests/setup/tests'

const route = '/test-examples/field-with-autocomplete'

test('With JS enabled', async ({ example }) => {
  const { page } = example

  const name = example.field('name')
  const code = example.field('code')
  const organizationTitle = example.field('organizationTitle')
  const organization = example.field('organization')
  const streetAddress = example.field('streetAddress')
  const country = example.field('country')
  const postalCode = example.field('postalCode')
  const addressLine1 = example.field('addressLine1')

  await page.goto(route)

  await expect(name.input).toHaveAttribute('autocomplete', 'name')
  await expect(code.input).toHaveAttribute('autocomplete', 'one-time-code')
  await expect(organizationTitle.input).toHaveAttribute(
    'autocomplete',
    'organization-title',
  )
  await expect(streetAddress.input).toHaveAttribute(
    'autocomplete',
    'street-address',
  )
  await expect(organization.input).toHaveAttribute(
    'autocomplete',
    'organization',
  )
  await expect(country.input).toHaveAttribute('autocomplete', 'country')
  await expect(postalCode.input).toHaveAttribute('autocomplete', 'postal-code')
  await expect(addressLine1.input).toHaveAttribute(
    'autocomplete',
    'address-line1',
  )
})
