import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/schemas/super-refine'

test('With JS enabled', async ({ example }) => {
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
