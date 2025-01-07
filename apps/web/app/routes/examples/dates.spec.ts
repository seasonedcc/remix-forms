import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/schemas/dates'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultField = example.field('default')

  await page.goto(route)

  // Render
  await example.expectField(mandatory, { type: 'date' })
  await example.expectField(optional, { type: 'date', required: false })
  await example.expectField(nullable, { type: 'date', required: false })

  await example.expectField(defaultField, {
    type: 'date',
    value: /\d{4}-\d{2}-\d{2}/,
  })

  await expect(button).toBeEnabled()

  // Client-side validation
  await defaultField.input.fill('')
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(mandatory, 'Expected date, received null')
  await example.expectValid(optional)
  await example.expectValid(nullable)
  await example.expectError(defaultField, 'Expected date, received null')
  await expect(mandatory.input).toBeFocused()

  // Make field be valid, focus goes to the next field
  await mandatory.input.fill('2022-01-01')
  await button.click()
  await example.expectValid(mandatory)
  await expect(defaultField.input).toBeFocused()

  // Make form be valid
  await optional.input.fill('2022-02-02')
  await nullable.input.fill('2022-03-03')
  await defaultField.input.fill('2022-04-04')

  // Submit form
  await button.click()
  await example.expectValid(defaultField)
  await expect(button).toBeDisabled()

  await example.expectData({
    mandatory: expect.stringContaining('2022-01-01'),
    optional: expect.stringContaining('2022-02-02'),
    nullable: expect.stringContaining('2022-03-03'),
    default: expect.stringContaining('2022-04-04'),
  })
})

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
