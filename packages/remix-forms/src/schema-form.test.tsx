import type * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import * as z from 'zod'
import { SchemaForm } from './schema-form'

vi.mock('react-router', () => ({
  Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
    <form {...props} />
  ),
  useActionData: () => undefined,
  useNavigation: () => ({ state: 'idle' }),
  useSubmit: () => () => {},
}))

describe('SchemaForm', () => {
  it('renders provided values as form defaults', () => {
    const schema = z.object({
      agree: z.boolean(),
      amount: z.number(),
      day: z.date(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        values={{
          agree: true,
          amount: 5,
          day: new Date('2024-05-06'),
        }}
      />
    )

    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
    expect(html).toContain('value="5"')
    expect(html).toContain('value="2024-05-06"')
  })

  it('merges hidden field errors into global errors', () => {
    const schema = z.object({
      visible: z.string(),
      secret: z.string(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        hiddenFields={['secret']}
        labels={{ secret: 'Secret' }}
        errors={{ secret: ['Missing'], _global: ['Oops'] }}
      />
    )

    expect(html).toContain('Secret: Missing')
    expect(html).toContain('Oops')
  })

  it('uses pendingButtonLabel when navigation is not idle', () => {
    const schema = z.object({ name: z.string() })

    const fetcher = {
      submit: vi.fn(),
      state: 'submitting',
      Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
        <form {...props} />
      ),
    }

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        fetcher={fetcher as never}
        pendingButtonLabel="Sending"
        buttonLabel="Submit"
      />
    )

    expect(html).toContain('Sending')
  })

  it('uses default values defined in the schema', () => {
    const schema = z.object({
      name: z.string().default('John'),
    })

    const html = renderToStaticMarkup(<SchemaForm schema={schema} />)

    expect(html).toContain('value="John"')
  })

  it('adds an empty select option for optional enum fields', () => {
    const schema = z.object({
      choice: z.enum(['a', 'b']).optional(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} emptyOptionLabel="-" />
    )

    expect(html).toMatch(/<option value=""[^>]*>-<\/option>/)
  })

  it('focuses the first field with an error', () => {
    const schema = z.object({
      first: z.string(),
      second: z.string(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} errors={{ second: ['Required'] }} />
    )

    expect(html).toMatch(/<input[^>]*autofocus[^>]*name="second"/)
  })

  it('does not add an empty option for required enum fields', () => {
    const schema = z.object({
      choice: z.enum(['a', 'b']),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} emptyOptionLabel="-" />
    )

    expect(html).not.toMatch(/<option value=""/)
    expect(html).toContain('<option value="a">A</option>')
    expect(html).toContain('<option value="b">B</option>')
  })

  it('renders beforeChildren content before the fields', () => {
    const schema = z.object({
      name: z.string(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} beforeChildren={<p id="first">Intro</p>} />
    )

    const beforeIndex = html.indexOf('id="first"')
    const fieldIndex = html.indexOf('for="name"')
    expect(beforeIndex).toBeGreaterThan(-1)
    expect(fieldIndex).toBeGreaterThan(-1)
    expect(beforeIndex).toBeLessThan(fieldIndex)
  })

  it('supports custom children using Field and Button components', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('name="name"')
    expect(html).toMatch(/<button[^>]*>OK<\/button>/)
  })

  it('renders textarea when field is marked as multiline', () => {
    const schema = z.object({ message: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} multiline={['message']} />
    )

    expect(html).toContain('<textarea')
    expect(html).toContain('name="message"')
  })

  it('renders radio inputs when field is marked as radio', () => {
    const schema = z.object({ choice: z.enum(['a', 'b']) })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} radio={['choice']} />
    )

    expect(html).toContain('type="radio"')
    expect(html).toContain('value="a"')
    expect(html).toContain('value="b"')
  })

  it('applies custom input types', () => {
    const schema = z.object({ email: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} inputTypes={{ email: 'email' }} />
    )

    expect(html).toContain('type="email"')
  })

  it('focuses the specified field when autoFocus is provided', () => {
    const schema = z.object({ first: z.string(), second: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} autoFocus="second" />
    )

    expect(html).toMatch(/<input[^>]*autofocus[^>]*name="second"/)
  })

  it('displays global errors using Errors and Error components', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} errors={{ _global: ['Oops'] }} />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain('Oops')
  })

  it('hides fields listed in hiddenFields', () => {
    const schema = z.object({ secret: z.string(), visible: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} hiddenFields={['secret']} />
    )

    expect(html).toMatch(/style="display:none"/)
  })
})
