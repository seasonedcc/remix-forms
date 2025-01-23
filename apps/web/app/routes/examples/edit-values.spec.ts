import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/edit-values'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const companySize = example.field('companySize')
  const howDidYouFindUs = example.field('howDidYouFindUs')

  await page.goto(route)

  // Render
  await example.expectField(firstName, { value: 'Mary' })
  await example.expectField(email, { value: 'mary@company.com' })
  await example.expectField(companySize, { value: '0' })
  await example.expectSelect(howDidYouFindUs, { value: 'google' })
  const options = howDidYouFindUs.input.locator('option')
  await expect(options.first()).toHaveText('A Friend')
  await expect(options.last()).toHaveText('Google')

  expect(await page.isChecked('input[type=checkbox]:visible')).toBeFalsy()

  await expect(button).toBeEnabled()

  // Submit form
  button.click()

  await example.expectData({
    firstName: 'Mary',
    email: 'mary@company.com',
    companySize: 0,
    howDidYouFindUs: 'google',
    subscribeToNewsletter: false,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  await page.goto(route)

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    firstName: 'Mary',
    email: 'mary@company.com',
    companySize: 0,
    howDidYouFindUs: 'google',
    subscribeToNewsletter: false,
  })
})
