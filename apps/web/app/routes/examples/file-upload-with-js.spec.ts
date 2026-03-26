import { expect, test } from 'tests/setup/tests'

const route = '/examples/schemas/file-upload'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const name = example.field('name')
  const avatar = example.field('avatar')

  await page.goto(route)

  await example.expectField(name)
  await expect(avatar.input).toHaveAttribute('type', 'file')
  await expect(avatar.input).toHaveAttribute('accept', 'image/*')
  await expect(page.locator('form')).toHaveAttribute(
    'encType',
    'multipart/form-data'
  )
  await expect(button).toBeEnabled()

  // Submit empty — both fields should show errors
  await button.click()
  await example.expectError(
    name,
    'Too small: expected string to have >=1 characters'
  )
  await example.expectError(avatar, 'Invalid input')

  // Fill name, upload a non-image file — type validation error
  await name.input.fill('Jane')
  await avatar.input.setInputFiles({
    name: 'doc.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('fake-pdf'),
  })
  await example.expectValid(name)
  await example.expectError(avatar, 'Only image files are allowed')

  // Upload an oversized image — size validation error
  await avatar.input.setInputFiles({
    name: 'huge.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(3_000_000),
  })
  await example.expectError(avatar, 'Max file size is 2MB')

  // Upload a valid image — errors clear
  await avatar.input.setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fake-image-data'),
  })
  await example.expectValid(name)
  await example.expectValid(avatar)

  // Submit form
  await button.click()
  await expect(button).toBeDisabled()
  await example.expectData({
    name: 'Jane',
    fileName: 'photo.png',
    fileSize: 15,
  })
})
