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
const Field = createField<typeof schema>({
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
    const NumField = createField<typeof schema>({
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
    const NumField = createField<typeof schema>({
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

  it('applies placeholder and hidden style', () => {
    const html = renderToStaticMarkup(
      <Field name="foo" label="Foo" placeholder="Enter" hidden />
    )
    expect(html).toContain('placeholder="Enter"')
    expect(html).toContain('style="display:none"')
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

  it('links radio labels to generated ids when using children', () => {
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
        {({ Label, RadioGroup, RadioWrapper, Radio }) => (
          <>
            <Label>Pick one</Label>
            <RadioGroup>
              <RadioWrapper>
                <Radio value="a" type="radio" />
                <Label>A</Label>
              </RadioWrapper>
              <RadioWrapper>
                <Radio value="b" type="radio" />
                <Label>B</Label>
              </RadioWrapper>
            </RadioGroup>
          </>
        )}
      </ChoiceField>
    )

    expect(html).toContain('id="choice-a"')
    expect(html).toContain('for="choice-a"')
    expect(html).toContain('id="choice-b"')
    expect(html).toContain('for="choice-b"')
  })

  it('creates radio inputs with fieldset and linked labels by default', () => {
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
    expect(html).toContain('for="choice-a"')
    expect(html).toContain('id="choice-b"')
    expect(html).toContain('for="choice-b"')
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
        checkboxWrapper: (props: React.ComponentProps<'div'>) => (
          <div data-cbwrap {...props} />
        ),
      },
    })

    const boolHtml = renderToStaticMarkup(
      <BoolField name="agree" label="Agree" fieldType="boolean" />
    )
    expect(boolHtml).toContain('data-cbwrap="true"')
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
        radioWrapper: (props: React.ComponentProps<'div'>) => (
          <div data-radio-wrap {...props} />
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
    expect(radioHtml).toContain('data-radio-wrap="true"')
    expect(radioHtml).toContain('data-radio="true"')
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
