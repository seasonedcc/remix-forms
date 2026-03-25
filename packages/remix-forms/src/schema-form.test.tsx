import { describe, expect, it, vi } from 'vitest'

vi.mock('react-router', () => {
  return {
    Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
      <form {...props} />
    ),
    useActionData: vi.fn(() => undefined),
    useNavigation: vi.fn(() => ({ state: 'idle' })),
    useSubmit: () => () => {},
  }
})

import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Form as ReactRouterForm } from 'react-router'
import * as z from 'zod'
import { defaultComponents } from './defaults'
import { SchemaForm, makeSchemaForm } from './schema-form'
import type { RenderField } from './schema-form'

import { useActionData, useNavigation } from 'react-router'

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
          day: new Date(2024, 4, 6),
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

  it('uses pendingButtonLabel when useNavigation state changes', () => {
    const schema = z.object({ name: z.string() })
    const navigation = vi.mocked(useNavigation)
    navigation.mockReturnValueOnce({ state: 'submitting' } as never)

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} pendingButtonLabel="Wait" />
    )

    expect(html).toContain('Wait')
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

  it('infers option labels from enum values', () => {
    const schema = z.object({
      choice: z.enum(['foo', 'barBaz']),
    })

    const html = renderToStaticMarkup(<SchemaForm schema={schema} />)

    expect(html).toContain('<select')
    expect(html).toContain('<option value="foo">Foo</option>')
    expect(html).toContain('<option value="barBaz">Bar Baz</option>')
  })

  it('renders beforeChildren content before the fields', () => {
    const schema = z.object({
      name: z.string(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} beforeChildren={<p id="first">Intro</p>} />
    )

    const beforeIndex = html.indexOf('id="first"')
    const fieldIndex = html.search(/for="[^"]*name"/)
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

  it('uses custom radioLabel component for radio option labels', () => {
    const schema = z.object({ choice: z.enum(['a', 'b']) })
    const RadioLabel = (props: React.ComponentProps<'label'>) => (
      // biome-ignore lint/a11y/noLabelWithoutControl: test component
      <label data-radio-label {...props} />
    )

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        radio={['choice']}
        components={{ radioLabel: RadioLabel }}
      />
    )

    expect(html).toContain('data-radio-label="true"')
    expect(html).toContain('>A</label>')
    expect(html).toContain('>B</label>')
  })

  it('uses custom checkboxLabel component for boolean fields', () => {
    const schema = z.object({ agree: z.boolean() })
    const CheckboxLabel = (props: React.ComponentProps<'label'>) => (
      // biome-ignore lint/a11y/noLabelWithoutControl: test component
      <label data-checkbox-label {...props} />
    )

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        components={{ checkboxLabel: CheckboxLabel }}
      />
    )

    expect(html).toContain('data-checkbox-label="true"')
    expect(html).toContain('Agree')
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

  it('prefers error autofocus over autoFocus prop', () => {
    const schema = z.object({ first: z.string(), second: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        errors={{ first: ['Required'] }}
        autoFocus="second"
      />
    )

    expect(html).toMatch(/<input[^>]*autofocus[^>]*name="first"/)
    expect(html).not.toMatch(/<input[^>]*name="second"[^>]*autofocus/)
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
    expect(html).toContain('type="hidden"')
  })

  it('overrides labels and placeholders', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        labels={{ name: 'Your Name' }}
        placeholders={{ name: 'Enter here' }}
      />
    )

    expect(html).toContain('Your Name')
    expect(html).toContain('placeholder="Enter here"')
  })

  it('uses options prop to render select and radio inputs', () => {
    const schema = z.object({ color: z.string() })
    const options = {
      color: [
        { name: 'Red', value: 'red' },
        { name: 'Blue', value: 'blue' },
      ],
    }

    const selectHtml = renderToStaticMarkup(
      <SchemaForm schema={schema} options={options} />
    )

    expect(selectHtml).toContain('<select')
    expect(selectHtml).toContain('<option value="red">Red</option>')

    const radioHtml = renderToStaticMarkup(
      <SchemaForm schema={schema} options={options} radio={['color']} />
    )

    expect(radioHtml).toContain('type="radio"')
    expect(radioHtml).toContain('value="red"')
    expect(radioHtml).toContain('value="blue"')
  })

  it('renders the provided buttonLabel when idle', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} buttonLabel="Send" />
    )

    expect(html).toMatch(/<button[^>]*>Send<\/button>/)
  })

  it('uses custom renderField for each field', () => {
    const schema = z.object({ first: z.string(), second: z.string() })
    const renderField: RenderField<
      typeof schema,
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      any,
      readonly [],
      readonly [],
      readonly []
    > = vi.fn(({ Field, name, label }) => (
      <div className="custom">
        <Field name={name} label={label} />
      </div>
    ))

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} renderField={renderField} />
    )

    expect(renderField).toHaveBeenCalledTimes(2)
    expect(html).toContain('class="custom"')
  })

  it('passes autoComplete through the Field component', () => {
    const schema = z.object({
      first: z.string(),
      middle: z.string(),
      last: z.string(),
      nick: z.string(),
      bio: z.string(),
      role: z.enum(['a', 'b']),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field, register }) => (
          <>
            <Field name="first" autoComplete="given-name" />
            <Field name="middle" autoComplete="family-name">
              {() => <input {...register('middle')} autoComplete="shipping" />}
            </Field>
            <Field name="last" autoComplete="family-name">
              {({ SmartInput }) => <SmartInput />}
            </Field>
            <Field name="nick" autoComplete="nickname">
              {({ Input }) => <Input autoComplete="off" />}
            </Field>
            <Field name="bio" autoComplete="on">
              {({ Multiline }) => <Multiline />}
            </Field>
            <Field name="role" autoComplete="organization">
              {({ Select }) => (
                <Select>
                  <option value="a">A</option>
                  <option value="b">B</option>
                </Select>
              )}
            </Field>
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('autoComplete="given-name"')
    expect(html).toContain('autoComplete="family-name"')
    expect(html).toContain('autoComplete="off"')
    expect(html).toContain('autoComplete="on"')
    expect(html).toContain('autoComplete="organization"')
    expect(html).toContain('autoComplete="shipping"')
  })

  it('applies schema-level autoComplete to generated inputs', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string(),
      bio: z.string(),
      role: z.enum(['a', 'b']),
    })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        autoComplete={{
          name: 'name',
          email: 'email',
          bio: 'on',
          role: 'organization',
        }}
        multiline={['bio']}
      />
    )

    expect(html).toContain('autoComplete="name"')
    expect(html).toContain('autoComplete="email"')
    expect(html).toContain('autoComplete="on"')
    expect(html).toContain('autoComplete="organization"')
  })

  it('passes schema-level autoComplete through renderField', () => {
    const schema = z.object({ email: z.string() })
    const renderField: RenderField<
      typeof schema,
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      any,
      readonly [],
      readonly [],
      readonly []
    > = vi.fn(({ Field, name, autoComplete }) => (
      <Field name={name} autoComplete={autoComplete} />
    ))

    renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        autoComplete={{ email: 'email' }}
        renderField={renderField}
      />
    )

    expect(renderField).toHaveBeenCalledWith(
      expect.objectContaining({ autoComplete: 'email' })
    )
  })

  it('lets Field-level autoComplete override schema-level', () => {
    const schema = z.object({ email: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} autoComplete={{ email: 'email' }}>
        {({ Field }) => <Field name="email" autoComplete="off" />}
      </SchemaForm>
    )

    expect(html).toContain('autoComplete="off"')
    expect(html).not.toContain('autoComplete="email"')
  })
})
it('uses provided form component for rendering', () => {
  const schema = z.object({ name: z.string() })
  const CustomForm = React.forwardRef<
    HTMLFormElement,
    React.ComponentProps<'form'>
  >((props, ref) => (
    <form data-custom ref={ref} {...props} />
  )) as unknown as typeof ReactRouterForm

  const html = renderToStaticMarkup(
    <SchemaForm schema={schema} components={{ form: CustomForm }} />
  )

  expect(html).toContain('data-custom="true"')
})

