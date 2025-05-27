import { testWithoutJS } from 'tests/setup/tests'

const route = '/examples/schemas/strings'

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
    'String must contain at least 1 character(s)'
  )
  await example.expectError(
    minLength,
    'String must contain at least 5 character(s)'
  )
  await example.expectError(
    maxLength,
    'String must contain at most 10 character(s)'
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
