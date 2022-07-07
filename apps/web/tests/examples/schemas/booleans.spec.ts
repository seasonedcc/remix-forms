import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/schemas/booleans'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultFalse = example.field('defaultFalse')
  const defaultTrue = example.field('defaultTrue')

  await page.goto(route)

  // Render
  await example.expectField(mandatory, { value: 'on', type: 'checkbox' })
  await example.expectField(optional, {
    value: 'on',
    required: false,
    type: 'checkbox',
  })
  await example.expectField(nullable, {
    value: 'on',
    required: false,
    type: 'checkbox',
  })
  await example.expectField(defaultFalse, { value: 'on', type: 'checkbox' })
  await example.expectField(defaultTrue, { value: 'on', type: 'checkbox' })

  // Submit
  await expect(button).toBeEnabled()
  await button.click()

  await example.expectData({
    mandatory: false,
    nullable: null,
    defaultFalse: false,
    defaultTrue: true,
  })

  await page.reload()

  await mandatory.input.check()
  await optional.input.check()
  await nullable.input.check()
  await defaultFalse.input.check()
  await defaultTrue.input.uncheck()

  await button.click()

  await example.expectData({
    mandatory: true,
    optional: true,
    nullable: true,
    defaultFalse: true,
    defaultTrue: false,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const mandatory = example.field('mandatory')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultFalse = example.field('defaultFalse')
  const defaultTrue = example.field('defaultTrue')

  await page.goto(route)

  // Submit
  await expect(button).toBeEnabled()
  await button.click()

  await example.expectData({
    mandatory: false,
    nullable: null,
    defaultFalse: false,
    defaultTrue: true,
  })

  await page.reload()

  await mandatory.input.check()
  await optional.input.check()
  await nullable.input.check()
  await defaultFalse.input.check()
  await defaultTrue.input.uncheck()

  await button.click()

  await example.expectData({
    mandatory: true,
    optional: true,
    nullable: true,
    defaultFalse: true,
    defaultTrue: false,
  })
})
