import { expect, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/schemas/dates'

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultField = example.field('default')

  await page.goto(route)

  // Server-side validation
  await defaultField.input.fill('')
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(mandatory, 'Expected date, received null')
  await example.expectValid(optional)
  await example.expectValid(nullable)
  await example.expectError(defaultField, 'Expected date, received null')
  await example.expectAutoFocus(mandatory)

  // Make first field be valid, focus goes to the second field
  // Make field be valid, focus goes to the next field
  await mandatory.input.fill('2022-01-01')
  await defaultField.input.fill('')
  await button.click()
  await page.reload()
  await example.expectValid(mandatory)
  await example.expectError(defaultField, 'Expected date, received null')
  await example.expectAutoFocus(defaultField)

  // Make form be valid
  await optional.input.fill('2022-02-02')
  await nullable.input.fill('2022-03-03')
  await defaultField.input.fill('2022-04-04')

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    mandatory: expect.stringContaining('2022-01-01'),
    optional: expect.stringContaining('2022-02-02'),
    nullable: expect.stringContaining('2022-03-03'),
    default: expect.stringContaining('2022-04-04'),
  })
})
