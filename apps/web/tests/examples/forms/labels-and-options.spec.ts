import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/labels-and-options'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const roleId = example.field('roleId')
  const bio = example.field('bio')

  await page.goto(route)

  // Render
  await example.expectField(name)
  await example.expectSelect(roleId, { label: 'Role', value: '1' })
  await example.expectField(bio, { multiline: true })
  const options = roleId.input.locator('option')
  await expect(options.first()).toHaveText('Designer')
  await expect(options.last()).toHaveText('Dev')
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(name, 'String must contain at least 1 character(s)')
  await example.expectError(bio, 'String must contain at least 1 character(s)')

  await expect(name.input).toBeFocused()

  // Make first field be valid, focus goes to the second field
  await name.input.fill('John')
  await button.click()
  await example.expectValid(name)
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
    bio: 'My bio',
    roleId: 2,
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const roleId = example.field('roleId')
  const bio = example.field('bio')

  await page.goto(route)

  // Server-side validation
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(name, 'String must contain at least 1 character(s)')
  await example.expectError(bio, 'String must contain at least 1 character(s)')
  await example.expectAutoFocus(name)
  await example.expectNoAutoFocus(bio)

  // Make first field be valid, focus goes to the second field
  await name.input.fill('John')
  await button.click()
  await page.reload()
  await example.expectValid(name)
  await example.expectNoAutoFocus(name)
  await example.expectAutoFocus(bio)

  // Make form be valid and test selecting an option
  await bio.input.fill('My bio')
  await roleId.input.selectOption('2')

  // Submit form
  await button.click()
  await page.reload()

  await example.expectData({
    name: 'John',
    bio: 'My bio',
    roleId: 2,
  })
})
