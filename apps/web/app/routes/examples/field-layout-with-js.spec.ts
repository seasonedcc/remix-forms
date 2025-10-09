import { expect, test } from 'tests/setup/tests'

const route = '/examples/forms/field-layout'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const street = example.field('street')
  const number = example.field('number')
  const extendedAddress = example.field('extendedAddress')
  const city = example.field('city')
  const state = example.field('state')

  await page.goto(route)

  // Render
  await example.expectField(street)
  await example.expectField(number)
  await example.expectField(extendedAddress, { required: false })
  await example.expectField(city)
  await example.expectSelect(state, { value: '' })
  await expect(button).toBeEnabled()
  await expect(street.input).toBeFocused()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    street,
    'Invalid input'
  )
  await example.expectError(
    number,
    'Invalid input'
  )

  await example.expectValid(extendedAddress)
  await example.expectError(city, 'Invalid input')
  await expect(street.input).toBeFocused()

  // Make first field be valid, focus goes to the second field
  await street.input.fill('Street')
  await button.click()
  await example.expectValid(street)
  await expect(number.input).toBeFocused()

  await number.input.fill('123')
  await button.click()
  await example.expectValid(number)
  await expect(city.input).toBeFocused()

  // Make form be valid
  await extendedAddress.input.fill('Extended address')
  await city.input.fill('City')
  await state.input.selectOption('Alaska')

  // Submit form
  await button.click()
  await example.expectValid(city)
  await expect(button).toBeDisabled()

  await example.expectData({
    street: 'Street',
    number: '123',
    extendedAddress: 'Extended address',
    city: 'City',
    state: 'Alaska',
  })
})