it('uses globalErrorsComponent when provided', () => {
  const schema = z.object({ name: z.string() })
  const Errors = (props: React.HTMLAttributes<HTMLDivElement>) => (
    <section data-errors {...props} />
  )

  const html = renderToStaticMarkup(
    <SchemaForm
      schema={schema}
      errors={{ _global: ['Oops'] }}
      components={{ globalErrors: Errors }}
    />
  )

  expect(html).toContain('<section data-errors="true"')
  expect(html).toContain('Oops')
})

it('renders the button using buttonComponent', () => {
  const schema = z.object({ name: z.string() })
  const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-btn {...props} />
  )

  const html = renderToStaticMarkup(
    <SchemaForm schema={schema} components={{ button: Button }} />
  )

  expect(html).toContain('data-btn="true"')
})

it('prioritizes action data over provided values and errors', () => {
  const schema = z.object({ name: z.string() })
  const mockUseActionData = vi.mocked(useActionData)

  mockUseActionData.mockReturnValueOnce({
    errors: { name: ['Action'] },
    values: { name: 'John' },
  })

  const html = renderToStaticMarkup(
    <SchemaForm
      schema={schema}
      values={{ name: 'Jane' }}
      errors={{ name: ['Prop'] }}
    />
  )

  expect(html).toContain('value="John"')
  expect(html).toContain('Action')
})

