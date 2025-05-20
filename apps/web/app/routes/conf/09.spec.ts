import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/conf/09'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  const button = page.getByRole('button', { name: 'Make reservation' })
  const city = example.field('city')
  const checkIn = example.field('checkIn')
  const checkOut = example.field('checkOut')
  const adults = example.field('adults')
  const children = example.field('children')
  const bedrooms = example.field('bedrooms')
  const specialRequests = example.field('specialRequests')

  await page.goto(route)

  // Render
  await example.expectSelect(city, { value: '' })
  const options = city.input.locator('option')
  await expect(options.nth(0)).toHaveText('Salt Lake City')
  await expect(options.nth(1)).toHaveText('Las Vegas')
  await expect(options.nth(2)).toHaveText('Los Angeles')
  await example.expectField(checkIn, { type: 'date' })
  await example.expectField(checkOut, { type: 'date' })
  await example.expectField(adults)
  await example.expectField(children)
  await example.expectField(bedrooms)
  await example.expectField(specialRequests, {
    multiline: true,
    required: false,
  })
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  await example.expectError(
    city,
    "Invalid enum value. Expected 'lasVegas' | 'losAngeles' | 'saltLakeCity', received ''"
  )
  await example.expectError(checkIn, 'Expected date, received null')

  await city.input.selectOption('saltLakeCity')
  await button.click()
  await example.expectValid(city)
  await expect(checkIn.input).toBeFocused()

  await checkIn.input.fill('2022-01-01')
  await checkOut.input.fill('2022-01-10')
  await adults.input.fill('2')
  await children.input.fill('1')
  await bedrooms.input.fill('1')
  await specialRequests.input.fill('Towels please')

  await button.click()

  await example.expectError(specialRequests, "Don't be such a diva!")
  await specialRequests.input.fill('None')

  button.click()
  await expect(button).toBeDisabled()
  await expect(page).toHaveURL('/conf/success/09')
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { page } = example
  const button = page.getByRole('button', { name: 'Make reservation' })
  const city = example.field('city')
  const checkIn = example.field('checkIn')
  const checkOut = example.field('checkOut')
  const adults = example.field('adults')
  const children = example.field('children')
  const bedrooms = example.field('bedrooms')
  const specialRequests = example.field('specialRequests')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  await example.expectError(
    city,
    "Invalid enum value. Expected 'lasVegas' | 'losAngeles' | 'saltLakeCity', received ''"
  )
  await example.expectError(checkIn, 'Expected date, received null')
  await example.expectAutoFocus(city)

  await city.input.selectOption('lasVegas')
  await button.click()
  await page.reload()
  await example.expectValid(city)
  await example.expectAutoFocus(checkIn)

  await checkIn.input.fill('2022-01-01')
  await checkOut.input.fill('2022-01-10')
  await adults.input.fill('2')
  await children.input.fill('1')
  await bedrooms.input.fill('1')
  await specialRequests.input.fill('Towels please')

  await button.click()
  await page.reload()
  await example.expectError(specialRequests, "Don't be such a diva!")

  await specialRequests.input.fill('None')
  await button.click()
  await page.reload()
  await expect(page).toHaveURL('/conf/success/09')
})
