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
})