it('uses fieldErrorsComponent and errorComponent when provided', () => {
  const schema = z.object({ name: z.string() })
  const Errors = (props: React.ComponentProps<'div'>) => (
    <div data-field-errors {...props} />
  )
  const Error = (props: React.ComponentProps<'span'>) => (
    <span data-error {...props} />
  )

  const html = renderToStaticMarkup(
    <SchemaForm
      schema={schema}
      errors={{ name: ['Oops'] }}
      components={{ fieldErrors: Errors, error: Error }}
    />
  )

  expect(html).toContain('data-field-errors="true"')
  expect(html).toContain('<span data-error="true">Oops</span>')
})

it('uses fetcher.Form when fetcher is supplied', () => {
  const schema = z.object({ name: z.string() })
  const fetcher = {
    submit: vi.fn(),
    state: 'idle',
    Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
      <form data-fetcher {...props} />
    ),
  }

  const html = renderToStaticMarkup(
    <SchemaForm schema={schema} fetcher={fetcher as never} />
  )

  expect(html).toContain('data-fetcher="true"')
})

it('uses fieldsComponent to wrap auto-generated fields', () => {
  const schema = z.object({ name: z.string(), email: z.string() })
  const FieldsWrapper = (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-fields {...props} />
  )

  const html = renderToStaticMarkup(
    <SchemaForm schema={schema} components={{ fields: FieldsWrapper }} />
  )

  expect(html).toContain('data-fields="true"')
})

it('promotes dot-path errors to global errors', () => {
  const schema = z.object({
    user: z.object({ name: z.string() }),
  })

  const html = renderToStaticMarkup(
    <SchemaForm
      schema={schema}
      errors={
        { 'user.name': ['Required'] } as Parameters<
          typeof SchemaForm<typeof schema>
        >[0]['errors']
      }
    />
  )

  expect(html).toContain('role="alert"')
  expect(html).toContain('Required')
})

it('promotes dot-path errors from action data to global errors', () => {
  const schema = z.object({
    user: z.object({ name: z.string(), age: z.number() }),
  })
  const mockUseActionData = vi.mocked(useActionData)

  mockUseActionData.mockReturnValueOnce({
    errors: { 'user.name': ['Required'], 'user.age': ['Invalid'] },
    values: {},
  })

  const html = renderToStaticMarkup(<SchemaForm schema={schema} />)

  expect(html).toContain('role="alert"')
  expect(html).toContain('Required')
  expect(html).toContain('Invalid')
})

