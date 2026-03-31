vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    useFormContext: vi.fn(() => ({
      control: {},
      formState: { errors: {} },
      getFieldState: () => ({ error: undefined }),
    })),
    useFieldArray: vi.fn((_opts: { name: string }) => ({
      fields: [{ id: 'item-0' }, { id: 'item-1' }],
      append: vi.fn(),
      prepend: vi.fn(),
      remove: vi.fn(),
      insert: vi.fn(),
      move: vi.fn(),
      swap: vi.fn(),
    })),
  }
})

import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { UseFormRegister } from 'react-hook-form'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest'
import { createField, useField } from './create-field'
import { defaultComponents } from './defaults'

const register = vi.fn((name: string) => ({
  name,
  onChange: () => Promise.resolve(),
  onBlur: () => Promise.resolve(),
  ref: () => {},
})) as unknown as UseFormRegister<Record<string, unknown>>
import { schemaInfo } from 'schema-info'
import * as z from 'zod'

const schema = z.object({ foo: z.string() })
const Field = createField<
  typeof schema,
  typeof defaultComponents,
  readonly [],
  readonly [],
  readonly []
>({
  register,
  idPrefix: '',
  components: defaultComponents,
})
const ChoiceField = createField({
  register,
  idPrefix: '',
  components: {
    ...defaultComponents,
    radio: React.forwardRef<
      HTMLInputElement,
      React.ComponentPropsWithoutRef<'input'>
    >((props, ref) => <input ref={ref} {...props} />),
  },
})

afterEach(() => {
  vi.clearAllMocks()
})

function LabelReader() {
  const { label } = useField()
  return <span>{label}</span>
}

function ErrorsReader() {
  const { errors } = useField()
  return <span>{errors?.join(', ')}</span>
}

function ValueReader() {
  const { value } = useField()
  return <span>{String(value)}</span>
}

describe('useField', () => {
  it('provides field context when inside a Field', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo">
        {() => <LabelReader />}
      </Field>
    )
    expect(html).toContain('<span>Foo</span>')
  })

  it('throws when used outside a field provider', () => {
    const render = () => renderToStaticMarkup(<LabelReader />)
    expect(render).toThrow(
      'useField() hook must be used within a Field component'
    )
  })

  it('exposes errors from the field context', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" errors={['A', 'B']}>
        {() => <ErrorsReader />}
      </Field>
    )

    expect(html).toContain('<span>A, B</span>')
  })

  it('exposes formatted values from the field context', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        fieldType="date"
        value={new Date(2024, 4, 6)}
      >
        {() => <ValueReader />}
      </Field>
    )

    expect(html).toContain('<span>2024-05-06</span>')
  })
})

