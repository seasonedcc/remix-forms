import { expect, test } from 'tests/setup/tests'

const route = '/test-examples/accented-options'

test('Renders options with accents', async ({ example }) => {
  const { page } = example
  const travel = example.field('travel')

  await page.goto(route)
  await example.expectSelect(travel, { value: 'avião' })

  const options = travel.input.locator('option')
  await expect(options.nth(0)).toHaveText('Avião')
  await expect(options.nth(1)).toHaveText('Ônibus')
})
