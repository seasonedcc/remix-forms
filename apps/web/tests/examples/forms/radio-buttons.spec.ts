import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/forms/radio-buttons'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const role = example.field('role')

  await page.goto(route)

  // Render
  await example.expectRadioToHaveOptions('role', [
    { name: 'Dev', value: 'Dev' },
    { name: 'Designer', value: 'Designer' },
  ])
  await example.expectRadioToHaveOptions('department', [
    { name: 'HR', value: 'HR' },
    { name: 'IT', value: 'IT' },
  ])
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectErrorMessage(
    'role',
    "Invalid enum value. Expected 'Designer' | 'Dev', received ''",
  )

  await expect(role.input.first()).toBeFocused()

  await role.input.first().click()

  // Submit form
  await button.click()

  await example.expectData({
    role: 'Designer',
    department: 'IT',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { button, page } = example
  const role = example.field('role')

  await page.goto(route)

  // Render
  await example.expectRadioToHaveOptions('role', [
    { name: 'Dev', value: 'Dev' },
    { name: 'Designer', value: 'Designer' },
  ])
  await expect(button).toBeEnabled()

  // Client-side validation
  await button.click()

  // Show field errors and focus on the first field

  await example.expectErrorMessage(
    'role',
    "Invalid enum value. Expected 'Designer' | 'Dev', received ''",
  )

  await expect(role.input.first()).toBeFocused()

  await role.input.first().click()

  // Submit form
  await button.click()

  await example.expectData({
    role: 'Designer',
    department: 'IT',
  })
})
