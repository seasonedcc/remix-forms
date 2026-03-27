import { expect, test } from 'tests/setup/tests'

const route = '/test-examples/field-with-ref'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example

  await page.goto(route)

  await button.click()

  const tagInput = page.locator('input[type="text"]').first()
  await tagInput.fill('some tag')
  await tagInput.press('Enter')

  button.click()
  await expect(button).toBeDisabled()
  await example.expectData({ tags: ['some tag'] })
})
