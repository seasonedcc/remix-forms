import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/schemas/numbers'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultRandom = example.field('defaultRandom')
  const greaterThan = example.field('greaterThan')
  const greaterThanOrEqualTo = example.field('greaterThanOrEqualTo')
  const lowerThan = example.field('lowerThan')
  const lowerThanOrEqualTo = example.field('lowerThanOrEqualTo')
  const integer = example.field('integer')

  await page.goto(route)

  // Render
  await example.expectField(mandatory)
  await example.expectField(optional, { required: false })
  await example.expectField(nullable, { required: false })
  await example.expectField(defaultRandom, { value: /\d/ })
  await example.expectField(greaterThan)
  await example.expectField(greaterThanOrEqualTo)
  await example.expectField(lowerThan)
  await example.expectField(lowerThanOrEqualTo)
  await example.expectField(integer)

  await expect(button).toBeEnabled()

  // Client-side validation

  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(mandatory, 'Expected number, received null')
  await example.expectValid(optional)
  await example.expectValid(nullable)

  await example.expectError(greaterThan, 'Expected number, received null')
  await example.expectError(
    greaterThanOrEqualTo,
    'Expected number, received null',
  )
  await example.expectError(lowerThan, 'Expected number, received null')
  await example.expectError(
    lowerThanOrEqualTo,
    'Expected number, received null',
  )
  await example.expectError(integer, 'Expected number, received null')

  await expect(mandatory.input).toBeFocused()

  // Test other errors
  await greaterThan.input.fill('4')
  await greaterThanOrEqualTo.input.fill('4')
  await lowerThan.input.fill('11')
  await lowerThanOrEqualTo.input.fill('11')

  await example.expectError(greaterThan, 'Number must be greater than 5')
  await example.expectError(
    greaterThanOrEqualTo,
    'Number must be greater than or equal to 10',
  )
  await example.expectError(lowerThan, 'Number must be less than 5')
  await example.expectError(
    lowerThanOrEqualTo,
    'Number must be less than or equal to 10',
  )

  // Make first field be valid, focus goes to the second field
  await mandatory.input.fill('1')
  await button.click()
  await example.expectValid(mandatory)
  await expect(greaterThan.input).toBeFocused()

  await greaterThan.input.fill('6')
  await button.click()
  await example.expectValid(greaterThan)
  await expect(greaterThanOrEqualTo.input).toBeFocused()

  await greaterThanOrEqualTo.input.fill('10')
  await button.click()
  await example.expectValid(greaterThanOrEqualTo)
  await expect(lowerThan.input).toBeFocused()

  await lowerThan.input.fill('4')
  await button.click()
  await example.expectValid(lowerThan)
  await expect(lowerThanOrEqualTo.input).toBeFocused()

  await lowerThanOrEqualTo.input.fill('10')
  await button.click()
  await example.expectValid(lowerThanOrEqualTo)
  await expect(integer.input).toBeFocused()

  await integer.input.fill('4')
  await example.expectValid(integer)

  // Submit form

  await optional.input.fill('5')

  await button.click()
  await expect(button).toBeDisabled()

  await example.expectData({
    mandatory: 1,
    nullable: null,
    defaultRandom: expect.any(Number),
    greaterThan: 6,
    greaterThanOrEqualTo: 10,
    lowerThan: 4,
    lowerThanOrEqualTo: 10,
    integer: 4,
    optional: 5,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const greaterThan = example.field('greaterThan')
  const greaterThanOrEqualTo = example.field('greaterThanOrEqualTo')
  const lowerThan = example.field('lowerThan')
  const lowerThanOrEqualTo = example.field('lowerThanOrEqualTo')
  const integer = example.field('integer')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  await example.expectError(mandatory, 'Expected number, received null')
  await example.expectValid(optional)
  await example.expectValid(nullable)

  await example.expectError(greaterThan, 'Expected number, received null')
  await example.expectError(
    greaterThanOrEqualTo,
    'Expected number, received null',
  )
  await example.expectError(lowerThan, 'Expected number, received null')
  await example.expectError(
    lowerThanOrEqualTo,
    'Expected number, received null',
  )
  await example.expectError(integer, 'Expected number, received null')
  await example.expectAutoFocus(mandatory)

  // Test other errors
  await greaterThan.input.fill('4')
  await greaterThanOrEqualTo.input.fill('4')
  await lowerThan.input.fill('11')
  await lowerThanOrEqualTo.input.fill('11')
  await button.click()
  await page.reload()

  await example.expectError(greaterThan, 'Number must be greater than 5')
  await example.expectError(
    greaterThanOrEqualTo,
    'Number must be greater than or equal to 10',
  )
  await example.expectError(lowerThan, 'Number must be less than 5')
  await example.expectError(
    lowerThanOrEqualTo,
    'Number must be less than or equal to 10',
  )

  // Make first field be valid, focus goes to the second field
  await mandatory.input.fill('1')
  await button.click()
  await page.reload()
  await example.expectValid(mandatory)
  await example.expectAutoFocus(greaterThan)

  await greaterThan.input.fill('6')
  await button.click()
  await page.reload()
  await example.expectValid(greaterThan)
  await example.expectAutoFocus(greaterThanOrEqualTo)

  await greaterThanOrEqualTo.input.fill('10')
  await button.click()
  await page.reload()
  await example.expectValid(greaterThanOrEqualTo)
  await example.expectAutoFocus(lowerThan)

  await lowerThan.input.fill('4')
  await button.click()
  await page.reload()
  await example.expectValid(lowerThan)
  await example.expectAutoFocus(lowerThanOrEqualTo)

  await lowerThanOrEqualTo.input.fill('10')
  await button.click()
  await page.reload()
  await example.expectValid(lowerThanOrEqualTo)
  await example.expectAutoFocus(integer)

  await integer.input.fill('4')

  await optional.input.fill('5')

  await button.click()
  await page.reload()

  await example.expectValid(integer)

  await example.expectData({
    mandatory: 1,
    nullable: null,
    defaultRandom: expect.any(Number),
    greaterThan: 6,
    greaterThanOrEqualTo: 10,
    lowerThan: 4,
    lowerThanOrEqualTo: 10,
    integer: 4,
    optional: 5,
  })
})
