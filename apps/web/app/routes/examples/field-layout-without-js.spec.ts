import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/field-layout'

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const street = example.field('street')
  const number = example.field('number')
  const extendedAddress = example.field('extendedAddress')
  const city = example.field('city')
  const state = example.field('state')

  await page.goto(route)
  await example.expectAutoFocus(street)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(
    street,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(
    number,
    'Too small: expected string to have >=1 characters'
  )

  await example.expectValid(extendedAddress)
  await example.expectError(
    city,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectAutoFocus(street)

  // Make first field be valid, focus goes to the second field
  await street.input.fill('Street')
  await button.click()
  await page.reload()
  await example.expectValid(street)
  await example.expectAutoFocus(number)

  await number.input.fill('123')
  await button.click()
  await page.reload()
  await example.expectValid(number)
  await example.expectAutoFocus(city)

  // Make form be valid
  await extendedAddress.input.fill('Extended address')
  await city.input.fill('City')
  await state.input.selectOption('Alaska')

  // Submit form
  await button.click()
  await page.reload()
  await example.expectValid(city)

  await example.expectData({
    street: 'Street',
    number: '123',
    extendedAddress: 'Extended address',
    city: 'City',
    state: 'Alaska',
  })
})
