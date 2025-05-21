import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { UseFormRegister } from 'react-hook-form'
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest'
import { createField, useField } from './create-field'

const register = vi.fn((name: string) => ({
  name,
  onChange: () => Promise.resolve(),
  onBlur: () => Promise.resolve(),
  ref: () => {},
})) as unknown as UseFormRegister<Record<string, unknown>>
import * as z from 'zod'

const schema = z.object({ foo: z.string() })
const Field = createField<typeof schema>({ register })
const choiceSchema = z.object({ choice: z.string() })
const ChoiceField = createField<typeof choiceSchema>({
  register,
  radioComponent: React.forwardRef<
    HTMLInputElement,
    React.ComponentPropsWithoutRef<'input'>
  >((props, ref) => <input ref={ref} {...props} />),
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
    expect(render).toThrow('useField used outside of field context')
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
        value={new Date('2024-05-06')}
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
    const NumField = createField<typeof schema>({ register })

    renderToStaticMarkup(
      <NumField
        name="amount"
        label="Amount"
        fieldType="number"
        shape={schema.shape.amount}
      />
    )

    const [name, options] = (register as unknown as Mock).mock.calls[0]
    expect(name).toBe('amount')
    const { setValueAs } = options as { setValueAs: (v: unknown) => unknown }
    expect(setValueAs('5')).toBe(5)
  })

  it('formats Date values for date fields', () => {
    const html = renderToStaticMarkup(
      <Field
        name="foo"
        label="Foo"
        fieldType="date"
        value={new Date('2024-01-02')}
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
    const CustomField = createField<typeof schema>({
      register,
      fieldComponent: (props: React.ComponentProps<'section'>) => (
        <section data-field {...props} />
      ),
      labelComponent: (props: React.ComponentProps<'label'>) => (
        // biome-ignore lint/a11y/noLabelWithoutControl: test component
        <label data-label {...props} />
      ),
      inputComponent: React.forwardRef<
        HTMLInputElement,
        React.ComponentProps<'input'>
      >((props, ref) => <input data-input ref={ref} {...props} />),
      fieldErrorsComponent: (props: React.ComponentProps<'div'>) => (
        <div data-errors {...props} />
      ),
      errorComponent: (props: React.ComponentProps<'span'>) => (
        <span data-error {...props} />
      ),
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
    const BoolField = createField<z.ZodObject<{ agree: z.ZodBoolean }>>({
      register,
      checkboxComponent: React.forwardRef<
        HTMLInputElement,
        React.ComponentProps<'input'>
      >((props, ref) => <input data-checkbox ref={ref} {...props} />),
      checkboxWrapperComponent: (props: React.ComponentProps<'div'>) => (
        <div data-cbwrap {...props} />
      ),
    })

    const boolHtml = renderToStaticMarkup(
      <BoolField name="agree" label="Agree" fieldType="boolean" />
    )
    expect(boolHtml).toContain('data-cbwrap="true"')
    expect(boolHtml).toContain('data-checkbox="true"')

    const MultiField = createField<typeof schema>({
      register,
      multilineComponent: React.forwardRef<
        HTMLTextAreaElement,
        React.ComponentProps<'textarea'>
      >((props, ref) => <textarea data-multi ref={ref} {...props} />),
    })
    const multiHtml = renderToStaticMarkup(
      <MultiField name="foo" label="Foo" multiline />
    )
    expect(multiHtml).toContain('data-multi="true"')

    const RadioField = createField<typeof choiceSchema>({
      register,
      radioGroupComponent: (props: React.ComponentProps<'fieldset'>) => (
        <fieldset data-radio-group {...props} />
      ),
      radioWrapperComponent: (props: React.ComponentProps<'div'>) => (
        <div data-radio-wrap {...props} />
      ),
      radioComponent: React.forwardRef<
        HTMLInputElement,
        React.ComponentProps<'input'>
      >((props, ref) => <input data-radio ref={ref} {...props} />),
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
