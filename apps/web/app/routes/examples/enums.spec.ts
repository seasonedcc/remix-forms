import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/schemas/enums'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultField = example.field('default')

  await page.goto(route)

  // Render
  await example.expectSelect(mandatory, { value: '' })
  await example.expectSelect(optional, { required: false })
  await example.expectSelect(nullable, { required: false })
  await example.expectSelect(defaultField, { value: 'two' })

  await mandatory.input.selectOption({ value: 'one' })

  await expect(button).toBeEnabled()

  // Submit form with default values
  await button.click()
  await example.expectValid(mandatory)
  await example.expectValid(optional)
  await example.expectValid(nullable)
  await example.expectValid(defaultField)

  await example.expectData({
    mandatory: 'one',
    nullable: null,
    default: 'two',
  })

  // Submit form with different values
  await mandatory.input.selectOption('one')
  await optional.input.selectOption('two')
  await nullable.input.selectOption('three')
  await defaultField.input.selectOption('one')

  await button.click()
  await expect(button).toBeDisabled()

  await page.waitForResponse((response) =>
    response.url().includes('enums.data'),
  )

  await example.expectData({
    default: 'one',
    mandatory: 'one',
    optional: 'two',
    nullable: 'three',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultField = example.field('default')

  await page.goto(route)

  // Submit form with default values
  await button.click()
  await page.reload()
  await example.expectValid(mandatory)
  await example.expectValid(optional)
  await example.expectValid(nullable)
  await example.expectValid(defaultField)

  await example.expectData({
    mandatory: 'one',
    nullable: null,
    default: 'two',
  })

  // Submit form with different values
  await mandatory.input.selectOption('one')
  await optional.input.selectOption('two')
  await nullable.input.selectOption('three')
  await defaultField.input.selectOption('one')

  await button.click()
  await page.reload()

  await example.expectData({
    mandatory: 'one',
    optional: 'two',
    nullable: 'three',
    default: 'one',
  })
})
