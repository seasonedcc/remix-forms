import { expect, test } from 'tests/setup/tests'

const route = '/examples/array-schemas/object-array-with-children'

test('With JS enabled', async ({ example }) => {
  const { button, page } = example
  const teamName = example.field('teamName')

  await page.goto(route)

  await example.expectField(teamName)
  await expect(button).toBeEnabled()

  await teamName.input.fill('Engineering')

  await button.click()

  await example.expectErrorMessage(
    'members',
    'Too small: expected array to have >=1 items'
  )

  await page.locator('button:has-text("Add member")').click()

  await expect(
    page.locator('input[name="members\\[0\\]\\[name\\]"]')
  ).toBeVisible()
  await expect(
    page.locator('select[name="members\\[0\\]\\[role\\]"]')
  ).toBeVisible()

  await page.locator('input[name="members\\[0\\]\\[name\\]"]').fill('Alice')
  await page
    .locator('select[name="members\\[0\\]\\[role\\]"]')
    .selectOption('designer')

  await page.locator('button:has-text("Add member")').click()
  await page.locator('input[name="members\\[1\\]\\[name\\]"]').fill('Bob')
  await page
    .locator('select[name="members\\[1\\]\\[role\\]"]')
    .selectOption('developer')

  await page.locator('button:has-text("Remove")').first().click()

  await button.click()

  await example.expectData({
    teamName: 'Engineering',
    members: [{ name: 'Bob', role: 'developer' }],
  })
})