describe('createField', () => {
  it('sets input type according to fieldType and radio flag', () => {
    const htmlDefault = renderToStaticMarkup(<Field name="foo" label="Foo" />)
    expect(htmlDefault).toContain('type="text"')

    const htmlDate = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldType="date" />
    )
    expect(htmlDate).toContain('type="date"')

    const htmlRadio = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        radio
        options={[{ name: 'A', value: 'a' }]}
      />
    )
    expect(htmlRadio).toContain('type="radio"')
  })

  it('supports boolean and number field types', () => {
    const htmlBool = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldType="boolean" />
    )
    expect(htmlBool).toContain('type="checkbox"')

    const htmlNumber = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldType="number" />
    )
    expect(htmlNumber).toContain('type="text"')
  })

  it('registers the field using setValueAs for coercion', () => {
    const schema = z.object({ amount: z.number() })
    const NumField = createField<
      typeof schema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: '',
      components: defaultComponents,
    })

    renderToStaticMarkup(
      <NumField
        name="amount"
        label="Amount"
        fieldType="number"
        shape={schemaInfo(schema.shape.amount)}
      />
    )

    const [name, options] = (register as unknown as Mock).mock.calls[0]
    expect(name).toBe('amount')
    const { setValueAs } = options as { setValueAs: (v: unknown) => unknown }
    expect(setValueAs('5')).toBe(5)
  })

  it('returns null from setValueAs when coercion fails', () => {
    const schema = z.object({ amount: z.number() })
    const NumField = createField<
      typeof schema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: '',
      components: defaultComponents,
    })

    renderToStaticMarkup(
      <NumField
        name="amount"
        label="Amount"
        fieldType="number"
        shape={schemaInfo(schema.shape.amount)}
      />
    )

    const [, options] = (register as unknown as Mock).mock.calls[0]
    const { setValueAs } = options as { setValueAs: (v: unknown) => unknown }
    expect(setValueAs('')).toBeNull()
  })

  it('formats Date values for date fields', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        fieldType="date"
        value={new Date(2024, 0, 2)}
      />
    )
    expect(html).toContain('value="2024-01-02"')
  })

  it('renders select options when provided', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      />
    )
    expect(html).toContain('<select')
    expect(html).toContain('<option value="a">A</option>')
    expect(html).toContain('<option value="b">B</option>')
  })

  it('applies hidden style and type="hidden" on the input', () => {
    const html = renderToStaticMarkup(<Field name="foo" label="Foo" hidden />)
    expect(html).toContain('style="display:none"')
    expect(html).toContain('type="hidden"')
    expect(html).not.toContain('type="text"')
  })

  it('renders type="hidden" for boolean fields when hidden', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldType="boolean" hidden />
    )
    expect(html).toContain('type="hidden"')
    expect(html).not.toContain('type="checkbox"')
  })

  it('renders type="hidden" instead of select when hidden', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
        value="a"
        hidden
      />
    )
    expect(html).toContain('type="hidden"')
    expect(html).not.toContain('<select')
  })

  it('renders type="hidden" instead of textarea when hidden and multiline', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" multiline hidden />
    )
    expect(html).toContain('type="hidden"')
    expect(html).not.toContain('<textarea')
  })

  it('respects explicit type prop over hidden (escape hatch)', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" hidden type="email" />
    )
    expect(html).toContain('type="email"')
    expect(html).not.toContain('type="hidden"')
  })

  it('passes type="hidden" to SmartInput children when hidden', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" hidden>
        {({ SmartInput }) => <SmartInput />}
      </Field>
    )
    expect(html).toContain('type="hidden"')
  })

  it('passes type="hidden" to Input children when hidden', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" hidden>
        {({ Input }) => <Input />}
      </Field>
    )
    expect(html).toContain('type="hidden"')
  })

  it('allows SmartInput children to override hidden type (escape hatch)', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" hidden>
        {({ SmartInput }) => <SmartInput type="text" />}
      </Field>
    )
    expect(html).toContain('type="text"')
  })

  it('sets the autoFocus attribute when requested', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" autoFocus />
    )
    expect(html).toMatch(/autofocus/i)
  })

  it('passes autoComplete to the input when no children are provided', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" autoComplete="on" />
    )

    expect(html).toContain('autoComplete="on"')
  })

  it('passes autoComplete to SmartInput children', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" autoComplete="username">
        {({ SmartInput }) => <SmartInput />}
      </Field>
    )

    expect(html).toContain('autoComplete="username"')
  })

  it('lets input autoComplete override the field prop', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" autoComplete="username">
        {({ Input }) => <Input autoComplete="email" />}
      </Field>
    )

    expect(html).toContain('autoComplete="email"')
  })

  it('lets input autoComplete override the field prop for custom input', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" autoComplete="username">
        {() => <input autoComplete="email" />}
      </Field>
    )

    expect(html).toContain('autoComplete="email"')
  })

  it('sets aria attributes and renders errors', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" required errors={['Required']} />
    )

    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-required="true"')
    expect(html).toContain('id="errors-for-foo"')
    expect(html).toContain('Required')
  })

  it('nests radio inputs inside labels when using children', () => {
    const html = renderToStaticMarkup(
      <ChoiceField
        name="choice"
        label="Choice"
        radio
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      >
        {({ Label, RadioLabel, RadioGroup, Radio }) => (
          <>
            <Label>Pick one</Label>
            <RadioGroup>
              <RadioLabel>
                <Radio value="a" type="radio" />A
              </RadioLabel>
              <RadioLabel>
                <Radio value="b" type="radio" />B
              </RadioLabel>
            </RadioGroup>
          </>
        )}
      </ChoiceField>
    )

    expect(html).toContain('id="choice-a"')
    expect(html).toContain('id="choice-b"')
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*id="choice-a"[^>]*\/>.*?A.*?<\/label>/s
    )
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*id="choice-b"[^>]*\/>.*?B.*?<\/label>/s
    )
  })

  it('nests RadioLabel around radio inputs when using children', () => {
    const html = renderToStaticMarkup(
      <ChoiceField
        name="choice"
        label="Choice"
        radio
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      >
        {({ RadioLabel, RadioGroup, Radio }) => (
          <RadioGroup>
            <RadioLabel>
              <Radio value="a" type="radio" />A
            </RadioLabel>
            <RadioLabel>
              <Radio value="b" type="radio" />B
            </RadioLabel>
          </RadioGroup>
        )}
      </ChoiceField>
    )

    expect(html).toContain('id="choice-a"')
    expect(html).toContain('id="choice-b"')
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*id="choice-a"[^>]*\/>.*?A.*?<\/label>/s
    )
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*id="choice-b"[^>]*\/>.*?B.*?<\/label>/s
    )
  })

  it('provides CheckboxLabel in children render function', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Agree" fieldType="boolean">
        {({ Checkbox, CheckboxLabel }) => (
          <CheckboxLabel>
            <Checkbox />
            Agree
          </CheckboxLabel>
        )}
      </Field>
    )

    expect(html).toContain('id="label-for-foo"')
    expect(html).toContain('Agree')
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*type="checkbox"[^>]*\/>.*?Agree.*?<\/label>/s
    )
  })

  it('creates radio inputs with fieldset and nested labels by default', () => {
    const html = renderToStaticMarkup(
      <ChoiceField
        name="choice"
        label="Choice"
        radio
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      />
    )

    expect(html).toContain('<fieldset')
    expect(html).toContain('id="choice-a"')
    expect(html).toContain('id="choice-b"')
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*id="choice-a"[^>]*\/>.*?A.*?<\/label>/s
    )
    expect(html).toMatch(
      /<label[^>]*>.*?<input[^>]*id="choice-b"[^>]*\/>.*?B.*?<\/label>/s
    )
  })
})

