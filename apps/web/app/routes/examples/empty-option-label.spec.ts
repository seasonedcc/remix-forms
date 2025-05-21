import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/empty-option-label'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const choice = example.field('choice')

  await page.goto(route)

  await example.expectSelect(choice, { required: false, value: '' })
  const options = choice.input.locator('option')
  await expect(options.first()).toHaveText('Select one')
  await expect(options.last()).toHaveText('Dev')

  await choice.input.selectOption('designer')
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({ choice: 'designer' })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const choice = example.field('choice')

  await page.goto(route)

  await example.expectSelect(choice, { required: false, value: '' })
  const options = choice.input.locator('option')
  await expect(options.first()).toHaveText('Select one')
  await expect(options.last()).toHaveText('Dev')

  await choice.input.selectOption('designer')
  await button.click()
  await page.reload()
  await example.expectData({ choice: 'designer' })
})
