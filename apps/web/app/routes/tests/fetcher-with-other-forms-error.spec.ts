import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/test-examples/fetcher-with-other-forms-error'

test('With JS enabled', async ({ example }) => {
  const { page } = example
  await page.goto(route)

  const button = page.locator('#form button:has-text("OK"):visible')

  // Render
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await expect(page.locator('#form > div[role="alert"]:visible')).toHaveText(
    'This error should not show inside the fetcher form'
  )

  expect(
    await page.locator('#fetcher-form > div[role="alert"]:visible').count()
  ).toEqual(0)
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { page } = example
  await page.goto(route)

  const button = page.locator('#form button:has-text("OK"):visible')

  // Render
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await expect(page.locator('#form > div[role="alert"]:visible')).toHaveText(
    'This error should not show inside the fetcher form'
  )

  expect(
    await page.locator('#fetcher-form > div[role="alert"]:visible').count()
  ).toEqual(0)
})
