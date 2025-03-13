import { expect, test } from 'tests/setup/tests'

const route = '/examples/render-field/dirty-indicator'

test('With JS enabled', async ({ example }) => {
  const { firstName, email, button, page } = example
  const preferredSport = example.field('preferredSport')
  const newsletter = example.field('newsletter')

  await page.goto(route)

  // Render
  await example.expectField(email, { value: 'default@domain.tld' })
  await example.expectField(firstName)
  await example.expectSelect(preferredSport, { value: 'Basketball' })
  const options = preferredSport.input.locator('option')
  await expect(options.first()).toHaveText('Basketball')
  await expect(options.nth(1)).toHaveText('Football')
  await expect(options.last()).toHaveText('Other')
  await expect(button).toBeEnabled()
  await example.expectField(newsletter, { type: 'checkbox', value: 'on' })

  // Make fields dirty
  await email.input.fill('john@doe.com')
  await firstName.input.fill('John Doe')
  await preferredSport.input.selectOption({ value: 'Other' })
  await newsletter.input.check()

  // Show fields that are dirty using a class
  const dirtyClass =
    'border-yellow-600 focus:border-yellow-600 focus:ring-yellow-600'

  expect(await email.input.getAttribute('class')).toContain(dirtyClass)
  expect(await firstName.input.getAttribute('class')).toContain(dirtyClass)
  expect(await preferredSport.input.getAttribute('class')).toContain(dirtyClass)
  expect(await newsletter.input.getAttribute('class')).toContain(dirtyClass)

  // Blank email is still dirty since our original value is not blank
  await email.input.fill('')
  expect(await email.input.getAttribute('class')).toContain(dirtyClass)

  // Clean up all fields
  await email.input.fill('default@domain.tld')
  await firstName.input.fill('')
  await preferredSport.input.selectOption({ value: 'Basketball' })
  await newsletter.input.uncheck()

  expect(await email.input.getAttribute('class')).not.toContain(dirtyClass)
  expect(await firstName.input.getAttribute('class')).not.toContain(dirtyClass)
  expect(await preferredSport.input.getAttribute('class')).not.toContain(
    dirtyClass
  )
  expect(await newsletter.input.getAttribute('class')).not.toContain(dirtyClass)
})
