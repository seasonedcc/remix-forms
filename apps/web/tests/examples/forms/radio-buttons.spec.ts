import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/radio-buttons'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const radio = example.field('role')

  await page.goto(route)

  // Render
  await example.expectField(name)
  await example.expectRadioToHaveOptions('role', [
    { name: 'Dev', value: 'Dev' },
    { name: 'Designer', value: 'Designer' },
  ])
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(name, 'String must contain at least 1 character(s)')
  await example.expectErrorMessage(
    'role',
    "Invalid enum value. Expected 'Designer' | 'Dev', received ''",
  )

  await expect(name.input).toBeFocused()

  await name.input.type('John Corn')
  await radio.input.first().click()

  // Submit form
  await button.click()

  await example.expectData({
    name: 'John Corn',
    role: 'Designer',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const radio = example.field('role')

  await page.goto(route)

  // Render
  await example.expectField(name)
  await example.expectRadioToHaveOptions('role', [
    { name: 'Dev', value: 'Dev' },
    { name: 'Designer', value: 'Designer' },
  ])
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectError(name, 'String must contain at least 1 character(s)')
  await example.expectErrorMessage(
    'role',
    "Invalid enum value. Expected 'Designer' | 'Dev', received ''",
  )

  await expect(name.input).toBeFocused()

  await name.input.type('John Corn')
  await radio.input.first().click()

  // Submit form
  await button.click()

  await example.expectData({
    name: 'John Corn',
    role: 'Designer',
  })
})