describe('component mappings', () => {
  it('uses custom components for field layout and errors', () => {
    const CustomField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        field: (props: React.ComponentProps<'section'>) => (
          <section data-field {...props} />
        ),
        label: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-label {...props} />
        ),
        input: React.forwardRef<
          HTMLInputElement,
          React.ComponentProps<'input'>
        >((props, ref) => <input data-input ref={ref} {...props} />),
        fieldErrors: (props: React.ComponentProps<'div'>) => (
          <div data-errors {...props} />
        ),
        error: (props: React.ComponentProps<'span'>) => (
          <span data-error {...props} />
        ),
      },
    })

    const html = renderToStaticMarkup(
      <CustomField name="foo" label="Foo" errors={['Oops']} />
    )

    expect(html).toContain('data-field="true"')
    expect(html).toContain('data-label="true"')
    expect(html).toContain('data-input="true"')
    expect(html).toContain('<div data-errors="true"')
    expect(html).toContain('<span data-error="true">Oops</span>')
  })

  it('uses custom components for multiline, checkbox and radio inputs', () => {
    const BoolField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        checkbox: React.forwardRef<
          HTMLInputElement,
          React.ComponentProps<'input'>
        >((props, ref) => <input data-checkbox ref={ref} {...props} />),
      },
    })

    const boolHtml = renderToStaticMarkup(
      <BoolField name="agree" label="Agree" fieldType="boolean" />
    )
    expect(boolHtml).toContain('data-checkbox="true"')

    const MultiField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        multiline: React.forwardRef<
          HTMLTextAreaElement,
          React.ComponentProps<'textarea'>
        >((props, ref) => <textarea data-multi ref={ref} {...props} />),
      },
    })
    const multiHtml = renderToStaticMarkup(
      <MultiField name="foo" label="Foo" multiline />
    )
    expect(multiHtml).toContain('data-multi="true"')

    const RadioField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        radioGroup: (props: React.ComponentProps<'fieldset'>) => (
          <fieldset data-radio-group {...props} />
        ),
        radio: React.forwardRef<
          HTMLInputElement,
          React.ComponentProps<'input'>
        >((props, ref) => <input data-radio ref={ref} {...props} />),
      },
    })

    const radioHtml = renderToStaticMarkup(
      <RadioField
        name="choice"
        label="Choice"
        radio
        options={[{ name: 'A', value: 'a' }]}
      />
    )
    expect(radioHtml).toContain('data-radio-group="true"')
    expect(radioHtml).toContain('data-radio="true"')
  })

  it('uses custom checkboxLabel component for boolean fields', () => {
    const BoolField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        checkboxLabel: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-checkbox-label {...props} />
        ),
      },
    })

    const html = renderToStaticMarkup(
      <BoolField name="agree" label="Agree" fieldType="boolean" />
    )
    expect(html).toContain('data-checkbox-label="true"')
    expect(html).toContain('Agree')
  })

  it('uses custom radioLabel component for radio option labels', () => {
    const RadioField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        radioLabel: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-radio-label {...props} />
        ),
      },
    })

    const html = renderToStaticMarkup(
      <RadioField
        name="choice"
        label="Choice"
        radio
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      />
    )
    expect(html).toContain('data-radio-label="true"')
    expect(html).toContain('>A</label>')
    expect(html).toContain('>B</label>')
  })

  it('keeps label and radioLabel independent', () => {
    const IndField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        label: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-field-label {...props} />
        ),
        radioLabel: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-radio-label {...props} />
        ),
      },
    })

    const html = renderToStaticMarkup(
      <IndField
        name="choice"
        label="Choice"
        radio
        options={[{ name: 'A', value: 'a' }]}
      />
    )
    expect(html).toContain('data-field-label="true"')
    expect(html).toContain('data-radio-label="true"')
  })

  it('keeps label and checkboxLabel independent', () => {
    const IndField = createField({
      register,
      idPrefix: '',
      components: {
        ...defaultComponents,
        label: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-field-label {...props} />
        ),
        checkboxLabel: (props: React.ComponentProps<'label'>) => (
          // biome-ignore lint/a11y/noLabelWithoutControl: test component
          <label data-checkbox-label {...props} />
        ),
      },
    })

    const htmlBool = renderToStaticMarkup(
      <IndField name="agree" label="Agree" fieldType="boolean" />
    )
    expect(htmlBool).toContain('data-checkbox-label="true"')
    expect(htmlBool).not.toContain('data-field-label="true"')

    const htmlString = renderToStaticMarkup(
      <IndField name="name" label="Name" />
    )
    expect(htmlString).toContain('data-field-label="true"')
    expect(htmlString).not.toContain('data-checkbox-label="true"')
  })
})

