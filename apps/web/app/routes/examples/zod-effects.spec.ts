import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/schemas/zod-effects'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const planType = example.field('planType')
  const quantity = example.field('quantity')

  await page.goto(route)

  // Render
  await example.expectSelect(planType, { value: '' })
  await example.expectField(quantity, {
    value: '',
    required: true,
  })

  // fill
  await quantity.input.fill('1')
  await planType.input.selectOption({ value: 'personal' })

  // Submit
  await expect(button).toBeEnabled()
  await button.click()

  await example.expectData({
    planType: 'personal',
    quantity: 1,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const planType = example.field('planType')
  const quantity = example.field('quantity')

  await page.goto(route)

  // Render
  await example.expectSelect(planType, { value: 'personal' })
  await example.expectField(quantity, {
    value: '',
    required: true,
  })

  // fill
  await quantity.input.fill('1')

  // Submit
  await expect(button).toBeEnabled()
  await button.click()

  await example.expectData({
    planType: 'personal',
    quantity: 1,
  })
})

test('With JS enabled we see a refinement validation error', async ({
  example,
}) => {
  const { button, page } = example
  const planType = example.field('planType')
  const quantity = example.field('quantity')

  await page.goto(route)

  // fill
  await planType.input.selectOption('corporate')
  await quantity.input.fill('1')

  // Submit
  await expect(button).toBeEnabled()
  await button.click()

  await example.expectError(
    planType,
    'For corporate cards you must issue at least 8'
  )
})

testWithoutJS(
  'With JS disabled we see a refinement validation error',
  async ({ example }) => {
    const { button, page } = example
    const planType = example.field('planType')
    const quantity = example.field('quantity')

    await page.goto(route)

    // Render
    await example.expectSelect(planType, { value: 'personal' })
    await example.expectField(quantity, {
      value: '',
      required: true,
    })

    // fill
    await quantity.input.fill('1')

    // Submit
    await expect(button).toBeEnabled()
    await button.click()

    await example.expectData({
      planType: 'personal',
      quantity: 1,
    })
  }
)
