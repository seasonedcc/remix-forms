import { renderToStaticMarkup } from 'react-dom/server'
import type { UseFormRegister } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { createField, useField } from './create-field'

const register = vi.fn(() => ({
  name: 'foo',
  onChange: () => Promise.resolve(),
  onBlur: () => Promise.resolve(),
  ref: () => {},
})) as unknown as UseFormRegister<Record<string, unknown>>
import * as z from 'zod'

const schema = z.object({ foo: z.string() })
const Field = createField<typeof schema>({ register })

function LabelReader() {
  const { label } = useField()
  return <span>{label}</span>
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
})
