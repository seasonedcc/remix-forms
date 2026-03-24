import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/labels-options-etc'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const email = example.field('email')
  const roleId = example.field('roleId')
  const bio = example.field('bio')

  await page.goto(route)

  // Render
  await example.expectField(name)
  await example.expectField(email)
  await expect(email.input).toHaveAttribute('autocomplete', 'email')
  await example.expectSelect(roleId, { label: 'Role', value: '' })
  await example.expectField(bio, { multiline: true })
  const options = roleId.input.locator('option')
  await expect(options.first()).toHaveText('Designer')
  await expect(options.last()).toHaveText('Dev')
  await expect(button).toBeEnabled()
  await expect(name.input).toBeFocused()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(
    name,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(
    email,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(
    bio,
    'Too small: expected string to have >=1 characters'
  )

  await expect(name.input).toBeFocused()

  // Make first and second fields valid, focus goes to the third field
  await name.input.fill('John')
  await email.input.fill('john@example.com')
  await roleId.input.selectOption({ value: '1' })
  await button.click()
  await example.expectValid(name)
  await example.expectValid(email)
  await expect(bio.input).toBeFocused()

  // Make form be valid
  await roleId.input.selectOption('2')
  await bio.input.fill('My bio')
  await example.expectValid(roleId)
  await example.expectValid(bio)

  // Submit form
  await button.click()

  await example.expectData({
    name: 'John',
    email: 'john@example.com',
    bio: 'My bio',
    roleId: 2,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const email = example.field('email')
  const roleId = example.field('roleId')
  const bio = example.field('bio')

  await page.goto(route)
  await example.expectAutoFocus(name)
  await expect(email.input).toHaveAttribute('autocomplete', 'email')

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(
    name,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectErrors(
    email,
    'Too small: expected string to have >=1 characters',
    'Invalid email address'
  )
  await example.expectError(
    bio,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectAutoFocus(name)
  await example.expectNoAutoFocus(bio)

  // Make first fields valid, focus goes to bio
  await name.input.fill('John')
  await email.input.fill('john@example.com')
  await button.click()
  await page.reload()
  await example.expectValid(name)
  await example.expectValid(email)
  await example.expectAutoFocus(bio)

  // Make form be valid and test selecting an option
  await bio.input.fill('My bio')
  await roleId.input.selectOption('2')

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    name: 'John',
    email: 'john@example.com',
    bio: 'My bio',
    roleId: 2,
  })
})
