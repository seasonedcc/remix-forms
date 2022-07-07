import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/render-field/required-indicator'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const preferredSport = example.field('preferredSport')
  const newsletter = example.field('newsletter')

  await page.goto(route)

  // Render
  await example.expectField(email, { label: 'Email*' })
  await example.expectField(firstName, { required: false })

  await example.expectSelect(preferredSport, {
    label: 'Preferred Sport*',
    value: 'Basketball',
  })

  const options = preferredSport.input.locator('option')
  await expect(options.first()).toHaveText('Basketball')
  await expect(options.nth(1)).toHaveText('Football')
  await expect(options.last()).toHaveText('Other')
  await expect(button).toBeEnabled()

  await example.expectField(newsletter, {
    label: 'Newsletter*',
    type: 'checkbox',
    value: 'on',
  })

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(email, 'Invalid email')
  await expect(email.input).toBeFocused()

  // Make form be valid
  await email.input.fill('john@doe.com')
  await firstName.input.fill('John')
  await preferredSport.input.selectOption('Other')
  await newsletter.input.check()
  await example.expectValid(email)
  await example.expectValid(firstName)
  await example.expectValid(preferredSport)
  await example.expectValid(newsletter)

  // Submit form
  button.click()
  await expect(button).toBeDisabled()

  await example.expectData({
    email: 'john@doe.com',
    firstName: 'John',
    preferredSport: 'Other',
    newsletter: true,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const preferredSport = example.field('preferredSport')
  const newsletter = example.field('newsletter')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(email, 'Invalid email')
  await example.expectAutoFocus(email)

  // Make form be valid
  await email.input.fill('john@doe.com')
  await firstName.input.fill('John')
  await preferredSport.input.selectOption('Other')
  await newsletter.input.check()

  // Submit form
  await button.click()
  await page.reload()
  await example.expectValid(email)
  await example.expectValid(firstName)
  await example.expectValid(preferredSport)
  await example.expectValid(newsletter)

  await example.expectData({
    email: 'john@doe.com',
    firstName: 'John',
    preferredSport: 'Other',
    newsletter: true,
  })
})