describe('element type comparison safety', () => {
  it('does not inject error props into plain div elements', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" errors={['Oops']}>
        {({ Errors }) => (
          <>
            <div className="wrapper">content</div>
            <Errors />
          </>
        )}
      </Field>
    )

    expect(html).toContain('role="alert"')
    expect(html).not.toMatch(/class="wrapper"[^>]*role="alert"/)
  })

  it('does not inject label props into plain label elements', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo">
        {({ Label, SmartInput }) => (
          <>
            <label htmlFor="other">Other</label>
            <Label />
            <SmartInput />
          </>
        )}
      </Field>
    )

    expect(html).toContain('for="other"')
    expect(html).toContain('id="label-for-foo"')
    const otherLabel = html.match(/<label[^>]*for="other"[^>]*>/)
    expect(otherLabel?.[0]).not.toContain('id="label-for-foo"')
  })

  it('does not inject input props into plain input elements', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo">
        {({ Input }) => (
          <>
            <input type="text" data-custom="true" />
            <Input />
          </>
        )}
      </Field>
    )

    expect(html).toContain('data-custom="true"')
    const customInput = html.match(/<input[^>]*data-custom="true"[^>]*/)
    expect(customInput?.[0]).not.toContain('name="foo"')
  })

  it('does not inject select props into plain select elements', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" options={[{ name: 'A', value: 'a' }]}>
        {({ Select }) => (
          <>
            <select data-custom="true">
              <option>X</option>
            </select>
            <Select />
          </>
        )}
      </Field>
    )

    expect(html).toContain('data-custom="true"')
    const customSelect = html.match(/<select[^>]*data-custom="true"[^>]*/)
    expect(customSelect?.[0]).not.toContain('name="foo"')
  })

  it('does not inject checkboxLabel props into plain label elements', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldType="boolean">
        {({ Checkbox, CheckboxLabel }) => (
          <>
            <CheckboxLabel>
              <Checkbox />
            </CheckboxLabel>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: test element */}
            <label data-custom="true">Unrelated</label>
          </>
        )}
      </Field>
    )

    expect(html).toContain('id="label-for-foo"')
    expect(html).toContain('data-custom="true"')
    const customLabel = html.match(/<label[^>]*data-custom="true"[^>]*>/)
    expect(customLabel?.[0]).not.toContain('id="label-for-foo"')
  })

  it('does not inject textarea props into plain textarea elements', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" multiline>
        {({ Multiline }) => (
          <>
            <textarea data-custom="true" />
            <Multiline />
          </>
        )}
      </Field>
    )

    expect(html).toContain('data-custom="true"')
    const customTextarea = html.match(/<textarea[^>]*data-custom="true"[^>]*/)
    expect(customTextarea?.[0]).not.toContain('name="foo"')
  })
})

describe('defaultValue/defaultChecked stripping', () => {
  it('strips defaultValue from Input child props', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" value="correct">
        {({ Input }) => (
          // @ts-expect-error defaultValue is stripped from user-facing type
          <Input defaultValue="wrong" />
        )}
      </Field>
    )
    expect(html).toContain('value="correct"')
    expect(html).not.toContain('value="wrong"')
  })

  it('strips defaultValue from Multiline child props', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" value="correct" multiline>
        {({ Multiline }) => (
          // @ts-expect-error defaultValue is stripped from user-facing type
          <Multiline defaultValue="wrong" />
        )}
      </Field>
    )
    expect(html).toContain('correct')
    expect(html).not.toContain('wrong')
  })

  it('strips defaultValue from Select child props', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        value="a"
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      >
        {({ Select }) => (
          // @ts-expect-error defaultValue is stripped from user-facing type
          <Select defaultValue="b" />
        )}
      </Field>
    )
    expect(html).toContain('<option value="a" selected="">A</option>')
    expect(html).not.toContain('<option value="b" selected')
  })

  it('strips defaultChecked from Checkbox child props', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldType="boolean" value={false}>
        {({ Checkbox }) => (
          // @ts-expect-error defaultChecked is stripped from user-facing type
          <Checkbox defaultChecked={true} />
        )}
      </Field>
    )
    expect(html).not.toContain('checked')
  })

  it('strips defaultChecked from Radio child props', () => {
    const html = renderToStaticMarkup(
      <ChoiceField
        name="choice"
        label="Choice"
        radio
        value="a"
        options={[
          { name: 'A', value: 'a' },
          { name: 'B', value: 'b' },
        ]}
      >
        {({ RadioGroup, Radio, RadioLabel }) => (
          <RadioGroup>
            <RadioLabel>
              {/* @ts-expect-error defaultChecked is stripped from user-facing type */}
              <Radio value="a" type="radio" defaultChecked={false} />A
            </RadioLabel>
            <RadioLabel>
              {/* @ts-expect-error defaultChecked is stripped from user-facing type */}
              <Radio value="b" type="radio" defaultChecked={true} />B
            </RadioLabel>
          </RadioGroup>
        )}
      </ChoiceField>
    )
    const radioA = html.match(/<input[^>]*value="a"[^>]*/)
    expect(radioA?.[0]).toContain('checked')
    const radioB = html.match(/<input[^>]*value="b"[^>]*/)
    expect(radioB?.[0]).not.toContain('checked')
  })
})