describe('autoInputTypes', () => {
  it('auto-detects date input type from schema format by default', () => {
    const schema = z.object({ birthday: z.string().date() })
    const html = renderToStaticMarkup(<SchemaForm schema={schema} />)
    expect(html).toContain('type="date"')
  })

  it('auto-detects datetime-local input type from schema format by default', () => {
    const schema = z.object({ createdAt: z.string().datetime() })
    const html = renderToStaticMarkup(<SchemaForm schema={schema} />)
    expect(html).toContain('type="datetime-local"')
  })

  it('auto-detects time input type from schema format by default', () => {
    const schema = z.object({ alarm: z.string().time() })
    const html = renderToStaticMarkup(<SchemaForm schema={schema} />)
    expect(html).toContain('type="time"')
  })

  it('does not auto-detect email input type by default', () => {
    const schema = z.object({ email: z.string().email() })
    const html = renderToStaticMarkup(<SchemaForm schema={schema} />)
    expect(html).toContain('type="text"')
  })

  it('auto-detects email when included in autoInputTypes', () => {
    const schema = z.object({ email: z.string().email() })
    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        autoInputTypes={['date', 'datetime-local', 'time', 'email']}
      />
    )
    expect(html).toContain('type="email"')
  })

  it('auto-detects url when included in autoInputTypes', () => {
    const schema = z.object({ website: z.string().url() })
    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} autoInputTypes={['url']} />
    )
    expect(html).toContain('type="url"')
  })

  it('disables all format auto-detection when autoInputTypes is empty', () => {
    const schema = z.object({ birthday: z.string().date() })
    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} autoInputTypes={[]} />
    )
    expect(html).toContain('type="text"')
  })

  it('prefers explicit inputTypes over auto-detected format', () => {
    const schema = z.object({ birthday: z.string().date() })
    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} inputTypes={{ birthday: 'text' }} />
    )
    expect(html).toContain('type="text"')
  })
})

describe('element type comparison safety', () => {
  it('does not inject error props into plain div elements in children', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} errors={{ _global: ['Oops'] }}>
        {({ Field, Errors }) => (
          <>
            <div className="wrapper">
              <Field name="name" />
            </div>
            <Errors />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('role="alert"')
    expect(html).not.toMatch(/class="wrapper"[^>]*role="alert"/)
  })

  it('does not inject button props into plain button elements in children', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <button type="button" data-custom="true">
              Cancel
            </button>
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('data-custom="true"')
    const customButton = html.match(
      /<button[^>]*data-custom="true"[^>]*>[^<]*<\/button>/
    )
    expect(customButton?.[0]).toContain('Cancel')
    expect(customButton?.[0]).not.toContain('OK')
  })
})

describe('schema-level props forwarded to Field with custom children', () => {
  it('forwards inputTypes to Field with custom children', () => {
    const schema = z.object({ email: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} inputTypes={{ email: 'email' }}>
        {({ Field }) => (
          <Field name="email">{({ SmartInput }) => <SmartInput />}</Field>
        )}
      </SchemaForm>
    )

    expect(html).toContain('type="email"')
  })

  it('forwards autoComplete to Field with custom children', () => {
    const schema = z.object({ email: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} autoComplete={{ email: 'username' }}>
        {({ Field }) => (
          <Field name="email">{({ SmartInput }) => <SmartInput />}</Field>
        )}
      </SchemaForm>
    )

    expect(html).toContain('autoComplete="username"')
  })
})

describe('fieldProps in SchemaForm custom children', () => {
  it('passes fieldProps to the wrapper element', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field }) => (
          <Field name="name" fieldProps={{ className: 'custom-wrapper' }} />
        )}
      </SchemaForm>
    )

    expect(html).toContain('class="custom-wrapper"')
  })
})

describe('SchemaForm hidden field errors', () => {
  it('promotes hidden field errors to global errors', () => {
    const schema = z.object({ visible: z.string(), secret: z.string() })
    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        hiddenFields={['secret']}
        labels={{ secret: 'Secret' }}
        errors={{ secret: ['Missing'] }}
      />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain('Secret: Missing')
  })
})

