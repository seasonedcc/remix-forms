import { expect, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/schemas/numbers'

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

  await example.expectError(mandatory, 'Invalid input: expected number, received null')
  await example.expectValid(optional)
  await example.expectValid(nullable)

  await example.expectError(greaterThan, 'Invalid input: expected number, received null')
  await example.expectError(
    greaterThanOrEqualTo,
    'Invalid input: expected number, received null'
  )
  await example.expectError(lowerThan, 'Invalid input: expected number, received null')
  await example.expectError(
    lowerThanOrEqualTo,
    'Invalid input: expected number, received null'
  )
  await example.expectError(integer, 'Invalid input: expected number, received null')
  await example.expectAutoFocus(mandatory)

  // Test other errors
  await greaterThan.input.fill('4')
  await greaterThanOrEqualTo.input.fill('4')
  await lowerThan.input.fill('11')
  await lowerThanOrEqualTo.input.fill('11')
  await button.click()
  await page.reload()

  await example.expectError(greaterThan, 'Too small: expected number to be >5')
  await example.expectError(
    greaterThanOrEqualTo,
    'Too small: expected number to be >=10'
  )
  await example.expectError(lowerThan, 'Too big: expected number to be <5')
  await example.expectError(
    lowerThanOrEqualTo,
    'Too big: expected number to be <=10'
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