describe('SmartInput inferred props on Field', () => {
  it('forwards type="email" to the input', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" type="email" />
    )
    expect(html).toContain('type="email"')
  })

  it('forwards autoComplete to the input', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" autoComplete="username" />
    )
    expect(html).toContain('autoComplete="username"')
  })

  it('forwards extra props to a multiline textarea', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" multiline rows={5} />
    )
    expect(html).toContain('<textarea')
    expect(html).toContain('rows="5"')
  })

  it('forwards extra props to SmartInput via cloneElement when children are provided', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" multiline rows={5}>
        {({ SmartInput }) => <SmartInput />}
      </Field>
    )
    expect(html).toContain('<textarea')
    expect(html).toContain('rows="5"')
  })

  it('child SmartInput props override Field-level inferred props', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" multiline rows={5}>
        {({ SmartInput }) => <SmartInput rows={10} />}
      </Field>
    )
    expect(html).toContain('rows="10"')
    expect(html).not.toContain('rows="5"')
  })
})

describe('fieldProps', () => {
  it('passes fieldProps to the wrapper element', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" fieldProps={{ className: 'my-wrapper' }} />
    )
    expect(html).toContain('class="my-wrapper"')
  })

  it('merges user style with hidden style, user takes precedence', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        hidden
        fieldProps={{ style: { color: 'red' } }}
      />
    )
    expect(html).toContain('display:none')
    expect(html).toContain('color:red')
  })

  it('user style overrides internal hidden display', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        hidden
        fieldProps={{ style: { display: 'block' } }}
      />
    )
    expect(html).toContain('display:block')
    expect(html).not.toContain('display:none')
  })
})

