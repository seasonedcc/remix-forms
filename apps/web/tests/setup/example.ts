import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { startCase } from 'lodash-es'

type Field = {
  name: string
  label: Locator
  input: Locator
}

type FieldOptions = {
  label?: string | null
  placeholder?: string
  value?: string | RegExp
  type?: string
  required?: boolean
  invalid?: boolean
  multiline?: boolean
  radio?: boolean
  options?: { name: string; value: string }[]
}

class Example {
  readonly page: Page
  readonly firstName: Field
  readonly email: Field
  readonly password: Field
  readonly button: Locator

  constructor(page: Page) {
    this.page = page
    this.firstName = this.field('firstName')
    this.email = this.field('email')
    this.password = this.field('password')
    this.button = page.locator('form button:has-text("OK"):visible')
  }

  field(name: string) {
    return {
      name,
      label: this.page.locator(`label[for="${name}"]:visible`),
      input: this.page.locator(`[name="${name}"]:visible`),
    }
  }

  async expectField(
    field: Field,
    {
      label: rawLabel,
      placeholder,
      value = '',
      type: rawType = 'text',
      required = true,
      invalid = false,
      multiline = false,
    }: FieldOptions = {},
  ) {
    const label = rawLabel === undefined ? startCase(field.name) : rawLabel
    const type = multiline ? '' : rawType

    if (label) {
      await expect(field.label).toHaveText(label)
      await expect(field.label).toHaveId(`label-for-${field.name}`)
    }

    await expect(field.input).toHaveValue(value)
    expect((await field.input.getAttribute('type')) ?? '').toBe(type)
    await expect(field.input).toHaveAttribute('aria-invalid', String(invalid))

    placeholder &&
      (await expect(field.input).toHaveAttribute('placeholder', placeholder))

    multiline &&
      (await expect(
        this.page.locator(`textarea[name=${field.name}]:visible`),
      ).toBeVisible())

    await expect(field.input).toHaveAttribute(
      'aria-labelledby',
      `label-for-${field.name}`,
    )

    await expect(field.input).toHaveAttribute('aria-required', String(required))
  }

  async expectRadioToHaveOptions(
    radioName: string,
    options: { name: string; value: string }[],
  ) {
    Promise.all(
      options.map(({ value }) =>
        expect(
          this.page.locator(`[name="${radioName}"][value="${value}"]:visible`),
        ).toBeVisible(),
      ),
    )
  }

  async expectSelect(field: Field, options: FieldOptions = {}) {
    await this.expectField(field, { type: '', ...options })
  }

  async expectValid(field: Field) {
    await expect(field.input).toHaveAttribute('aria-invalid', 'false')
  }

  async expectInvalid(field: Field) {
    await expect(
      this.page.locator(`#errors-for-${field.name}:visible`),
    ).toHaveAttribute('role', 'alert')

    await expect(field.input).toHaveAttribute('aria-invalid', 'true')

    await expect(field.input).toHaveAttribute(
      'aria-describedBy',
      `errors-for-${field.name}`,
    )
  }

  async expectError(field: Field, message: string) {
    await this.expectInvalid(field)

    await this.expectErrorMessage(field.name, message)
  }

  async expectGlobalError(message: string) {
    await expect(
      this.page.locator('form > div[role="alert"]:visible'),
    ).toHaveText(message)
  }

  async expectNoGlobalError() {
    expect(
      await this.page.locator('form > div[role="alert"]:visible').count(),
    ).toEqual(0)
  }

  async expectErrorMessage(fieldName: string, message: string) {
    await expect(
      this.page.locator(`#errors-for-${fieldName}:visible`),
    ).toHaveText(message)
  }

  async expectErrors(field: Field, ...messages: string[]) {
    await this.expectInvalid(field)

    for (var index = 0; index < messages.length; index++) {
      await expect(
        this.page.locator(`#errors-for-${field.name} > div`).nth(index),
      ).toHaveText(messages[index])
    }
  }

  async expectAutoFocus(field: Field) {
    expect(await field.input.getAttribute('autofocus')).not.toBeNull()
  }

  async expectNoAutoFocus(field: Field) {
    expect(await field.input.getAttribute('autofocus')).toBeNull()
  }

  async expectData(data: any) {
    const actionData = JSON.parse(
      await this.page.locator('#action-data > pre:visible').first().innerText(),
    )

    expect(actionData).toEqual(data)
  }
}

export { Example }