describe('Fields component', () => {
  it('renders all schema fields when used without children', () => {
    const schema = z.object({
      firstName: z.string(),
      email: z.string(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Fields, Errors, Button }) => (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('First Name')
    expect(html).toContain('name="firstName"')
    expect(html).toContain('Email')
    expect(html).toContain('name="email"')
  })

  it('renders same output as auto-generated form', () => {
    const schema = z.object({
      firstName: z.string(),
      email: z.string(),
    })

    const autoHtml = renderToStaticMarkup(<SchemaForm schema={schema} />)

    const fieldsHtml = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Fields, Errors, Button }) => (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    const extractFields = (html: string) => {
      const match = html.match(/name="firstName"/)
      return match !== null
    }
    expect(extractFields(autoHtml)).toBe(true)
    expect(extractFields(fieldsHtml)).toBe(true)

    expect(fieldsHtml).toContain('name="firstName"')
    expect(fieldsHtml).toContain('name="email"')
    expect(fieldsHtml).toContain('First Name')
    expect(fieldsHtml).toContain('Email')
  })

  it('applies overrides from Field children while rendering all fields', () => {
    const schema = z.object({
      firstName: z.string(),
      email: z.string(),
      age: z.number(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field, Fields, Errors, Button }) => (
          <>
            <Fields>
              <Field name="email" label="E-mail Address" />
            </Fields>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('First Name')
    expect(html).toContain('name="firstName"')
    expect(html).toContain('E-mail Address')
    expect(html).toContain('name="email"')
    expect(html).toContain('Age')
    expect(html).toContain('name="age"')
  })

  it('preserves schema field order regardless of override order', () => {
    const schema = z.object({
      firstName: z.string(),
      email: z.string(),
      age: z.number(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field, Fields, Errors, Button }) => (
          <>
            <Fields>
              <Field name="age" label="Your Age" />
              <Field name="firstName" label="Your Name" />
            </Fields>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    const firstNameIdx = html.indexOf('Your Name')
    const emailIdx = html.indexOf('name="email"')
    const ageIdx = html.indexOf('Your Age')

    expect(firstNameIdx).toBeLessThan(emailIdx)
    expect(emailIdx).toBeLessThan(ageIdx)
  })

  it('works alongside Errors and Button', () => {
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} errors={{ _global: ['Oops'] }}>
        {({ Fields, Errors, Button }) => (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('name="name"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Oops')
    expect(html).toMatch(/<button/)
  })

  it('works with renderField prop', () => {
    const schema = z.object({ first: z.string(), second: z.string() })
    const renderField: RenderField<
      typeof schema,
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      any,
      readonly [],
      readonly [],
      readonly []
    > = vi.fn(({ Field, name, label }) => (
      <div className="custom-render">
        <Field name={name} label={label} />
      </div>
    ))

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} renderField={renderField}>
        {({ Fields, Errors, Button }) => (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(renderField).toHaveBeenCalledTimes(2)
    expect(html).toContain('class="custom-render"')
  })

  it('works with hiddenFields', () => {
    const schema = z.object({ visible: z.string(), secret: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} hiddenFields={['secret']}>
        {({ Fields, Errors, Button }) => (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('name="visible"')
    expect(html).toContain('type="hidden"')
    expect(html).toMatch(/style="display:none"/)
  })

  it('supports Field overrides with custom children function', () => {
    const schema = z.object({
      firstName: z.string(),
      email: z.string(),
    })

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema}>
        {({ Field, Fields, Errors, Button }) => (
          <>
            <Fields>
              <Field name="email">
                {({ Label, SmartInput, Errors }) => (
                  <>
                    <Label>Custom E-mail</Label>
                    <em>helper text</em>
                    <SmartInput />
                    <Errors />
                  </>
                )}
              </Field>
            </Fields>
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('First Name')
    expect(html).toContain('name="firstName"')
    expect(html).toContain('Custom E-mail')
    expect(html).toContain('helper text')
    expect(html).toContain('name="email"')
  })

  it('forwards props to the fields wrapper component', () => {
    const schema = z.object({ name: z.string() })
    const FieldsWrapper = (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div data-fields-wrapper {...props} />
    )

    const html = renderToStaticMarkup(
      <SchemaForm schema={schema} components={{ fields: FieldsWrapper }}>
        {({ Fields, Errors, Button }) => (
          <>
            <Fields className="grid-cols-2" />
            <Errors />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(html).toContain('data-fields-wrapper="true"')
    expect(html).toContain('class="grid-cols-2"')
  })
})

describe('renderForm', () => {
  it('is called when no children are provided', () => {
    const schema = z.object({ name: z.string() })
    const renderForm = vi.fn(({ Fields, Errors, Button }) => (
      <>
        <Fields />
        <Errors />
        <Button />
      </>
    ))

    renderToStaticMarkup(<SchemaForm schema={schema} renderForm={renderForm} />)

    expect(renderForm).toHaveBeenCalledTimes(1)
  })

  it('is ignored when children are provided', () => {
    const schema = z.object({ name: z.string() })
    const renderForm = vi.fn(() => null)

    renderToStaticMarkup(
      <SchemaForm schema={schema} renderForm={renderForm}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Button />
          </>
        )}
      </SchemaForm>
    )

    expect(renderForm).not.toHaveBeenCalled()
  })

  it('receives fetcher, disabled, and buttonLabel', () => {
    const schema = z.object({ name: z.string() })
    const fetcher = {
      submit: vi.fn(),
      state: 'idle',
      Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
        <form {...props} />
      ),
    }

    const renderForm = vi.fn(
      ({
        Fields,
        Errors,
        Button,
        fetcher: f,
        disabled: d,
        buttonLabel: bl,
      }) => {
        expect(f).toBe(fetcher)
        expect(typeof d).toBe('boolean')
        expect(bl).toBe('Send')
        return (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )
      }
    )

    renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        fetcher={fetcher as never}
        buttonLabel="Send"
        renderForm={renderForm}
      />
    )

    expect(renderForm).toHaveBeenCalled()
  })

  it('processes Field, Errors, and Button through mapChildren', () => {
    const schema = z.object({ name: z.string(), email: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        errors={{ _global: ['Oops'] }}
        buttonLabel="Submit"
        renderForm={({ Field, Errors, Button }) => (
          <div data-custom>
            <Field name="email" />
            <Field name="name" />
            <Errors />
            <Button />
          </div>
        )}
      />
    )

    expect(html).toContain('data-custom')
    expect(html).toContain('name="email"')
    expect(html).toContain('name="name"')
    expect(html).toContain('Oops')
    expect(html).toContain('role="alert"')
    expect(html).toMatch(/<button[^>]*>Submit<\/button>/)
  })

  it('supports Fields sentinel for auto-rendering', () => {
    const schema = z.object({ name: z.string(), email: z.string() })

    const html = renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        renderForm={({ Fields, Errors, Button }) => (
          <>
            <Fields />
            <Errors />
            <Button />
          </>
        )}
      />
    )

    expect(html).toContain('name="name"')
    expect(html).toContain('name="email"')
    expect(html).toContain('Name')
    expect(html).toContain('Email')
  })

  it('receives useFormReturn properties', () => {
    const schema = z.object({ name: z.string() })

    const renderForm = vi.fn((props) => {
      expect(props.register).toBeDefined()
      expect(props.formState).toBeDefined()
      expect(props.getValues).toBeDefined()
      return (
        <>
          <props.Fields />
          <props.Errors />
          <props.Button />
        </>
      )
    })

    renderToStaticMarkup(<SchemaForm schema={schema} renderForm={renderForm} />)

    expect(renderForm).toHaveBeenCalled()
  })

  it('works with makeSchemaForm factory-level renderForm', () => {
    const CustomSchemaForm = makeSchemaForm(defaultComponents, {
      renderForm: ({ Fields, Errors, Button }) => (
        <div data-factory>
          <Fields />
          <Errors />
          <Button />
        </div>
      ),
    })
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(<CustomSchemaForm schema={schema} />)

    expect(html).toContain('data-factory')
    expect(html).toContain('name="name"')
  })

  it('per-form renderForm overrides factory-level', () => {
    const CustomSchemaForm = makeSchemaForm(defaultComponents, {
      renderForm: ({ Fields, Errors, Button }) => (
        <div data-factory>
          <Fields />
          <Errors />
          <Button />
        </div>
      ),
    })
    const schema = z.object({ name: z.string() })

    const html = renderToStaticMarkup(
      <CustomSchemaForm
        schema={schema}
        renderForm={({ Fields, Errors, Button }) => (
          <div data-per-form>
            <Fields />
            <Errors />
            <Button />
          </div>
        )}
      />
    )

    expect(html).toContain('data-per-form')
    expect(html).not.toContain('data-factory')
  })

  it('uses pendingButtonLabel in buttonLabel when submitting', () => {
    const schema = z.object({ name: z.string() })
    const fetcher = {
      submit: vi.fn(),
      state: 'submitting',
      Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => (
        <form {...props} />
      ),
    }

    const renderForm = vi.fn(({ Fields, Errors, Button, buttonLabel }) => {
      expect(buttonLabel).toBe('Sending')
      return (
        <>
          <Fields />
          <Errors />
          <Button />
        </>
      )
    })

    renderToStaticMarkup(
      <SchemaForm
        schema={schema}
        fetcher={fetcher as never}
        buttonLabel="Submit"
        pendingButtonLabel="Sending"
        renderForm={renderForm}
      />
    )

    expect(renderForm).toHaveBeenCalled()
  })
})
