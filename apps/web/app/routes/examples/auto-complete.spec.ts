import { expect, test, testWithoutJS } from 'tests/setup/tests'

const route = '/examples/forms/auto-complete'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const firstName = example.field('firstName')
  const lastName = example.field('lastName')
  const nickname = example.field('nickname')
  const bio = example.field('bio')
  const role = example.field('role')

  await page.goto(route)

  await example.expectField(firstName)
  await example.expectField(lastName)
  await example.expectField(nickname)
  await example.expectField(bio, { multiline: true })
  await example.expectSelect(role)

  await expect(firstName.input).toHaveAttribute('autocomplete', 'given-name')
  await expect(lastName.input).toHaveAttribute('autocomplete', 'family-name')
  await expect(nickname.input).toHaveAttribute('autocomplete', 'off')
  await expect(bio.input).toHaveAttribute('autocomplete', 'on')
  await expect(role.input).toHaveAttribute('autocomplete', 'organization')

  await expect(button).toBeEnabled()
})

testWithoutJS('With JS disabled', async ({ example }) => {
  const { page } = example
  const firstName = example.field('firstName')
  const lastName = example.field('lastName')
  const nickname = example.field('nickname')
  const bio = example.field('bio')
  const role = example.field('role')

  await page.goto(route)

  await example.expectField(firstName)
  await example.expectField(lastName)
  await example.expectField(nickname)
  await example.expectField(bio, { multiline: true })
  await example.expectSelect(role)

  await expect(firstName.input).toHaveAttribute('autocomplete', 'given-name')
  await expect(lastName.input).toHaveAttribute('autocomplete', 'family-name')
  await expect(nickname.input).toHaveAttribute('autocomplete', 'off')
  await expect(bio.input).toHaveAttribute('autocomplete', 'on')
  await expect(role.input).toHaveAttribute('autocomplete', 'organization')
})