describe('file fields', () => {
  it('renders type="file" for file fieldType', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Avatar" fieldType="file" />
    )
    expect(html).toContain('type="file"')
    expect(html).not.toContain('type="text"')
  })

  it('does not render defaultValue for file fields', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Avatar" fieldType="file" value="ignored" />
    )
    expect(html).not.toContain('value="ignored"')
    expect(html).not.toContain('defaultValue')
  })

  it('passes accept attribute to the file input', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Avatar" fieldType="file" accept="image/*" />
    )
    expect(html).toContain('accept="image/*"')
  })

  it('renders type="hidden" when file field is hidden (hidden takes priority)', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Avatar" fieldType="file" hidden />
    )
    expect(html).toContain('type="hidden"')
    expect(html).not.toContain('type="file"')
  })

  it('uses a custom fileInput component when provided', () => {
    const CustomFileInput = React.forwardRef<
      HTMLInputElement,
      React.ComponentPropsWithoutRef<'input'>
    >((props, ref) => <input data-custom-file ref={ref} {...props} />)

    const CustomField = createField({
      register,
      idPrefix: '',
      components: { ...defaultComponents, fileInput: CustomFileInput },
    })

    const html = renderToStaticMarkup(
      <CustomField name="foo" label="Avatar" fieldType="file" />
    )
    expect(html).toContain('data-custom-file')
    expect(html).toContain('type="file"')
  })

  it('provides FileInput helper in children render function', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Avatar" fieldType="file" accept="image/*">
        {({ FileInput }) => <FileInput />}
      </Field>
    )
    expect(html).toContain('type="file"')
    expect(html).toContain('accept="image/*"')
  })

  it('does not use setValueAs for file fields (RHF bypasses it)', () => {
    const fileSchema = z.object({ avatar: z.instanceof(File) })
    const FileField = createField<
      typeof fileSchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: '',
      components: defaultComponents,
    })

    renderToStaticMarkup(
      <FileField name="avatar" label="Avatar" fieldType="file" />
    )

    const [, options] = (register as unknown as Mock).mock.calls[0]
    expect(options.setValueAs).toBeUndefined()
  })
})

describe('object fields', () => {
  const objectSchema = z.object({
    billing: z.object({
      street: z.string(),
      city: z.string(),
    }),
  })

  const ObjectField = createField<
    typeof objectSchema,
    typeof defaultComponents,
    readonly [],
    readonly [],
    readonly []
  >({
    register,
    idPrefix: 'test-',
    components: defaultComponents,
  })

  it('auto-renders nested fields for object fieldType', () => {
    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      />
    )
    expect(html).toContain('Billing')
    expect(html).toContain('Street')
    expect(html).toContain('City')
    expect(html).toContain('name="billing[street]"')
    expect(html).toContain('name="billing[city]"')
    expect(html).toMatch(/<div[^>]*>Billing<\/div>/)
  })

  it('renders custom children with scoped Field for object fieldType', () => {
    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      >
        {({ Field: BillingField, label }) => (
          <>
            <h3>{label}</h3>
            <BillingField name="city" />
          </>
        )}
      </ObjectField>
    )
    expect(html).toContain('Billing')
    expect(html).toContain('City')
    expect(html).toContain('name="billing[city]"')
    expect(html).not.toContain('Street')
  })

  it('recursively renders nested objects', () => {
    const deepSchema = z.object({
      company: z.object({
        address: z.object({
          street: z.string(),
          zip: z.string(),
        }),
      }),
    })
    const DeepField = createField<
      typeof deepSchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: 'deep-',
      components: defaultComponents,
    })
    const shape = schemaInfo(deepSchema.shape.company)
    const html = renderToStaticMarkup(
      <DeepField
        name="company"
        label="Company"
        fieldType="object"
        shape={shape}
      />
    )
    expect(html).toContain('Company')
    expect(html).toContain('Street')
    expect(html).toContain('Zip')
    expect(html).toContain('name="company[address][street]"')
    expect(html).toContain('name="company[address][zip]"')
  })

  it('renders errors for auto-rendered nested object fields', () => {
    const mock = {
      control: {},
      formState: { errors: {} },
      getFieldState: (path: string) => {
        if (path === 'billing.street') return { error: { message: 'Required' } }
        return { error: undefined }
      },
    }
    ;(useFormContext as unknown as Mock).mockReturnValue(mock)

    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      />
    )
    ;(useFormContext as unknown as Mock).mockRestore()
    expect(html).toContain('Required')
    expect(html).toContain('errors-for-billing[street]')
  })

  it('renders errors for scoped Field in object children', () => {
    const mock = {
      control: {},
      formState: { errors: {} },
      getFieldState: (path: string) => {
        if (path === 'billing.street') return { error: { message: 'Required' } }
        return { error: undefined }
      },
    }
    ;(useFormContext as unknown as Mock).mockReturnValue(mock)

    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      >
        {({ Field: BillingField }) => <BillingField name="street" />}
      </ObjectField>
    )
    ;(useFormContext as unknown as Mock).mockRestore()
    expect(html).toContain('Required')
    expect(html).toContain('errors-for-billing[street]')
  })
})

describe('array fields', () => {
  const arraySchema = z.object({
    tags: z.array(z.string()),
  })

  const ArrayField = createField<
    typeof arraySchema,
    typeof defaultComponents,
    readonly [],
    readonly [],
    readonly []
  >({
    register,
    idPrefix: 'arr-',
    components: defaultComponents,
  })

  it('auto-renders array of scalars with add/remove buttons', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape} />
    )
    expect(html).toContain('Tags')
    expect(html).toContain('name="tags[0]"')
    expect(html).toContain('name="tags[1]"')
    expect(html).toContain('Remove')
    expect(html).toContain('Add')
    expect(html).toMatch(/<div[^>]*>Tags<\/div>/)
  })

  it('wraps scalar array items directly without field wrapper or label', () => {
    const CustomField = createField({
      register,
      idPrefix: 'slot-',
      components: {
        ...defaultComponents,
        field: (props: React.ComponentProps<'div'>) => (
          <div data-slot="field" {...props} />
        ),
        arrayField: (props: React.ComponentProps<'div'>) => (
          <div data-slot="array-field" {...props} />
        ),
        scalarArrayItem: (props: React.ComponentProps<'div'>) => (
          <div data-slot="scalar-array-item" {...props} />
        ),
      },
    })

    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <CustomField name="tags" label="Tags" fieldType="array" shape={shape} />
    )

    const fieldCount = (html.match(/data-slot="field"/g) || []).length
    expect(fieldCount).toBe(1)

    const arrayFieldCount = (html.match(/data-slot="array-field"/g) || [])
      .length
    expect(arrayFieldCount).toBe(2)

    const arrayItemCount = (html.match(/data-slot="scalar-array-item"/g) || [])
      .length
    expect(arrayItemCount).toBe(2)
  })

  it('renders empty state when useFieldArray returns no items', () => {
    ;(useFieldArray as unknown as Mock).mockReturnValueOnce({
      fields: [],
      append: vi.fn(),
      prepend: vi.fn(),
      remove: vi.fn(),
      insert: vi.fn(),
      move: vi.fn(),
      swap: vi.fn(),
    })

    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape} />
    )
    expect(html).toContain('No items')
    expect(html).toContain('Add')
    expect(html).not.toContain('Remove')
  })

  it('renders custom emptyArrayLabel when provided', () => {
    ;(useFieldArray as unknown as Mock).mockReturnValueOnce({
      fields: [],
      append: vi.fn(),
      prepend: vi.fn(),
      remove: vi.fn(),
      insert: vi.fn(),
      move: vi.fn(),
      swap: vi.fn(),
    })

    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField
        name="tags"
        label="Tags"
        fieldType="array"
        shape={shape}
        emptyArrayLabel="Nothing here yet"
      />
    )
    expect(html).toContain('Nothing here yet')
    expect(html).not.toContain('No items')
  })

  it('auto-renders array of objects with nested fields', () => {
    const objArraySchema = z.object({
      contacts: z.array(z.object({ name: z.string(), email: z.string() })),
    })
    const ObjArrayField = createField<
      typeof objArraySchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: 'oa-',
      components: defaultComponents,
    })

    const shape = schemaInfo(objArraySchema.shape.contacts)
    const html = renderToStaticMarkup(
      <ObjArrayField
        name="contacts"
        label="Contacts"
        fieldType="array"
        shape={shape}
      />
    )
    expect(html).toContain('Contacts')
    expect(html).toContain('Name')
    expect(html).toContain('Email')
    expect(html).toContain('name="contacts[0][name]"')
    expect(html).toContain('name="contacts[0][email]"')
    expect(html).toContain('name="contacts[1][name]"')
    expect(html).toContain('Remove')
    expect(html).toContain('Add')
  })

  it('wraps object array sub-fields with their own field slot', () => {
    const objArraySchema = z.object({
      contacts: z.array(z.object({ name: z.string(), email: z.string() })),
    })
    const CustomField = createField({
      register,
      idPrefix: 'oa-slot-',
      components: {
        ...defaultComponents,
        field: (props: React.ComponentProps<'div'>) => (
          <div data-slot="field" {...props} />
        ),
        arrayField: (props: React.ComponentProps<'div'>) => (
          <div data-slot="array-field" {...props} />
        ),
        objectArrayItem: (props: React.ComponentProps<'div'>) => (
          <div data-slot="object-array-item" {...props} />
        ),
      },
    })

    const shape = schemaInfo(objArraySchema.shape.contacts)
    const html = renderToStaticMarkup(
      <CustomField
        name="contacts"
        label="Contacts"
        fieldType="array"
        shape={shape}
      />
    )

    const fieldCount = (html.match(/data-slot="field"/g) || []).length
    expect(fieldCount).toBe(5)

    const arrayFieldCount = (html.match(/data-slot="array-field"/g) || [])
      .length
    expect(arrayFieldCount).toBe(0)

    const arrayItemCount = (html.match(/data-slot="object-array-item"/g) || [])
      .length
    expect(arrayItemCount).toBe(2)
  })

  it('renders custom children with items and helpers', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape}>
        {({ items, label }) => (
          <div>
            <span>{label}</span>
            {items.map((item) => (
              <div key={item.key} data-index={item.index} />
            ))}
          </div>
        )}
      </ArrayField>
    )
    expect(html).toContain('Tags')
    expect(html).toContain('data-index="0"')
    expect(html).toContain('data-index="1"')
  })

  it('enhances Title with id in array children', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape}>
        {({ Title }) => <Title />}
      </ArrayField>
    )
    expect(html).toContain('id="arr-label-for-tags"')
    expect(html).toContain('Tags')
    expect(html).toContain('<div ')
    expect(html).not.toContain('<label')
  })

  it('preserves user children on Title in array children', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape}>
        {({ Title }) => <Title>My list</Title>}
      </ArrayField>
    )
    expect(html).toContain('My list')
    expect(html).not.toContain('>Tags<')
  })

  it('enhances Errors with id, role, and content in array children', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField
        name="tags"
        label="Tags"
        fieldType="array"
        shape={shape}
        errors={['Required']}
      >
        {({ Errors }) => <Errors />}
      </ArrayField>
    )
    expect(html).toContain('id="arr-errors-for-tags"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Required')
  })

  it('hides Errors when no errors in array children', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape}>
        {({ Errors }) => <Errors />}
      </ArrayField>
    )
    expect(html).not.toContain('role="alert"')
    expect(html).not.toContain('errors-for-tags')
  })

  it('preserves user children on Errors in array children', () => {
    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField
        name="tags"
        label="Tags"
        fieldType="array"
        shape={shape}
        errors={['Required']}
      >
        {({ Errors }) => <Errors>Custom error</Errors>}
      </ArrayField>
    )
    expect(html).toContain('Custom error')
    expect(html).not.toContain('Required')
  })

  it('provides per-item Errors with id and role in array children', () => {
    const mock = {
      control: {},
      formState: { errors: {} },
      getFieldState: (path: string) => {
        if (path === 'tags.0') return { error: { message: 'Too short' } }
        return { error: undefined }
      },
    }
    ;(useFormContext as unknown as Mock).mockReturnValue(mock)

    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape}>
        {({ items, Item }) => (
          <>
            {items.map(({ key }) => (
              <Item key={key}>
                {({ Errors: ItemErrors }) => <ItemErrors />}
              </Item>
            ))}
          </>
        )}
      </ArrayField>
    )
    ;(useFormContext as unknown as Mock).mockRestore()
    expect(html).toContain('id="arr-errors-for-tags[0]"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Too short')
  })

  it('sets correct a11y props on scalar array item SmartInput', () => {
    const mock = {
      control: {},
      formState: { errors: {} },
      getFieldState: (path: string) => {
        if (path === 'tags.0') return { error: { message: 'Too short' } }
        return { error: undefined }
      },
    }
    ;(useFormContext as unknown as Mock).mockReturnValue(mock)

    const shape = schemaInfo(arraySchema.shape.tags)
    const html = renderToStaticMarkup(
      <ArrayField name="tags" label="Tags" fieldType="array" shape={shape}>
        {({ items, Item }) => (
          <>
            {items.map(({ key }) => (
              <Item key={key}>{({ SmartInput }) => <SmartInput />}</Item>
            ))}
          </>
        )}
      </ArrayField>
    )
    ;(useFormContext as unknown as Mock).mockRestore()
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="arr-errors-for-tags[0]"')
  })

  it('renders errors for ScopedItemField in object-array children', () => {
    const objArraySchema = z.object({
      contacts: z.array(z.object({ name: z.string(), email: z.string() })),
    })

    const mock = {
      control: {},
      formState: { errors: {} },
      getFieldState: (path: string) => {
        if (path === 'contacts.0.name')
          return { error: { message: 'Name required' } }
        return { error: undefined }
      },
    }
    ;(useFormContext as unknown as Mock).mockReturnValue(mock)

    const ObjArrayField = createField<
      typeof objArraySchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: 'oa-err-',
      components: defaultComponents,
    })

    const shape = schemaInfo(objArraySchema.shape.contacts)
    const html = renderToStaticMarkup(
      <ObjArrayField
        name="contacts"
        label="Contacts"
        fieldType="array"
        shape={shape}
      >
        {({ items, Item }) => (
          <>
            {items.map(({ key }) => (
              <Item key={key}>
                {({ Field: ItemField }) => <ItemField name="name" />}
              </Item>
            ))}
          </>
        )}
      </ObjArrayField>
    )
    ;(useFormContext as unknown as Mock).mockRestore()
    expect(html).toContain('Name required')
    expect(html).toContain('errors-for-contacts[0][name]')
  })
})

describe('object children enhancement', () => {
  const objectSchema = z.object({
    billing: z.object({
      street: z.string(),
      city: z.string(),
    }),
  })

  const ObjectField = createField<
    typeof objectSchema,
    typeof defaultComponents,
    readonly [],
    readonly [],
    readonly []
  >({
    register,
    idPrefix: 'test-',
    components: defaultComponents,
  })

  it('enhances Title with id in object children', () => {
    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      >
        {({ Title }) => <Title />}
      </ObjectField>
    )
    expect(html).toContain('id="test-label-for-billing"')
    expect(html).toContain('Billing')
    expect(html).toContain('<div ')
    expect(html).not.toContain('<label')
  })

  it('preserves user children on Title in object children', () => {
    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      >
        {({ Title }) => <Title>Payment info</Title>}
      </ObjectField>
    )
    expect(html).toContain('Payment info')
    expect(html).not.toContain('>Billing<')
  })

  it('enhances Errors with id, role, and content in object children', () => {
    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
        errors={['Invalid address']}
      >
        {({ Errors }) => <Errors />}
      </ObjectField>
    )
    expect(html).toContain('id="test-errors-for-billing"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Invalid address')
  })

  it('hides Errors when no errors in object children', () => {
    const shape = schemaInfo(objectSchema.shape.billing)
    const html = renderToStaticMarkup(
      <ObjectField
        name="billing"
        label="Billing"
        fieldType="object"
        shape={shape}
      >
        {({ Errors }) => <Errors />}
      </ObjectField>
    )
    expect(html).not.toContain('role="alert"')
    expect(html).not.toContain('errors-for-billing')
  })
})

describe('enum options on scoped fields', () => {
  it('renders enum as select in object array items via children', () => {
    const enumArraySchema = z.object({
      members: z.array(
        z.object({
          name: z.string(),
          role: z.enum(['developer', 'designer', 'manager']),
        })
      ),
    })
    const EnumField = createField<
      typeof enumArraySchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: 'enum-',
      components: defaultComponents,
    })

    const shape = schemaInfo(enumArraySchema.shape.members)
    const html = renderToStaticMarkup(
      <EnumField name="members" label="Members" fieldType="array" shape={shape}>
        {({ items, Item }) => (
          <>
            {items.map(({ key }) => (
              <Item key={key}>
                {({ Field: ItemField }) => <ItemField name="role" />}
              </Item>
            ))}
          </>
        )}
      </EnumField>
    )
    expect(html).toContain('<select')
    expect(html).toContain('Developer')
    expect(html).toContain('Designer')
    expect(html).toContain('Manager')
  })

  it('renders enum as select in object children via scoped Field', () => {
    const enumObjSchema = z.object({
      settings: z.object({
        theme: z.enum(['light', 'dark', 'auto']),
        name: z.string(),
      }),
    })
    const EnumObjField = createField<
      typeof enumObjSchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: 'eobj-',
      components: defaultComponents,
    })

    const shape = schemaInfo(enumObjSchema.shape.settings)
    const html = renderToStaticMarkup(
      <EnumObjField
        name="settings"
        label="Settings"
        fieldType="object"
        shape={shape}
      >
        {({ Field }) => <Field name="theme" />}
      </EnumObjField>
    )
    expect(html).toContain('<select')
    expect(html).toContain('Light')
    expect(html).toContain('Dark')
    expect(html).toContain('Auto')
  })

  it('renders enum as select in auto-rendered object array items', () => {
    const enumArraySchema = z.object({
      members: z.array(
        z.object({
          name: z.string(),
          role: z.enum(['developer', 'designer', 'manager']),
        })
      ),
    })
    const EnumField = createField<
      typeof enumArraySchema,
      typeof defaultComponents,
      readonly [],
      readonly [],
      readonly []
    >({
      register,
      idPrefix: 'auto-enum-',
      components: defaultComponents,
    })

    const shape = schemaInfo(enumArraySchema.shape.members)
    const html = renderToStaticMarkup(
      <EnumField
        name="members"
        label="Members"
        fieldType="array"
        shape={shape}
      />
    )
    expect(html).toContain('<select')
    expect(html).toContain('Developer')
  })
})
