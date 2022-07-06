import { test, testWithoutJS, expect } from 'tests/setup/tests'

const route = '/examples/schemas/strings'

test('With JS enabled', async ({ example }) => {
  const { email, button, page } = example
  const nonEmpty = example.field('nonEmpty')
  const optional = example.field('optional')
  const nullable = example.field('nullable')
  const defaultField = example.field('default')
  const minLength = example.field('minLength')
  const maxLength = example.field('maxLength')
  const url = example.field('url')
  const phoneNumber = example.field('phoneNumber')

  await page.goto(route)

  // Render
  await example.expectField(nonEmpty)
  await example.expectField(optional, { required: false })
  await example.expectField(nullable, { required: false })
  await example.expectField(defaultField, { value: 'Foo Bar' })
  await example.expectField(minLength)
  await example.expectField(maxLength)
  await example.expectField(email)
  await example.expectField(url, { label: 'URL' })
  await example.expectField(phoneNumber)
  await expect(button).toBeEnabled()

  // Client-side validation
  maxLength.input.fill('abcdefghijk')
  await button.click()

  // Show field errors and focus on the first field
  await example.expectError(
    nonEmpty,
    'String must contain at least 1 character(s)',
  )
  await example.expectValid(optional)
  await example.expectValid(nullable)
  await example.expectError(
    minLength,
    'String must contain at least 5 character(s)',
  )
  await example.expectError(
    maxLength,
    'String must contain at most 10 character(s)',
  )
  await example.expectError(email, 'Invalid email')
  await example.expectError(url, 'Invalid url')
  await example.expectError(phoneNumber, 'Invalid phone number')

  await expect(nonEmpty.input).toBeFocused()

  // Make first field be valid, focus goes to the second field
  await nonEmpty.input.fill('John')
  await button.click()
  await example.expectValid(nonEmpty)
  await expect(minLength.input).toBeFocused()

  await minLength.input.fill('abcde')
  await button.click()
  await example.expectValid(minLength)
  await expect(maxLength.input).toBeFocused()

  await maxLength.input.fill('abcde')
  await button.click()
  await example.expectValid(maxLength)
  await expect(email.input).toBeFocused()

  await email.input.fill('john@doe.com')
  await button.click()
  await example.expectValid(email)
  await expect(url.input).toBeFocused()

  await url.input.fill('http://example.com')
  await button.click()
  await example.expectValid(url)
  await expect(phoneNumber.input).toBeFocused()

  // Make form be valid
  await phoneNumber.input.fill('5551234567')

  // Submit form
  await button.click()
  await example.expectValid(phoneNumber)
  await expect(button).toBeDisabled()

  await example.expectData({
    nonEmpty: 'John',
    nullable: null,
    default: 'Foo Bar',
    minLength: 'abcde',
    maxLength: 'abcde',
    email: 'john@doe.com',
    url: 'http://example.com',
    phoneNumber: '5551234567',
  })
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { email, button, page } = example
  const nonEmpty = example.field('nonEmpty')
  const minLength = example.field('minLength')
  const maxLength = example.field('maxLength')
  const url = example.field('url')
  const phoneNumber = example.field('phoneNumber')

  await page.goto(route)

  // Server-side validation
  maxLength.input.fill('abcdefghijk')
  await button.click()
  await page.reload()

  // Show field errors and focus on the first field
  await example.expectError(
    nonEmpty,
    'String must contain at least 1 character(s)',
  )
  await example.expectError(
    minLength,
    'String must contain at least 5 character(s)',
  )
  await example.expectError(
    maxLength,
    'String must contain at most 10 character(s)',
  )
  await example.expectError(email, 'Invalid email')
  await example.expectError(url, 'Invalid url')
  await example.expectError(phoneNumber, 'Invalid phone number')
  await example.expectAutoFocus(nonEmpty)

  // Make first field be valid, focus goes to the second field
  await nonEmpty.input.fill('John')
  await button.click()
  await page.reload()
  await example.expectValid(nonEmpty)
  await example.expectAutoFocus(minLength)

  await minLength.input.fill('abcde')
  await button.click()
  await page.reload()
  await example.expectValid(minLength)
  await example.expectAutoFocus(maxLength)

  await maxLength.input.fill('abcde')
  await button.click()
  await page.reload()
  await example.expectValid(maxLength)
  await example.expectAutoFocus(email)

  await email.input.fill('john@doe.com')
  await button.click()
  await page.reload()
  await example.expectValid(email)
  await example.expectAutoFocus(url)

  await url.input.fill('http://example.com')
  await button.click()
  await page.reload()
  await example.expectValid(url)
  await example.expectAutoFocus(phoneNumber)

  // Make form be valid
  await phoneNumber.input.fill('5551234567')

  // Submit form
  await button.click()
  await page.reload()
  await example.expectValid(phoneNumber)

  await example.expectData({
    nonEmpty: 'John',
    nullable: null,
    default: 'Foo Bar',
    minLength: 'abcde',
    maxLength: 'abcde',
    email: 'john@doe.com',
    url: 'http://example.com',
    phoneNumber: '5551234567',
  })
})
