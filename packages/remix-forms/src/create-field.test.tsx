import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { UseFormRegister } from 'react-hook-form'
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
